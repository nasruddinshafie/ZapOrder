using Microsoft.EntityFrameworkCore;
using QRCoder;
using System.Text.Json;
using ZapOrder.API.Data;
using ZapOrder.API.Data.Entities;
using ZapOrder.API.DTOs.Tables;
using ZapOrder.API.Services.Interfaces;

namespace ZapOrder.API.Services.Implementation
{
    public class TableService : ITableService
    {
        private readonly AppDbContext _context;

        public TableService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TableResponse>> GetRestaurantTablesAsync(int restaurantId)
        {
            var tables = await _context.Tables
                .Where(t => t.RestaurantId == restaurantId)
                .OrderBy(t => t.TableNumber)
                .ToListAsync();

            var tableResponses = new List<TableResponse>();

            foreach (var table in tables)
            {
                var activeOrdersCount = await _context.Orders
                    .Where(o => o.TableId == table.Id &&
                               (o.Status == OrderStatus.Pending ||
                                o.Status == OrderStatus.Preparing ||
                                o.Status == OrderStatus.Ready))
                    .CountAsync();

                tableResponses.Add(new TableResponse
                {
                    Id = table.Id,
                    RestaurantId = table.RestaurantId,
                    TableNumber = table.TableNumber,
                    QRCode = table.QRCode,
                    Capacity = table.Capacity,
                    Status = table.Status,
                    ActiveOrdersCount = activeOrdersCount
                });
            }

            return tableResponses;
        }

        public async Task<TableResponse> GetTableByIdAsync(int id)
        {
            var table = await _context.Tables.FindAsync(id);

            if (table == null)
            {
                throw new KeyNotFoundException($"Table with ID {id} not found.");
            }

            var activeOrdersCount = await _context.Orders
                .Where(o => o.TableId == table.Id &&
                           (o.Status == OrderStatus.Pending ||
                            o.Status == OrderStatus.Preparing ||
                            o.Status == OrderStatus.Ready))
                .CountAsync();

            return new TableResponse
            {
                Id = table.Id,
                RestaurantId = table.RestaurantId,
                TableNumber = table.TableNumber,
                QRCode = table.QRCode,
                Capacity = table.Capacity,
                Status = table.Status,
                ActiveOrdersCount = activeOrdersCount
            };
        }

        public async Task<TableResponse> CreateTableAsync(CreateTableRequest request)
        {
            // Check if table number already exists for this restaurant
            var existingTable = await _context.Tables
                .FirstOrDefaultAsync(t => t.RestaurantId == request.RestaurantId &&
                                         t.TableNumber == request.TableNumber);

            if (existingTable != null)
            {
                throw new InvalidOperationException($"Table number '{request.TableNumber}' already exists for this restaurant.");
            }

            var table = new Table
            {
                RestaurantId = request.RestaurantId,
                TableNumber = request.TableNumber,
                Capacity = request.Capacity,
                Status = TableStatus.Available,
                QRCode = string.Empty // Will be generated after saving to get the ID
            };

            _context.Tables.Add(table);
            await _context.SaveChangesAsync();

            // Generate QR code with table ID
            table.QRCode = GenerateQRCodeBase64(table.Id, table.RestaurantId);
            await _context.SaveChangesAsync();

            return new TableResponse
            {
                Id = table.Id,
                RestaurantId = table.RestaurantId,
                TableNumber = table.TableNumber,
                QRCode = table.QRCode,
                Capacity = table.Capacity,
                Status = table.Status,
                ActiveOrdersCount = 0
            };
        }

        public async Task<TableResponse> UpdateTableAsync(int id, UpdateTableRequest request)
        {
            var table = await _context.Tables.FindAsync(id);

            if (table == null)
            {
                throw new KeyNotFoundException($"Table with ID {id} not found.");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(request.TableNumber))
            {
                // Check if new table number conflicts with existing tables
                var existingTable = await _context.Tables
                    .FirstOrDefaultAsync(t => t.RestaurantId == table.RestaurantId &&
                                             t.TableNumber == request.TableNumber &&
                                             t.Id != id);

                if (existingTable != null)
                {
                    throw new InvalidOperationException($"Table number '{request.TableNumber}' already exists for this restaurant.");
                }

                table.TableNumber = request.TableNumber;
            }

            if (request.Capacity.HasValue)
            {
                table.Capacity = request.Capacity.Value;
            }

            if (request.Status.HasValue)
            {
                table.Status = request.Status.Value;
            }

            await _context.SaveChangesAsync();

            var activeOrdersCount = await _context.Orders
                .Where(o => o.TableId == table.Id &&
                           (o.Status == OrderStatus.Pending ||
                            o.Status == OrderStatus.Preparing ||
                            o.Status == OrderStatus.Ready))
                .CountAsync();

            return new TableResponse
            {
                Id = table.Id,
                RestaurantId = table.RestaurantId,
                TableNumber = table.TableNumber,
                QRCode = table.QRCode,
                Capacity = table.Capacity,
                Status = table.Status,
                ActiveOrdersCount = activeOrdersCount
            };
        }

        public async Task<bool> DeleteTableAsync(int id)
        {
            var table = await _context.Tables.FindAsync(id);

            if (table == null)
            {
                throw new KeyNotFoundException($"Table with ID {id} not found.");
            }

            // Check if table has active orders
            var hasActiveOrders = await _context.Orders
                .AnyAsync(o => o.TableId == id &&
                              (o.Status == OrderStatus.Pending ||
                               o.Status == OrderStatus.Preparing ||
                               o.Status == OrderStatus.Ready));

            if (hasActiveOrders)
            {
                throw new InvalidOperationException("Cannot delete table with active orders.");
            }

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<byte[]> GenerateQRCodeAsync(int tableId)
        {
            var table = await _context.Tables.FindAsync(tableId);

            if (table == null)
            {
                throw new KeyNotFoundException($"Table with ID {tableId} not found.");
            }

            // Generate QR code data
            var qrData = new
            {
                tableId = table.Id,
                restaurantId = table.RestaurantId,
                tableNumber = table.TableNumber
            };

            var qrContent = JsonSerializer.Serialize(qrData);

            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);

            return qrCode.GetGraphic(20); // 20 pixels per module
        }

        private string GenerateQRCodeBase64(int tableId, int restaurantId)
        {
            // Generate QR code data
            var qrData = new
            {
                tableId = tableId,
                restaurantId = restaurantId
            };

            var qrContent = JsonSerializer.Serialize(qrData);

            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeImage = qrCode.GetGraphic(20);

            return Convert.ToBase64String(qrCodeImage);
        }
    }
}
