import type { DashboardStats } from '../../api/analytics';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const formatted = Math.abs(growth).toFixed(1);
    return growth >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <div className="flex items-center mt-2">
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatGrowth(stats.revenueGrowth)}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs previous period</span>
            </div>
          </div>
          <div className="bg-primary-100 p-3 rounded-full">
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Total Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.completedOrdersToday} completed today
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(stats.averageOrderValue)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Per completed order</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Awaiting completion</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Today's Revenue */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-md p-6 text-white lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-100">Today's Revenue</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(stats.todayRevenue)}</p>
            <p className="text-sm text-primary-100 mt-2">
              From {stats.completedOrdersToday} completed orders
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-full">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
