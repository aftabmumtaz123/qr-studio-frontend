/**
 * Convert an uploaded logo into a reasonably sized data URL before it is
 * stored in QR settings or sent to the API. This prevents large camera/PNG
 * files from turning a JSON request into a multi-megabyte payload.
 */
export const prepareLogoDataUrl = (file, maxDimension = 800) => new Promise((resolve, reject) => {
  if (!file) return reject(new Error('No logo selected'));

  // Keep SVG logos as SVG data URLs so vectors remain crisp.
  if (file.type === 'image/svg+xml') {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('SVG logo is too large. Please use a logo under 5 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = () => reject(new Error('Could not read the logo'));
    reader.readAsDataURL(file);
    return;
  }

  if (!file.type.startsWith('image/')) {
    reject(new Error('Please select an image logo'));
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Could not read the logo'));
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not process the logo'));
        return;
      }

      // Keep transparency for PNG logos; use WebP for other raster images
      // to substantially reduce the JSON payload size.
      if (file.type === 'image/png') {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      }
    };
    img.onerror = () => reject(new Error('Could not decode the logo'));
    img.src = event.target?.result;
  };
  reader.readAsDataURL(file);
});
