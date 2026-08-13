import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Briefcase, ShoppingCart, FileText, ArrowLeft, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-4 space-y-4">
        <ShieldCheck className="w-16 h-16 text-red-500" />
        <h2 className="font-serif text-3xl font-bold">Access Restricted</h2>
        <p className="text-xs text-gray-500">You must be logged in as an Administrator to view this portal.</p>
        <button onClick={() => navigate('/account/login')} className="px-6 py-3 bg-[#1A1918] text-white rounded-xl text-xs uppercase font-bold">
          Log In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFEA] flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#1A1918] text-[#FAF9F5] p-6 border-r border-[#C5A059]/30 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block">
              CONTROL PANEL
            </span>
            <h2 className="font-serif text-xl font-bold tracking-wider text-white mt-0.5">
              SAI BALAJI ADMIN
            </h2>
          </div>

          <nav className="space-y-2 text-xs font-semibold uppercase tracking-wider">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </NavLink>

            <NavLink 
              to="/admin/products" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span>Products & Inventory</span>
            </NavLink>

            <NavLink 
              to="/admin/wholesale" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Briefcase className="w-4 h-4" />
              <span>B2B Quotation Engine</span>
            </NavLink>

            <NavLink 
              to="/admin/orders" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Retail Fulfillment</span>
            </NavLink>

            <NavLink 
              to="/admin/cms" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#C5A059] text-[#1A1918] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              <span>CMS & Editorial</span>
            </NavLink>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Storefront</span>
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Outlet View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
