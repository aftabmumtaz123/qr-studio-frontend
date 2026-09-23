import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  message: z.string().optional(),
  title: z.string().optional(),
});

const SMSForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    if (values.phone) {
      updateQRData(`sms:${values.phone}${values.message ? `?body=${encodeURIComponent(values.message)}` : ''}`);
    }
  }, [values.phone, values.message]);

  return (
    <FormWrapper title="SMS QR Code" icon="💬" description="Compose a pre-filled SMS when scanned." type="SMS" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Send us a message" />
      </div>
      <div>
        <label className="label">Phone Number *</label>
        <input {...register('phone')} className="input" placeholder="+1234567890" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="label">Message (optional)</label>
        <textarea {...register('message')} className="input min-h-[80px] resize-y" placeholder="Pre-filled message..." />
      </div>
    </FormWrapper>
  );
};

export default SMSForm;
