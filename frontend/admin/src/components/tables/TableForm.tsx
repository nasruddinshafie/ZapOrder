import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TableStatus, type TableResponse } from '../../types';
import { useCreateTable, useUpdateTable } from '../../api/tables';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface TableFormProps {
  table?: TableResponse;
  onClose: () => void;
}

export default function TableForm({ table, onClose }: TableFormProps) {
  const [tableNumber, setTableNumber] = useState(table?.tableNumber || '');
  const [capacity, setCapacity] = useState(table?.capacity.toString() || '4');
  const [status, setStatus] = useState<TableStatus>(table?.status || TableStatus.Available);

  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable();

  const isEditing = !!table;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (table) {
      setTableNumber(table.tableNumber);
      setCapacity(table.capacity.toString());
      setStatus(table.status);
    }
  }, [table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const capacityNum = parseInt(capacity, 10);

    if (!tableNumber.trim()) {
      alert('Please enter a table number');
      return;
    }

    if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 50) {
      alert('Capacity must be between 1 and 50');
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: table.id,
          tableNumber: tableNumber.trim(),
          capacity: capacityNum,
          status,
        });
      } else {
        await createMutation.mutateAsync({
          tableNumber: tableNumber.trim(),
          capacity: capacityNum,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving table:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Table' : 'Add New Table'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Table Number */}
          <Input
            label="Table Number"
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g., 1, A1, T-101"
            required
            maxLength={50}
            disabled={isLoading}
          />

          {/* Capacity */}
          <Input
            label="Capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Number of seats"
            required
            min={1}
            max={50}
            disabled={isLoading}
          />

          {/* Status (only for editing) */}
          {isEditing && (
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value) as TableStatus)}
              disabled={isLoading}
              options={[
                { value: TableStatus.Available, label: 'Available' },
                { value: TableStatus.Occupied, label: 'Occupied' },
                { value: TableStatus.Reserved, label: 'Reserved' },
              ]}
            />
          )}

          {/* Info */}
          {!isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                A unique QR code will be automatically generated for this table.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Table' : 'Create Table'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
