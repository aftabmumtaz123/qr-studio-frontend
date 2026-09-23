import { useMemo, useEffect, useState, useRef } from 'react';
import { useQR } from '../contexts/QRContext';
import { 
  Phone, Mail, Globe, MapPin, Building2, User, Wifi, 
  Calendar, Utensils, Download, FileText, Image as ImageIcon,
  Sparkles, ShieldCheck, CheckCircle, Code, Award, Terminal
} from 'lucide-react';

const CardPreview = ({ cardRef }) => {
  const { activeType, qrData, qrStyle, logo, cardTemplate, cardStyle, cardData } = useQR();
  const [qrImageDataUrl, setQrImageDataUrl] = useState('');
  const qrContainerRef = useRef(null);

  // Generate QR Canvas inside card if embedded
  useEffect(() => {
    let isMounted = true;
    import('qr-code-styling').then((module) => {
      const QRCodeStylingClass = module.default || module;
      try {
        const qrCode = new QRCodeStylingClass({
          ...qrStyle,
          width: 135,
          height: 135,
          margin: 6,
          data: qrData || 'https://example.com',
          image: logo || undefined,
        });

        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = '';
          qrCode.append(qrContainerRef.current);
          
          setTimeout(() => {
            if (!isMounted) return;
            const canvas = qrContainerRef.current?.querySelector('canvas');
            if (canvas) {
              setQrImageDataUrl(canvas.toDataURL('image/png'));
            }
          }, 100);
        }
      } catch (err) {
        console.error('Embedded QR error:', err);
      }
    });

    return () => { isMounted = false; };
  }, [qrData, qrStyle, logo]);

  const accentColor = cardStyle.accentColor || '#4f46e5';
  const isDark = cardTemplate === 'dark' || cardTemplate === 'tech' || cardStyle.themeMode === 'dark';

  // Styling helper computations
  const containerStyle = useMemo(() => {
    let bg = cardStyle.bgColor || '#ffffff';
    if (cardStyle.bgType === 'gradient') {
      bg = `linear-gradient(${cardStyle.gradientDirection || '135deg'}, ${cardStyle.gradientFrom || '#3b82f6'}, ${cardStyle.gradientTo || '#8b5cf6'})`;
    } else if (cardTemplate === 'dark') {
      bg = 'linear-gradient(135deg, #090d16 0%, #111827 100%)';
    } else if (cardTemplate === 'executive') {
      bg = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    } else if (cardTemplate === 'tech') {
      bg = 'linear-gradient(135deg, #050811 0%, #0d1527 100%)';
    } else if (cardTemplate === 'glassmorphism') {
      bg = 'rgba(255, 255, 255, 0.15)';
    }

    let radius = '1.25rem';
    if (cardStyle.borderRadius === 'none') radius = '0px';
    if (cardStyle.borderRadius === 'md') radius = '0.5rem';
    if (cardStyle.borderRadius === 'lg') radius = '0.75rem';
    if (cardStyle.borderRadius === '2xl') radius = '1.25rem';
    if (cardStyle.borderRadius === '3xl') radius = '1.75rem';
    if (cardStyle.borderRadius === 'full') radius = '2.25rem';

    let shadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
    if (cardStyle.shadow === 'none') shadow = 'none';
    if (cardStyle.shadow === 'soft') shadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    if (cardStyle.shadow === 'glow') shadow = `0 12px 30px ${accentColor}33`;
    if (cardStyle.shadow === 'deep') shadow = '0 20px 40px rgba(0, 0, 0, 0.35)';

    return {
      background: bg,
      fontFamily: cardStyle.fontFamily || 'Inter, sans-serif',
      borderRadius: radius,
      boxShadow: shadow,
      color: isDark ? '#f8fafc' : (cardStyle.textColor || '#0f172a'),
    };
  }, [cardTemplate, cardStyle, accentColor, isDark]);

  // vCard & Dynamic card details renderer
  const renderCardDetails = () => {
    const isVCard = activeType === 'VCARD';
    const isWifi = activeType === 'WIFI';
    const isEvent = activeType === 'EVENT';
    const isApp = activeType === 'APP';
    const isMenu = activeType === 'MENU';

    // show the card if it's a vCard type
    
    if (isVCard) {
      return (
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-3">
            {cardStyle.avatar ? (
              <img 
                src={cardStyle.avatar} 
                alt="Avatar" 
                className="w-14 h-14 rounded-full object-cover border-2 shadow-md shrink-0" 
                style={{ borderColor: accentColor }}
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {(cardData.name || 'J').charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold truncate leading-tight">
                {cardData.name || 'John Doe'}
              </h3>
              <p className="text-xs font-semibold truncate" style={{ color: accentColor }}>
                {cardData.title || 'CEO & Founder'}
              </p>
              <p className="text-[11px] opacity-60 truncate">
                {cardData.company || 'Acme Inc.'}
              </p>
            </div>
            {cardStyle.brandLogo && (
              <img src={cardStyle.brandLogo} alt="Logo" className="w-9 h-9 object-contain ml-auto shrink-0" />
            )}
          </div>

          <div className="space-y-1.5 pt-2.5 border-t text-xs border-black/10 dark:border-white/10">
            {cardData.phone && (
              <div className="flex items-center gap-2.5 opacity-90">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
                  <Phone size={12} />
                </div>
                <span className="font-medium truncate">{cardData.phone}</span>
              </div>
            )}
            {cardData.email && (
              <div className="flex items-center gap-2.5 opacity-90">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
                  <Mail size={12} />
                </div>
                <span className="font-medium truncate">{cardData.email}</span>
              </div>
            )}
            {cardData.website && (
              <div className="flex items-center gap-2.5 opacity-90">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
                  <Globe size={12} />
                </div>
                <span className="font-medium truncate">{cardData.website}</span>
              </div>
            )}
            {cardData.address && (
              <div className="flex items-center gap-2.5 opacity-90">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
                  <MapPin size={12} />
                </div>
                <span className="font-medium truncate">{cardData.address}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    // Default marketing card layout
    return (
      <div className="space-y-2.5 w-full">
        {cardStyle.brandLogo && (
          <img src={cardStyle.brandLogo} alt="Logo" className="h-7 object-contain mb-1" />
        )}
        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
            {cardData.badgeText || 'SCAN ME'}
          </span>
          <h3 className="text-base font-extrabold leading-snug">{cardData.subtitle || 'Visit Our Website'}</h3>
        </div>
        <p className="text-xs font-mono truncate px-2 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 opacity-90">
          {qrData || 'https://example.com'}
        </p>
      </div>
    );
  };

  // Render template layout variants
  const renderTemplateContent = () => {
    // 1. Executive Slate Template
    if (cardTemplate === 'executive') {
      return (
        <div className="p-6 space-y-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-slate-100 rounded-2xl border border-amber-500/30 shadow-2xl">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-serif font-bold text-xs uppercase tracking-widest">
              <Award size={16} /> EXECUTIVE CARD
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">VERIFIED</span>
          </div>

          {renderCardDetails()}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <span className="text-[9px] font-bold uppercase text-amber-400 tracking-wider">OFFICIAL QR</span>
              <p className="text-[10px] text-slate-400">Scan to save vCard</p>
            </div>
            <div className="p-1.5 bg-white rounded-xl shadow-lg">
              <div ref={qrContainerRef} className="flex items-center justify-center" />
            </div>
          </div>
        </div>
      );
    }

    // 2. Tech Developer Template
    if (cardTemplate === 'tech') {
      return (
        <div className="p-5 space-y-3.5 bg-slate-950 font-mono text-emerald-400 rounded-2xl border border-emerald-500/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Terminal size={13} /> ~/vcard.json
            </span>
            <span className="text-slate-500">v3.0</span>
          </div>

          {renderCardDetails()}

          <div className="pt-2 flex items-center justify-between border-t border-emerald-500/20">
            <span className="text-[10px] text-slate-400">// Scan to inspect payload</span>
            <div className="p-1.5 bg-slate-900 rounded-xl border border-emerald-500/30">
              <div ref={qrContainerRef} className="flex items-center justify-center" />
            </div>
          </div>
        </div>
      );
    }

    // 3. ID Badge Template
    if (cardTemplate === 'idbadge') {
      return (
        <div className="p-5 text-center space-y-3.5 bg-surface-900 text-slate-100 rounded-2xl border-2 border-brand-500/40 shadow-2xl relative">
          <div className="w-10 h-2 bg-surface-700 rounded-full mx-auto shadow-inner" />
          
          <div className="flex flex-col items-center">
            {cardStyle.avatar ? (
              <img src={cardStyle.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center font-bold text-2xl text-white shadow-md">
                {(cardData.name || 'J').charAt(0)}
              </div>
            )}
            <h3 className="text-base font-bold mt-2">{cardData.name || 'John Doe'}</h3>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 mt-0.5">
              {cardData.title || 'CEO & Founder'}
            </span>
          </div>

          <div className="p-2 bg-white rounded-xl shadow-md inline-block mx-auto">
            <div ref={qrContainerRef} className="flex items-center justify-center" />
          </div>

          <p className="text-[10px] text-slate-400 font-mono">ID: {Math.floor(100000 + Math.random() * 900000)}</p>
        </div>
      );
    }

    // 4. Glassmorphism Template
    if (cardTemplate === 'glassmorphism') {
      return (
        <div className="relative p-5 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl overflow-hidden space-y-4">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ backgroundColor: accentColor }} />
          {renderCardDetails()}
          <div className="flex items-center justify-between pt-3 border-t border-white/20">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-75 flex items-center gap-1">
              <Sparkles size={12} style={{ color: accentColor }} /> SCAN VCARD
            </span>
            <div className="p-1 bg-white/90 rounded-xl shadow-lg border border-white">
              <div ref={qrContainerRef} className="flex items-center justify-center" />
            </div>
          </div>
        </div>
      );
    }

    // 5. Corporate Template
    if (cardTemplate === 'corporate') {
      return (
        <div className="p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-700">
            {cardStyle.brandLogo ? (
              <img src={cardStyle.brandLogo} alt="Logo" className="h-7 object-contain" />
            ) : (
              <span className="font-black text-xs uppercase tracking-widest" style={{ color: accentColor }}>CORPORATE</span>
            )}
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 opacity-80">VERIFIED CARD</span>
          </div>
          {renderCardDetails()}
          <div className="pt-2 flex justify-center">
            <div className="p-1.5 bg-white rounded-xl shadow-md border border-slate-200">
              <div ref={qrContainerRef} className="flex items-center justify-center" />
            </div>
          </div>
        </div>
      );
    }

    // 6. Minimal Template
    if (cardTemplate === 'minimal') {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          {renderCardDetails()}
          <div className="p-1.5 bg-white rounded-xl shadow-md border border-slate-200">
            <div ref={qrContainerRef} className="flex items-center justify-center" />
          </div>
        </div>
      );
    }

    // 7. Dark Template
    if (cardTemplate === 'dark') {
      return (
        <div className="p-5 space-y-3 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl">
          {renderCardDetails()}
          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400">DYNAMIC QR</span>
              <p className="text-[10px] text-slate-400">Scan to interact</p>
            </div>
            <div className="p-1.5 bg-white rounded-xl shadow-glow">
              <div ref={qrContainerRef} className="flex items-center justify-center" />
            </div>
          </div>
        </div>
      );
    }

    // 8. Default Modern Template
    return (
      <div className="p-5 space-y-3.5">
        {renderCardDetails()}
        <div className="flex justify-center pt-2">
          <div className="p-1.5 bg-white rounded-2xl shadow-md border border-slate-200">
            <div ref={qrContainerRef} className="flex items-center justify-center" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={cardRef} 
      className="relative w-full max-w-[340px] mx-auto overflow-hidden transition-all duration-300"
      style={containerStyle}
    >
      {renderTemplateContent()}
    </div>
  );
};

export default CardPreview;
