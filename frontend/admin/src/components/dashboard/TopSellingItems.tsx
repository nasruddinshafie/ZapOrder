import type { TopSellingItem } from '../../api/analytics';
import { Trophy, TrendingUp } from 'lucide-react';

interface TopSellingItemsProps {
  items: TopSellingItem[];
}

export function TopSellingItems({ items }: TopSellingItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 1:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 2:
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top Selling Items
        </h2>
        <span className="text-sm text-gray-500">
          Based on quantity sold
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No sales data available yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Item Name
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Qty Sold
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.menuItemId}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getRankColor(
                        index
                      )}`}
                    >
                      #{index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {item.menuItemName}
                      </span>
                      {index < 3 && (
                        <Trophy
                          className={`w-4 h-4 ${
                            index === 0
                              ? 'text-yellow-500'
                              : index === 1
                              ? 'text-gray-400'
                              : 'text-orange-500'
                          }`}
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {item.totalQuantitySold}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-gray-600">{item.orderCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Items Analyzed:</span>
            <span className="font-semibold text-gray-900">{items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Total Revenue from Top Items:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(items.reduce((sum, item) => sum + item.totalRevenue, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
