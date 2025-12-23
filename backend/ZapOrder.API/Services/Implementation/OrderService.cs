using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ZapOrder.API.Data;
using ZapOrder.API.Data.Entities;
using ZapOrder.API.DTOs.Requests;
using ZapOrder.API.DTOs.Responses;
using ZapOrder.API.Hubs;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Services.Implementation
{
    public class OrderService : IOrderService
    {

        private readonly AppDbContext _context;
        private readonly ILogger<OrderService> _logger;
        private readonly IHubContext<OrderHub> _hubContext;

        public OrderService(AppDbContext context, ILogger<OrderService> logger, IHubContext<OrderHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        public Task<bool> CancelOrderAsync(int orderId)
        {
            throw new NotImplementedException();
        }

        public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request)
        {
            //validate table exists and is available

            var table = await _context.Tables.Include(r => r.Restaurant)
                                             .Where(t => t.Status == TableStatus.Available)              
                                             .FirstOrDefaultAsync(t => t.Id == request.TableId);


            if(table == null)
                throw new Exception("Table not found or not available");

            //Get menu items 
            var menuItemIds = request.Items.Select(i => i.MenuItemId).ToList();

            var menuItems = await _context.MenuItems
                .Where(m => menuItemIds.Contains(m.Id)
                    && m.RestaurantId == table.RestaurantId
                    && m.IsAvailable)
                .ToDictionaryAsync(m => m.Id);

            if(menuItems.Count != menuItemIds.Distinct().Count())
                throw new Exception("One or more menu items are invalid or unavailable");

            //Create Order
            var order = new Order
            {
                OrderNumber = GenerateOrderNumber(),
                TableId = table.Id,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                RestaurantId = table.RestaurantId,
                PaymentStatus = PaymentStatus.Pending,
            };


            // Add Order Items

            foreach(var item in request.Items)
            {
                var menuItem = menuItems[item.MenuItemId];

                var orderItem = new OrderItem
                {
                    MenuItemId = item.MenuItemId,
                    Quantity = item.Quantity,
                    UnitPrice = menuItem.Price,
                    Subtotal = menuItem.Price * item.Quantity,
                    Notes = item.Notes
                };
                order.Items.Add(orderItem);
            }

            //Calculate Total Amount

            order.TotalAmount = order.Items.Sum(i => i.Subtotal);

            _context.Orders.Add(order);
            await  _context.SaveChangesAsync();

            // Notify kitchen via SignalR
            var orderResponse = MapToOrderResponse(order, table.TableNumber);
            await _hubContext.Clients.Group($"restaurant_{table.RestaurantId}")
                .SendAsync("OrderCreated", orderResponse);

            _logger.LogInformation("Order {OrderNumber} created successfully", order.OrderNumber);

            return orderResponse;
        }

        public async Task<OrderResponse?> GetOrderByIdAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(oi => oi.MenuItem)
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.Id == id);

            if(order == null)
                return null;

            return MapToOrderResponse(order, order.Table.TableNumber);
        }

        public async Task<List<OrderResponse>> GetRestaurantOrdersAsync(int restaurantId, OrderStatus? status = null)
        {
            var query = _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.MenuItem)
                .Include(o => o.Table)
                .Where(o => o.RestaurantId == restaurantId);

            if (status.HasValue)
                query = query.Where(o => o.Status == status.Value);

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(o => MapToOrderResponse(o, o.Table.TableNumber)).ToList();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.MenuItem)
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return false;

            order.Status = newStatus;

            if (newStatus == OrderStatus.Completed)
                order.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify via SignalR
            var orderResponse = MapToOrderResponse(order, order.Table.TableNumber);

            // Notify restaurant group (for admin dashboard)
            await _hubContext.Clients.Group($"restaurant_{order.RestaurantId}")
                .SendAsync("OrderStatusUpdated", orderResponse);

            // Notify specific order group (for customer tracking)
            await _hubContext.Clients.Group($"order_{orderId}")
                .SendAsync("OrderStatusUpdated", orderResponse);

            return true;
        }


        private string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"ORD-{timestamp}-{random}";
        }

        private OrderResponse MapToOrderResponse(Order order, string tableNumber)
        {
            return new OrderResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                TableId = order.TableId,
                TableNumber = tableNumber,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                CreatedAt = order.CreatedAt,
                Items = order.Items.Select(i => new OrderItemResponse
                {
                    Id = i.Id,
                    MenuItemName = i.MenuItem.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Subtotal = i.Subtotal,
                    Notes = i.Notes
                }).ToList()
            };
        }
    }
}
