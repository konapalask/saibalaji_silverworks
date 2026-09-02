import api from '../services/api';

// Central Configuration for Sai Balaji Silver Works Admin WhatsApp Number
// Number format: International format without '+', spaces, hyphens, or brackets.
const DEFAULT_NUMBER = "919492664870";

export let ADMIN_WHATSAPP_NUMBER = localStorage.getItem('sbs_admin_whatsapp_number') || DEFAULT_NUMBER;

export const getAdminWhatsAppNumber = (): string => {
  return localStorage.getItem('sbs_admin_whatsapp_number') || ADMIN_WHATSAPP_NUMBER || DEFAULT_NUMBER;
};

export const setAdminWhatsAppNumber = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean) {
    ADMIN_WHATSAPP_NUMBER = clean;
    localStorage.setItem('sbs_admin_whatsapp_number', clean);
  }
};

export const syncAdminWhatsAppNumber = async (): Promise<string> => {
  try {
    const res = await api.get('/settings');
    if (res.data && res.data.whatsapp_number) {
      const num = String(res.data.whatsapp_number).replace(/\D/g, '');
      if (num) {
        setAdminWhatsAppNumber(num);
        return num;
      }
    }
  } catch (e) {
    // Retain existing cached/default number if offline
  }
  return getAdminWhatsAppNumber();
};

// Initial background sync
syncAdminWhatsAppNumber();

