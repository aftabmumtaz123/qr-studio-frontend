import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Save, RotateCcw, Crown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQR } from '../contexts/QRContext';
import { prepareLogoDataUrl } from '../utils/logoUtils';

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

const normalizeHex = (value, fallback = '#ffffff') => {
  const v = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
};

const ColorInput = ({ label, value, onChange }) => {
  const safeValue = normalizeHex(value);
  return (
    <div className="flex items-center gap-3">
      <label className="label flex-1 mb-0">{label}</label>
      <input
        type="color"
        value={safeValue}
        onChange={(e) => onChange(normalizeHex(e.target.value))}
        className="w-8 h-8 rounded cursor-pointer border border-surface-700 bg-transparent"
      />
      <input
        type="text"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          const normalized = normalizeHex(e.target.value, safeValue);
          if (normalized !== e.target.value) onChange(normalized);
        }}
        className="input w-28 text-xs py-1.5"
      />
    </div>
  );
};

const QRSettings = () => {
  const { qrStyle, updateStyle, resetStyle, setLogo, logo, selectedTheme, selectTheme, saveGlobalSettings } = useQR();
  const [themePreview, setThemePreview] = useState(() => ({ id: selectedTheme, style: qrStyle }));

  const updateColor = (section, color) => {
    const normalized = normalizeHex(color);
    updateStyle({ [section]: { color: normalized } });
  };
  const [PreviewClass, setPreviewClass] = useState(null);

  // Theme selection is a preview-only action. It does not touch the shared QR
  // settings until the user explicitly saves the theme.
  const previewStyle = themePreview.style;
  const previewThemeId = themePreview.id;
  const previewRef = useRef(null);
  const previewInstance = useRef(null);

  useEffect(() => {
    import('qr-code-styling').then((module) => setPreviewClass(() => module.default || module)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!PreviewClass || !previewRef.current) return;

    // Recreate the preview when the logo changes. qr-code-styling merges
    // update options and may retain a previously supplied image when `image`
    // becomes undefined. Recreating guarantees that removing the logo also
    // removes it from the live preview.
    const options = JSON.parse(JSON.stringify({
      ...previewStyle,
      data: 'https://lumalink.app/demo',
      ...(logo ? { image: logo } : {}),
    }));

    previewRef.current.innerHTML = '';
    previewInstance.current = new PreviewClass(options);
    previewInstance.current.append(previewRef.current);

    return () => {
      if (previewRef.current) previewRef.current.innerHTML = '';
      previewInstance.current = null;
    };
  }, [PreviewClass, previewStyle, logo]);

  useEffect(() => () => {
    previewInstance.current = null;
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLogo(await prepareLogoDataUrl(file));
      toast.success('Logo added');
    } catch (error) {
      toast.error(error.message || 'Could not process the logo');
    } finally {
      e.target.value = '';
    }
  };

  const handleThemePreview = (theme) => {
    setThemePreview({ id: theme.id, style: theme.style });
  };

  const saveTheme = () => {
    updateStyle(themePreview.style);
    selectTheme(THEMES.find((theme) => theme.id === themePreview.id) || { id: themePreview.id, style: themePreview.style });
    toast.success('Theme saved');
  };

  const refreshThemePreview = () => {
    setThemePreview({ id: selectedTheme, style: qrStyle });
    toast.success('Theme preview reset');
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
            <div className="panel-title">
              <div><h2>Premium Design Themes</h2><p>Preview themes without changing your saved design</p></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={refreshThemePreview} className="secondary-button text-xs py-2 px-3"><RefreshCw size={13} /> Undo</button>
                <button type="button" onClick={saveTheme} className="primary-button text-xs py-2 px-3"><Save size={13} /> Save Theme</button>
                <Crown size={17} className="text-link" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button key={theme.id} type="button" onClick={() => handleThemePreview(theme)} className={`text-left rounded-xl border p-4 transition ${previewThemeId === theme.id ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between"><strong className="text-sm text-slate-800">{theme.name}</strong>{previewThemeId === theme.id && <Check size={15} className="text-indigo-600" />}</div>
                  <p className="text-xs text-slate-500 mt-1">{theme.description}</p>
                  <div className="mt-3 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.style.backgroundOptions.color }}><span className="h-3/5 w-2/3 rounded" style={{ background: theme.style.dotsOptions.color }} /></div>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
              Theme changes are preview-only until you click <strong>Save Theme</strong>. Use <strong>Refresh</strong> to return to the saved theme.
            </div>
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Size & Margin</h2><p>Control output dimensions</p></div></div>
            <div><label className="label">Size: {qrStyle.width}px</label><input type="range" min={150} max={600} step={10} value={qrStyle.width} onChange={(e) => updateStyle({ width: +e.target.value, height: +e.target.value })} className="w-full" /></div>
            <div><label className="label">Margin: {qrStyle.margin}px</label><input type="range" min={0} max={50} step={2} value={qrStyle.margin} onChange={(e) => updateStyle({ margin: +e.target.value })} className="w-full" /></div>
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Colors</h2><p>Keep the code readable and brand-safe</p></div></div>
            <ColorInput label="Dot Color" value={qrStyle.dotsOptions?.color} onChange={(c) => updateColor('dotsOptions', c)} />
            <ColorInput label="Background" value={qrStyle.backgroundOptions?.color} onChange={(c) => updateColor('backgroundOptions', c)} />
            <ColorInput label="Corner Square" value={qrStyle.cornersSquareOptions?.color} onChange={(c) => updateColor('cornersSquareOptions', c)} />
            <ColorInput label="Corner Dot" value={qrStyle.cornersDotOptions?.color} onChange={(c) => updateColor('cornersDotOptions', c)} />
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>QR Shape</h2><p>Choose dot and corner styles</p></div></div>
            <div className="grid grid-cols-3 gap-2">{DOT_TYPES.map(t => <button key={t} onClick={() => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, type: t } })} className={`secondary-button justify-center ${qrStyle.dotsOptions?.type === t ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{t}</button>)}</div>
            <div className="grid sm:grid-cols-2 gap-4"><div><label className="label">Corner square</label><div className="flex gap-2">{CORNER_SQUARE_TYPES.map(t => <button key={t} onClick={() => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, type: t } })} className={`secondary-button flex-1 justify-center ${qrStyle.cornersSquareOptions?.type === t ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{t}</button>)}</div></div><div><label className="label">Corner dot</label><div className="flex gap-2">{CORNER_DOT_TYPES.map(t => <button key={t} onClick={() => updateStyle({ cornersDotOptions: { ...qrStyle.cornersDotOptions, type: t } })} className={`secondary-button flex-1 justify-center ${qrStyle.cornersDotOptions?.type === t ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{t}</button>)}</div></div></div>
          </section>

          <section className="simple-panel space-y-4"><div className="panel-title"><div><h2>Error Correction</h2><p>Higher levels improve recovery from damage</p></div></div><div className="grid grid-cols-4 gap-2">{ERROR_LEVELS.map(l => <button key={l} onClick={() => updateStyle({ errorCorrectionLevel: l })} className={`secondary-button justify-center ${qrStyle.errorCorrectionLevel === l ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}`}>{l}</button>)}</div></section>

          <section className="simple-panel space-y-4">
            <div className="panel-title">
              <div>
                <h2>Center Logo</h2>
                <p>Optional brand mark for your QR codes</p>
              </div>
            </div>

            <input
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-slate-500"
            />

            {logo && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={logo} alt="Current QR logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700">Logo added</p>
                      <p className="text-xs text-slate-500">This logo appears in the center of your QR code.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                    className="secondary-button shrink-0 !text-red-600 !border-red-200 hover:!bg-red-50"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            )}

            {logo && (
              <div>
                <label className="label">Logo size: {Math.round((qrStyle.imageOptions?.imageSize || .3) * 100)}%</label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={(qrStyle.imageOptions?.imageSize || .3) * 100}
                  onChange={(e) => updateStyle({ imageOptions: { ...qrStyle.imageOptions, imageSize: +e.target.value / 100 } })}
                  className="w-full"
                />
              </div>
            )}
          </section>
        </div>

        <section className="simple-panel lg:sticky lg:top-24"><div className="panel-title"><div><h2>Live Preview</h2><p>Updates as you change settings</p></div><span className="text-xs text-emerald-600 font-semibold">Live</span></div><div className="qr-preview-viewport min-h-[360px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-8 overflow-hidden"><div ref={previewRef} className="qr-preview-content max-w-full max-h-full flex items-center justify-center overflow-hidden" /></div><div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Preview data</p><p className="text-xs text-slate-600 font-mono mt-1 truncate">https://lumalink.app/demo</p></div></section>
      </div>
    </motion.div>
  );
};
export default QRSettings;
