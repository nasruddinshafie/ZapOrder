import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Minus } from 'lucide-react';
import { useMenuCategories, useMenuItems } from '../../api/menu';
import { useCart } from '../../contexts/CartContext';
import type { MenuItem } from '../../types';

export default function CustomerMenu() {
  const navigate = useNavigate();
  const { items: cartItems, addItem, updateQuantity, getTotalItems, getTotalPrice, tableId } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [] } = useMenuCategories(true);
  const { data: menuItems = [] } = useMenuItems();

  // Redirect if no table selected
  if (!tableId) {
    navigate('/customer');
    return null;
  }

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === null || item.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailable = item.isAvailable;

    return matchesCategory && matchesSearch && isAvailable;
  });

  const getItemQuantity = (itemId: number) => {
    const cartItem = cartItems.find((item) => item.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    addItem(menuItem);
  };

  const handleIncrement = (menuItem: MenuItem) => {
    const currentQty = getItemQuantity(menuItem.id);
    updateQuantity(menuItem.id, currentQty + 1);
  };

  const handleDecrement = (menuItem: MenuItem) => {
    const currentQty = getItemQuantity(menuItem.id);
    if (currentQty > 0) {
      updateQuantity(menuItem.id, currentQty - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Menu</h1>
              <p className="text-sm text-gray-600">Table #{tableId}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const quantity = getItemQuantity(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary-600">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="mt-3">
                    {quantity === 0 ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-lg">{quantity}</span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={() => navigate('/customer/cart')}
            className="w-full flex items-center justify-between py-4 px-6 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary-600 text-xs font-bold rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </div>
              <span>View Cart</span>
            </div>
            <span className="text-lg">${getTotalPrice().toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
