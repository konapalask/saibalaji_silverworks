import React, { useState } from 'react';
import { MapPin, Phone, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface UserAddress {
  fullName?: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onSave: (address: UserAddress) => void;
  onSkip?: () => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onSave, onSkip }) => {
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState<string>(() => user?.full_name || '');
  const [address, setAddress] = useState<UserAddress>(() => {
    if (user?.street_address || user?.phone) {
      return {
        fullName: user.full_name || '',
        phone: user.phone || '',
        street_address: user.street_address || '',
        city: user.city || 'Hyderabad',
        state: user.state || 'Telangana',
        pincode: user.pincode || '500033'
      };
    }
    try {
      const saved = localStorage.getItem('sbs_user_address');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      fullName: user?.full_name || '',
      phone: user?.phone || '',
      street_address: '',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033'
    };
  });

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAddress((prev) => ({
        fullName: user.full_name || prev.fullName,
        phone: user.phone || prev.phone,
        street_address: user.street_address || prev.street_address,
        city: user.city || prev.city,
        state: user.state || prev.state,
        pincode: user.pincode || prev.pincode
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedDetails: UserAddress = {
      fullName,
      phone: address.phone,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    };

    localStorage.setItem('sbs_user_address', JSON.stringify(updatedDetails));
    if (user) {
      try {
        await updateProfile({
          full_name: fullName,
          phone: address.phone,
          street_address: address.street_address,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        });
      } catch (err) {
        console.error('Failed to sync details to backend', err);
      }
    }
    onSave(updatedDetails);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#C5A059] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-[#1A1918] animate-in fade-in zoom-in-95">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#FAF9F5] border border-[#C5A059]/40 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
            PROFILE & DELIVERY SETUP
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#1A1918]">Welcome! Please Confirm Your Details</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Provide your name, phone number, and default shipping address for seamless ordering & quotations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Full Name *</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Mobile / Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                required
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Street Address / Door No. *</label>
            <textarea 
              required
              rows={2}
              value={address.street_address}
              onChange={(e) => setAddress({ ...address, street_address: e.target.value })}
              placeholder="Door No. / Flat, Building Name, Street, Landmark..."
              className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">City *</label>
              <input 
                type="text" 
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">State *</label>
              <input 
                type="text" 
                required
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pincode *</label>
              <input 
                type="text" 
                required
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {onSkip && (
              <button 
                type="button"
                onClick={onSkip}
                className="px-5 py-3 border border-[#E6E1DA] text-gray-500 rounded-xl text-xs uppercase font-bold hover:bg-gray-50"
              >
                Skip for now
              </button>
            )}

            <button 
              type="submit"
              className="flex-1 bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Save Details & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
