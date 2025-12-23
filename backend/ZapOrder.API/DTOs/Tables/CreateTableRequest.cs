using System.ComponentModel.DataAnnotations;

namespace ZapOrder.API.DTOs.Tables
{
    public class CreateTableRequest
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        [StringLength(50)]
        public string TableNumber { get; set; } = null!;

        [Range(1, 50)]
        public int Capacity { get; set; }
    }
}
