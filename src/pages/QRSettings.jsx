import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Save, RotateCcw, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQR } from '../contexts/QRContext';

const DOT_TYPES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_SQUARE_TYPES = ['dot', 'square', 'extra-rounded'];
const CORNER_DOT_TYPES = ['dot', 'square'];
const ERROR_LEVELS = ['L', 'M', 'Q', 'H'];

const THEMES = [
  { id: 'clean', name: 'Clean Pro', description: 'Crisp white and slate', style: { width: 250, height: 250, margin: 24, dotsOptions: { color: '#172033', type: 'rounded' }, backgroundOptions: { color: '#ffffff' }, cornersSquareOptions: { color: '#172033', type: 'extra-rounded' }, cornersDotOptions: { color: '#172033', type: 'dot' }, errorCorrectionLevel: 'M', imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 } } },
  { id: 'royal', name: 'Royal Indigo', description: 'Premium indigo accent', style: { width: 250, height: 250, margin: 22, dotsOptions: { color: '#5146d8', type: 'classy-rounded' }, backgroundOptions: { color: '#ffffff' }, cornersSquareOptions: { color: '#3d35a8', type: 'extra-rounded' }, cornersDotOptions: { color: '#5146d8', type: 'dot' }, errorCorrectionLevel: 'M', imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 } } },
  { id: 'ocean', name: 'Ocean Blue', description: 'Calm blue professional', style: { width: 250, height: 250, margin: 22, dotsOptions: { color: '#1769aa', type: 'dots' }, backgroundOptions: { color: '#fafdff' }, cornersSquareOptions: { color: '#12558b', type: 'square' }, cornersDotOptions: { color: '#1769aa', type: 'square' }, errorCorrectionLevel: 'Q', imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.28 } } },
  { id: 'emerald', name: 'Emerald', description: 'Soft green luxury', style: { width: 250, height: 250, margin: 22, dotsOptions: { color: '#13795b', type: 'rounded' }, backgroundOptions: { color: '#fbfffd' }, cornersSquareOptions: { color: '#0f634b', type: 'extra-rounded' }, cornersDotOptions: { color: '#13795b', type: 'dot' }, errorCorrectionLevel: 'M', imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.3 } } },
  { id: 'sunset', name: 'Sunset', description: 'Warm coral statement', style: { width: 250, height: 250, margin: 20, dotsOptions: { color: '#b45336', type: 'classy' }, backgroundOptions: { color: '#fffdfb' }, cornersSquareOptions: { color: '#8e3d27', type: 'extra-rounded' }, cornersDotOptions: { color: '#b45336', type: 'dot' }, errorCorrectionLevel: 'H', imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.26 } } },
];

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3">
    <label className="label flex-1 mb-0">{label}</label>
    <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-surface-700 bg-transparent" />
    <input type="text" value={value || '#1e293b'} onChange={(e) => onChange(e.target.value)} className="input w-28 text-xs py-1.5" />
  </div>
);

