import { useState } from 'react';
import { useQR } from '../contexts/QRContext';
import { 
  Palette, LayoutTemplate, Type, Image as ImageIcon, 
  Sparkles, Layers, Sliders, Upload, Check, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const templates = [
  { id: 'modern', name: 'Modern', desc: 'Clean layout with top header & bottom QR' },
  { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted glass look with soft glow' },
  { id: 'corporate', name: 'Corporate', desc: 'Formal logo header & structured grid' },
  { id: 'executive', name: 'Executive Slate', desc: 'Sleek dark slate & metallic gold accents' },
  { id: 'tech', name: 'Tech Developer', desc: 'Terminal monospace theme with cyan syntax' },
  { id: 'idbadge', name: 'ID Badge', desc: 'Classic vertical employee / event badge' },
  { id: 'minimal', name: 'Minimal', desc: 'Ultra-clean typography focus' },
  { id: 'dark', name: 'Dark', desc: 'Deep black canvas with vibrant purple accents' },
];

const presetGradients = [
  { from: '#3b82f6', to: '#8b5cf6', name: 'Ocean Dusk' },
  { from: '#ec4899', to: '#8b5cf6', name: 'Neon Dream' },
  { from: '#10b981', to: '#3b82f6', name: 'Emerald Wave' },
  { from: '#f59e0b', to: '#ef4444', name: 'Sunset Glow' },
  { from: '#6366f1', to: '#14b8a6', name: 'Cyber Indigo' },
];

const fonts = [
  { label: 'Outfit (Modern)', value: 'Outfit, sans-serif' },
  { label: 'Inter (Clean)', value: 'Inter, sans-serif' },
  { label: 'Playfair (Elegant)', value: 'Playfair Display, serif' },
  { label: 'Roboto (Standard)', value: 'Roboto, sans-serif' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
];

const CardCustomizer = () => {
  const { 
    cardTemplate, setCardTemplate, 
    cardStyle, updateCardStyle, 
    cardData, updateCardData 
  } = useQR();

  const [activeTab, setActiveTab] = useState('template');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleFileUpload = async (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const setUploading = targetField === 'avatar' ? setIsUploadingAvatar : setIsUploadingLogo;
    setUploading(true);

    try {
      const res = await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        updateCardStyle({ [targetField]: res.data.url });
        toast.success(`${targetField === 'avatar' ? 'Profile picture' : 'Logo'} uploaded!`);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      // Fallback local Object URL preview if backend offline
      const localUrl = URL.createObjectURL(file);
      updateCardStyle({ [targetField]: localUrl });
      toast.success('Image loaded locally');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-surface-850 border border-surface-800 rounded-2xl p-4 space-y-4 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Palette size={15} className="text-brand-400" />
          Card Customization
        </h3>
        <span className="text-[10px] bg-brand-500/20 text-brand-300 font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
          Live Updating
        </span>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-surface-900 rounded-xl text-xs font-medium">
        {[
          { id: 'template', label: 'Template', icon: LayoutTemplate },
          { id: 'style', label: 'Colors', icon: Palette },
          { id: 'font', label: 'Fonts', icon: Type },
          { id: 'assets', label: 'Logos', icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-bold shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
              }`}
            >
              <Icon size={13} />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Template Selection */}
      {activeTab === 'template' && (
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase text-slate-400 block">Choose Template</label>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((tpl) => {
              const isSelected = cardTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setCardTemplate(tpl.id)}
                  className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-glow' 
                      : 'bg-surface-900/60 border-surface-800 text-slate-300 hover:border-surface-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {tpl.name}
                      {isSelected && <Check size={13} className="text-brand-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tpl.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Colors & Styling */}
      {activeTab === 'style' && (
        <div className="space-y-3.5 text-xs">
          {/* Background Type Toggle */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">Background Style</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateCardStyle({ bgType: 'solid' })}
                className={`py-1.5 rounded-lg border font-semibold text-xs ${
                  cardStyle.bgType === 'solid' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-900 border-surface-800 text-slate-400'
                }`}
              >
                Solid Color
              </button>
              <button
                onClick={() => updateCardStyle({ bgType: 'gradient' })}
                className={`py-1.5 rounded-lg border font-semibold text-xs ${
                  cardStyle.bgType === 'gradient' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-900 border-surface-800 text-slate-400'
                }`}
              >
                Gradient
              </button>
            </div>
          </div>

          {/* Preset Gradients */}
          {cardStyle.bgType === 'gradient' && (
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">Gradient Presets</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {presetGradients.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateCardStyle({ gradientFrom: g.from, gradientTo: g.to })}
                    className="w-8 h-8 rounded-full shrink-0 border-2 border-white/20 shadow-md transition-transform hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                    title={g.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {cardStyle.bgType === 'solid' ? (
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Card Background</label>
                <div className="flex items-center gap-2 bg-surface-900 p-1.5 rounded-lg border border-surface-800">
                  <input
                    type="color"
                    value={cardStyle.bgColor}
                    onChange={(e) => updateCardStyle({ bgColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-300 uppercase">{cardStyle.bgColor}</span>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Start Color</label>
                  <div className="flex items-center gap-2 bg-surface-900 p-1.5 rounded-lg border border-surface-800">
                    <input
                      type="color"
                      value={cardStyle.gradientFrom}
                      onChange={(e) => updateCardStyle({ gradientFrom: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-slate-300 uppercase">{cardStyle.gradientFrom}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">End Color</label>
                  <div className="flex items-center gap-2 bg-surface-900 p-1.5 rounded-lg border border-surface-800">
                    <input
                      type="color"
                      value={cardStyle.gradientTo}
                      onChange={(e) => updateCardStyle({ gradientTo: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-slate-300 uppercase">{cardStyle.gradientTo}</span>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Accent Color</label>
              <div className="flex items-center gap-2 bg-surface-900 p-1.5 rounded-lg border border-surface-800">
                <input
                  type="color"
                  value={cardStyle.accentColor}
                  onChange={(e) => updateCardStyle({ accentColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="font-mono text-[11px] text-slate-300 uppercase">{cardStyle.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Border Radius & Shadow */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Corner Radius</label>
              <select
                value={cardStyle.borderRadius}
                onChange={(e) => updateCardStyle({ borderRadius: e.target.value })}
                className="input py-1.5 text-xs"
              >
                <option value="none">Square (0px)</option>
                <option value="md">Rounded (8px)</option>
                <option value="2xl">Extra Rounded (20px)</option>
                <option value="full">Pill (36px)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Box Shadow</label>
              <select
                value={cardStyle.shadow}
                onChange={(e) => updateCardStyle({ shadow: e.target.value })}
                className="input py-1.5 text-xs"
              >
                <option value="none">Flat (None)</option>
                <option value="soft">Soft Elevation</option>
                <option value="glow">Neon Glow</option>
                <option value="deep">Deep Shadow</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Typography & QR Position */}
      {activeTab === 'font' && (
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Font Family</label>
            <select
              value={cardStyle.fontFamily}
              onChange={(e) => updateCardStyle({ fontFamily: e.target.value })}
              className="input py-1.5 text-xs"
            >
              {fonts.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">QR Placement</label>
            <div className="grid grid-cols-3 gap-2">
              {['bottom', 'top', 'side'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateCardStyle({ qrPosition: pos })}
                  className={`py-1.5 capitalize rounded-lg border font-semibold text-xs ${
                    cardStyle.qrPosition === pos ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-900 border-surface-800 text-slate-400'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Profile & Logo Upload */}
      {activeTab === 'assets' && (
        <div className="space-y-3.5 text-xs">
          {/* Profile Picture Upload */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Profile Picture / Avatar</label>
            <div className="flex items-center gap-3 bg-surface-900 p-2.5 rounded-xl border border-surface-800">
              {cardStyle.avatar ? (
                <img src={cardStyle.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-brand-500" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-slate-400">
                  <ImageIcon size={18} />
                </div>
              )}
              <label className="flex-1 btn-secondary text-xs py-1.5 cursor-pointer text-center flex items-center justify-center gap-1.5">
                <Upload size={13} />
                {isUploadingAvatar ? 'Uploading...' : 'Upload Image'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'avatar')} 
                />
              </label>
            </div>
          </div>

          {/* Brand Logo Upload */}
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Brand Logo</label>
            <div className="flex items-center gap-3 bg-surface-900 p-2.5 rounded-xl border border-surface-800">
              {cardStyle.brandLogo ? (
                <img src={cardStyle.brandLogo} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-slate-400">
                  <ImageIcon size={18} />
                </div>
              )}
              <label className="flex-1 btn-secondary text-xs py-1.5 cursor-pointer text-center flex items-center justify-center gap-1.5">
                <Upload size={13} />
                {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'brandLogo')} 
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardCustomizer;
