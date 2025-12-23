using ZapOrder.API.DTOs.Analytics;

namespace ZapOrder.API.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<DashboardStatsResponse> GetDashboardStatsAsync(int restaurantId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<SalesChartDataPoint>> GetSalesChartDataAsync(int restaurantId, int days = 7);
        Task<List<TopSellingItemResponse>> GetTopSellingItemsAsync(int restaurantId, int limit = 10);
    }
}
