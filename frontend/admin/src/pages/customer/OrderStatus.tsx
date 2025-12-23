import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChefHat, Bell, Home, Wifi, WifiOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrder } from '../../api/orders';
import { useOrderSignalR } from '../../hooks/useSignalR';
import { OrderStatus as OrderStatusEnum } from '../../types';
import type { Order } from '../../types';
import Button from '../../components/ui/Button';

export default function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch order (no polling, SignalR will handle updates)
  const { data: order, isLoading } = useOrder(Number(orderId), undefined);

  // SignalR real-time connection for this specific order
  const { isConnected } = useOrderSignalR(
    undefined,
    Number(orderId),
    undefined,
    (_updatedOrder: Order) => {
      // Order status updated - invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['order', Number(orderId)] });
    }
  );

  useEffect(() => {
    // Play notification sound when order is ready (in production)
    if (order?.status === 'Ready') {
      // You could add a notification sound here
    }
  }, [order?.status]);

  if (isLoading && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-gray-600 mb-4">Order not found</p>
        <Button variant="primary" onClick={() => navigate('/customer')}>
          Start New Order
        </Button>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case OrderStatusEnum.Pending:
        return 1;
      case OrderStatusEnum.Preparing:
        return 2;
      case OrderStatusEnum.Ready:
        return 3;
      case OrderStatusEnum.Completed:
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(order.status);
  const isCompleted = currentStep === 4;
  const isReady = currentStep >= 3;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Status</h1>
          <p className="text-gray-600">
            Order #{order.orderNumber} • Table {order.tableNumber}
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Status Alert */}
        {isReady && !isCompleted && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Your order is ready!</p>
                <p className="text-sm text-green-700">Please collect it from the counter</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-6">
            {/* Step 1: Pending */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep >= 1 ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>
                {currentStep < 4 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-gray-900">Order Received</h3>
                <p className="text-sm text-gray-600">We've received your order</p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= 2
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <ChefHat className="w-6 h-6" />
                </div>
                {currentStep < 4 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-gray-900">Preparing</h3>
                <p className="text-sm text-gray-600">
                  {currentStep >= 2
                    ? 'Your order is being prepared'
                    : 'Waiting to start preparation'}
                </p>
              </div>
            </div>

            {/* Step 3: Ready */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= 3
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Bell className="w-6 h-6" />
                </div>
                {currentStep < 4 && <div className="w-0.5 h-12 bg-gray-200 mt-2" />}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-gray-900">Ready</h3>
                <p className="text-sm text-gray-600">
                  {currentStep >= 3
                    ? 'Your order is ready to collect!'
                    : 'Almost there...'}
                </p>
              </div>
            </div>

            {/* Step 4: Completed */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= 4
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-semibold text-gray-900">Completed</h3>
                <p className="text-sm text-gray-600">Enjoy your meal!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {item.quantity}x {item.menuItemName}
                  </span>
                  {item.notes && (
                    <p className="text-gray-600 italic text-xs mt-1">"{item.notes}"</p>
                  )}
                </div>
                <span className="text-gray-600">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isCompleted ? (
            <Button
              variant="primary"
              onClick={() => navigate('/customer')}
              className="w-full py-3"
            >
              <Home className="w-5 h-5 mr-2" />
              Start New Order
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => navigate('/customer/menu')}
              className="w-full py-3"
            >
              Add More Items
            </Button>
          )}
        </div>

        {/* Connection Status */}
        {!isCompleted && (
          <div className={`mt-6 flex items-center justify-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isConnected ? 'Real-time updates' : 'Disconnected'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
