import { toPng, toJpeg, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

/**
 * Scale factors for quality options
 */
const QUALITY_SCALES = {
  '1080p': 1.5,
  '2048p': 2.5,
  '4K': 4,
  'print': 5, // 300 DPI equivalent
};

/**
 * Trigger browser file download from Blob or DataURL
 */
const triggerDownload = (dataUrlOrBlob, fileName) => {
  const link = document.createElement('a');
  if (typeof dataUrlOrBlob === 'string') {
    link.href = dataUrlOrBlob;
  } else {
    link.href = URL.createObjectURL(dataUrlOrBlob);
  }
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download Standalone QR Code
 */
export const downloadStandaloneQR = (qrCodeRef, extension = 'png') => {
  if (!qrCodeRef?.current) {
    toast.error('QR code not initialized');
    return;
  }
  try {
    const ext = extension.toLowerCase() === 'jpg' ? 'jpeg' : extension.toLowerCase();
    qrCodeRef.current.download({ name: 'qr-code', extension: ext });
    toast.success(`Downloaded QR Code (${extension.toUpperCase()})`);
  } catch (err) {
    console.error('QR download failed:', err);
    toast.error('Failed to download QR code');
  }
};

/**
 * Download Contact/Marketing Card
 */
export const downloadCardImage = async (cardElement, format = 'png', qualityKey = '2048p') => {
  if (!cardElement) {
    toast.error('Card element not ready');
    return;
  }

  const toastId = toast.loading(`Generating Card (${format.toUpperCase()})...`);
  const scale = QUALITY_SCALES[qualityKey] || 2.5;

  try {
    const options = {
      pixelRatio: scale,
      cacheBust: true,
    };

    if (format === 'png') {
      const dataUrl = await toPng(cardElement, options);
      triggerDownload(dataUrl, `contact-card-${qualityKey}.png`);
    } else if (format === 'jpg' || format === 'jpeg') {
      const dataUrl = await toJpeg(cardElement, { ...options, quality: 0.95 });
      triggerDownload(dataUrl, `contact-card-${qualityKey}.jpg`);
    } else if (format === 'svg') {
      const dataUrl = await toSvg(cardElement, options);
      triggerDownload(dataUrl, `contact-card.svg`);
    } else if (format === 'pdf') {
      const dataUrl = await toPng(cardElement, { pixelRatio: 3, cacheBust: true });
      const img = new Image();
      img.src = dataUrl;

      await new Promise((res) => { img.onload = res; });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save('contact-card.pdf');
    }

    toast.success(`Card downloaded successfully!`, { id: toastId });
  } catch (err) {
    console.error('Card export error:', err);
    toast.error('Export failed. Please try again.', { id: toastId });
  }
};

/**
 * Download Both QR Code and Contact Card as a bundled ZIP
 */
export const downloadBothAsZip = async (qrCodeRef, cardElement, qualityKey = '2048p') => {
  if (!cardElement || !qrCodeRef?.current) {
    toast.error('Card or QR Code not initialized');
    return;
  }

  const toastId = toast.loading('Preparing ZIP Bundle...');

  try {
    const zip = new JSZip();
    const scale = QUALITY_SCALES[qualityKey] || 2.5;

    // 1. Capture Card PNG
    const cardDataUrl = await toPng(cardElement, { pixelRatio: scale, cacheBust: true });
    const cardBase64 = cardDataUrl.replace(/^data:image\/(png|jpg);base64,/, '');
    zip.file('contact-card.png', cardBase64, { base64: true });

    // 2. Capture QR PNG
    const qrCanvas = document.querySelector('aside canvas') || document.querySelector('canvas');
    if (qrCanvas) {
      const qrDataUrl = qrCanvas.toDataURL('image/png');
      const qrBase64 = qrDataUrl.replace(/^data:image\/(png|jpg);base64,/, '');
      zip.file('qr-code.png', qrBase64, { base64: true });
    }

    // 3. Generate & Download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, 'qr-card-bundle.zip');

    toast.success('Downloaded ZIP bundle containing QR Code & Card!', { id: toastId });
  } catch (err) {
    console.error('ZIP bundle error:', err);
    toast.error('Failed to generate ZIP package', { id: toastId });
  }
};
