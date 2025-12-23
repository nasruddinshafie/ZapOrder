import { useState } from 'react';
import { useDashboardStats, useSalesChartData, useTopSellingItems } from '../api/analytics';
import { StatsCards } from '../components/dashboard/StatsCards';
import { SalesChart } from '../components/dashboard/SalesChart';
import { TopSellingItems } from '../components/dashboard/TopSellingItems';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [selectedDays, setSelectedDays] = useState(7);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useSalesChartData(selectedDays);
  const { data: topItems, isLoading: topItemsLoading } = useTopSellingItems(10);

  if (statsLoading && chartLoading && topItemsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your restaurant's performance and analytics
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <StatsCards stats={stats} />
      )}

      {/* Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {chartData && (
            <SalesChart
              data={chartData}
              onDaysChange={setSelectedDays}
              selectedDays={selectedDays}
            />
          )}
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Summary
          </h3>
          {stats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Today's Orders</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.completedOrdersToday}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="text-lg font-bold text-yellow-600">
                  {stats.pendingOrders}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="text-lg font-bold text-green-600">
                  ${stats.averageOrderValue.toFixed(2)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <span
                    className={`text-lg font-bold ${
                      stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stats.revenueGrowth >= 0 ? '+' : ''}
                    {stats.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stats.revenueGrowth >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(stats.revenueGrowth), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Selling Items */}
      {topItems && (
        <TopSellingItems items={topItems} />
      )}
    </div>
  );
}
