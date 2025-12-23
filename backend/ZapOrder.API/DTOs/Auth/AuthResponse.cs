namespace ZapOrder.API.DTOs.Auth
{
    public class AuthResponse
    {
        public int RestaurantId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
