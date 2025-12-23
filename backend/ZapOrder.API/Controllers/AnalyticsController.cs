using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZapOrder.API.DTOs.Analytics;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Controllers
{
    /// <summary>
    /// Analytics and dashboard statistics
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// Get dashboard statistics for a restaurant
        /// </summary>
        [HttpGet("dashboard/{restaurantId}")]
        [ProducesResponseType(typeof(DashboardStatsResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<DashboardStatsResponse>> GetDashboardStats(
            int restaurantId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var stats = await _analyticsService.GetDashboardStatsAsync(restaurantId, startDate, endDate);
            return Ok(stats);
        }

        /// <summary>
        /// Get sales chart data for a restaurant
        /// </summary>
        [HttpGet("sales-chart/{restaurantId}")]
        [ProducesResponseType(typeof(List<SalesChartDataPoint>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<SalesChartDataPoint>>> GetSalesChartData(
            int restaurantId,
            [FromQuery] int days = 7)
        {
            var chartData = await _analyticsService.GetSalesChartDataAsync(restaurantId, days);
            return Ok(chartData);
        }

        /// <summary>
        /// Get top selling items for a restaurant
        /// </summary>
        [HttpGet("top-items/{restaurantId}")]
        [ProducesResponseType(typeof(List<TopSellingItemResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<TopSellingItemResponse>>> GetTopSellingItems(
            int restaurantId,
            [FromQuery] int limit = 10)
        {
            var topItems = await _analyticsService.GetTopSellingItemsAsync(restaurantId, limit);
            return Ok(topItems);
        }
    }
}
