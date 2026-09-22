import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  ssid: z.string().min(1, 'Network name is required'),
  password: z.string().optional(),
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
  hidden: z.boolean().optional(),
  title: z.string().optional(),
});

const WiFiForm = () => {
  const { updateQRData } = useQR();
  const [showPassword, setShowPassword] = useState(false);
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { encryption: 'WPA' },
  });
  const values = watch();

  useEffect(() => {
    const { ssid, password, encryption, hidden } = values;
    if (ssid) {
      updateQRData(`WIFI:S:${ssid};T:${encryption};P:${password || ''};H:${hidden ? 'true' : 'false'};;`);
    }
  }, [values.ssid, values.password, values.encryption, values.hidden]);

  return (
    <FormWrapper title="WiFi QR Code" icon="📶" description="Connect to WiFi instantly by scanning." type="WIFI" formData={values}>
      <div>
        <label className="label">Network Name (SSID) *</label>
        <input {...register('ssid')} className="input" placeholder="MyNetwork" />
        {errors.ssid && <p className="field-error">{errors.ssid.message}</p>}
      </div>
      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className="input pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>
      <div>
        <label className="label">Security Type</label>
        <select {...register('encryption')} className="input">
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">No Password</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('hidden')} id="hidden" className="w-4 h-4 accent-brand-500" />
        <label htmlFor="hidden" className="text-sm text-slate-400">Hidden network</label>
      </div>
    </FormWrapper>
  );
};

export default WiFiForm;
