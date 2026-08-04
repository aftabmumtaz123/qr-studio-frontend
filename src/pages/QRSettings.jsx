import { useQR } from '../contexts/QRContext';
import { motion } from 'framer-motion';

const DOT_TYPES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_SQUARE_TYPES = ['dot', 'square', 'extra-rounded'];
const CORNER_DOT_TYPES = ['dot', 'square'];
const ERROR_LEVELS = ['L', 'M', 'Q', 'H'];

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3">
    <label className="label flex-1 mb-0">{label}</label>
    <input
      type="color"
      value={value || '#ffffff'}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-8 rounded cursor-pointer border border-surface-700 bg-transparent"
    />
    <input
      type="text"
      value={value || '#1e293b'}
      onChange={(e) => onChange(e.target.value)}
      className="input w-28 text-xs py-1.5"
      placeholder="#1e293b"
    />
  </div>
);

const QRSettings = () => {
  const { qrStyle, updateStyle, resetStyle, setLogo } = useQR();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-xl space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">⚙️ QR Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Customize the appearance of your QR code</p>
        </div>
        <button onClick={resetStyle} className="btn-secondary text-sm">Reset to Default</button>
      </div>

      {/* Size */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Size & Margin</h3>
        <div>
          <label className="label">Size: {qrStyle.width}px</label>
          <input
            type="range" min={150} max={600} step={10}
            value={qrStyle.width}
            onChange={(e) => updateStyle({ width: +e.target.value, height: +e.target.value })}
            className="w-full accent-brand-500"
          />
        </div>
        <div>
          <label className="label">Margin: {qrStyle.margin}px</label>
          <input
            type="range" min={0} max={50} step={2}
            value={qrStyle.margin}
            onChange={(e) => updateStyle({ margin: +e.target.value })}
            className="w-full accent-brand-500"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Colors</h3>
        <ColorInput
          label="Dot Color"
          value={qrStyle.dotsOptions?.color}
          onChange={(c) => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, color: c } })}
        />
        <ColorInput
          label="Background"
          value={qrStyle.backgroundOptions?.color}
          onChange={(c) => updateStyle({ backgroundOptions: { ...qrStyle.backgroundOptions, color: c } })}
        />
        <ColorInput
          label="Corner Square"
          value={qrStyle.cornersSquareOptions?.color}
          onChange={(c) => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, color: c } })}
        />
        <ColorInput
          label="Corner Dot"
          value={qrStyle.cornersDotOptions?.color}
          onChange={(c) => updateStyle({ cornersDotOptions: { ...qrStyle.cornersDotOptions, color: c } })}
        />
      </div>

      {/* Dot style */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Dot Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {DOT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, type: t } })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all duration-150
                ${qrStyle.dotsOptions?.type === t
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Corner styles */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Corner Square Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {CORNER_SQUARE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, type: t } })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all duration-150
                ${qrStyle.cornersSquareOptions?.type === t
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Corner Dot Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {CORNER_DOT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateStyle({ cornersDotOptions: { ...qrStyle.cornersDotOptions, type: t } })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all duration-150
                ${qrStyle.cornersDotOptions?.type === t
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error Correction */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Error Correction Level</h3>
        <p className="text-xs text-slate-500">Higher = more data recovery, larger QR code</p>
        <div className="grid grid-cols-4 gap-2">
          {ERROR_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => updateStyle({ errorCorrectionLevel: l })}
              className={`py-1.5 rounded-lg text-xs font-bold border transition-all duration-150
                ${qrStyle.errorCorrectionLevel === l
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Center Logo</h3>
        <div>
          <label className="label">Upload Logo (PNG, SVG, JPG, WebP)</label>
          <input
            type="file"
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            onChange={handleLogoUpload}
            className="block w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="label">Logo Size: {qrStyle.imageOptions?.imageSize * 100 || 30}%</label>
          <input
            type="range" min={10} max={60} step={5}
            value={(qrStyle.imageOptions?.imageSize || 0.3) * 100}
            onChange={(e) => updateStyle({ imageOptions: { ...qrStyle.imageOptions, imageSize: +e.target.value / 100 } })}
            className="w-full accent-brand-500"
          />
        </div>
        <div>
          <label className="label">Logo Margin: {qrStyle.imageOptions?.margin || 5}px</label>
          <input
            type="range" min={0} max={20} step={1}
            value={qrStyle.imageOptions?.margin || 5}
            onChange={(e) => updateStyle({ imageOptions: { ...qrStyle.imageOptions, margin: +e.target.value } })}
            className="w-full accent-brand-500"
          />
        </div>
      </div>
    </motion.div>
  );
};



export default QRSettings;
