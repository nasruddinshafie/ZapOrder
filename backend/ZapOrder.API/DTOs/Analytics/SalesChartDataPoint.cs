namespace ZapOrder.API.DTOs.Analytics
{
    public class SalesChartDataPoint
    {
        public string Date { get; set; } = null!;
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }
}
