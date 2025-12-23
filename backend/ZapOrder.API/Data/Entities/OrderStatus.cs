namespace ZapOrder.API.Data.Entities
{
    public enum OrderStatus
    {
        Pending = 1,
        Preparing = 2,
        Ready = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Paid = 2,
        Failed = 3,
        Refunded = 4
    }

    public enum TableStatus
    {
        Available = 1,
        Occupied = 2,
        Reserved = 3
    }
}
