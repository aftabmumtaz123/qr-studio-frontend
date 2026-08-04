import { motion } from 'framer-motion';
import { qrAPI } from '../services/api';
import { useQR } from '../contexts/QRContext';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import QRStyleAccordion from './QRStyleAccordion';

/**
 * Shared form wrapper providing page header, save action, and consistent styling.
 * @param {string} title - Page title
 * @param {string} icon - Emoji icon
 * @param {string} description
 * @param {string} type - QR type key
 * @param {object} formData - Data to save for this QR type
 * @param {boolean} dynamic - Whether this is a dynamic QR
 * @param {function} children - React children (the form itself)
 */
const FormWrapper = ({ title, icon, description, type, formData, dynamic = false, children }) => {
  const { qrStyle, logo, cardTemplate, cardStyle, cardData } = useQR();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      await qrAPI.create({
        title: formData.title || `${type} QR Code`,
        type,
        dynamic,
        destination: formData.destination || formData.url || formData.pdfUrl || formData.imageUrl || formData.data || 'https://example.com',
        payload: formData,
        style: qrStyle,
        logo,
        cardTemplate,
        cardStyle,
        cardConfig: cardData,
      });
      toast.success('QR Code & Card configuration saved to MongoDB!');
    } catch (err) {
      toast.error(err.message || 'Failed to save QR');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{icon}</span> {title}
          </h1>
          {description && (
            <p className="text-sm ml-10 text-slate-400 mt-1">{description}</p>
          )}
        </div>
        {/* //save button on just dynamic url form */}
        {dynamic && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save QR
              </>
            )}
          </button>
        )}
      </div>

      {/* Form */}
      <div className="card space-y-4">
        {children}
        <QRStyleAccordion />
      </div>
    </motion.div>
  );
};

export default FormWrapper;
