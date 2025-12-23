using ZapOrder.API.Data.Entities;

namespace ZapOrder.API.DTOs.Requests
{
    public class UpdateOrderStatusRequest
    {
        public OrderStatus Status { get; set; }

    }
}
