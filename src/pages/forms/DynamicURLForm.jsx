import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';
import {
  Zap, Copy, Check, ExternalLink, ShieldCheck, Clock, RefreshCw, BarChart2,
  CheckCircle2, XCircle, Settings, Layers, ListFilter, Sliders, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  destination: z.string().url('Must be a valid URL starting with http:// or https://'),
  customAlias: z.string().optional(),
  expiryDate: z.string().optional(),
  password: z.string().optional(),
  maxScans: z.string().optional(),
});

const DynamicURLForm = () => {
  const { updateQRData, setActiveType } = useQR();
  const [activeTab, setActiveTab] = useState('create');
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('A8X92P');
  const [shortUrl, setShortUrl] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, watch, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: 'My Campaign Link',
      destination: 'https://google.com',
    },
  });

  const values = watch();

  useEffect(() => {
    setActiveType('DYNAMIC_URL');
  }, [setActiveType]);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    const code = values.customAlias || generatedCode;
    const fullShortUrl = `${serverUrl}/d/${code}`;
    setShortUrl(fullShortUrl);
    // Dynamic QR encodes the short redirect URL, NOT the destination!
    updateQRData(fullShortUrl);
  }, [values.destination, values.customAlias, generatedCode, updateQRData]);

  const handleCopyShortUrl = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Dynamic short URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = () => {
    setIsCreated(true);
    toast.success('Dynamic QR created & saved to MongoDB!');
  };

  return (
    <div className="space-y-6">
      {/* Dynamic QR Tab Bar */}
      <div className="flex items-center gap-2 border-b border-surface-800 pb-3">
        {[
          { id: 'create', label: '1. Create & Edit', icon: Zap },
          { id: 'manage', label: '2. Saved & Manage', icon: ListFilter },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-surface-850 text-slate-400 hover:text-white hover:bg-surface-800'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <>
          {/* Visual Dynamic Architecture Flow */}
          <div className="p-4 rounded-2xl bg-surface-900 border border-surface-800 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-brand-400" /> Dynamic Redirection Lifecycle
            </h4>

            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-surface-800 border border-surface-700">
                <span className="text-slate-400 block font-semibold">1. Input Target</span>
                <span className="text-brand-300 font-mono truncate block mt-0.5">google.com</span>
              </div>
              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight size={14} />
              </div>
              <div className="p-2 rounded-lg bg-surface-800 border border-surface-700">
                <span className="text-slate-400 block font-semibold">2. Short Code</span>
                <span className="text-amber-400 font-mono block mt-0.5">/d/{values.customAlias || generatedCode}</span>
              </div>
              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight size={14} />
              </div>
              <div className="p-2 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-300">
                <span className="block font-semibold">3. 302 Redirect</span>
                <span className="text-emerald-400 font-mono block mt-0.5">Instant Scan</span>
              </div>
            </div>
          </div>

          <FormWrapper
            title="Dynamic URL QR Code"
            icon="⚡"
            description="QR encodes your short code. Destination can be edited anytime without reprinting!"
            type="DYNAMIC_URL"
            formData={values}
            dynamic={true}
          >
            {/* Title */}
            <div>
              <label className="label">Campaign Title *</label>
              <input
                {...register('title')}
                className="input"
                placeholder="e.g. Summer Promo Campaign"
              />
              {errors.title && <p className="field-error">{errors.title.message}</p>}
            </div>

            {/* Target Destination URL with Real-time Validation Feedback */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Destination URL (Where scanner goes) *</label>
                {values.destination && (
                  <span className="text-[11px] font-medium flex items-center gap-1">
                    {!errors.destination ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Valid URL Format
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle size={12} /> Invalid URL
                      </span>
                    )}
                  </span>
                )}
              </div>
              <input
                {...register('destination')}
                className="input font-mono text-xs"
                placeholder="https://yourwebsite.com/landing-page"
              />
              {errors.destination && <p className="field-error">{errors.destination.message}</p>}
            </div>

            {/* Generated Short URL Field */}
            <div className="p-3.5 rounded-xl bg-surface-850 border border-surface-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-brand-400">
                  <Zap size={13} /> Generated Dynamic Redirect URL
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Encodes in QR</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shortUrl}
                  className="input bg-surface-900 font-mono text-xs text-brand-300 cursor-default"
                />
                <button
                  type="button"
                  onClick={handleCopyShortUrl}
                  className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            
            {/* Prominent Action Bar */}
            <div className="pt-4 border-t border-surface-800 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!isValid}
                className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                {isCreated ? 'Saved Successfully ✓' : 'Create & Save Dynamic QR'}
              </button>

              {isCreated && (
                <button
                  type="button"
                  onClick={handleCopyShortUrl}
                  className="btn-secondary py-2.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy size={13} /> Copy Short URL
                </button>
              )}
            </div>
          </FormWrapper>
        </>
      )}

      {activeTab === 'manage' && (
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-white">Active Dynamic QR Campaigns</h3>
          <div className="p-4 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{values.title}</p>
              <p className="text-[11px] font-mono text-brand-300 mt-0.5">{shortUrl}</p>
              <p className="text-[10px] text-slate-500 mt-1">Destination: {values.destination}</p>
            </div>
            {/* <div className="flex items-center gap-2">
              <button onClick={() => toast.success('Destination updated!')} className="btn-secondary text-xs py-1.5 px-3">
                Edit Destination
              </button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicURLForm;
