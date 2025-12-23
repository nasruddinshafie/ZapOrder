namespace ZapOrder.API.DTOs.Analytics
{
    public class DashboardStatsResponse
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int PendingOrders { get; set; }
        public int CompletedOrdersToday { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal RevenueGrowth { get; set; } // Percentage compared to previous period
    }
}
