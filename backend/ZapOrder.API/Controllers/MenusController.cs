using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZapOrder.API.DTOs.Requests;
using ZapOrder.API.DTOs.Responses;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MenusController : ControllerBase
    {
        private readonly IMenuService _menuService;
        private readonly ILogger<MenusController> _logger;

        public MenusController(IMenuService menuService, ILogger<MenusController> logger)
        {
            _menuService = menuService;
            _logger = logger;
        }

        #region MenuCategory Endpoints

        /// <summary>
        /// Create a new menu category
        /// </summary>
        [HttpPost("categories")]
        [ProducesResponseType(typeof(MenuCategoryResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CreateMenuCategoryRequest request)
        {
            try
            {
                var category = await _menuService.CreateMenuCategoryAsync(request);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id, restaurantId = category.RestaurantId }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating menu category");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get a menu category by ID
        /// </summary>
        [HttpGet("categories/{id}")]
        [ProducesResponseType(typeof(MenuCategoryResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCategory(int id, [FromQuery] int restaurantId)
        {
            var category = await _menuService.GetMenuCategoryByIdAsync(id, restaurantId);

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        /// <summary>
        /// Get all categories for a restaurant
        /// </summary>
        [HttpGet("categories/restaurant/{restaurantId}")]
        [ProducesResponseType(typeof(List<MenuCategoryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRestaurantCategories(
            int restaurantId,
            [FromQuery] bool? isActiveOnly = null)
        {
            var categories = await _menuService.GetRestaurantCategoriesAsync(restaurantId, isActiveOnly);
            return Ok(categories);
        }

        /// <summary>
        /// Update a menu category
        /// </summary>
        [HttpPut("categories/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateCategory(
            int id,
            [FromQuery] int restaurantId,
            [FromBody] UpdateMenuCategoryRequest request)
        {
            try
            {
                var success = await _menuService.UpdateMenuCategoryAsync(id, restaurantId, request);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating menu category {CategoryId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a menu category
        /// </summary>
        [HttpDelete("categories/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteCategory(int id, [FromQuery] int restaurantId)
        {
            try
            {
                var success = await _menuService.DeleteMenuCategoryAsync(id, restaurantId);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting menu category {CategoryId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Toggle category active status
        /// </summary>
        [HttpPut("categories/{id}/toggle-active")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ToggleCategoryActive(int id, [FromQuery] int restaurantId)
        {
            var success = await _menuService.ToggleCategoryActiveStatusAsync(id, restaurantId);

            if (!success)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Reorder a category
        /// </summary>
        [HttpPut("categories/{id}/reorder")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReorderCategory(
            int id,
            [FromQuery] int restaurantId,
            [FromQuery] int newDisplayOrder)
        {
            var success = await _menuService.ReorderCategoryAsync(id, restaurantId, newDisplayOrder);

            if (!success)
                return NotFound();

            return NoContent();
        }

        #endregion

        #region MenuItem Endpoints

        /// <summary>
        /// Create a new menu item
        /// </summary>
        [HttpPost("items")]
        [ProducesResponseType(typeof(MenuItemResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateItem([FromBody] CreateMenuItemRequest request)
        {
            try
            {
                var item = await _menuService.CreateMenuItemAsync(request);
                return CreatedAtAction(nameof(GetItem), new { id = item.Id, restaurantId = item.RestaurantId }, item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating menu item");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get a menu item by ID
        /// </summary>
        [HttpGet("items/{id}")]
        [ProducesResponseType(typeof(MenuItemResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetItem(int id, [FromQuery] int restaurantId)
        {
            var item = await _menuService.GetMenuItemByIdAsync(id, restaurantId);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        /// <summary>
        /// Get all menu items for a restaurant
        /// </summary>
        [HttpGet("items/restaurant/{restaurantId}")]
        [ProducesResponseType(typeof(List<MenuItemResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRestaurantItems(
            int restaurantId,
            [FromQuery] int? categoryId = null,
            [FromQuery] bool? isAvailableOnly = null)
        {
            var items = await _menuService.GetRestaurantMenuItemsAsync(restaurantId, categoryId, isAvailableOnly);
            return Ok(items);
        }

        /// <summary>
        /// Search menu items by name or description
        /// </summary>
        [HttpGet("items/search")]
        [ProducesResponseType(typeof(List<MenuItemResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchItems(
            [FromQuery] int restaurantId,
            [FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Search term is required" });

            var items = await _menuService.SearchMenuItemsAsync(restaurantId, searchTerm);
            return Ok(items);
        }

        /// <summary>
        /// Update a menu item
        /// </summary>
        [HttpPut("items/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateItem(
            int id,
            [FromQuery] int restaurantId,
            [FromBody] UpdateMenuItemRequest request)
        {
            try
            {
                var success = await _menuService.UpdateMenuItemAsync(id, restaurantId, request);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating menu item {ItemId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a menu item
        /// </summary>
        [HttpDelete("items/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteItem(int id, [FromQuery] int restaurantId)
        {
            try
            {
                var success = await _menuService.DeleteMenuItemAsync(id, restaurantId);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting menu item {ItemId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Toggle menu item availability
        /// </summary>
        [HttpPut("items/{id}/toggle-availability")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ToggleItemAvailability(int id, [FromQuery] int restaurantId)
        {
            var success = await _menuService.ToggleMenuItemAvailabilityAsync(id, restaurantId);

            if (!success)
                return NotFound();

            return NoContent();
        }

        #endregion
    }
}
