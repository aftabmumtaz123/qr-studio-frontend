import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  url: z.string().url('Please enter a valid URL (include https://)'),
  title: z.string().optional(),
});

const URLForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { url: 'https://example.com' },
  });
  const values = watch();
  useEffect(() => { if (values.url) updateQRData(values.url); }, [values.url]);

  return (
    <FormWrapper
      title="URL QR Code"
      icon="🔗"
      description="Link to any website, product page, or web resource."
      type="URL"
      formData={values}
    >
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="My Website" />
      </div>
      <div>
        <label className="label">URL *</label>
        <input {...register('url')} className="input" placeholder="https://example.com" />
        {errors.url && <p className="field-error">{errors.url.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default URLForm;
