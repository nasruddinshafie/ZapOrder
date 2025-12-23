
namespace ZapOrder.API.Data.Entities
{
    public class Order
    {
        public int Id { get; set; }

        public string OrderNumber { get; set; } = null!;

        public int TableId { get; set; }

        public int RestaurantId { get; set; }

        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        public Table Table { get; set; } = null!;
        public Restaurant Restaurant { get; set; } = null!;
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    }
}
