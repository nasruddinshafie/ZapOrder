import { useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '../api/orders';
import { useOrderSignalR } from '../hooks/useSignalR';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import type { Order, OrderStatus } from '../types';
import OrderCard from '../components/orders/OrderCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const ORDER_STATUSES: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Preparing', label: 'Preparing' },
  { value: 'Ready', label: 'Ready' },
  { value: 'Completed', label: 'Completed' },
];

export default function Orders() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch orders (no polling, SignalR will handle updates)
  const { data: orders = [], isLoading, refetch } = useOrders(
    selectedStatus === 'all' ? undefined : selectedStatus,
    undefined // No polling
  );

  const updateStatusMutation = useUpdateOrderStatus();

  // SignalR real-time connection
  const { isConnected } = useOrderSignalR(
    user?.restaurantId,
    undefined,
    (_newOrder: Order) => {
      // Order created - invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    (_updatedOrder: Order) => {
      // Order status updated - invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  );

  // Filter out completed and cancelled orders if viewing "all"
  const filteredOrders = selectedStatus === 'all'
    ? orders.filter(order => order.status !== 'Completed' && order.status !== 'Cancelled')
    : orders;

  // Group orders by status for display
  const pendingOrders = filteredOrders.filter(o => o.status === 'Pending');
  const preparingOrders = filteredOrders.filter(o => o.status === 'Preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'Ready');

  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredOrders.length} active orders
            <span className={`ml-2 inline-flex items-center gap-1 text-sm ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isConnected ? 'Real-time' : 'Disconnected'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
              {status.value !== 'all' && (
                <span className="ml-2 text-xs">
                  ({orders.filter(o => o.status === status.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Display */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : selectedStatus === 'all' ? (
        // Kanban view for "All Orders"
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              Pending ({pendingOrders.length})
            </h3>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>

          {/* Preparing Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Preparing ({preparingOrders.length})
            </h3>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Ready ({readyOrders.length})
            </h3>
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // List view for specific status
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Table:</span>
                <span className="ml-2 font-medium">{selectedOrder.tableNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'Ready' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Time:</span>
                <span className="ml-2 font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x</span>
                      <span className="ml-2">{item.menuItemName}</span>
                      {item.notes && (
                        <p className="text-xs text-gray-500 ml-6 mt-0.5">Note: {item.notes}</p>
                      )}
                    </div>
                    <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">${selectedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
