import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  url: z.string().url('Enter a valid PDF URL'),
  title: z.string().optional(),
});

const PDFForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    if (values.url) updateQRData(values.url);
  }, [values.url]);

  return (
    <FormWrapper title="PDF QR Code" icon="📄" description="Link directly to a PDF document." type="PDF" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Product Brochure" />
      </div>
      <div>
        <label className="label">PDF URL *</label>
        <input {...register('url')} className="input" placeholder="https://example.com/document.pdf" />
        {errors.url && <p className="field-error">{errors.url.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default PDFForm;
