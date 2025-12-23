import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Hash } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import Button from '../../components/ui/Button';
// import Input from '../../components/ui/Input';

export default function TableSelection() {
  const navigate = useNavigate();
  const { setTable } = useCart();
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tableNumber.trim()) {
      setError('Please enter a table number');
      return;
    }

    // For MVP, we'll use table number directly as table ID
    // In production, you'd want to validate this against the backend
    const tableId = parseInt(tableNumber, 10);

    if (isNaN(tableId) || tableId <= 0) {
      setError('Please enter a valid table number');
      return;
    }

    setTable(tableId);
    navigate(`/customer/menu`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-500 to-primary-700 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
            <QrCode className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to ZapOrder</h1>
          <p className="text-primary-100">
            Scan your table's QR code or enter your table number to get started
          </p>
        </div>

        {/* Manual Entry Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  autoFocus
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 text-lg">
              View Menu
            </Button>
          </form>

          {/* QR Scanner Option */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors"
              onClick={() => alert('QR Scanner feature coming soon!')}
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code Instead
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 text-sm mt-6">
          Need help? Ask a staff member
        </p>
      </div>
    </div>
  );
}
