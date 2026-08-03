import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({ username: z.string().min(1, 'Username is required'), title: z.string().optional() });

const InstagramForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();
  useEffect(() => {
    if (values.username) updateQRData(`https://instagram.com/${values.username.replace('@', '')}`);
  }, [values.username]);
  return (
    <FormWrapper title="Instagram QR Code" icon="📸" description="Link to your Instagram profile." type="INSTAGRAM" formData={values}>
      <div>
        <label className="label">Instagram Username *</label>
        <input {...register('username')} className="input" placeholder="@yourhandle" />
        {errors.username && <p className="field-error">{errors.username.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default InstagramForm;
