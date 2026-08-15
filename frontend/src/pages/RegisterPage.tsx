import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AddressModal, UserAddress } from '../components/AddressModal';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    company_name: '',
    gstin: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetRedirect = searchParams.get('redirect') || '/about';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      setShowAddressModal(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const googleEmail = prompt('Enter your Google Account email:', 'customer@gmail.com');
      if (!googleEmail) {
        setGoogleLoading(false);
        return;
      }
      const user = await loginWithGoogle(googleEmail, googleEmail.split('@')[0].toUpperCase());
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        setShowAddressModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAddressSaved = (address: UserAddress) => {
    setShowAddressModal(false);
    navigate(targetRedirect);
  };

  return (
    <div className="min-h-[80vh] bg-[#FAF9F5] flex items-center justify-center py-12 px-4 text-[#1A1918]">
      <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 max-w-lg w-full shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            JOIN SAI BALAJI
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#1A1918]">Create Account</h2>
          <p className="text-xs text-gray-500">Register for retail shopping & B2B wholesale request management.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        {/* 1-Click Direct Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          type="button"
          className="w-full bg-white hover:bg-gray-50 text-[#1A1918] border border-[#E6E1DA] py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-3 hover:border-[#C5A059]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google Account'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E6E1DA]" />
          <span className="text-[10px] uppercase font-bold text-gray-400">or register with email</span>
          <div className="flex-1 h-px bg-[#E6E1DA]" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Full Name *</label>
            <input 
              type="text" 
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email Address *</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Password *</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Company (Optional)</label>
              <input 
                type="text" 
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="For B2B Wholesalers"
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">GSTIN (Optional)</label>
              <input 
                type="text" 
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#E6E1DA] text-xs text-gray-600">
          <span>Already registered? </span>
          <Link to={`/account/login?redirect=${encodeURIComponent(targetRedirect)}`} className="font-bold text-[#C5A059] hover:underline">Sign In</Link>
        </div>

      </div>

      {/* Address Modal post-register */}
      <AddressModal 
        isOpen={showAddressModal}
        onSave={handleAddressSaved}
        onSkip={() => {
          setShowAddressModal(false);
          navigate(targetRedirect);
        }}
      />
    </div>
  );
};
