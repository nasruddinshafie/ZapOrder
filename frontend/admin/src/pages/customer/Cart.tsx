import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useCreateOrder } from '../../api/orders';
import Button from '../../components/ui/Button';

export default function Cart() {
  const navigate = useNavigate();
  const { items, tableId, updateQuantity, removeItem, updateNotes, getTotalPrice, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();
  const [expandedNotes, setExpandedNotes] = useState<number | null>(null);

  const handlePlaceOrder = async () => {
    if (!tableId || items.length === 0) return;

    try {
      const orderData = {
        tableId,
        items: items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      };

      const order = await createOrderMutation.mutateAsync(orderData);
      clearCart();
      navigate(`/customer/order/${order.id}`);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6 text-center">
          Add some delicious items from the menu
        </p>
        <Button variant="primary" onClick={() => navigate('/customer/menu')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customer/menu')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Order</h1>
              <p className="text-sm text-gray-600">Table #{tableId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.menuItem.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex gap-3">
              {/* Image */}
              {item.menuItem.imageUrl ? (
                <img
                  src={item.menuItem.imageUrl}
                  alt={item.menuItem.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100" />
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.menuItem.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${item.menuItem.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.menuItem.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-primary-600">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Notes */}
                <div className="mt-3">
                  {expandedNotes === item.menuItem.id ? (
                    <div>
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                        placeholder="Add special instructions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        rows={2}
                        autoFocus
                      />
                      <button
                        onClick={() => setExpandedNotes(null)}
                        className="text-sm text-primary-600 font-medium mt-1"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedNotes(item.menuItem.id)}
                      className="text-sm text-primary-600 font-medium"
                    >
                      {item.notes ? 'Edit notes' : 'Add notes'}
                    </button>
                  )}
                  {item.notes && expandedNotes !== item.menuItem.id && (
                    <p className="text-sm text-gray-600 mt-1 italic">"{item.notes}"</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-2xl text-primary-600">
              ${getTotalPrice().toFixed(2)}
            </span>
          </div>

          {/* Place Order Button */}
          <Button
            variant="primary"
            onClick={handlePlaceOrder}
            disabled={createOrderMutation.isPending}
            className="w-full py-4 text-lg"
          >
            {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
          </Button>

          <button
            onClick={() => navigate('/customer/menu')}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
          >
            Add more items
          </button>
        </div>
      </div>
    </div>
  );
}
