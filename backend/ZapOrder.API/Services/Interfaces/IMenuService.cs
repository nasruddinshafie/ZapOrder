using ZapOrder.API.DTOs.Requests;
using ZapOrder.API.DTOs.Responses;

namespace ZapOrder.API.Services.Interfaces
{
    public interface IMenuService
    {
        // MenuCategory Operations
        Task<MenuCategoryResponse> CreateMenuCategoryAsync(CreateMenuCategoryRequest request);
        Task<MenuCategoryResponse?> GetMenuCategoryByIdAsync(int id, int restaurantId);
        Task<List<MenuCategoryResponse>> GetRestaurantCategoriesAsync(int restaurantId, bool? isActiveOnly = null);
        Task<bool> UpdateMenuCategoryAsync(int id, int restaurantId, UpdateMenuCategoryRequest request);
        Task<bool> DeleteMenuCategoryAsync(int id, int restaurantId);
        Task<bool> ToggleCategoryActiveStatusAsync(int id, int restaurantId);
        Task<bool> ReorderCategoryAsync(int id, int restaurantId, int newDisplayOrder);

        // MenuItem Operations
        Task<MenuItemResponse> CreateMenuItemAsync(CreateMenuItemRequest request);
        Task<MenuItemResponse?> GetMenuItemByIdAsync(int id, int restaurantId);
        Task<List<MenuItemResponse>> GetRestaurantMenuItemsAsync(int restaurantId, int? categoryId = null, bool? isAvailableOnly = null);
        Task<List<MenuItemResponse>> SearchMenuItemsAsync(int restaurantId, string searchTerm);
        Task<bool> UpdateMenuItemAsync(int id, int restaurantId, UpdateMenuItemRequest request);
        Task<bool> DeleteMenuItemAsync(int id, int restaurantId);
        Task<bool> ToggleMenuItemAvailabilityAsync(int id, int restaurantId);
    }
}
