import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

/* ── Admin ── */
import AdminRoute         from './admin/components/AdminRoute';
import AdminDashboard     from './admin/pages/AdminDashboard';
import AdminOrders        from './admin/pages/AdminOrders';
import AdminMenu          from './admin/pages/AdminMenu';
// import AdminInventory     from './admin/pages/AdminInventory';
import AdminReports       from './admin/pages/AdminReports';
import AdminNotifications from './admin/pages/AdminNotifications';

/* ── Customer (user) pages ── */
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import OTPPage            from './pages/OTPPage';
import SplashScreen       from './pages/SplashScreen';
import HomePage           from './pages/HomePage';
import ItemDetailPage     from './pages/ItemDetailPage';
import CartPage           from './pages/CartPage';
import OrderSummaryPage   from './pages/OrderSummaryPage';
import OrderTrackingPage  from './pages/OrderTrackingPage';
import OrderHistoryPage   from './pages/OrderHistoryPage';
import ProfilePage        from './pages/ProfilePage';
import ProtectedRoute     from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'Poppins,sans-serif', fontSize: 14, borderRadius: 12 },
              success: { iconTheme: { primary: '#e85a2a', secondary: '#fff' } },
            }} 
          />

          <Routes>
            {/* ── Admin routes (Full Desktop Width) ── */}
            {/* These are NOT wrapped in app-container */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders"        element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/menu"          element={<AdminRoute><AdminMenu /></AdminRoute>} />
            {/* <Route path="/admin/inventory"     element={<AdminRoute><AdminInventory /></AdminRoute>} /> */}
            <Route path="/admin/reports"       element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />

            {/* ── Customer routes (Mobile Optimized Frame) ── */}
            {/* We use a wildcard route to wrap all student pages in the app-container */}
            <Route path="/*" element={
              <div className="app-container">
                <Routes>
                  <Route path="/"               element={<SplashScreen />} />
                  <Route path="/login"          element={<LoginPage />} />
                  <Route path="/signup"         element={<SignupPage />} />
                  <Route path="/verify-otp"     element={<OTPPage />} />
                  <Route path="/home"           element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/item/:id"       element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
                  <Route path="/cart"           element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/order-summary"  element={<ProtectedRoute><OrderSummaryPage /></ProtectedRoute>} />
                  <Route path="/order-tracking" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                  <Route path="/orders"         element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                  <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  
                  {/* Fallback inside the container */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}