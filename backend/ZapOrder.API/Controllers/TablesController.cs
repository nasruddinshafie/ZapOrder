using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZapOrder.API.DTOs.Tables;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Controllers
{
    /// <summary>
    /// Manages restaurant tables and QR code generation
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TablesController : ControllerBase
    {
        private readonly ITableService _tableService;
        private readonly ILogger<TablesController> _logger;

        public TablesController(ITableService tableService, ILogger<TablesController> logger)
        {
            _tableService = tableService;
            _logger = logger;
        }

        /// <summary>
        /// Get all tables for a specific restaurant
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <returns>List of tables with their current status and active orders count</returns>
        [HttpGet("restaurant/{restaurantId}")]
        [ProducesResponseType(typeof(List<TableResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<TableResponse>>> GetRestaurantTables(int restaurantId)
        {
            try
            {
                var tables = await _tableService.GetRestaurantTablesAsync(restaurantId);
                return Ok(tables);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tables for restaurant {RestaurantId}", restaurantId);
                return StatusCode(500, new { message = "An error occurred while retrieving tables." });
            }
        }

        /// <summary>
        /// Get a specific table by ID
        /// </summary>
        /// <param name="id">The table ID</param>
        /// <returns>Table details with active orders count</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TableResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<TableResponse>> GetTableById(int id)
        {
            try
            {
                var table = await _tableService.GetTableByIdAsync(id);
                return Ok(table);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving table {TableId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the table." });
            }
        }

        /// <summary>
        /// Create a new table
        /// </summary>
        /// <param name="request">Table creation details</param>
        /// <returns>Created table with generated QR code</returns>
        [HttpPost]
        [ProducesResponseType(typeof(TableResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<TableResponse>> CreateTable([FromBody] CreateTableRequest request)
        {
            try
            {
                var table = await _tableService.CreateTableAsync(request);
                return CreatedAtAction(nameof(GetTableById), new { id = table.Id }, table);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating table");
                return StatusCode(500, new { message = "An error occurred while creating the table." });
            }
        }

        /// <summary>
        /// Update an existing table
        /// </summary>
        /// <param name="id">The table ID</param>
        /// <param name="request">Updated table details</param>
        /// <returns>Updated table information</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(TableResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<TableResponse>> UpdateTable(int id, [FromBody] UpdateTableRequest request)
        {
            try
            {
                var table = await _tableService.UpdateTableAsync(id, request);
                return Ok(table);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating table {TableId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the table." });
            }
        }

        /// <summary>
        /// Delete a table
        /// </summary>
        /// <param name="id">The table ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteTable(int id)
        {
            try
            {
                await _tableService.DeleteTableAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting table {TableId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the table." });
            }
        }

        /// <summary>
        /// Download QR code for a specific table as PNG image
        /// </summary>
        /// <param name="id">The table ID</param>
        /// <returns>PNG image file of the QR code</returns>
        [HttpGet("{id}/qrcode")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DownloadQRCode(int id)
        {
            try
            {
                var qrCodeBytes = await _tableService.GenerateQRCodeAsync(id);
                return File(qrCodeBytes, "image/png", $"table-{id}-qrcode.png");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating QR code for table {TableId}", id);
                return StatusCode(500, new { message = "An error occurred while generating the QR code." });
            }
        }
    }
}
