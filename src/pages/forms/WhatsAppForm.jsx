import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  phone: z.string().min(7, 'Phone number is required (international format)'),
  message: z.string().optional(),
  title: z.string().optional(),
});

const WhatsAppForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    if (values.phone) {
      const phone = values.phone.replace(/\D/g, '');
      const msg = values.message ? `?text=${encodeURIComponent(values.message)}` : '';
      updateQRData(`https://wa.me/${phone}${msg}`);
    }
  }, [values.phone, values.message]);

  return (
    <FormWrapper title="WhatsApp QR Code" icon="📱" description="Open a WhatsApp chat directly." type="WHATSAPP" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Chat on WhatsApp" />
      </div>
      <div>
        <label className="label">Phone Number * (with country code)</label>
        <input {...register('phone')} className="input" placeholder="+1 555 123 4567" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="label">Pre-filled Message (optional)</label>
        <textarea {...register('message')} className="input min-h-[80px] resize-y" placeholder="Hi there!" />
      </div>
    </FormWrapper>
  );
};

export default WhatsAppForm;
