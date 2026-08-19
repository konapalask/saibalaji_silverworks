export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  format?: string;
  popular?: boolean;
}

export const COUNTRIES: Country[] = [
  // Popular / Priority Countries
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', format: '98765 43210', popular: true },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', format: '(555) 000-0000', popular: true },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', format: '7911 123456', popular: true },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', format: '50 123 4567', popular: true },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', format: '50 123 4567', popular: true },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', format: '8123 4567', popular: true },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', format: '(555) 000-0000', popular: true },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', format: '412 345 678', popular: true },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', format: '12-345 6789', popular: true },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', format: '151 23456789', popular: true },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', format: '3312 3456', popular: true },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼', format: '5012 3456', popular: true },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲', format: '9123 4567', popular: true },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭', format: '3600 1234', popular: true },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰', format: '71 234 5678', popular: true },

  // All Worldwide Countries (Alphabetical)
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫', format: '70 123 4567' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: '🇦🇱', format: '67 123 4567' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿', format: '551 23 45 67' },
  { name: 'Andorra', code: 'AD', dialCode: '+376', flag: '🇦🇩', format: '312 345' },
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: '🇦🇴', format: '923 123 456' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷', format: '9 11 1234-5678' },
  { name: 'Armenia', code: 'AM', dialCode: '+374', flag: '🇦🇲', format: '77 123456' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹', format: '650 1234567' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', flag: '🇦🇿', format: '50 123 45 67' },
  { name: 'Bahamas', code: 'BS', dialCode: '+1242', flag: '🇧🇸', format: '359-0000' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩', format: '1812-345678' },
  { name: 'Barbados', code: 'BB', dialCode: '+1246', flag: '🇧🇧', format: '260-0000' },
  { name: 'Belarus', code: 'BY', dialCode: '+375', flag: '🇧🇾', format: '29 123-45-67' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪', format: '470 12 34 56' },
  { name: 'Belize', code: 'BZ', dialCode: '+501', flag: '🇧🇿', format: '622-1234' },
  { name: 'Benin', code: 'BJ', dialCode: '+229', flag: '🇧🇯', format: '90 01 23 45' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: '🇧🇹', format: '17 12 34 56' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: '🇧🇴', format: '71234567' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '+387', flag: '🇧🇦', format: '61 123 456' },
  { name: 'Botswana', code: 'BW', dialCode: '+267', flag: '🇧🇼', format: '71 123 456' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', format: '(11) 91234-5678' },
  { name: 'Brunei', code: 'BN', dialCode: '+673', flag: '🇧🇳', format: '712 3456' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: '🇧🇬', format: '87 123 4567' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855', flag: '🇰🇭', format: '12 345 678' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲', format: '6 71 23 45 67' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱', format: '9 1234 5678' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', format: '138 0013 8000' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴', format: '300 1234567' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: '🇨🇷', format: '8312 3456' },
  { name: 'Croatia', code: 'HR', dialCode: '+385', flag: '🇭🇷', format: '91 234 5678' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357', flag: '🇨🇾', format: '96 123456' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿', format: '601 123 456' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰', format: '20 12 34 56' },
  { name: 'Dominican Republic', code: 'DO', dialCode: '+1809', flag: '🇩🇴', format: '234-5678' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨', format: '99 123 4567' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', format: '100 123 4567' },
  { name: 'Estonia', code: 'EE', dialCode: '+372', flag: '🇪🇪', format: '5123 4567' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹', format: '91 123 4567' },
  { name: 'Fiji', code: 'FJ', dialCode: '+679', flag: '🇫🇯', format: '701 2345' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮', format: '40 1234567' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', format: '6 12 34 56 78' },
  { name: 'Georgia', code: 'GE', dialCode: '+995', flag: '🇬🇪', format: '555 12 34 56' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', format: '24 123 4567' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷', format: '691 234 5678' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: '🇬🇹', format: '5123 4567' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: '🇭🇰', format: '9123 4567' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺', format: '20 123 4567' },
  { name: 'Iceland', code: 'IS', dialCode: '+354', flag: '🇮🇸', format: '611 2345' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', format: '812-345-678' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: '🇮🇷', format: '912 345 6789' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶', format: '790 123 4567' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪', format: '85 123 4567' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱', format: '50-123-4567' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', format: '320 123 4567' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1876', flag: '🇯🇲', format: '312-3456' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', format: '90-1234-5678' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴', format: '7 9012 3456' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', flag: '🇰🇿', format: '701 123 4567' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', format: '712 345678' },
  { name: 'Latvia', code: 'LV', dialCode: '+371', flag: '🇱🇻', format: '21 234 567' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧', format: '70 123 456' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', flag: '🇱🇹', format: '612 34567' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺', format: '621 123 456' },
  { name: 'Macau', code: 'MO', dialCode: '+853', flag: '🇲🇴', format: '6612 3456' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: '🇲🇻', format: '791 2345' },
  { name: 'Malta', code: 'MT', dialCode: '+356', flag: '🇲🇹', format: '9912 3456' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: '🇲🇺', format: '5251 2345' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽', format: '1 55 1234 5678' },
  { name: 'Monaco', code: 'MC', dialCode: '+377', flag: '🇲🇨', format: '6 12 34 56 78' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦', format: '661-234567' },
  { name: 'Myanmar', code: 'MM', dialCode: '+95', flag: '🇲🇲', format: '9 2123 456' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵', format: '984-1234567' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', format: '6 12345678' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', format: '21 123 4567' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', format: '802 123 4567' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴', format: '412 34 567' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰', format: '301 2345678' },
  { name: 'Panama', code: 'PA', dialCode: '+507', flag: '🇵🇦', format: '6123-4567' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: '🇵🇪', format: '912 345 678' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭', format: '917 123 4567' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱', format: '512 345 678' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹', format: '912 345 678' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴', format: '712 345 678' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺', format: '912 345-67-89' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', format: '788 123 456' },
  { name: 'Serbia', code: 'RS', dialCode: '+381', flag: '🇷🇸', format: '60 1234567' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', flag: '🇸🇰', format: '912 345 678' },
  { name: 'Slovenia', code: 'SI', dialCode: '+386', flag: '🇸🇮', format: '41 123 456' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', format: '71 123 4567' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷', format: '10-1234-5678' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', format: '612 34 56 78' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', format: '70 123 45 67' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', format: '78 123 45 67' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: '🇹🇼', format: '912 345 678' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿', format: '712 345 678' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭', format: '81 234 5678' },
  { name: 'Trinidad and Tobago', code: 'TT', dialCode: '+1868', flag: '🇹🇹', format: '290-0000' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳', format: '20 123 456' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷', format: '501 234 56 78' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬', format: '772 123456' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦', format: '50 123 4567' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: '🇺🇾', format: '94 123 456' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', flag: '🇺🇿', format: '90 123 45 67' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪', format: '412 1234567' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳', format: '91 234 56 78' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: '🇿🇲', format: '97 1234567' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼', format: '71 234 5678' }
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India (+91)

/**
 * Helper to extract country and local number from a given phone string
 */
export function parsePhoneNumber(raw: string): { country: Country; number: string } {
  if (!raw || typeof raw !== 'string') {
    return { country: DEFAULT_COUNTRY, number: '' };
  }

  const clean = raw.trim();

  if (clean.startsWith('+')) {
    // Sort countries by dialCode length descending to match longest dialCode first
    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (clean.startsWith(c.dialCode)) {
        const remaining = clean.slice(c.dialCode.length).trim();
        return { country: c, number: remaining };
      }
    }
  }

  return { country: DEFAULT_COUNTRY, number: clean };
}
