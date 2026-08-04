import { createContext, useContext, useState, useCallback } from 'react';

const defaultStyle = {
  width: 250,
  height: 250,
  margin: 24,
  dotsOptions: { color: '#1e293b', type: 'dot' },
  backgroundOptions: { color: '#ffffff' },
  cornersSquareOptions: { color: '#1e293b', type: 'extra-rounded' },
  cornersDotOptions: { color: '#1e293b', type: 'dot' },
  errorCorrectionLevel: 'M',
  imageOptions: { crossOrigin: 'anonymous', margin: 5 },
};

const defaultCardStyle = {
  bgType: 'solid',
  bgColor: '#ffffff',
  gradientFrom: '#3b82f6',
  gradientTo: '#8b5cf6',
  gradientDirection: 'to-br',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 'medium', // small, medium, large
  borderRadius: '2xl', // sm, md, lg, 2xl, 3xl
  shadow: 'glow', // none, soft, glow, deep
  qrPosition: 'bottom', // top, bottom, side, floating, center
  accentColor: '#4f46e5',
  textColor: '#0f172a',
  avatar: '',
  brandLogo: '',
  showIcons: true,
  themeMode: 'light', // light, dark
};

const defaultCardData = {
  name: 'John Doe',
  title: 'CEO & Founder',
  company: 'Acme Inc.',
  phone: '+1 234 567 890',
  email: 'john@example.com',
  website: 'https://example.com',
  address: '123 Tech Blvd, Suite 400',
  subtitle: 'Visit Our Website',
  badgeText: 'FREE WIFI ACCESS',
  wifiNetwork: 'Office_Guest_5G',
  eventTitle: 'Tech Summit 2026',
  eventDate: 'Saturday, Oct 24 • 7:00 PM',
  menuTitle: 'Scan to View Menu',
  appTitle: 'Download Mobile App',
};

const QRContext = createContext(null);

export const QRProvider = ({ children }) => {
  const [activeType, setActiveType] = useState('URL');
  const [qrData, setQrData] = useState('https://example.com');
  const [qrStyle, setQrStyle] = useState(defaultStyle);
  const [logo, setLogo] = useState(null);
  const [qrRef, setQrRef] = useState(null);

  // Card system states
  const [cardTemplate, setCardTemplate] = useState('modern'); // modern, glassmorphism, corporate, minimal, dark
  const [cardStyle, setCardStyle] = useState(defaultCardStyle);
  const [cardData, setCardData] = useState(defaultCardData);
  const [exportQuality, setExportQuality] = useState('2048p'); // 1080p, 2048p, 4K, print

  const updateStyle = useCallback((updates) => {
    setQrStyle((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateCardStyle = useCallback((updates) => {
    setCardStyle((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateCardData = useCallback((updates) => {
    setCardData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateQRData = useCallback((value) => {
    setQrData(value);
  }, []);

  const resetStyle = useCallback(() => {
    setQrStyle(defaultStyle);
    setCardStyle(defaultCardStyle);
  }, []);

  return (
    <QRContext.Provider
      value={{
        activeType,
        setActiveType,
        qrData,
        updateQRData,
        qrStyle,
        updateStyle,
        resetStyle,
        logo,
        setLogo,
        qrRef,
        setQrRef,
        defaultStyle,

        // Card System Exports
        cardTemplate,
        setCardTemplate,
        cardStyle,
        updateCardStyle,
        cardData,
        updateCardData,
        exportQuality,
        setExportQuality,
        defaultCardStyle,
      }}
    >
      {children}
    </QRContext.Provider>
  );
};

export const useQR = () => {
  const ctx = useContext(QRContext);
  if (!ctx) throw new Error('useQR must be used within a QRProvider');
  return ctx;
};
