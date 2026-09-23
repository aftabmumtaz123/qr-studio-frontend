import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQR } from '../contexts/QRContext';
import CardPreview from './CardPreview';
import CardCustomizer from './CardCustomizer';
import { 
  downloadStandaloneQR, 
  downloadCardImage, 
  downloadBothAsZip 
} from '../utils/exportUtils';
import { 
  Copy, Download, Sparkles, CheckCircle2, Clock, Globe, 
  BarChart2, QrCode, CreditCard, SlidersHorizontal, Archive, ShieldCheck, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const hexToRgb = (hex) => {
  const value = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

const relativeLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const linear = Object.values(rgb).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrastRatio = (foreground, background) => {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  if (fg == null || bg == null) return 0;
  const light = Math.max(fg, bg);
  const dark = Math.min(fg, bg);
  return (light + 0.05) / (dark + 0.05);
};

// This is a heuristic scanability score, not a measured probability of a
// particular phone camera/scanner successfully decoding the QR code.
const calculateScanability = (style, hasLogo, data = '', activeType = '') => {
  const fg = style?.dotsOptions?.color || '#1e293b';
  const bg = style?.backgroundOptions?.color || '#ffffff';
  const eye = style?.cornersSquareOptions?.color || fg;
  const contrast = contrastRatio(fg, bg);
  const eyeContrast = contrastRatio(eye, bg);
  const ecc = String(style?.errorCorrectionLevel || 'M').toUpperCase();
  const logoSize = Number(style?.imageOptions?.imageSize || 0);
  const margin = Number(style?.margin ?? 0);

  let score = 0;
  const warnings = [];

  if (contrast >= 7) score += 30;
  else if (contrast >= 4.5) score += 28;
  else if (contrast >= 3) { score += 20; warnings.push('Foreground/background contrast is below the recommended high-contrast range.'); }
  else if (contrast >= 2) { score += 10; warnings.push('Very low contrast can prevent phone cameras from separating QR modules.'); }
  else { score += 2; warnings.push('Extremely low contrast: use a light background with a dark foreground.'); }

  if (eyeContrast >= 4.5) score += 10;
  else if (eyeContrast >= 3) score += 7;
  else { score += 2; warnings.push('Finder/eye contrast is too low.'); }

  const eccPoints = { L: 5, M: 10, Q: 15, H: 20 };
  score += eccPoints[ecc] ?? 10;
  if (hasLogo && ecc !== 'H') warnings.push('A center logo is present; Error Correction H is safer for damaged/covered modules.');

  if (!hasLogo) score += 20;
  else if (logoSize <= 0.18) score += 20;
  else if (logoSize <= 0.22) score += 17;
  else if (logoSize <= 0.28) { score += 13; warnings.push('Logo is moderately large; reducing it improves scan reliability.'); }
  else if (logoSize <= 0.35) { score += 7; warnings.push('Logo is large and may cover too many data modules.'); }
  else { score += 2; warnings.push('Logo is very large and can make the QR difficult to decode.'); }

  if (margin >= 16) score += 15;
  else if (margin >= 8) score += 12;
  else if (margin >= 4) score += 7;
  else { score += 2; warnings.push('Increase the quiet-zone margin around the QR code.'); }

  const bgRgb = hexToRgb(bg);
  const bgLum = bgRgb ? relativeLuminance(bg) : 1;
  if (bgLum >= 0.6) score += 5;
  else warnings.push('A light background is more consistently recognized by phone scanners.');

  // Event QR payloads are much denser than URLs. Treat payload length as a
  // compatibility factor so the score warns before the symbol becomes
  // impractically dense for phone cameras.
  const payloadBytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(String(data || '')).length
    : String(data || '').length;
  if (activeType === 'EVENT') {
    if (payloadBytes <= 220) score += 5;
    else if (payloadBytes <= 320) score += 3;
    else if (payloadBytes <= 450) {
      score += 1;
      warnings.push('Event payload is getting dense; shorten the description for easier scanning.');
    } else {
      warnings.push('Event payload is very dense; remove optional description/location text or enlarge the QR.');
    }
    if (!hasLogo && ecc === 'H') warnings.push('ECC H increases QR density; M or Q is usually easier to scan for a clean Event QR.');
    warnings.push('Samsung compatibility mode uses a compact VEVENT payload with local event time.');
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), contrast, eyeContrast, payloadBytes, warnings };
};

const QRPreviewPanel = () => {
  const { qrData, qrStyle, logo, activeType, exportQuality, setExportQuality } = useQR();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const qrCodeRef = useRef(null);

  const [QRCodeStylingClass, setQRCodeStylingClass] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('qr'); // 'qr' | 'card' | 'both'
  const [showCustomizer, setShowCustomizer] = useState(false);

  const isVCard = activeType === 'VCARD';
  const scanability = useMemo(() => calculateScanability(qrStyle, Boolean(logo), qrData, activeType), [qrStyle, logo, qrData, activeType]);

  // When user navigates to vCard, default to 'card' tab; otherwise force 'qr'
  useEffect(() => {
    if (isVCard) {
      setActivePreviewTab('card');
    } else {
      setActivePreviewTab('qr');
      setShowCustomizer(false);
    }
  }, [isVCard]);

  useEffect(() => {
    import('qr-code-styling').then((module) => {
      setQRCodeStylingClass(() => module.default || module);
    }).catch(err => {
      console.error('Failed to load qr-code-styling', err);
    });
  }, []);

  // Render the QR preview. qr-code-styling merges update options, so an
  // image that was previously supplied can remain visible when `image` is
  // later set to undefined. When the logo changes (especially when it is
  // removed), recreate the QR instance exactly like the Settings preview.
  // This guarantees the old logo is actually removed from the canvas.
  const previousLogoRef = useRef(logo);

  useEffect(() => {
    if (!QRCodeStylingClass || !containerRef.current) return;

    const logoChanged = previousLogoRef.current !== logo;
    previousLogoRef.current = logo;

    const options = JSON.parse(JSON.stringify({
      ...qrStyle,
      data: qrData || 'https://example.com',
      ...(logo ? { image: logo } : {}),
    }));

    try {
      // A logo add/remove requires a fresh instance because qr-code-styling
      // can retain the previous image when update() receives no image.
      if (!qrCodeRef.current || logoChanged) {
        if (containerRef.current) containerRef.current.innerHTML = '';
        qrCodeRef.current = new QRCodeStylingClass(options);
        qrCodeRef.current.append(containerRef.current);
        return;
      }

      qrCodeRef.current.update(options);

      // Re-append if the preview container lost the canvas.
      if (containerRef.current && !containerRef.current.querySelector('canvas')) {
        containerRef.current.innerHTML = '';
        qrCodeRef.current.append(containerRef.current);
      }
    } catch (e) {
      console.error('QR code generation error:', e);
    }
  }, [QRCodeStylingClass, qrData, qrStyle, logo]);

  // Clean up the QR canvas when the preview panel unmounts.
  useEffect(() => () => {
    if (containerRef.current) containerRef.current.innerHTML = '';
    qrCodeRef.current = null;
  }, []);

  const handleCopyQR = async () => {
    try {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        canvas.toBlob(async (blob) => {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          toast.success('QR image copied to clipboard!');
        });
      }
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <aside className="w-96 flex-shrink-0 h-full bg-surface-900 border-l border-surface-800 flex flex-col sticky top-0 right-0 z-10 select-none overflow-hidden">
      {/* Panel Header & Preview Selector */}
      <div className="px-4 py-3 border-b border-surface-800 flex flex-col space-y-2.5 bg-surface-950">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={14} className="text-brand-400" />
            Live Previews
          </h2>
          {/* Only show Customize Card button for vCard */}
          {isVCard && (
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                showCustomizer 
                  ? 'bg-brand-600 text-white border-brand-500 shadow-glow' 
                  : 'bg-surface-800 text-slate-300 border-surface-700 hover:bg-surface-750'
              }`}
            >
              <SlidersHorizontal size={13} />
              {showCustomizer ? 'Hide Styles' : 'Customize Card'}
            </button>
          )}
        </div>

        {/* Live Preview Mode Tabs — only show for vCard */}
        {isVCard ? (
          <div className="grid grid-cols-3 gap-1 bg-surface-900 p-1 rounded-xl text-xs font-medium border border-surface-800">
            <button
              onClick={() => setActivePreviewTab('card')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                activePreviewTab === 'card' 
                  ? 'bg-brand-600 text-white font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard size={13} />
              Contact Card
            </button>
            <button
              onClick={() => setActivePreviewTab('qr')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                activePreviewTab === 'qr' 
                  ? 'bg-brand-600 text-white font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode size={13} />
              QR Preview
            </button>
            <button
              onClick={() => setActivePreviewTab('both')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                activePreviewTab === 'both' 
                  ? 'bg-brand-600 text-white font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} />
              Dual View
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-surface-900 p-1.5 rounded-xl border border-surface-800">
            <QrCode size={14} className="text-brand-400" />
            <span className="text-xs font-bold text-slate-300">QR Code Preview</span>
          </div>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex flex-col items-center p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Customizer Drawer — only for vCard */}
        {isVCard && showCustomizer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="w-full"
          >
            <CardCustomizer />
          </motion.div>
        )}

        {/* Live Previews */}
        <motion.div
          animate={{ scale: 1 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center justify-center space-y-4"
        >
          {/* 1. Contact Card Preview — only for vCard */}
          {isVCard && (activePreviewTab === 'card' || activePreviewTab === 'both') && (
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                <CreditCard size={12} className="text-brand-400" /> vCard Contact Card Preview
              </span>
              <div className="w-full p-2 rounded-2xl bg-surface-950/60 border border-surface-800 shadow-inner flex items-center justify-center">
                <CardPreview cardRef={cardRef} />
              </div>
            </div>
          )}

          {/* 2. Standalone QR Code Preview — ALWAYS in DOM */}
          <div
            className="w-full flex flex-col items-center"
            style={{ display: (!isVCard || activePreviewTab === 'qr' || activePreviewTab === 'both') ? 'flex' : 'none' }}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
              <QrCode size={12} className="text-brand-400" /> QR Code Preview
            </span>
            <div className="p-4 rounded-2xl bg-surface-800 border border-surface-700 shadow-glow flex items-center justify-center min-w-[200px] min-h-[200px]">
              <div ref={containerRef} className="rounded-lg overflow-hidden flex items-center justify-center" />
            </div>
          </div>
        </motion.div>

        {/* Telemetry Information Box */}
        <div className="w-full bg-surface-850 rounded-xl p-3 border border-surface-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Globe size={12} className="text-brand-400" /> Live Telemetry
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 size={10} /> Active
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Data</span>
            <p className="font-mono text-brand-300 truncate bg-surface-900 px-2 py-1 rounded border border-surface-800">
              {qrData || 'https://example.com'}
            </p>
          </div>
        </div>

        {/* Scanability Status */}
        <div className="w-full bg-surface-850 rounded-xl p-3 border border-surface-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-brand-400" />
              <div>
                <p className="text-[11px] font-bold text-slate-200">Scan Safety</p>
                <p className="text-[9px] text-slate-500">Heuristic compatibility score</p>
              </div>
            </div>
            <span className={`text-sm font-black ${scanability.score >= 85 ? 'text-emerald-400' : scanability.score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
              {scanability.score}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-surface-900 overflow-hidden border border-surface-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${scanability.score >= 85 ? 'bg-emerald-500' : scanability.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${scanability.score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded-lg bg-surface-900 border border-surface-800 px-2 py-1.5">
              <span className="text-slate-500 block">Module contrast</span>
              <strong className="text-slate-200">{scanability.contrast.toFixed(1)}:1</strong>
            </div>
            <div className="rounded-lg bg-surface-900 border border-surface-800 px-2 py-1.5">
              <span className="text-slate-500 block">ECC</span>
              <strong className="text-slate-200">{qrStyle.errorCorrectionLevel || 'M'}</strong>
            </div>
            {activeType === 'EVENT' && (
              <div className="rounded-lg bg-surface-900 border border-surface-800 px-2 py-1.5">
                <span className="text-slate-500 block">Event payload</span>
                <strong className="text-slate-200">{scanability.payloadBytes} B</strong>
              </div>
            )}
          </div>

          {scanability.warnings.length > 0 ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-2 space-y-1.5">
              {scanability.warnings.slice(0, 3).map((warning) => (
                <p key={warning} className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                  <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                  {warning}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={11} /> Strong scan-friendly configuration.
            </p>
          )}

          <p className="text-[9px] text-slate-600 leading-relaxed">
            This percentage is a design heuristic, not a guaranteed real-world scan-success probability. Camera, distance, print quality and lighting also affect scanning.
          </p>
        </div>
      </div>

      {/* Export Controls & Quality Selection */}
      <div className="p-4 border-t border-surface-800 space-y-3 bg-surface-950">
        {/* Export Resolution Selector */}
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="text-[11px] font-bold uppercase text-slate-400">Export Quality</span>
          <select
            value={exportQuality}
            onChange={(e) => setExportQuality(e.target.value)}
            className="input py-1 px-2 text-[11px] bg-surface-850 border-surface-700 w-auto font-mono"
          >
            <option value="1080p">1080×1080 (Standard)</option>
            <option value="2048p">2048×2048  (HD)</option>
            <option value="4K">3840×3840 (4K Ultra)</option>
            <option value="print">Print Quality (300 DPI)</option>
          </select>
        </div>

        {/* Download QR Section — always visible */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Download QR Code
          </span>
          <div className="grid grid-cols-4 gap-1">
            {['png', 'svg', 'jpg', 'webp'].map((ext) => (
              <button
                key={ext}
                onClick={() => downloadStandaloneQR(qrCodeRef, ext)}
                className="text-[11px] py-1.5 rounded-lg bg-surface-800 hover:bg-brand-600 text-slate-300 hover:text-white border border-surface-700 transition-all font-bold uppercase"
              >
                {ext}
              </button>
            ))}
          </div>
        </div>

        {/* Download Contact Card Section — only for vCard */}
        {isVCard && (
          <>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Download vCard Contact Card
              </span>
              <div className="grid grid-cols-4 gap-1">
                {['png', 'jpg', 'pdf', 'svg'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => downloadCardImage(cardRef.current, fmt, exportQuality)}
                    className="text-[11px] py-1.5 rounded-lg bg-brand-950/60 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-800/60 transition-all font-bold uppercase"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Both ZIP Action */}
            <div className="pt-1">
              <button
                onClick={() => downloadBothAsZip(qrCodeRef, cardRef.current, exportQuality)}
                className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 text-xs font-bold shadow-glow"
              >
                <Archive size={15} />
                Download Both (ZIP Bundle)
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default QRPreviewPanel;
