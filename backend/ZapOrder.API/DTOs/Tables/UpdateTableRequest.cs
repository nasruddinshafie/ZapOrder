using System.ComponentModel.DataAnnotations;
using ZapOrder.API.Data.Entities;

namespace ZapOrder.API.DTOs.Tables
{
    public class UpdateTableRequest
    {
        [StringLength(50)]
        public string? TableNumber { get; set; }

        [Range(1, 50)]
        public int? Capacity { get; set; }

        public TableStatus? Status { get; set; }
    }
}
