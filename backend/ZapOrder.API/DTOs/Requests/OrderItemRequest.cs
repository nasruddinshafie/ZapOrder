namespace ZapOrder.API.DTOs.Requests
{
    public class OrderItemRequest
    {
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
        public string? Notes { get; set; }
    }
}
