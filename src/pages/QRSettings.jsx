import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Save, RotateCcw, Sparkles, SlidersHorizontal, Palette, ImagePlus, ScanLine, Download, AlertTriangle } from 'lucide-react';
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
  const [textValue, setTextValue] = useState(value || '#ffffff');
  useEffect(() => setTextValue(value || '#ffffff'), [value]);
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
        value={textValue}
        onChange={(e) => {
          const next = e.target.value;
          setTextValue(next);
          if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(next);
        }}
        onBlur={() => {
          const normalized = normalizeHex(textValue, safeValue);
          setTextValue(normalized);
          if (normalized !== value) onChange(normalized);
        }}
        className="input w-28 text-xs py-1.5"
      />
    </div>
  );
};

const QRSettings = () => {
  const { qrStyle, updateStyle, setLogo, logo, selectedTheme, selectTheme, saveGlobalSettings } = useQR();
  const [themePreview, setThemePreview] = useState(() => ({ id: selectedTheme, style: qrStyle }));
  const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);
  const [draftLogo, setDraftLogo] = useState(logo);
  const [logoDirty, setLogoDirty] = useState(false);

  const applyStyleChange = (updates) => {
    setThemePreview((current) => {
      const next = { ...current.style };
      Object.entries(updates).forEach(([key, value]) => {
        next[key] = value && typeof value === 'object' && !Array.isArray(value)
          ? { ...(next[key] || {}), ...value }
          : value;
      });
      return { ...current, style: next };
    });
  };

  const updateColor = (section, color) => {
    const normalized = normalizeHex(color);
    applyStyleChange({ [section]: { color: normalized } });
  };

  const hexToRgb = (hex) => {
    const safe = normalizeHex(hex);
    return [1, 3, 5].map((i) => parseInt(safe.slice(i, i + 2), 16));
  };
  const luminance = (hex) => hexToRgb(hex).map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const contrastRatio = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); };
  const [PreviewClass, setPreviewClass] = useState(null);

  // Theme selection is a preview-only action. It does not touch the shared QR
  // settings until the user explicitly saves the theme.
  const previewStyle = themePreview.style;
  const previewThemeId = themePreview.id;
  const contrast = contrastRatio(previewStyle.dotsOptions?.color || '#172033', previewStyle.backgroundOptions?.color || '#ffffff');
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
      ...(draftLogo ? { image: draftLogo } : {}),
    }));

    previewRef.current.innerHTML = '';
    previewInstance.current = new PreviewClass(options);
    previewInstance.current.append(previewRef.current);

    return () => {
      if (previewRef.current) previewRef.current.innerHTML = '';
      previewInstance.current = null;
    };
  }, [PreviewClass, previewStyle, draftLogo]);

  useEffect(() => () => {
    previewInstance.current = null;
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setDraftLogo(await prepareLogoDataUrl(file));
      setLogoDirty(true);
      toast.success('Logo selected. Click Save Settings to apply it.');
    } catch (error) {
      toast.error(error.message || 'Could not process the logo');
    } finally {
      e.target.value = '';
    }
  };

  const handleLogoRemove = () => {
    if (!draftLogo) return;
    setShowDeleteLogoModal(true);
  };

  const confirmLogoRemove = () => {
    setDraftLogo(null);
    setLogoDirty(true);
    setShowDeleteLogoModal(false);
    toast.success('Logo removal pending. Click Save Settings to confirm.');
  };

  const handleThemePreview = (theme) => {
    setThemePreview({ id: theme.id, style: theme.style });
  };

  // Keep the Settings page's independent theme preview in sync with the logo
  // size slider. Updating qrStyle alone does not update previewStyle because
  // themePreview intentionally stores a snapshot for theme previews.
  const handleLogoSizeChange = (event) => {
    const imageSize = Number(event.target.value) / 100;
    applyStyleChange({
      imageOptions: { ...(previewStyle.imageOptions || {}), imageSize },
    });
  };

  const refreshThemePreview = () => {
    setThemePreview({ id: selectedTheme, style: qrStyle });
    setDraftLogo(logo);
    setLogoDirty(false);
    toast.success('Preview restored to the current settings');
  };

  const save = () => {
    selectTheme({ id: themePreview.id, style: themePreview.style });
    updateStyle(themePreview.style);
    if (logoDirty) setLogo(draftLogo);
    saveGlobalSettings(draftLogo);
    setLogoDirty(false);
    toast.success('QR design settings saved');
  };

  const resetToDefaults = () => {
    setDraftLogo(null);
    setLogoDirty(true);
    setThemePreview({ id: 'clean', style: { ...THEMES[0].style } });
    toast.success('Default design loaded. Save Settings to apply it.');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="qr-settings-page max-w-6xl space-y-6">
      <div className="qr-settings-heading">
        <div className="min-w-0"><p className="eyebrow">Workspace settings</p><h1>QR Design Studio</h1><p>Build a branded QR code with reusable themes, precise styling, and a live preview.</p></div>
        <div className="qr-settings-actions">
          <span className="settings-unsaved"><span className="settings-status-dot" /> Editing design</span>
          <button type="button" onClick={refreshThemePreview} className="secondary-button"><RotateCcw size={14} /> Undo changes</button>
          <button type="button" onClick={resetToDefaults} className="secondary-button qr-reset-button">Reset defaults</button>
          <button type="button" onClick={save} className="primary-button"><Save size={14} /> Save Settings</button>
        </div>
      </div>

      <div className="qr-settings-layout grid lg:grid-cols-[minmax(0,1fr)_350px] gap-5 items-start">
        <div className="space-y-5">
          <section className="simple-panel settings-section settings-themes">
            <div className="panel-title">
              <div className="settings-section-heading"><span className="settings-section-icon"><Sparkles size={17} /></span><div><h2>Design themes</h2><p>Start with a preset, then fine-tune every detail</p></div></div>
              <span className="settings-count">{THEMES.length} presets</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button key={theme.id} type="button" onClick={() => handleThemePreview(theme)} className={`theme-choice text-left rounded-xl border p-3 transition ${previewThemeId === theme.id ? 'is-selected border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between"><strong className="text-sm text-slate-800">{theme.name}</strong>{previewThemeId === theme.id && <Check size={15} className="text-indigo-600" />}</div>
                  <p className="text-xs text-slate-500 mt-1">{theme.description}</p>
                  <div className="theme-mini-preview mt-3 rounded-lg flex items-center justify-center" style={{ background: theme.style.backgroundOptions.color }} aria-hidden="true">
                    <svg viewBox="0 0 88 58" width="88" height="58">
                      {Array.from({ length: 9 }, (_, y) => Array.from({ length: 13 }, (_, x) => ((x * 7 + y * 5 + x * y) % 4 !== 0) && <rect key={`${x}-${y}`} x={7 + x * 5.8} y={4 + y * 5.6} width="3.5" height="3.5" rx={theme.style.dotsOptions.type.includes('round') || theme.style.dotsOptions.type === 'dots' ? 1.7 : 0} fill={theme.style.dotsOptions.color} />))}
                      <rect x="4" y="2" width="19" height="19" rx="4" fill={theme.style.backgroundOptions.color} stroke={theme.style.cornersSquareOptions.color} strokeWidth="3.5"/><rect x="65" y="2" width="19" height="19" rx="4" fill={theme.style.backgroundOptions.color} stroke={theme.style.cornersSquareOptions.color} strokeWidth="3.5"/><rect x="4" y="37" width="19" height="19" rx="4" fill={theme.style.backgroundOptions.color} stroke={theme.style.cornersSquareOptions.color} strokeWidth="3.5"/>
                    </svg>
                  </div>
                  <div className="theme-swatches"><i style={{ background: theme.style.dotsOptions.color }} /><i style={{ background: theme.style.backgroundOptions.color }} /><i style={{ background: theme.style.cornersSquareOptions.color }} /></div>
                </button>
              ))}
            </div>
            <div className="settings-note"><Sparkles size={14} /><span>Preset changes are reflected in the preview. Click <strong>Save Settings</strong> to apply them across the QR builder.</span></div>
          </section>

          <section className="simple-panel settings-section space-y-4"><div className="panel-title"><div className="settings-section-heading"><span className="settings-section-icon"><SlidersHorizontal size={17} /></span><div><h2>Size & spacing</h2><p>Control the exported QR dimensions</p></div></div></div>
            <div className="settings-range-field"><div className="settings-range-label"><label className="label mb-0" htmlFor="qr-size-range">QR size</label><label className="settings-number-wrap"><input aria-label="QR size in pixels" type="number" min={150} max={1024} step={10} value={previewStyle.width} onChange={(e) => { const n = Math.max(150, Math.min(1024, Number(e.target.value) || 150)); applyStyleChange({ width: n, height: n }); }} /> <span>px</span></label></div><input id="qr-size-range" type="range" min={150} max={1024} step={10} value={previewStyle.width} onChange={(e) => applyStyleChange({ width: +e.target.value, height: +e.target.value })} className="w-full settings-range" /><div className="settings-range-ends"><span>150 px</span><span>1024 px</span></div></div>
            <div className="settings-range-field"><div className="settings-range-label"><label className="label mb-0" htmlFor="qr-margin-range">Quiet zone / margin</label><label className="settings-number-wrap"><input aria-label="QR margin in pixels" type="number" min={0} max={50} step={1} value={previewStyle.margin ?? 0} onChange={(e) => applyStyleChange({ margin: Math.max(0, Math.min(50, Number(e.target.value) || 0)) })} /><span>px</span></label></div><input id="qr-margin-range" type="range" min={0} max={50} step={1} value={previewStyle.margin ?? 0} onChange={(e) => applyStyleChange({ margin: +e.target.value })} className="w-full settings-range" /><p className="settings-help">A clear border around the code helps scanners detect it reliably.</p></div>
          </section>

          <section className="simple-panel settings-section space-y-4"><div className="panel-title"><div className="settings-section-heading"><span className="settings-section-icon"><Palette size={17} /></span><div><h2>Colors & contrast</h2><p>Match your brand while keeping your code scannable</p></div></div></div>
            <ColorInput label="Dot Color" value={previewStyle.dotsOptions?.color} onChange={(c) => updateColor('dotsOptions', c)} />
            <ColorInput label="Background" value={previewStyle.backgroundOptions?.color} onChange={(c) => updateColor('backgroundOptions', c)} />
            <ColorInput label="Corner Square" value={previewStyle.cornersSquareOptions?.color} onChange={(c) => updateColor('cornersSquareOptions', c)} />
            <ColorInput label="Corner Dot" value={previewStyle.cornersDotOptions?.color} onChange={(c) => updateColor('cornersDotOptions', c)} />
            <div className={`settings-contrast ${contrast < 3 ? 'is-warning' : 'is-good'}`}><span className="settings-contrast-icon">{contrast < 3 ? <AlertTriangle size={15} /> : <Check size={15} />}</span><div><strong>{contrast < 3 ? 'Low color contrast' : 'Good color contrast'}</strong><p>{contrast.toFixed(1)}:1 contrast ratio. {contrast < 3 ? 'Choose a darker foreground or lighter background to improve scanning reliability.' : 'Your foreground and background have a useful contrast difference.'}</p></div></div>
          </section>

          <section className="simple-panel settings-section space-y-4"><div className="panel-title"><div className="settings-section-heading"><span className="settings-section-icon"><ScanLine size={17} /></span><div><h2>QR shape</h2><p>Select the dot and finder-pattern style</p></div></div></div>
            <label className="label">Dot style</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{DOT_TYPES.map(t => <button type="button" key={t} onClick={() => applyStyleChange({ dotsOptions: { ...previewStyle.dotsOptions, type: t } })} className={`shape-choice ${previewStyle.dotsOptions?.type === t ? 'is-selected' : ''}`} aria-pressed={previewStyle.dotsOptions?.type === t}><span className={`shape-sample shape-${t}`} style={{ color: previewStyle.dotsOptions?.color || '#5146d8' }}><i /><i /><i /><i /></span><span>{t.replaceAll('-', ' ')}</span>{previewStyle.dotsOptions?.type === t && <Check size={14} />}</button>)}</div>
            <div className="grid sm:grid-cols-2 gap-4"><div><label className="label">Corner square</label><div className="flex gap-2">{CORNER_SQUARE_TYPES.map(t => <button type="button" key={t} onClick={() => applyStyleChange({ cornersSquareOptions: { ...previewStyle.cornersSquareOptions, type: t } })} className={`shape-pill ${previewStyle.cornersSquareOptions?.type === t ? 'is-selected' : ''}`} aria-pressed={previewStyle.cornersSquareOptions?.type === t}>{t.replaceAll('-', ' ')}</button>)}</div></div><div><label className="label">Corner dot</label><div className="flex gap-2">{CORNER_DOT_TYPES.map(t => <button type="button" key={t} onClick={() => applyStyleChange({ cornersDotOptions: { ...previewStyle.cornersDotOptions, type: t } })} className={`shape-pill ${previewStyle.cornersDotOptions?.type === t ? 'is-selected' : ''}`} aria-pressed={previewStyle.cornersDotOptions?.type === t}>{t}</button>)}</div></div></div>
          </section>

          <section className="simple-panel settings-section space-y-4"><div className="panel-title"><div><h2>Error correction</h2><p>Higher levels recover more data when the code is damaged</p></div></div><div className="grid grid-cols-4 gap-2">{ERROR_LEVELS.map((level) => <button type="button" key={level} onClick={() => applyStyleChange({ errorCorrectionLevel: level })} aria-pressed={previewStyle.errorCorrectionLevel === level} className={`error-level-choice ${previewStyle.errorCorrectionLevel === level ? 'is-selected' : ''}`}><strong>{level}</strong><span>{({ L: '7%', M: '15%', Q: '25%', H: '30%' })[level]}</span></button>)}</div><p className="settings-help">If you use a center logo, Q or H is usually a better starting point. Always test-scan the final code.</p></section>

          <section className="simple-panel settings-section space-y-4">
            <div className="panel-title">
              <div className="settings-section-heading"><span className="settings-section-icon"><ImagePlus size={17} /></span><div><h2>Center logo</h2><p>Add a brand mark to the center of your QR code</p></div></div>
            </div>

            <label className="logo-upload-zone">
              <span className="logo-upload-icon"><ImagePlus size={20} /></span>
              <span><strong>{draftLogo ? 'Replace logo image' : 'Choose a logo image'}</strong><small>PNG, JPG, WebP or SVG · optimized for QR use</small></span>
              <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={handleLogoUpload} />
            </label>

            {draftLogo && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={draftLogo} alt="Current QR logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700">Logo added</p>
                      <p className="text-xs text-slate-500">This logo appears in the center of your QR code.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="secondary-button shrink-0 !text-red-600 !border-red-200 hover:!bg-red-50"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            )}

            {draftLogo && (
              <div>
                <div className="settings-range-label"><label className="label mb-0" htmlFor="logo-size-range">Logo size</label><strong className="settings-value-chip">{Math.round((previewStyle.imageOptions?.imageSize || .3) * 100)}%</strong></div>
                <input id="logo-size-range" type="range" min={10} max={40} step={5} value={(previewStyle.imageOptions?.imageSize || .3) * 100} onChange={handleLogoSizeChange} className="w-full settings-range" />
                <p className="settings-help">Keep the logo compact to protect QR readability. Test-scan after changing its size.</p>
                {Math.round((previewStyle.imageOptions?.imageSize || .3) * 100) > 30 && <p className="settings-warning"><AlertTriangle size={13} /> Larger logos can reduce scanning reliability.</p>}
              </div>
            )}
          </section>
        </div>

        <section className="simple-panel qr-settings-preview lg:sticky lg:top-24"><div className="panel-title"><div><div className="settings-section-heading"><span className="settings-section-icon"><ScanLine size={17} /></span><div><h2>Live preview</h2><p>Updates as you customize</p></div></div></div><span className="preview-live-pill"><span /> Live</span></div><div className="qr-preview-viewport min-h-[320px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-6 overflow-hidden"><div ref={previewRef} className="qr-preview-content max-w-full max-h-full flex items-center justify-center overflow-hidden" /></div><div className="preview-meta-row"><span>OUTPUT SIZE</span><strong>{previewStyle.width || 250} × {previewStyle.height || previewStyle.width || 250}px</strong></div><div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200"><p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Preview destination</p><p className="text-xs text-slate-600 font-mono mt-1 truncate">https://lumalink.app/demo</p></div><div className="preview-download-note"><Download size={14} /><span>Save settings, then export your QR from the builder.</span></div></section>
      </div>

      {showDeleteLogoModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDeleteLogoModal(false); }}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-logo-title"
            aria-describedby="delete-logo-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <span className="text-2xl font-semibold" aria-hidden="true">!</span>
            </div>
            <h2 id="delete-logo-title" className="text-center text-lg font-semibold text-slate-900">Remove center logo?</h2>
            <p id="delete-logo-description" className="mt-2 text-center text-sm leading-6 text-slate-600">Are you sure you want to remove this logo? It will be removed from the QR preview and saved logo settings.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => setShowDeleteLogoModal(false)} className="secondary-button inline-flex h-11 w-28 items-center justify-center !px-0 !py-0">Cancel</button>
              <button type="button" onClick={confirmLogoRemove} className="primary-button inline-flex h-11 w-28 items-center justify-center !px-0 !py-0 !bg-red-600 hover:!bg-red-700">Delete Logo</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
export default QRSettings;
