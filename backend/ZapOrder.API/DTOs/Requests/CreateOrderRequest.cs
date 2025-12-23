namespace ZapOrder.API.DTOs.Requests
{
    public class CreateOrderRequest
    {
        public int TableId { get; set; }
        public List<OrderItemRequest> Items { get; set; } = new();
    }
}
