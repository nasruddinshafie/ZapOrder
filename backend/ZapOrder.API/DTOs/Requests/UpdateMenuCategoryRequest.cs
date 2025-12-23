namespace ZapOrder.API.DTOs.Requests
{
    public class UpdateMenuCategoryRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
