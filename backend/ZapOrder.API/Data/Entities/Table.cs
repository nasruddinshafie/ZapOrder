namespace ZapOrder.API.Data.Entities
{
    public class Table
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string TableNumber { get; set; } = null!;
        public string QRCode { get; set; } = null!;
        public int Capacity { get; set; }
        public TableStatus Status { get; set; }

        public Restaurant Restaurant { get; set; } = null!;
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
