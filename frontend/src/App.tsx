import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
                    <Route path="cms" element={<AdminCMS />} />
                  </Route>

                  {/* Public & Customer Routes with Navigation Header & Footer */}
                  <Route path="*" element={
                    <>
                      <Navbar />
                      <main className="flex-1 pb-16 lg:pb-0">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/shop/retail" element={<RetailShop />} />
                          <Route path="/shop/retail/:slug" element={<ProductDetail />} />
                          <Route path="/shop/wholesale" element={<WholesaleCatalogue />} />
                          <Route path="/wholesale/request" element={<WholesaleRequestPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/order-success" element={<OrderSuccessPage />} />
                          <Route path="/account" element={<AccountPage />} />
                          <Route path="/account/wishlist" element={<AccountPage />} />
                          <Route path="/account/login" element={<LoginPage />} />
                          <Route path="/account/register" element={<RegisterPage />} />
                        </Routes>
                      </main>
                      <Footer />
                      <CartDrawer />
                      <MobileBottomNav />
                    </>
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
