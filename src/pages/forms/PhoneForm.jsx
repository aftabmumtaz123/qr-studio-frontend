import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  title: z.string().optional(),
});

const PhoneForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();

  useEffect(() => {
    if (values.phone) updateQRData(`tel:${values.phone}`);
  }, [values.phone]);

  return (
    <FormWrapper title="Phone QR Code" icon="📞" description="Dial a phone number directly when scanned." type="PHONE" formData={values}>
      <div>
        <label className="label">Title (optional)</label>
        <input {...register('title')} className="input" placeholder="Call us" />
      </div>
      <div>
        <label className="label">Phone Number *</label>
        <input {...register('phone')} className="input" placeholder="+1234567890" />
        {errors.phone && <p className="field-error">{errors.phone.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default PhoneForm;
