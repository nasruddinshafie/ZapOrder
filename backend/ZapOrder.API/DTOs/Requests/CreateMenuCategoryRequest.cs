namespace ZapOrder.API.DTOs.Requests
{
    public class CreateMenuCategoryRequest
    {
        public int RestaurantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
    }
}