const QRSettings = () => {
  const { qrStyle, updateStyle, resetStyle, setLogo, logo, selectedTheme, selectTheme, saveGlobalSettings } = useQR();
  const [PreviewClass, setPreviewClass] = useState(null);
  const previewRef = useRef(null);
  const previewInstance = useRef(null);

  useEffect(() => {
    import('qr-code-styling').then((module) => setPreviewClass(() => module.default || module)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!PreviewClass || !previewRef.current) return;
    const options = { ...qrStyle, data: 'https://lumalink.app/demo', image: logo || undefined };
    if (!previewInstance.current) {
      previewInstance.current = new PreviewClass(options);
      previewInstance.current.append(previewRef.current);
    } else {
      previewInstance.current.update(options);
    }
  }, [PreviewClass, qrStyle, logo]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    saveGlobalSettings();
    toast.success('QR settings saved globally');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow">Workspace settings</p><h1>QR Design Settings</h1><p>Choose a premium theme or fine-tune your QR style. Changes are shared across the QR builder.</p></div>
        <div className="flex gap-2">
          <button onClick={resetStyle} className="secondary-button"><RotateCcw size={14} /> Reset</button>
          <button onClick={save} className="primary-button"><Save size={14} /> Save Settings</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="space-y-5">
          <section className="simple-panel">
            <div className="panel-title"><div><h2>Premium Design Themes</h2><p>One-click styles for all QR builders</p></div><Crown size={17} className="text-link" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button key={theme.id} type="button" onClick={() => selectTheme(theme)} className={`text-left rounded-xl border p-4 transition ${selectedTheme === theme.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between"><strong className="text-sm text-slate-800">{theme.name}</strong>{selectedTheme === theme.id && <Check size={15} className="text-indigo-600" />}</div>
                  <p className="text-xs text-slate-500 mt-1">{theme.description}</p>
                  <div className="mt-3 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.style.backgroundOptions.color }}><span className="h-3/5 w-2/3 rounded" style={{ background: theme.style.dotsOptions.color }} /></div>
                </button>
              ))}
            </div>
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Size & Margin</h2><p>Control output dimensions</p></div></div>
            <div><label className="label">Size: {qrStyle.width}px</label><input type="range" min={150} max={600} step={10} value={qrStyle.width} onChange={(e) => updateStyle({ width: +e.target.value, height: +e.target.value })} className="w-full" /></div>
            <div><label className="label">Margin: {qrStyle.margin}px</label><input type="range" min={0} max={50} step={2} value={qrStyle.margin} onChange={(e) => updateStyle({ margin: +e.target.value })} className="w-full" /></div>
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Colors</h2><p>Keep the code readable and brand-safe</p></div></div>
            <ColorInput label="Dot Color" value={qrStyle.dotsOptions?.color} onChange={(c) => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, color: c } })} />
            <ColorInput label="Background" value={qrStyle.backgroundOptions?.color} onChange={(c) => updateStyle({ backgroundOptions: { ...qrStyle.backgroundOptions, color: c } })} />
            <ColorInput label="Corner Square" value={qrStyle.cornersSquareOptions?.color} onChange={(c) => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, color: c } })} />
            <ColorInput label="Corner Dot" value={qrStyle.cornersDotOptions?.color} onChange={(c) => updateStyle({ cornersDotOptions: { ...qrStyle.cornersDotOptions, color: c } })} />
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>QR Shape</h2><p>Choose dot and corner styles</p></div></div>
            <div className="grid grid-cols-3 gap-2">{DOT_TYPES.map(t => <button key={t} onClick={() => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, type: t } })} className={`secondary-button justify-center ${qrStyle.dotsOptions?.type === t ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{t}</button>)}</div>
            <div className="grid sm:grid-cols-2 gap-4"><div><label className="label">Corner square</label><div className="flex gap-2">{CORNER_SQUARE_TYPES.map(t => <button key={t} onClick={() => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, type: t } })} className={`secondary-button flex-1 justify-center ${qrStyle.cornersSquareOptions?.type === t ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{t}</button>)}</div></div><div><label className="label">Corner dot</label><div className="flex gap-2">{CORNER_DOT_TYPES.map(t => <button key={t} onClick={() => updateStyle({ cornersDotOptions: { ...qrStyle.cornersDotOptions, type: t } })} className={`secondary-button flex-1 justify-center ${qrStyle.cornersDotOptions?.type === t ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{t}</button>)}</div></div></div>
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Error Correction</h2><p>Higher levels improve recovery from damage</p></div></div><div className="grid grid-cols-4 gap-2">{ERROR_LEVELS.map(l => <button key={l} onClick={() => updateStyle({ errorCorrectionLevel: l })} className={`secondary-button justify-center ${qrStyle.errorCorrectionLevel === l ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{l}</button>)}</div></section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Center Logo</h2><p>Optional brand mark for your QR codes</p></div></div><input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500" /><div><label className="label">Logo size: {Math.round((qrStyle.imageOptions?.imageSize || .3) * 100)}%</label><input type="range" min={10} max={60} step={5} value={(qrStyle.imageOptions?.imageSize || .3) * 100} onChange={(e) => updateStyle({ imageOptions: { ...qrStyle.imageOptions, imageSize: +e.target.value / 100 } })} className="w-full" /></div></section>
        </div>

        <section className="simple-panel lg:sticky lg:top-24"><div className="panel-title"><div><h2>Live Preview</h2><p>Updates as you change settings</p></div><span className="text-xs text-emerald-600 font-semibold">Live</span></div><div className="min-h-[360px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-8"><div ref={previewRef} /></div><div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Preview data</p><p className="text-xs text-slate-600 font-mono mt-1 truncate">https://lumalink.app/demo</p></div></section>
      </div>
    </motion.div>
  );
};
export default QRSettings;
