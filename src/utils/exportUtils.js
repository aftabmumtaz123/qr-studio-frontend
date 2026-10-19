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

/**
 * Wait for card images before DOM capture. Old drafts can contain expired blob/file
 * URLs; replace only failed images for the duration of export so html-to-image
 * does not abort the entire download. Valid data-URL profile photos are preserved.
 */
const withExportReadyImages = async (element, capture) => {
  const images = Array.from(element.querySelectorAll('img'));
  const transparentFallback =
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#e2e8f0"/><circle cx="32" cy="23" r="11" fill="#64748b"/><path d="M12 56c1-12 9-18 20-18s19 6 20 18" fill="#64748b"/></svg>');

  await Promise.all(images.map(async (img) => {
    const src = img.getAttribute('src') || '';
    if (!src) return;
    if (img.complete && img.naturalWidth > 0) return;

    // file:// paths, relative filesystem paths, and expired blob URLs cannot be
    // embedded reliably by html-to-image. Replace them before capture instead
    // of letting one broken avatar/logo abort the card and ZIP exports.
    const isPortableImage = src.startsWith('data:image/') || src.startsWith('https://') || src.startsWith('http://');
    if (!isPortableImage) {
      img.removeAttribute('srcset');
      img.setAttribute('src', transparentFallback);
      await new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
      return;
    }

    // Give in-flight data/HTTP images a chance to finish loading.
    const loaded = await new Promise((resolve) => {
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
        clearTimeout(timer);
        resolve(ok);
      };
      const onLoad = () => finish(img.naturalWidth > 0);
      const onError = () => finish(false);
      const timer = setTimeout(() => finish(img.complete && img.naturalWidth > 0), 2500);
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });
      if (img.complete) finish(img.naturalWidth > 0);
    });

    if (!loaded) {
      img.removeAttribute('srcset');
      img.setAttribute('src', transparentFallback);
      // Ensure the replacement itself is decoded before the DOM is cloned.
      await new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }
  }));

  // Leave the fallback in place for any broken image. Restoring an expired
  // file/blob URL here retriggers ERR_FILE_NOT_FOUND immediately after export.
  return capture();
};

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
      const dataUrl = await withExportReadyImages(cardElement, () => toPng(cardElement, options));
      triggerDownload(dataUrl, `contact-card-${qualityKey}.png`);
    } else if (format === 'jpg' || format === 'jpeg') {
      const dataUrl = await withExportReadyImages(cardElement, () => toJpeg(cardElement, { ...options, quality: 0.95 }));
      triggerDownload(dataUrl, `contact-card-${qualityKey}.jpg`);
    } else if (format === 'svg') {
      const dataUrl = await withExportReadyImages(cardElement, () => toSvg(cardElement, options));
      triggerDownload(dataUrl, `contact-card.svg`);
    } else if (format === 'pdf') {
      const dataUrl = await withExportReadyImages(cardElement, () => toPng(cardElement, { pixelRatio: 3, cacheBust: true }));
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
    const cardDataUrl = await withExportReadyImages(cardElement, () => toPng(cardElement, { pixelRatio: scale, cacheBust: true }));
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
