using ZapOrder.API.Data.Entities;
using ZapOrder.API.DTOs.Requests;
using ZapOrder.API.DTOs.Responses;

namespace ZapOrder.API.Services.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request);
        Task<OrderResponse?> GetOrderByIdAsync(int id);
        Task<List<OrderResponse>> GetRestaurantOrdersAsync(int restaurantId, OrderStatus? status = null);
        Task<bool> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus);
        Task<bool> CancelOrderAsync(int orderId);
    }
}
