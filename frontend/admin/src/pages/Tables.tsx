import { useState } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { TableStatus, type TableResponse } from '../types';
import { useTables, useDeleteTable } from '../api/tables';
import TableCard from '../components/tables/TableCard';
import TableForm from '../components/tables/TableForm';
import Button from '../components/ui/Button';

export default function Tables() {
  const [selectedTable, setSelectedTable] = useState<TableResponse | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');

  const { data: tables = [], isLoading, refetch } = useTables();
  const deleteMutation = useDeleteTable();

  const handleAddTable = () => {
    setSelectedTable(undefined);
    setIsFormOpen(true);
  };

  const handleEditTable = (table: TableResponse) => {
    setSelectedTable(table);
    setIsFormOpen(true);
  };

  const handleDeleteTable = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTable(undefined);
  };

  // Filter tables
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      searchQuery === '' ||
      table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group tables by status for stats
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === TableStatus.Available).length,
    occupied: tables.filter((t) => t.status === TableStatus.Occupied).length,
    reserved: tables.filter((t) => t.status === TableStatus.Reserved).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tables</h1>
        <p className="text-gray-600">
          Manage your restaurant tables and QR codes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Tables</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Available</p>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Occupied</p>
          <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Reserved</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by table number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value === 'all' ? 'all' : Number(value) as TableStatus);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value={TableStatus.Available}>Available</option>
            <option value={TableStatus.Occupied}>Occupied</option>
            <option value={TableStatus.Reserved}>Reserved</option>
          </select>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Add Table Button */}
          <Button variant="primary" onClick={handleAddTable}>
            <Plus className="w-4 h-4" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'No tables found matching your filters'
              : 'No tables yet'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button variant="primary" onClick={handleAddTable}>
              <Plus className="w-4 h-4" />
              Add Your First Table
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={handleEditTable}
              onDelete={handleDeleteTable}
            />
          ))}
        </div>
      )}

      {/* Table Form Modal */}
      {isFormOpen && (
        <TableForm table={selectedTable} onClose={handleCloseForm} />
      )}
    </div>
  );
}
