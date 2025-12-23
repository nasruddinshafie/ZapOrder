namespace ZapOrder.API.DTOs.Responses
{
    public class OrderItemResponse
    {
        public int Id { get; set; }
        public string MenuItemName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public string? Notes { get; set; }
    }
}
