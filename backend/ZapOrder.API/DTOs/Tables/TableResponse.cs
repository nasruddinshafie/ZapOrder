using ZapOrder.API.Data.Entities;

namespace ZapOrder.API.DTOs.Tables
{
    public class TableResponse
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string TableNumber { get; set; } = null!;
        public string QRCode { get; set; } = null!;
        public int Capacity { get; set; }
        public TableStatus Status { get; set; }
        public int ActiveOrdersCount { get; set; }
    }
}
