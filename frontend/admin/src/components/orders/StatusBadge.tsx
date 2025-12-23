import type { OrderStatus } from '../../types';
import { Clock, ChefHat, CheckCircle, XCircle, Package } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  Pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  Preparing: {
    label: 'Preparing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: ChefHat,
  },
  Ready: {
    label: 'Ready',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Package,
  },
  Completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: CheckCircle,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
