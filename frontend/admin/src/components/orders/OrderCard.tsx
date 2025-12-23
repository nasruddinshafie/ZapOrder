import { format } from 'date-fns';
import { Clock, Hash, Users } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import Button from '../ui/Button';
import StatusBadge from './StatusBadge';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: number, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
}

export default function OrderCard({ order, onUpdateStatus, onViewDetails }: OrderCardProps) {
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      Pending: 'Preparing',
      Preparing: 'Ready',
      Ready: 'Completed',
      Completed: null,
      Cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const nextStatus = getNextStatus(order.status as OrderStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Table {order.tableNumber}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(order.createdAt), 'HH:mm')}
            </div>
          </div>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.slice(0, 3).map((item, index) => (
          <div key={index} className="text-sm flex justify-between">
            <span className="text-gray-700">
              {item.quantity}x {item.menuItemName}
            </span>
            <span className="text-gray-900 font-medium">${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-sm text-gray-500">
            +{order.items.length - 3} more items
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-3 border-t mb-3">
        <span className="text-sm font-medium text-gray-700">Total</span>
        <span className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onViewDetails(order)}
          className="flex-1"
        >
          View Details
        </Button>
        {nextStatus && (
          <Button
            size="sm"
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="flex-1"
          >
            Mark as {nextStatus}
          </Button>
        )}
      </div>
    </div>
  );
}
