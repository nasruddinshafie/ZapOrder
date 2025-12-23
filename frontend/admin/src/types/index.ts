// Menu Types
export interface MenuCategory {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  itemCount: number;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId?: number;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateMenuCategoryRequest {
  restaurantId: number;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface UpdateMenuCategoryRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateMenuItemRequest {
  restaurantId: number;
  categoryId?: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: number;
}

// Order Types
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export const OrderStatus = {
  Pending: 'Pending' as const,
  Preparing: 'Preparing' as const,
  Ready: 'Ready' as const,
  Completed: 'Completed' as const,
  Cancelled: 'Cancelled' as const,
};

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export const PaymentStatus = {
  Pending: 'Pending' as const,
  Paid: 'Paid' as const,
  Failed: 'Failed' as const,
  Refunded: 'Refunded' as const,
};

export interface Order {
  id: number;
  orderNumber: string;
  tableId: number;
  tableNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface CreateOrderRequest {
  tableId: number;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
  notes?: string;
}

// Table Types
export type TableStatus = 1 | 2 | 3;

export const TableStatus = {
  Available: 1 as const,
  Occupied: 2 as const,
  Reserved: 3 as const,
};

export interface Table {
  id: number;
  restaurantId: number;
  tableNumber: string;
  qrCode: string;
  capacity: number;
  status: TableStatus;
}

export interface TableResponse {
  id: number;
  restaurantId: number;
  tableNumber: string;
  qrCode: string;
  capacity: number;
  status: TableStatus;
  activeOrdersCount: number;
}

export interface CreateTableRequest {
  restaurantId: number;
  tableNumber: string;
  capacity: number;
}

export interface UpdateTableRequest {
  tableNumber?: string;
  capacity?: number;
  status?: TableStatus;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  restaurantId: number;
  name: string;
  email: string;
  token: string;
  expiresAt: string;
}

export interface User {
  restaurantId: number;
  name: string;
  email: string;
}
