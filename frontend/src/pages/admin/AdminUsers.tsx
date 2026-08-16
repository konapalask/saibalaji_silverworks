import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Building2, ShieldCheck, UserCheck, Trash2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

interface UserItem {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  gstin?: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q) ||
      u.gstin?.toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const customerCount = users.filter(u => u.role !== 'ADMIN').length;
  const wholesaleCount = users.filter(u => u.company_name || u.gstin).length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold block">
            ADMINISTRATION PORTAL
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1918]">
            User & Customer Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            View, manage, and inspect all registered store customers and administrative users.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold hover:border-[#C5A059] transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C5A059] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1A1918] text-[#C5A059] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Total Registered</span>
            <span className="text-xl font-serif font-bold text-[#1A1918]">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Retail Customers</span>
            <span className="text-xl font-serif font-bold text-[#1A1918]">{customerCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Wholesale Accounts</span>
            <span className="text-xl font-serif font-bold text-[#1A1918]">{wholesaleCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Admins</span>
            <span className="text-xl font-serif font-bold text-[#1A1918]">{adminCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search users by name, email, phone, company name, or GSTIN..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none placeholder:text-gray-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-black">
            Clear
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 animate-pulse font-serif">
            Loading user list...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-600">No users found</p>
            <p className="text-xs text-gray-400">Try adjusting your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Company & GSTIN</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1A1918] text-[#C5A059] flex items-center justify-center font-bold text-xs shrink-0">
                          {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1A1918] block">{u.full_name || 'Anonymous User'}</span>
                          <span className="text-[10px] text-gray-400">ID: #{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {u.company_name || u.gstin ? (
                        <div className="space-y-0.5">
                          {u.company_name && (
                            <span className="font-medium text-[#1A1918] block">{u.company_name}</span>
                          )}
                          {u.gstin && (
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded block w-fit">
                              GST: {u.gstin}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Retail Individual</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] uppercase tracking-wider">
                          <UserCheck className="w-3 h-3" />
                          Customer
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
