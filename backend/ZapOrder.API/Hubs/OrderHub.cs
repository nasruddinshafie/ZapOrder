using Microsoft.AspNetCore.SignalR;

namespace ZapOrder.API.Hubs
{
    public class OrderHub : Hub
    {
        public async Task JoinRestaurantGroup(int restaurantId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"restaurant_{restaurantId}");
        }

        public async Task LeaveRestaurantGroup(int restaurantId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"restaurant_{restaurantId}");
        }

        public async Task JoinOrderGroup(int orderId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"order_{orderId}");
        }

        public async Task LeaveOrderGroup(int orderId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order_{orderId}");
        }
    }
}
