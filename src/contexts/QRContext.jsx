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

const QRContext = createContext(null);

export const QRProvider = ({ children }) => {
  const [activeType, setActiveType] = useState('URL');
  const [qrData, setQrData] = useState('https://example.com');
  const [qrStyle, setQrStyle] = useState(defaultStyle);
  const [logo, setLogo] = useState(null);
  const [qrRef, setQrRef] = useState(null);

  const updateStyle = useCallback((updates) => {
    setQrStyle((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateQRData = useCallback((value) => {
    setQrData(value);
  }, []);

  const resetStyle = useCallback(() => {
    setQrStyle(defaultStyle);
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
