import { useState } from 'react';
import { useQR } from '../contexts/QRContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Layers, Eye, Image as ImageIcon, Sliders, ChevronDown, Frame, Sparkles, MoveRight } from 'lucide-react';

const DOT_TYPES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_SQUARE_TYPES = ['dot', 'square', 'extra-rounded'];
const CORNER_DOT_TYPES = ['dot', 'square'];
const ERROR_LEVELS = ['L', 'M', 'Q', 'H'];

const AccordionSection = ({ icon: Icon, title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-800 rounded-xl bg-surface-900 overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-850 transition-colors"
      >
        <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Icon size={14} className="text-brand-400" />
          {title}
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 pt-2 space-y-4 border-t border-surface-800"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-3">
    <label className="text-xs text-slate-400 font-medium">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border border-surface-700 bg-transparent p-0"
      />
      <input
        type="text"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="input w-24 text-xs py-1"
      />
    </div>
  </div>
);

const QRStyleAccordion = () => {
  const { qrStyle, updateStyle, setLogo, logo } = useQR();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-6 pt-6 border-t border-surface-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} className="text-brand-400" />
          🎨 QR Customization (Figma Studio)
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">Real-time Updates</span>
      </div>

      {/* 1. Appearance (Dots & Patterns) */}
      <AccordionSection icon={Layers} title="1. Appearance & Dots" defaultOpen={true}>
        <div>
          <label className="text-xs text-slate-400 block mb-2 font-medium">Dot Style Pattern</label>
          <div className="grid grid-cols-3 gap-2">
            {DOT_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, type: t } })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border capitalize transition-all
                  ${qrStyle.dotsOptions?.type === t
                    ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                    : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </AccordionSection>

      {/* 2. Eye & Corner Frame Style */}
      <AccordionSection icon={Eye} title="2. Eyes & Corner Frames">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Corner Square Outer Frame</label>
            <div className="grid grid-cols-3 gap-2">
              {CORNER_SQUARE_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, type: t } })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border capitalize transition-all
                    ${qrStyle.cornersSquareOptions?.type === t
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Corner Dot Center Ball</label>
            <div className="grid grid-cols-2 gap-2">
              {CORNER_DOT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => updateStyle({ cornersDotOptions: { ...qrStyle.cornersDotOptions, type: t } })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border capitalize transition-all
                    ${qrStyle.cornersDotOptions?.type === t
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* 3. Palette & Colors */}
      <AccordionSection icon={Palette} title="3. Palette & Colors">
        <div className="space-y-3">
          <ColorInput
            label="Foreground Dots Color"
            value={qrStyle.dotsOptions?.color}
            onChange={(c) => updateStyle({ dotsOptions: { ...qrStyle.dotsOptions, color: c } })}
          />
          <ColorInput
            label="Background Color"
            value={qrStyle.backgroundOptions?.color}
            onChange={(c) => updateStyle({ backgroundOptions: { ...qrStyle.backgroundOptions, color: c } })}
          />
          <ColorInput
            label="Eye Corner Color"
            value={qrStyle.cornersSquareOptions?.color}
            onChange={(c) => updateStyle({ cornersSquareOptions: { ...qrStyle.cornersSquareOptions, color: c } })}
          />
        </div>
      </AccordionSection>

      {/* 4. Center Logo Branding */}
      <AccordionSection icon={ImageIcon} title="4. Center Logo Branding">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Upload Brand Logo (PNG, SVG, JPG)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
            />
          </div>

          {logo && (
            <div className="space-y-2 pt-2 border-t border-surface-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Logo Size</span>
                <span className="text-xs font-mono text-brand-300">
                  {Math.round((qrStyle.imageOptions?.imageSize || 0.3) * 100)}%
                </span>
              </div>
              <input
                type="range" min={10} max={50} step={5}
                value={(qrStyle.imageOptions?.imageSize || 0.3) * 100}
                onChange={(e) => updateStyle({ imageOptions: { ...qrStyle.imageOptions, imageSize: +e.target.value / 100 } })}
                className="w-full accent-brand-500"
              />

              <button
                type="button"
                onClick={() => setLogo(null)}
                className="text-[11px] text-red-400 hover:text-red-300 transition-colors pt-1"
              >
                Remove Logo
              </button>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* 5. Advanced Configuration */}
      <AccordionSection icon={Sliders} title="5. Advanced Specs (Margin & ECC)">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-medium">Quiet Zone Margin</span>
              <span className="text-xs font-mono text-slate-400">{qrStyle.margin || 10}px</span>
            </div>
            <input
              type="range" min={0} max={40} step={2}
              value={qrStyle.margin || 10}
              onChange={(e) => updateStyle({ margin: +e.target.value })}
              className="w-full accent-brand-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Error Correction Level (ECC)</label>
            <div className="grid grid-cols-4 gap-2">
              {ERROR_LEVELS.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => updateStyle({ errorCorrectionLevel: l })}
                  className={`py-1 rounded-lg text-xs font-bold border transition-all
                    ${qrStyle.errorCorrectionLevel === l
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-surface-800 border-surface-700 text-slate-400 hover:border-surface-600'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>
    </div>
  );
};

export default QRStyleAccordion;
