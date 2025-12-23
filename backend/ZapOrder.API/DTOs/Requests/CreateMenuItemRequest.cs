namespace ZapOrder.API.DTOs.Requests
{
    public class CreateMenuItemRequest
    {
        public int RestaurantId { get; set; }
        public int? CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
    }
}
