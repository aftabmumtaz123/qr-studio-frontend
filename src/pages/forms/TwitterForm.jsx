import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({ username: z.string().min(1, 'Username is required'), title: z.string().optional() });

const TwitterForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();
  useEffect(() => {
    if (values.username) updateQRData(`https://twitter.com/${values.username.replace('@', '')}`);
  }, [values.username]);
  return (
    <FormWrapper title="Twitter / X QR Code" icon="🐦" description="Link to your Twitter/X profile." type="TWITTER" formData={values}>
      <div>
        <label className="label">Twitter Username *</label>
        <input {...register('username')} className="input" placeholder="@handle" />
        {errors.username && <p className="field-error">{errors.username.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default TwitterForm;
