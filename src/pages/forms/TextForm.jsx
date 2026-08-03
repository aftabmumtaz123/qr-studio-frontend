import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  text: z.string().min(1, 'Text is required').max(2000, 'Text is too long'),
  title: z.string().optional(),
});

const TextForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { text: 'Hello, World!' },
  });
  const values = watch();
  useEffect(() => { if (values.text) updateQRData(values.text); }, [values.text]);

  return (
    <FormWrapper title="Text QR Code" icon="📝" description="Encode any plain text into a QR code." type="TEXT" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="My Text" />
      </div>
      <div>
        <label className="label">Text *</label>
        <textarea {...register('text')} className="input min-h-[120px] resize-y" placeholder="Enter your text..." />
        {errors.text && <p className="field-error">{errors.text.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default TextForm;
