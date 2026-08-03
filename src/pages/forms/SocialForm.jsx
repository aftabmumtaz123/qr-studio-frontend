import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  url: z.string().url('Enter a valid URL'),
  title: z.string().optional(),
  platform: z.string().optional(),
});

const SocialForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();
  useEffect(() => { if (values.url) updateQRData(values.url); }, [values.url]);

  return (
    <FormWrapper title="Social Media QR Code" icon="🌐" description="Link to any social media profile or page." type="SOCIAL" formData={values}>
      <div>
        <label className="label">Platform (optional)</label>
        <input {...register('platform')} className="input" placeholder="e.g. Facebook, YouTube..." />
      </div>
      <div>
        <label className="label">Profile URL *</label>
        <input {...register('url')} className="input" placeholder="https://facebook.com/yourpage" />
        {errors.url && <p className="field-error">{errors.url.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default SocialForm;
