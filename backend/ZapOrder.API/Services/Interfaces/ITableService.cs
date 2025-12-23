using ZapOrder.API.DTOs.Tables;

namespace ZapOrder.API.Services.Interfaces
{
    public interface ITableService
    {
        Task<List<TableResponse>> GetRestaurantTablesAsync(int restaurantId);
        Task<TableResponse> GetTableByIdAsync(int id);
        Task<TableResponse> CreateTableAsync(CreateTableRequest request);
        Task<TableResponse> UpdateTableAsync(int id, UpdateTableRequest request);
        Task<bool> DeleteTableAsync(int id);
        Task<byte[]> GenerateQRCodeAsync(int tableId);
    }
}
