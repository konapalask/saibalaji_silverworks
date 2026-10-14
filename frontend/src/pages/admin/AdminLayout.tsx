import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Briefcase, ShoppingCart,
  FileText, Users, ShieldCheck, LogOut, ExternalLink,
  Menu, X, Sparkles, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-4 space-y-4">
        <ShieldCheck className="w-16 h-16 text-red-500" />
        <h2 className="font-serif text-3xl font-bold">Access Restricted</h2>
        <p className="text-xs text-gray-500">You must be logged in as an Administrator to view this portal.</p>
        <button
          onClick={() => navigate('/account/login')}
          className="px-6 py-3 bg-[#1A1918] text-white rounded-xl text-xs uppercase font-bold hover:bg-[#C5A059] transition-colors cursor-pointer"
        >
          Log In as Admin
        </button>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Retail Bookings', icon: ShoppingCart },
    { to: '/admin/wholesale', label: 'Wholesale Bookings', icon: Briefcase },
    { to: '/admin/products', label: 'Products & Inventory', icon: Package },
    { to: '/admin/users', label: 'Users & Customers', icon: Users },
    { to: '/admin/cms', label: 'CMS & Settings', icon: FileText, badge: 'WA' },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFEA] flex flex-col font-sans text-[#1A1918]">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#1A1918] text-[#FAF9F5] border-b border-[#C5A059]/30 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Brand / Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/admin" className="flex flex-col group">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-bold">
                    CONTROL PANEL
                  </span>
                </div>
                <h1 className="font-serif text-base sm:text-lg font-bold tracking-wider text-white leading-none mt-0.5 group-hover:text-[#C5A059] transition-colors">
                  SAI BALAJI ADMIN
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.2 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Actions (View Store, Admin User, Logout) */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <Link
                to="/shop/retail"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#C5A059]/40 text-[#C5A059] hover:text-white text-xs font-bold transition-colors"
                title="Open storefront in new tab to view live changes"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">View Store</span>
              </Link>

              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-300">
                  <UserIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="font-semibold text-white truncate max-w-[120px]">
                    {user.full_name || 'Admin'}
                  </span>
                </div>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/40 text-xs font-bold transition-colors cursor-pointer"
                title="Logout of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>

            {/* Mobile / Tablet Hamburger Toggle Button */}
            <div className="flex xl:hidden items-center gap-2">
              <Link
                to="/shop/retail"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-white/5 text-[#C5A059]"
                title="View Store"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#C5A059]" />}
              </button>
            </div>

          </div>

          {/* Medium Screens (lg to xl) Secondary Navigation Bar */}
          <div className="hidden lg:flex xl:hidden items-center justify-between py-2 border-t border-white/10 overflow-x-auto gap-2">
            <nav className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-[#C5A059] text-[#1A1918] font-bold'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#1A1918] border-t border-[#C5A059]/20 px-4 py-4 space-y-2 animate-fadeIn">
            <nav className="flex flex-col space-y-1.5 text-xs font-semibold uppercase tracking-wider">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.5 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              {user && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <UserIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{user.full_name || 'Admin'}</span>
                </div>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/50 text-red-400 rounded-lg text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet View (Full Width, Spacious) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
