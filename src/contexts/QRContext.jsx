import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const defaultStyle = {
  width: 250,
  height: 250,
  margin: 24,
  dotsOptions: { color: '#1e293b', type: 'dot' },
  backgroundOptions: { color: '#ffffff' },
  cornersSquareOptions: { color: '#1e293b', type: 'extra-rounded' },
  cornersDotOptions: { color: '#1e293b', type: 'dot' },
  errorCorrectionLevel: 'M',
  imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 },
};

const defaultCardStyle = {
  bgType: 'solid', bgColor: '#ffffff', gradientFrom: '#3b82f6', gradientTo: '#8b5cf6',
  gradientDirection: 'to-br', fontFamily: 'Outfit, sans-serif', fontSize: 'medium',
  borderRadius: '2xl', shadow: 'glow', qrPosition: 'bottom', accentColor: '#4f46e5',
  textColor: '#0f172a', avatar: '', brandLogo: '', showIcons: true, themeMode: 'light',
};

const defaultCardData = {
  name: 'John Doe', title: 'CEO & Founder', company: 'Acme Inc.', phone: '+1 234 567 890',
  email: 'john@example.com', website: 'https://example.com', address: '123 Tech Blvd, Suite 400',
  subtitle: 'Visit Our Website', badgeText: 'FREE WIFI ACCESS', wifiNetwork: 'Office_Guest_5G',
  eventTitle: 'Tech Summit 2026', eventDate: 'Saturday, Oct 24 • 7:00 PM', menuTitle: 'Scan to View Menu',
  appTitle: 'Download Mobile App',
};

const SETTINGS_KEY = 'lumalink_qr_settings_v1';

const readSavedSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return {};
    return JSON.parse(saved) || {};
  } catch {
    return {};
  }
};

const QRContext = createContext(null);

export const QRProvider = ({ children }) => {
  const saved = readSavedSettings();
  const [activeType, setActiveType] = useState('URL');
  const [qrData, setQrData] = useState('https://example.com');
  const [qrStyle, setQrStyle] = useState({ ...defaultStyle, ...(saved.qrStyle || {}) });
  const [logo, setLogo] = useState(saved.logo || null);
  const [qrRef, setQrRef] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(saved.selectedTheme || 'clean');
  const [cardTemplate, setCardTemplate] = useState('modern');
  const [cardStyle, setCardStyle] = useState(defaultCardStyle);
  const [cardData, setCardData] = useState(defaultCardData);
  const [exportQuality, setExportQuality] = useState('2048p');

  const persistSettings = useCallback((nextStyle, nextTheme = selectedTheme, nextLogo = logo) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        qrStyle: nextStyle,
        selectedTheme: nextTheme,
        logo: nextLogo,
      }));
    } catch {
      // Local persistence is best-effort (for example, private browser storage can be disabled).
    }
  }, [logo, selectedTheme]);

  // Persist after state has actually changed. Never perform side effects from
  // inside a setState updater; React may invoke updater functions more than once
  // in development/StrictMode.
  useEffect(() => {
    persistSettings(qrStyle, selectedTheme, logo);
  }, [qrStyle, selectedTheme, logo, persistSettings]);

  // Update only when the requested value is actually different. This is
  // important for controlled color/style inputs because some UI components can
  // emit the same value more than once.
  const updateStyle = useCallback((updates) => {
    setQrStyle((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const [key, value] of Object.entries(updates)) {
        const previous = prev[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const merged = { ...(previous || {}), ...value };
          const previousKeys = Object.keys(previous || {});
          const mergedKeys = Object.keys(merged);
          const same =
            previousKeys.length === mergedKeys.length &&
            mergedKeys.every((nestedKey) => merged[nestedKey] === previous?.[nestedKey]);

          if (!same) {
            next[key] = merged;
            changed = true;
          }
        } else if (previous !== value) {
          next[key] = value;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, []);

  const updateCardStyle = useCallback((updates) => setCardStyle((prev) => ({ ...prev, ...updates })), []);
  const updateCardData = useCallback((updates) => setCardData((prev) => ({ ...prev, ...updates })), []);
  const updateQRData = useCallback((value) => setQrData(value), []);

  const saveGlobalSettings = useCallback(() => {
    persistSettings(qrStyle, selectedTheme, logo);
  }, [logo, persistSettings, qrStyle, selectedTheme]);

  const selectTheme = useCallback((theme) => {
    setSelectedTheme(theme.id);
    setQrStyle(theme.style);
  }, []);

  const resetStyle = useCallback(() => {
    setQrStyle(defaultStyle);
    setSelectedTheme('clean');
    setLogo(null);
    try { localStorage.removeItem(SETTINGS_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <QRContext.Provider value={{
      activeType, setActiveType, qrData, updateQRData, qrStyle, updateStyle, resetStyle,
      logo, setLogo: (value) => setLogo(value),
      qrRef, setQrRef, defaultStyle, saveGlobalSettings, selectedTheme, selectTheme,
      cardTemplate, setCardTemplate, cardStyle, updateCardStyle, cardData, updateCardData,
      exportQuality, setExportQuality, defaultCardStyle,
    }}>
      {children}
    </QRContext.Provider>
  );
};

export const useQR = () => {
  const ctx = useContext(QRContext);
  if (!ctx) throw new Error('useQR must be used within QRProvider');
  return ctx;
};
