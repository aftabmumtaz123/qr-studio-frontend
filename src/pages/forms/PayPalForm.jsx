import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useQR } from '../../contexts/QRContext';
import FormWrapper from '../../components/FormWrapper';

const schema = z.object({ paypalUrl: z.string().url('Enter a valid PayPal URL'), title: z.string().optional() });

const PayPalForm = () => {
  const { updateQRData } = useQR();
  const { register, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const values = watch();
  useEffect(() => { if (values.paypalUrl) updateQRData(values.paypalUrl); }, [values.paypalUrl]);
  return (
    <FormWrapper title="PayPal QR Code" icon="💳" description="Link to your PayPal.me or donation page." type="PAYPAL" formData={values}>
      <div>
        <label className="label">PayPal URL *</label>
        <input {...register('paypalUrl')} className="input" placeholder="https://paypal.me/yourusername" />
        {errors.paypalUrl && <p className="field-error">{errors.paypalUrl.message}</p>}
      </div>
    </FormWrapper>
  );
};

export default PayPalForm;
