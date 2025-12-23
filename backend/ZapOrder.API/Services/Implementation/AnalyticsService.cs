using Microsoft.EntityFrameworkCore;
using ZapOrder.API.Data;
using ZapOrder.API.Data.Entities;
using ZapOrder.API.DTOs.Analytics;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Services.Implementation
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly AppDbContext _context;

        public AnalyticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsResponse> GetDashboardStatsAsync(int restaurantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var start = startDate ?? DateTime.UtcNow.Date.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow.Date.AddDays(1);

            var orders = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId && o.CreatedAt >= start && o.CreatedAt < end)
                .ToListAsync();

            var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();
            var pendingOrders = orders.Where(o => o.Status == OrderStatus.Pending ||
                                                  o.Status == OrderStatus.Preparing ||
                                                  o.Status == OrderStatus.Ready).Count();

            var todayStart = DateTime.UtcNow.Date;
            var todayOrders = orders.Where(o => o.CreatedAt >= todayStart).ToList();
            var todayCompletedOrders = todayOrders.Where(o => o.Status == OrderStatus.Completed).ToList();

            // Calculate revenue growth (compare to previous period)
            var periodDays = (end - start).Days;
            var previousStart = start.AddDays(-periodDays);
            var previousEnd = start;

            var previousRevenue = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId &&
                           o.CreatedAt >= previousStart &&
                           o.CreatedAt < previousEnd &&
                           o.Status == OrderStatus.Completed)
                .SumAsync(o => o.TotalAmount);

            var currentRevenue = completedOrders.Sum(o => o.TotalAmount);
            var revenueGrowth = previousRevenue > 0
                ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
                : 0;

            return new DashboardStatsResponse
            {
                TotalRevenue = currentRevenue,
                TotalOrders = completedOrders.Count,
                AverageOrderValue = completedOrders.Count > 0 ? currentRevenue / completedOrders.Count : 0,
                PendingOrders = pendingOrders,
                CompletedOrdersToday = todayCompletedOrders.Count,
                TodayRevenue = todayCompletedOrders.Sum(o => o.TotalAmount),
                RevenueGrowth = revenueGrowth
            };
        }

        public async Task<List<SalesChartDataPoint>> GetSalesChartDataAsync(int restaurantId, int days = 7)
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-days + 1);
            var endDate = DateTime.UtcNow.Date.AddDays(1);

            var orders = await _context.Orders
                .Where(o => o.RestaurantId == restaurantId &&
                           o.CreatedAt >= startDate &&
                           o.CreatedAt < endDate &&
                           o.Status == OrderStatus.Completed)
                .ToListAsync();

            var chartData = new List<SalesChartDataPoint>();

            for (int i = 0; i < days; i++)
            {
                var date = startDate.AddDays(i);
                var nextDate = date.AddDays(1);

                var dayOrders = orders.Where(o => o.CreatedAt >= date && o.CreatedAt < nextDate).ToList();

                chartData.Add(new SalesChartDataPoint
                {
                    Date = date.ToString("MMM dd"),
                    Revenue = dayOrders.Sum(o => o.TotalAmount),
                    Orders = dayOrders.Count
                });
            }

            return chartData;
        }

        public async Task<List<TopSellingItemResponse>> GetTopSellingItemsAsync(int restaurantId, int limit = 10)
        {
            var topItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.MenuItem)
                .Where(oi => oi.Order.RestaurantId == restaurantId &&
                            oi.Order.Status == OrderStatus.Completed)
                .GroupBy(oi => new { oi.MenuItemId, oi.MenuItem.Name })
                .Select(g => new TopSellingItemResponse
                {
                    MenuItemId = g.Key.MenuItemId,
                    MenuItemName = g.Key.Name,
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Subtotal),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(x => x.TotalQuantitySold)
                .Take(limit)
                .ToListAsync();

            return topItems;
        }
    }
}
