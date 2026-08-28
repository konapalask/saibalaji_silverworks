import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { WholesaleProvider } from './context/WholesaleContext';
import { LiveSilverProvider } from './context/LiveSilverContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ScrollToTop } from './components/ScrollToTop';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { CategoryPage } from './pages/CategoryPage';
import { RetailShop } from './pages/RetailShop';
import { ProductDetail } from './pages/ProductDetail';
import { WholesaleCatalogue } from './pages/WholesaleCatalogue';
import { WholesaleRequestPage } from './pages/WholesaleRequestPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminWholesale } from './pages/admin/AdminWholesale';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCMS } from './pages/admin/AdminCMS';
import { AdminUsers } from './pages/admin/AdminUsers';

// Protected Route Component (ONLY applied to Checkout, Purchasing & Account Pages)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-serif text-sm text-[#C8A96B] animate-pulse">
        Authenticating Sai Balaji Silverworks...
      </div>
    );
  }

  if (!user) {
    const target = location.pathname + location.search;
    return <Navigate to={`/account/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  return <>{children}</>;
};

// Store Shell Component (Provides Header, Footer, Cart Drawer, Mobile Bar)
const StoreShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-serif text-sm text-[#C8A96B] animate-pulse">
        Authenticating Sai Balaji Silverworks...
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <LiveSilverProvider>
          <CartProvider>
            <WishlistProvider>
              <WholesaleProvider>
              
              <div className="min-h-screen flex flex-col justify-between bg-[#F8F6F1] text-[#202020]">
                
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="wholesale" element={<AdminWholesale />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="cms" element={<AdminCMS />} />
                  </Route>

                  {/* Auth Pages */}
                  <Route path="/account/login" element={<StoreShell><LoginPage /></StoreShell>} />
                  <Route path="/account/register" element={<StoreShell><RegisterPage /></StoreShell>} />

                  {/* Public Browsing Routes (NO LOGIN REQUIRED) */}
                  <Route path="/" element={<StoreShell><Home /></StoreShell>} />
                  <Route path="/home" element={<StoreShell><Home /></StoreShell>} />
                  <Route path="/about" element={<StoreShell><About /></StoreShell>} />
                  <Route path="/contact" element={<StoreShell><Contact /></StoreShell>} />

                  {/* Data-Driven Category Routes (PUBLIC) */}
                  <Route path="/category/:categorySlug" element={<StoreShell><CategoryPage /></StoreShell>} />
                  <Route path="/category/:categorySlug/:subcategorySlug" element={<StoreShell><CategoryPage /></StoreShell>} />

                  {/* Category Aliases */}
                  <Route path="/silver-pooja-articles" element={<Navigate to="/category/silver-pooja-articles" replace />} />
                  <Route path="/silver-pooja-articles/:subcategorySlug" element={<StoreShell><CategoryPage /></StoreShell>} />
                  <Route path="/silver-god-temple-items" element={<Navigate to="/category/silver-god-temple-items" replace />} />
                  <Route path="/silver-dining-tableware" element={<Navigate to="/category/silver-dining-tableware" replace />} />
                  <Route path="/silver-baby-kids-gifts" element={<Navigate to="/category/silver-baby-kids-gifts" replace />} />
                  <Route path="/silver-wedding-return-gifts" element={<Navigate to="/category/silver-wedding-return-gifts" replace />} />
                  <Route path="/silver-jewellery" element={<Navigate to="/category/silver-jewellery" replace />} />
                  <Route path="/silver-coins-bars" element={<Navigate to="/category/silver-coins-bars" replace />} />
                  <Route path="/silver-home-decor" element={<Navigate to="/category/silver-home-decor" replace />} />
                  <Route path="/silver-corporate-premium-gifts" element={<Navigate to="/category/silver-corporate-premium-gifts" replace />} />
                  <Route path="/customized-silver-products" element={<Navigate to="/category/customized-silver-products" replace />} />

                  {/* Public Store Pages (PUBLIC) */}
                  <Route path="/shop/retail" element={<StoreShell><RetailShop /></StoreShell>} />
                  <Route path="/shop/retail/:slug" element={<StoreShell><ProductDetail /></StoreShell>} />
                  <Route path="/shop/wholesale" element={<StoreShell><WholesaleCatalogue /></StoreShell>} />

                  {/* Mandatory Purchasing & Checkout Routes (REQUIRES LOGIN) */}
                  <Route path="/checkout" element={<ProtectedRoute><StoreShell><CheckoutPage /></StoreShell></ProtectedRoute>} />
                  <Route path="/wholesale/request" element={<ProtectedRoute><StoreShell><WholesaleRequestPage /></StoreShell></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><StoreShell><OrderSuccessPage /></StoreShell></ProtectedRoute>} />
                  <Route path="/account" element={<ProtectedRoute><StoreShell><AccountPage /></StoreShell></ProtectedRoute>} />
                  <Route path="/account/orders" element={<ProtectedRoute><StoreShell><AccountPage /></StoreShell></ProtectedRoute>} />
                  <Route path="/account/wishlist" element={<ProtectedRoute><StoreShell><AccountPage /></StoreShell></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

              </div>
              </WholesaleProvider>
            </WishlistProvider>
          </CartProvider>
        </LiveSilverProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
