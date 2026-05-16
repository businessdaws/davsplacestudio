import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface SiteSettings {
  whatsapp: string;
  instagram: string;
  email: string;
  address: string;
  maintenance_mode: boolean;
  promo_text: string;
  running_text_enabled: boolean;
}

const defaultSettings: SiteSettings = {
  whatsapp: '6289667736500',
  instagram: '',
  email: 'businessdaws@gmail.com',
  address: '',
  maintenance_mode: false,
  promo_text: '',
  running_text_enabled: false
};

const SettingsContext = createContext<{ 
  settings: SiteSettings; 
  loading: boolean;
}>({ 
  settings: defaultSettings, 
  loading: true 
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...defaultSettings, ...docSnap.data() });
      }
      setLoading(false);
    }, (error) => {
      console.error('SettingsContext onSnapshot error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
