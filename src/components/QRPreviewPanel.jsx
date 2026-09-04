import { useEffect, useRef, useState } from 'react';
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
  BarChart2, QrCode, CreditCard, SlidersHorizontal, Archive
} from 'lucide-react';
import toast from 'react-hot-toast';

const QRPreviewPanel = () => {
  const { qrData, qrStyle, logo, activeType, exportQuality, setExportQuality } = useQR();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const qrCodeRef = useRef(null);

  const [QRCodeStylingClass, setQRCodeStylingClass] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('qr'); // 'qr' | 'card' | 'both'
  const [showCustomizer, setShowCustomizer] = useState(false);

  const isVCard = activeType === 'VCARD';

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

  // Create QR instance once the library is loaded
  useEffect(() => {
    if (!QRCodeStylingClass || !containerRef.current) return;

    // qr-code-styling can mutate nested option objects. Never give it the
    // same nested references that React keeps in qrStyle; doing so can cause
    // controlled inputs to receive values that changed outside React and can
    // lead to update loops.
    const options = JSON.parse(JSON.stringify({
      ...qrStyle,
      data: qrData || 'https://example.com',
      image: logo || undefined,
    }));

    try {
      if (!qrCodeRef.current) {
        const qrCode = new QRCodeStylingClass(options);
        qrCodeRef.current = qrCode;
        containerRef.current.innerHTML = '';
        qrCode.append(containerRef.current);
      } else {
        qrCodeRef.current.update(options);

        // Re-append if the preview container lost the canvas.
        if (containerRef.current && !containerRef.current.querySelector('canvas')) {
          containerRef.current.innerHTML = '';
          qrCodeRef.current.append(containerRef.current);
        }
      }
    } catch (e) {
      console.error('QR code generation error:', e);
    }
  }, [QRCodeStylingClass, qrData, qrStyle, logo]);

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
