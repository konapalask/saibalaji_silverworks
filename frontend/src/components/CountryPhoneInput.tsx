import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { COUNTRIES, DEFAULT_COUNTRY, Country, parsePhoneNumber } from '../data/countries';

export interface CountryPhoneInputProps {
  value: string;
  onChange: (fullPhoneNumber: string, nationalNumber: string, country: Country) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  defaultCountryCode?: string;
  id?: string;
  name?: string;
  bgClass?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  defaultCountryCode = 'IN',
  id,
  name,
  bgClass = 'bg-[#F8F6F1]'
}) => {
  // Find initial country from defaultCountryCode
  const initialDefault = COUNTRIES.find(c => c.code.toUpperCase() === defaultCountryCode.toUpperCase()) || DEFAULT_COUNTRY;
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value && value.startsWith('+')) {
      const parsed = parsePhoneNumber(value);
      return parsed.country;
    }
    return initialDefault;
  });

  const [nationalNumber, setNationalNumber] = useState<string>(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      return parsed.number;
    }
    return '';
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.number);
    } else {
      setNationalNumber('');
    }
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        phoneInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter countries by search query
  const query = searchQuery.trim().toLowerCase();
  const filteredCountries = COUNTRIES.filter(c => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.dialCode.toLowerCase().includes(query) ||
      c.dialCode.replace('+', '').includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  });

  const popularCountries = COUNTRIES.filter(c => c.popular);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    
    // Trigger change with new dial code
    const fullNumber = nationalNumber.trim() ? `${country.dialCode} ${nationalNumber.trim()}` : '';
    onChange(fullNumber, nationalNumber.trim(), country);
    phoneInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Check if user pasted a full international number like "+1 555 123 4567"
    if (raw.startsWith('+')) {
      const parsed = parsePhoneNumber(raw);
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.number);
      const fullNumber = parsed.number.trim() ? `${parsed.country.dialCode} ${parsed.number.trim()}` : '';
      onChange(fullNumber, parsed.number.trim(), parsed.country);
      return;
    }

    // Only allow numbers, spaces, hyphens, parentheses
    const sanitized = raw.replace(/[^\d\s\-()]/g, '');
    setNationalNumber(sanitized);

    const fullNumber = sanitized.trim() ? `${selectedCountry.dialCode} ${sanitized.trim()}` : '';
    onChange(fullNumber, sanitized.trim(), selectedCountry);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div 
        className={`flex items-stretch border border-[#E5E0D8] rounded-xl transition-all duration-200 focus-within:border-[#B9A77A] focus-within:ring-2 focus-within:ring-[#B9A77A]/20 ${bgClass}`}
      >
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          title="Select Country Code"
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-l-xl text-xs font-semibold text-[#1A1918] hover:bg-black/5 transition-colors border-r border-[#E5E0D8]/80 shrink-0 cursor-pointer ${buttonClassName}`}
        >
          <span className="text-base leading-none select-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-bold tracking-tight text-[#1A1918]">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#B9A77A]' : ''}`} />
        </button>

        {/* Phone Number Input */}
        <input
          ref={phoneInputRef}
          id={id}
          name={name}
          type="tel"
          required={required}
          disabled={disabled}
          value={nationalNumber}
          onChange={handleInputChange}
          placeholder={placeholder || selectedCountry.format || '98765 43210'}
          className={`w-full px-3.5 py-2.5 text-xs text-[#1A1918] placeholder-gray-400 bg-transparent focus:outline-none rounded-r-xl ${inputClassName}`}
        />
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-1.5 w-full sm:w-84 max-w-[95vw] bg-white border border-[#E6E1DA] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ maxHeight: '360px' }}
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-[#E6E1DA] bg-[#FAF9F5] sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code (e.g. India, +91)..."
                className="w-full bg-white border border-[#E5E0D8] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#1A1918] placeholder-gray-400 focus:outline-none focus:border-[#B9A77A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-68 divide-y divide-gray-50 text-xs">
            {/* If no search query, show popular section */}
            {!query && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/70">
                  Popular Countries
                </div>
                {popularCountries.map((country) => {
                  const isSelected = selectedCountry.code === country.code;
                  return (
                    <button
                      key={`pop-${country.code}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#FAF9F5] transition-colors cursor-pointer ${isSelected ? 'bg-[#F8F6F1] font-bold text-[#B9A77A]' : 'text-gray-700'}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base select-none">{country.flag}</span>
                        <span className="truncate">{country.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({country.code})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-mono text-xs font-semibold text-gray-600">{country.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#B9A77A]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Country List */}
            <div>
              {!query && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/70">
                  All Countries
                </div>
              )}

              {filteredCountries.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-xs">
                  No countries found matching "{searchQuery}"
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = selectedCountry.code === country.code;
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#FAF9F5] transition-colors cursor-pointer ${isSelected ? 'bg-[#F8F6F1] font-bold text-[#B9A77A]' : 'text-gray-700'}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base select-none">{country.flag}</span>
                        <span className="truncate">{country.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({country.code})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-mono text-xs font-semibold text-gray-600">{country.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#B9A77A]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
