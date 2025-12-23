import { Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Order } from '../../types';
import Button from '../ui/Button';

interface OrderTicketProps {
  order: Order;
  onStatusUpdate: (orderId: number, newStatus: 'Preparing' | 'Ready') => void;
}

export default function OrderTicket({ order, onStatusUpdate }: OrderTicketProps) {
  const isPending = order.status === 'Pending';
  const isPreparing = order.status === 'Preparing';

  const timeAgo = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true });

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 ${
      isPending ? 'border-yellow-400' : isPreparing ? 'border-blue-400' : 'border-green-400'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 ${
        isPending ? 'bg-yellow-50' : isPreparing ? 'bg-blue-50' : 'bg-green-50'
      } border-b`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Table {order.tableNumber}
            </h3>
            <p className="text-sm text-gray-600">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            {/* Quantity Badge */}
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              {item.quantity}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-lg">
                {item.menuItemName}
              </p>
              {item.notes && (
                <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-900 font-medium">
                    📝 {item.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        {isPending && (
          <Button
            variant="primary"
            onClick={() => onStatusUpdate(order.id, 'Preparing')}
            className="w-full py-3 text-lg"
          >
            Start Preparing
          </Button>
        )}

        {isPreparing && (
          <Button
            onClick={() => onStatusUpdate(order.id, 'Ready')}
            className="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark as Ready
          </Button>
        )}
      </div>
    </div>
  );
}
