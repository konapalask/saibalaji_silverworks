import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AddressModal, UserAddress } from '../components/AddressModal';
import { CountryPhoneInput } from '../components/CountryPhoneInput';
import { getErrorMessage } from '../utils/apiError';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    company_name: '',
    gstin: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetRedirect = searchParams.get('redirect') || '/shop/retail';

  const onAuthSuccess = (loggedUser: any) => {
    if (loggedUser.role === 'ADMIN' || loggedUser.role === 'SUPER_ADMIN') {
      navigate('/admin');
      return;
    }

    // Check if the user profile already contains address & phone from backend
    const hasAddress = Boolean(loggedUser?.street_address && loggedUser?.phone);
    if (hasAddress) {
      localStorage.setItem('sbs_user_address', JSON.stringify({
        fullName: loggedUser.full_name || '',
        phone: loggedUser.phone || '',
        street_address: loggedUser.street_address || '',
        city: loggedUser.city || '',
        state: loggedUser.state || '',
        pincode: loggedUser.pincode || ''
      }));
      navigate(targetRedirect);
    } else {
      setShowAddressModal(true);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const registeredUser = await register(formData);
      onAuthSuccess(registeredUser);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        onAuthSuccess(loggedUser);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Google authentication failed. Please try again.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-16 px-4 flex items-center justify-center text-[#202020]">
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 max-w-lg w-full product-shadow space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B9A77A] font-bold">
            JOIN SAI BALAJI
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#202020]">Create Account</h2>
          <p className="text-xs text-[#666666]">Register with your delivery address to manage orders & quotations.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* 1-Click Direct Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          type="button"
          className="w-full bg-[#F8F6F1] hover:bg-white text-[#202020] border border-[#E5E0D8] py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-3 hover:border-[#B9A77A]"
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
          <div className="flex-1 h-px bg-[#E5E0D8]" />
          <span className="text-[10px] uppercase font-bold text-gray-400">or register with email</span>
          <div className="flex-1 h-px bg-[#E5E0D8]" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Full Name *</label>
              <input 
                type="text" 
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#B9A77A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Mobile Number *</label>
              <CountryPhoneInput
                required
                value={formData.phone}
                onChange={(fullPhone) => setFormData({ ...formData, phone: fullPhone })}
                placeholder="98765 43210"
                bgClass="bg-[#F8F6F1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Email Address *</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#B9A77A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Password *</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#B9A77A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-[#B9A77A] focus:outline-none transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Street Address / Door No. *</label>
            <textarea 
              required
              rows={2}
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              placeholder="Door No., Building, Street, Landmark..."
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#B9A77A]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">City *</label>
              <input 
                type="text" 
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B9A77A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">State *</label>
              <input 
                type="text" 
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B9A77A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Pincode *</label>
              <input 
                type="text" 
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B9A77A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#666666] mb-1">Company / Store Name (Optional)</label>
            <input 
              type="text" 
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Optional for B2B wholesale"
              className="w-full bg-[#F8F6F1] border border-[#E5E0D8] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#B9A77A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E0D8] text-center text-xs text-[#666666]">
          <span>Already registered? </span>
          <Link to={`/account/login?redirect=${encodeURIComponent(targetRedirect)}`} className="text-[#B9A77A] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>

      {/* Address Modal post-register */}
      <AddressModal 
        isOpen={showAddressModal}
        onSave={(addr: UserAddress) => {
          localStorage.setItem('sbs_user_address', JSON.stringify(addr));
          setShowAddressModal(false);
          navigate(targetRedirect);
        }}
        onSkip={() => {
          setShowAddressModal(false);
          navigate(targetRedirect);
        }}
      />
    </div>
  );
};
