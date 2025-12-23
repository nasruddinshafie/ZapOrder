namespace ZapOrder.API.DTOs.Analytics
{
    public class TopSellingItemResponse
    {
        public int MenuItemId { get; set; }
        public string MenuItemName { get; set; } = null!;
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrderCount { get; set; }
    }
}
