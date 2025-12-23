import { QrCode, Users, Edit, Trash2, Download } from 'lucide-react';
import { TableStatus, type TableResponse } from '../../types';
import { downloadTableQRCode } from '../../api/tables';

interface TableCardProps {
  table: TableResponse;
  onEdit: (table: TableResponse) => void;
  onDelete: (id: number) => void;
}

const getStatusConfig = (status: TableStatus) => {
  switch (status) {
    case TableStatus.Available:
      return {
        label: 'Available',
        color: 'bg-green-100 text-green-800 border-green-200',
        dotColor: 'bg-green-500',
      };
    case TableStatus.Occupied:
      return {
        label: 'Occupied',
        color: 'bg-red-100 text-red-800 border-red-200',
        dotColor: 'bg-red-500',
      };
    case TableStatus.Reserved:
      return {
        label: 'Reserved',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dotColor: 'bg-yellow-500',
      };
    default:
      return {
        label: TableStatus[status] || 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        dotColor: 'bg-gray-500',
      };
  }
};

export default function TableCard({ table, onEdit, onDelete }: TableCardProps) {
  const statusConfig = getStatusConfig(table.status);

  const handleDownloadQR = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadTableQRCode(table.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(table);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (table.activeOrdersCount > 0) {
      alert('Cannot delete table with active orders');
      return;
    }
    if (window.confirm(`Are you sure you want to delete table ${table.tableNumber}?`)) {
      onDelete(table.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Table {table.tableNumber}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Capacity: {table.capacity}</span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
          {statusConfig.label}
        </span>
      </div>

      {/* QR Code Preview */}
      <div className="mb-4 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
        {table.qrCode ? (
          <img
            src={`data:image/png;base64,${table.qrCode}`}
            alt={`QR Code for Table ${table.tableNumber}`}
            className="w-32 h-32"
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center text-gray-400">
            <QrCode className="w-16 h-16" />
          </div>
        )}
      </div>

      {/* Active Orders */}
      {table.activeOrdersCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{table.activeOrdersCount}</strong> active order
            {table.activeOrdersCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownloadQR}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>

        <button
          onClick={handleEdit}
          className="inline-flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit table"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={handleDelete}
          disabled={table.activeOrdersCount > 0}
          className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            table.activeOrdersCount > 0
              ? 'Cannot delete table with active orders'
              : 'Delete table'
          }
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
