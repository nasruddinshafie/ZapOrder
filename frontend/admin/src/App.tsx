import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import CustomerLayout from './components/layout/CustomerLayout'
import KitchenLayout from './components/layout/KitchenLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import CategoryManagement from './pages/CategoryManagement'
import Orders from './pages/Orders'
import Tables from './pages/Tables'
import TableSelection from './pages/customer/TableSelection'
import CustomerMenu from './pages/customer/CustomerMenu'
import Cart from './pages/customer/Cart'
import OrderStatus from './pages/customer/OrderStatus'
import KitchenDashboard from './pages/kitchen/KitchenDashboard'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer routes (public) */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<TableSelection />} />
              <Route path="menu" element={<CustomerMenu />} />
              <Route path="cart" element={<Cart />} />
              <Route path="order/:orderId" element={<OrderStatus />} />
            </Route>

            {/* Kitchen routes (protected) */}
            <Route path="/kitchen" element={
              <ProtectedRoute>
                <KitchenLayout />
              </ProtectedRoute>
            }>
              <Route index element={<KitchenDashboard />} />
            </Route>

            {/* Admin protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<Orders />} />
              <Route path="tables" element={<Tables />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
