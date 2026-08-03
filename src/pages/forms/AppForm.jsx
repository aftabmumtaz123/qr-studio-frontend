import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  appStoreUrl: z.string().url('Enter valid App Store URL').optional().or(z.literal('')),
  playStoreUrl: z.string().url('Enter valid Play Store URL').optional().or(z.literal('')),
  title: z.string().optional(),
}).refine((d) => d.appStoreUrl || d.playStoreUrl, { message: 'At least one store URL is required' });

const AppForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    updateQRData(values.appStoreUrl || values.playStoreUrl || 'https://apps.apple.com');
  }, [values.appStoreUrl, values.playStoreUrl]);

  return (
    <FormWrapper title="App Store QR Code" icon="📲" description="Link to your app on the App Store or Google Play." type="APP" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Download Our App" />
      </div>
      <div>
        <label className="label">App Store URL (iOS)</label>
        <input {...register('appStoreUrl')} className="input" placeholder="https://apps.apple.com/..." />
        {errors.appStoreUrl && <p className="field-error">{errors.appStoreUrl.message}</p>}
      </div>
      <div>
        <label className="label">Play Store URL (Android)</label>
        <input {...register('playStoreUrl')} className="input" placeholder="https://play.google.com/..." />
        {errors.playStoreUrl && <p className="field-error">{errors.playStoreUrl.message}</p>}
      </div>
      {errors.root && <p className="field-error">{errors.root.message}</p>}
    </FormWrapper>
  );
};

export default AppForm;
