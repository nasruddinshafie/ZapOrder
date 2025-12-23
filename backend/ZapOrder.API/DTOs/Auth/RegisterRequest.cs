using System.ComponentModel.DataAnnotations;

namespace ZapOrder.API.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Name { get; set; } = null!;

        [Required]
        [EmailAddress]
        [StringLength(256)]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = null!;

        [StringLength(100)]
        public string? Phone { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }
    }
}
