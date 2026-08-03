import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQR } from '../contexts/QRContext';
import { Copy, Download, Zap, Sparkles, CheckCircle2, Clock, Globe, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QRPreviewPanel = () => {
  const { qrData, qrStyle, logo, setQrRef, activeType } = useQR();
  const containerRef = useRef(null);
  const qrCodeRef = useRef(null);
  const [QRCodeStylingClass, setQRCodeStylingClass] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    import('qr-code-styling').then((module) => {
      setQRCodeStylingClass(() => module.default || module);
    }).catch(err => {
      console.error('Failed to load qr-code-styling', err);
    });
  }, []);

  useEffect(() => {
    if (!QRCodeStylingClass) return;

    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 200);

    try {
      if (!qrCodeRef.current) {
        const qrCode = new QRCodeStylingClass({
          ...qrStyle,
          data: qrData || 'https://example.com',
          image: logo || undefined,
        });
        qrCodeRef.current = qrCode;
        setQrRef(qrCode);

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          qrCode.append(containerRef.current);
        }
      } else {
        qrCodeRef.current.update({
          ...qrStyle,
          data: qrData || 'https://example.com',
          image: logo || undefined,
        });
      }
    } catch (e) {
      console.error('QR code generation error:', e);
    }

    return () => clearTimeout(timer);
  }, [QRCodeStylingClass, qrData, qrStyle, logo]);

  const handleDownload = (ext) => {
    qrCodeRef.current?.download({ name: 'qr-code', extension: ext });
    toast.success(`Downloading as ${ext.toUpperCase()}`);
  };

  const handleCopy = async () => {
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

  const isDynamic = activeType === 'DYNAMIC_URL' || activeType === 'DYNAMIC';

  return (
    <aside className="w-80 flex-shrink-0 h-full bg-surface-900 border-l border-surface-800 flex flex-col sticky top-0 right-0 z-10 select-none">
      {/* Panel Header */}
      <div className="px-4 py-3.5 border-b border-surface-800 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} className="text-brand-400" />
          Live Telemetry Preview
        </h2>
        {/* <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isDynamic
            ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
            : 'bg-surface-800 text-slate-400 border-surface-700'
        }`}>
          {isDynamic ? <Zap size={10} /> : null} {isDynamic ? 'DYNAMIC' : 'STATIC'}
        </span> */}
      </div>

      {/* QR Canvas */}
      <div className="flex-1 flex flex-col items-center justify-start p-5 space-y-4 overflow-y-auto">
        <motion.div
          animate={{ scale: isUpdating ? 0.98 : 1 }}
          transition={{ duration: 0.15 }}
          className="relative p-5 rounded-2xl bg-surface-800 border border-surface-700 shadow-glow flex items-center justify-center min-w-[210px] min-h-[210px]"
        >
          <div ref={containerRef} className="rounded-lg h-120 w-120 overflow-hidden flex items-center justify-center" />
        </motion.div>

        {/* Real-Time Telemetry Info Box */}
        <div className="w-full bg-surface-850 rounded-xl p-3 border border-surface-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <Globe size={12} className="text-brand-400" /> Telemetry Info
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 size={10} /> Live
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Encoded Data (QR Content)</span>
              <p className="font-mono text-brand-300 truncate bg-surface-900 px-2 py-1 rounded border border-surface-800">
                {qrData || 'https://example.com'}
              </p>
            </div>

            {isDynamic && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Destination</span>
                <p className="text-slate-300 truncate font-mono bg-surface-900 px-2 py-1 rounded border border-surface-800">
                  {qrData ? qrData : 'https://google.com'}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-800 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <BarChart2 size={11} className="text-brand-400" /> Total Scans: <strong className="text-white font-mono">0</strong>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-brand-400" /> Status: <strong className="text-emerald-400">Active</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Export Controls */}
      <div className="p-4 border-t border-surface-800 space-y-2 bg-surface-900">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Export Formats</span>
          <span className="text-[10px] text-slate-500 font-mono">{qrStyle.width || 300}x{qrStyle.height || 300}px</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {['png', 'svg', 'jpeg', 'webp'].map((ext) => (
            <button
              key={ext}
              onClick={() => handleDownload(ext)}
              className="text-xs py-1.5 rounded-lg bg-surface-800 hover:bg-brand-600 text-slate-300 hover:text-white border border-surface-700 hover:border-brand-500 transition-all duration-200 font-semibold uppercase"
            >
              {ext}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 btn-secondary text-xs py-2"
          >
            <Copy size={13} />
            Copy Image
          </button>
          <button
            onClick={() => handleDownload('png')}
            className="flex items-center justify-center gap-1.5 btn-primary text-xs py-2"
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>
    </aside>
  );
};

export default QRPreviewPanel;
