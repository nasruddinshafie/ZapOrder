using Microsoft.EntityFrameworkCore;
using ZapOrder.API.Data;
using ZapOrder.API.Data.Entities;
using ZapOrder.API.DTOs.Requests;
using ZapOrder.API.DTOs.Responses;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Services.Implementation
{
    public class MenuService : IMenuService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MenuService> _logger;

        public MenuService(AppDbContext context, ILogger<MenuService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region MenuCategory Operations

        public async Task<MenuCategoryResponse> CreateMenuCategoryAsync(CreateMenuCategoryRequest request)
        {
            // Validate restaurant exists
            var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
            if (restaurant == null)
                throw new Exception("Restaurant not found");

            // Check if category name already exists for this restaurant
            var existingCategory = await _context.MenuCategories
                .FirstOrDefaultAsync(c => c.RestaurantId == request.RestaurantId && c.Name == request.Name);

            if (existingCategory != null)
                throw new Exception("Category with this name already exists for the restaurant");

            var category = new MenuCategory
            {
                RestaurantId = request.RestaurantId,
                Name = request.Name,
                Description = request.Description,
                DisplayOrder = request.DisplayOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.MenuCategories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu category {CategoryName} created for restaurant {RestaurantId}",
                category.Name, request.RestaurantId);

            return MapMenuCategoryToResponse(category);
        }

        public async Task<MenuCategoryResponse?> GetMenuCategoryByIdAsync(int id, int restaurantId)
        {
            var category = await _context.MenuCategories
                .Where(c => c.Id == id && c.RestaurantId == restaurantId)
                .Include(c => c.MenuItems)
                .FirstOrDefaultAsync();

            if (category == null)
                return null;

            return MapMenuCategoryToResponse(category);
        }

        public async Task<List<MenuCategoryResponse>> GetRestaurantCategoriesAsync(int restaurantId, bool? isActiveOnly = null)
        {
            var query = _context.MenuCategories
                .Where(c => c.RestaurantId == restaurantId);

            if (isActiveOnly.HasValue && isActiveOnly.Value)
                query = query.Where(c => c.IsActive);

            var categories = await query
                .Include(c => c.MenuItems)
                .OrderBy(c => c.DisplayOrder)
                .ToListAsync();

            return categories.Select(MapMenuCategoryToResponse).ToList();
        }

        public async Task<bool> UpdateMenuCategoryAsync(int id, int restaurantId, UpdateMenuCategoryRequest request)
        {
            var category = await _context.MenuCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == restaurantId);

            if (category == null)
                return false;

            // Check if new name already exists (if name is being updated)
            if (!string.IsNullOrEmpty(request.Name) && request.Name != category.Name)
            {
                var existingCategory = await _context.MenuCategories
                    .FirstOrDefaultAsync(c => c.RestaurantId == restaurantId &&
                                             c.Name == request.Name &&
                                             c.Id != id);
                if (existingCategory != null)
                    throw new Exception("Category with this name already exists for the restaurant");

                category.Name = request.Name;
            }

            if (request.Description != null)
                category.Description = request.Description;

            if (request.DisplayOrder.HasValue)
                category.DisplayOrder = request.DisplayOrder.Value;

            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu category {CategoryId} updated for restaurant {RestaurantId}",
                id, restaurantId);

            return true;
        }

        public async Task<bool> DeleteMenuCategoryAsync(int id, int restaurantId)
        {
            var category = await _context.MenuCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == restaurantId);

            if (category == null)
                return false;

            // Check if category has menu items
            var hasItems = await _context.MenuItems
                .AnyAsync(m => m.CategoryId == id && m.RestaurantId == restaurantId);

            if (hasItems)
                throw new Exception("Cannot delete category with active menu items");

            _context.MenuCategories.Remove(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu category {CategoryId} deleted for restaurant {RestaurantId}",
                id, restaurantId);

            return true;
        }

        public async Task<bool> ToggleCategoryActiveStatusAsync(int id, int restaurantId)
        {
            var category = await _context.MenuCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == restaurantId);

            if (category == null)
                return false;

            category.IsActive = !category.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu category {CategoryId} active status toggled to {IsActive} for restaurant {RestaurantId}",
                id, category.IsActive, restaurantId);

            return true;
        }

        public async Task<bool> ReorderCategoryAsync(int id, int restaurantId, int newDisplayOrder)
        {
            var category = await _context.MenuCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.RestaurantId == restaurantId);

            if (category == null)
                return false;

            category.DisplayOrder = newDisplayOrder;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu category {CategoryId} reordered to position {DisplayOrder} for restaurant {RestaurantId}",
                id, newDisplayOrder, restaurantId);

            return true;
        }

        #endregion

        #region MenuItem Operations

        public async Task<MenuItemResponse> CreateMenuItemAsync(CreateMenuItemRequest request)
        {
            // Validate restaurant exists
            var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
            if (restaurant == null)
                throw new Exception("Restaurant not found");

            // Validate category if provided
            if (request.CategoryId.HasValue)
            {
                var category = await _context.MenuCategories
                    .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.RestaurantId == request.RestaurantId);
                if (category == null)
                    throw new Exception("Category not found for the restaurant");
            }

            // Validate price
            if (request.Price <= 0)
                throw new Exception("Price must be greater than zero");

            var menuItem = new MenuItem
            {
                RestaurantId = request.RestaurantId,
                CategoryId = request.CategoryId,
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                ImageUrl = request.ImageUrl,
                IsAvailable = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.MenuItems.Add(menuItem);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu item {ItemName} created for restaurant {RestaurantId}",
                menuItem.Name, request.RestaurantId);

            return MapMenuItemToResponse(menuItem);
        }

        public async Task<MenuItemResponse?> GetMenuItemByIdAsync(int id, int restaurantId)
        {
            var menuItem = await _context.MenuItems
                .Where(m => m.Id == id && m.RestaurantId == restaurantId)
                .Include(m => m.Category)
                .FirstOrDefaultAsync();

            if (menuItem == null)
                return null;

            return MapMenuItemToResponse(menuItem);
        }

        public async Task<List<MenuItemResponse>> GetRestaurantMenuItemsAsync(int restaurantId, int? categoryId = null, bool? isAvailableOnly = null)
        {
            var query = _context.MenuItems
                .Where(m => m.RestaurantId == restaurantId);

            if (categoryId.HasValue)
                query = query.Where(m => m.CategoryId == categoryId);

            if (isAvailableOnly.HasValue && isAvailableOnly.Value)
                query = query.Where(m => m.IsAvailable);

            var items = await query
                .Include(m => m.Category)
                .OrderBy(m => m.Category != null ? m.Category.DisplayOrder : int.MaxValue)
                .ThenBy(m => m.Name)
                .ToListAsync();

            return items.Select(MapMenuItemToResponse).ToList();
        }

        public async Task<List<MenuItemResponse>> SearchMenuItemsAsync(int restaurantId, string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return new List<MenuItemResponse>();

            var normalizedSearch = searchTerm.ToLower().Trim();

            var items = await _context.MenuItems
                .Where(m => m.RestaurantId == restaurantId &&
                           m.IsAvailable &&
                           (m.Name.ToLower().Contains(normalizedSearch) ||
                            m.Description != null && m.Description.ToLower().Contains(normalizedSearch)))
                .Include(m => m.Category)
                .OrderBy(m => m.Name)
                .ToListAsync();

            return items.Select(MapMenuItemToResponse).ToList();
        }

        public async Task<bool> UpdateMenuItemAsync(int id, int restaurantId, UpdateMenuItemRequest request)
        {
            var menuItem = await _context.MenuItems
                .FirstOrDefaultAsync(m => m.Id == id && m.RestaurantId == restaurantId);

            if (menuItem == null)
                return false;

            // Validate new category if provided
            if (request.CategoryId.HasValue && request.CategoryId != menuItem.CategoryId)
            {
                var category = await _context.MenuCategories
                    .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.RestaurantId == restaurantId);
                if (category == null)
                    throw new Exception("Category not found for the restaurant");

                menuItem.CategoryId = request.CategoryId;
            }

            // Validate price if provided
            if (request.Price.HasValue && request.Price <= 0)
                throw new Exception("Price must be greater than zero");

            if (!string.IsNullOrEmpty(request.Name))
                menuItem.Name = request.Name;

            if (request.Description != null)
                menuItem.Description = request.Description;

            if (request.Price.HasValue)
                menuItem.Price = request.Price.Value;

            if (request.ImageUrl != null)
                menuItem.ImageUrl = request.ImageUrl;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu item {ItemId} updated for restaurant {RestaurantId}",
                id, restaurantId);

            return true;
        }

        public async Task<bool> DeleteMenuItemAsync(int id, int restaurantId)
        {
            var menuItem = await _context.MenuItems
                .FirstOrDefaultAsync(m => m.Id == id && m.RestaurantId == restaurantId);

            if (menuItem == null)
                return false;

            // Check if item is referenced in any active orders
            var isInActiveOrder = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.MenuItemId == id &&
                               (oi.Order.Status == OrderStatus.Pending ||
                                oi.Order.Status == OrderStatus.Preparing));

            if (isInActiveOrder)
                throw new Exception("Cannot delete menu item that is in active orders");

            _context.MenuItems.Remove(menuItem);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu item {ItemId} deleted for restaurant {RestaurantId}",
                id, restaurantId);

            return true;
        }

        public async Task<bool> ToggleMenuItemAvailabilityAsync(int id, int restaurantId)
        {
            var menuItem = await _context.MenuItems
                .FirstOrDefaultAsync(m => m.Id == id && m.RestaurantId == restaurantId);

            if (menuItem == null)
                return false;

            menuItem.IsAvailable = !menuItem.IsAvailable;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Menu item {ItemId} availability toggled to {IsAvailable} for restaurant {RestaurantId}",
                id, menuItem.IsAvailable, restaurantId);

            return true;
        }

        #endregion

        #region Mapping Methods

        private MenuCategoryResponse MapMenuCategoryToResponse(MenuCategory category)
        {
            return new MenuCategoryResponse
            {
                Id = category.Id,
                RestaurantId = category.RestaurantId,
                Name = category.Name,
                Description = category.Description,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ItemCount = category.MenuItems?.Count ?? 0
            };
        }

        private MenuItemResponse MapMenuItemToResponse(MenuItem menuItem)
        {
            return new MenuItemResponse
            {
                Id = menuItem.Id,
                RestaurantId = menuItem.RestaurantId,
                CategoryId = menuItem.CategoryId,
                CategoryName = menuItem.Category?.Name,
                Name = menuItem.Name,
                Description = menuItem.Description,
                Price = menuItem.Price,
                ImageUrl = menuItem.ImageUrl,
                IsAvailable = menuItem.IsAvailable,
                CreatedAt = menuItem.CreatedAt
            };
        }

        #endregion
    }
}
