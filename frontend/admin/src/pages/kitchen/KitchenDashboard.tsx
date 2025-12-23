import { useRef, useState } from 'react';
import { Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders, useUpdateOrderStatus } from '../../api/orders';
import { useOrderSignalR } from '../../hooks/useSignalR';
import type { Order } from '../../types';
import OrderTicket from '../../components/kitchen/OrderTicket';

export default function KitchenDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: orders = [], isLoading } = useOrders(undefined, undefined);
  const updateStatusMutation = useUpdateOrderStatus();

  // Filter active orders (Pending, Preparing, Ready)
  const activeOrders = orders.filter(
    (order) => ['Pending', 'Preparing', 'Ready'].includes(order.status)
  );

  const pendingOrders = activeOrders.filter((o) => o.status === 'Pending');
  const preparingOrders = activeOrders.filter((o) => o.status === 'Preparing');
  const readyOrders = activeOrders.filter((o) => o.status === 'Ready');

  // SignalR for real-time updates
  const { isConnected } = useOrderSignalR(
    user?.restaurantId,
    undefined,
    (_newOrder: Order) => {
      // Play sound for new order
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch((e) => console.log('Audio play failed:', e));
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    (_updatedOrder: Order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  );

  const handleStatusUpdate = async (orderId: number, newStatus: 'Preparing' | 'Ready') => {
    await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
  };

  return (
    <div className="p-6">
      {/* Hidden audio element for notifications */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSp+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFwpBlNrywXElBSl5yO/bjDsJGGS56+mjUxELTKXh8bllHAU2jdXzzn0vBSt6yvHajjwJFmy/7t6WRwwPU6rj8LFaFw=="
      />

      {/* Stats Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preparing</p>
              <p className="text-3xl font-bold text-blue-600">{preparingOrders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready</p>
              <p className="text-3xl font-bold text-green-600">{readyOrders.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-lg transition-colors ${
                soundEnabled
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              <span className="font-medium">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Queue */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-xl text-gray-500">No active orders</p>
          <p className="text-gray-400 mt-2">New orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🔔 New Orders ({pendingOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pendingOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                👨‍🍳 In Progress ({preparingOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {preparingOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ✅ Ready for Pickup ({readyOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {readyOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
