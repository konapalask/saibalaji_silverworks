import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { WholesaleProvider } from './context/WholesaleContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';

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

import { useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-serif text-sm text-[#C5A059] animate-pulse">
        Authenticating Sai Balaji Silverworks...
      </div>
    );
  }

  if (!user) {
    const target = location.pathname === '/' ? '/about' : (location.pathname + location.search);
    return <Navigate to={`/account/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <WholesaleProvider>
              
              <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F5] text-[#1A1918]">
                
                <Routes>
                  {/* Admin Routes with distinct layout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="wholesale" element={<AdminWholesale />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="cms" element={<AdminCMS />} />
                  </Route>

                  {/* Unauthenticated Login & Register Routes */}
                  <Route path="/account/login" element={
                    <>
                      <Navbar />
                      <main className="flex-1 pb-16 lg:pb-0">
                        <LoginPage />
                      </main>
                      <Footer />
                    </>
                  } />

                  <Route path="/account/register" element={
                    <>
                      <Navbar />
                      <main className="flex-1 pb-16 lg:pb-0">
                        <RegisterPage />
                      </main>
                      <Footer />
                    </>
                  } />

                  {/* Protected Store Routes (Requires Login) */}
                  <Route path="*" element={
                    <ProtectedRoute>
                      <Navbar />
                      <main className="flex-1 pb-16 lg:pb-0">
                        <Routes>
                          <Route path="/" element={<Navigate to="/about" replace />} />
                          <Route path="/home" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          
                          {/* Data-Driven Category Routes */}
                          <Route path="/category/:categorySlug" element={<CategoryPage />} />
                          <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                          
                          {/* Clean Category URLs */}
                          <Route path="/silver-pooja-articles" element={<Navigate to="/category/silver-pooja-articles" replace />} />
                          <Route path="/silver-pooja-articles/:subcategorySlug" element={<CategoryPage />} />
                          <Route path="/silver-god-temple-items" element={<Navigate to="/category/silver-god-temple-items" replace />} />
                          <Route path="/silver-dining-tableware" element={<Navigate to="/category/silver-dining-tableware" replace />} />
                          <Route path="/silver-baby-kids-gifts" element={<Navigate to="/category/silver-baby-kids-gifts" replace />} />
                          <Route path="/silver-wedding-return-gifts" element={<Navigate to="/category/silver-wedding-return-gifts" replace />} />
                          <Route path="/silver-jewellery" element={<Navigate to="/category/silver-jewellery" replace />} />
                          <Route path="/silver-coins-bars" element={<Navigate to="/category/silver-coins-bars" replace />} />
                          <Route path="/silver-home-decor" element={<Navigate to="/category/silver-home-decor" replace />} />
                          <Route path="/silver-corporate-premium-gifts" element={<Navigate to="/category/silver-corporate-premium-gifts" replace />} />
                          <Route path="/customized-silver-products" element={<Navigate to="/category/customized-silver-products" replace />} />

                          <Route path="/shop/retail" element={<RetailShop />} />
                          <Route path="/shop/retail/:slug" element={<ProductDetail />} />
                          <Route path="/shop/wholesale" element={<WholesaleCatalogue />} />
                          <Route path="/wholesale/request" element={<WholesaleRequestPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/order-success" element={<OrderSuccessPage />} />
                          <Route path="/account" element={<AccountPage />} />
                          <Route path="/account/wishlist" element={<AccountPage />} />
                        </Routes>
                      </main>
                      <Footer />
                      <CartDrawer />
                      <MobileBottomNav />
                    </ProtectedRoute>
                  } />
                </Routes>

              </div>

            </WholesaleProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
