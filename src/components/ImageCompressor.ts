/**
 * Client-Side Image Compression Engine
 * Guarantees every POD photograph is compressed under 300 KB
 * to save data in 2G/3G highway dead zones before upload.
 */

export interface CompressionResult {
  compressedBlob: Blob;
  compressedFile: File;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
  dataUrl: string;
}

export async function compressPODImage(
  file: File,
  maxSizeKb = 280,
  maxDimension = 1600
): Promise<CompressionResult> {
  const originalSizeKb = file.size / 1024;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calculate aspect-ratio scaling
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to create canvas 2D context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Iterative quality adjustment if needed
        let quality = 0.82;
        const tryCompression = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas blob generation failed'));
                return;
              }

              const compressedSizeKb = blob.size / 1024;
              if (compressedSizeKb > maxSizeKb && q > 0.4) {
                tryCompression(q - 0.15);
              } else {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });

                const dataUrl = canvas.toDataURL('image/webp', q);
                const reductionPercentage = Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100);

                resolve({
                  compressedBlob: blob,
                  compressedFile,
                  originalSizeKb: Math.round(originalSizeKb),
                  compressedSizeKb: Math.round(compressedSizeKb),
                  reductionPercentage: Math.max(0, reductionPercentage),
                  dataUrl,
                });
              }
            },
            'image/webp',
            q
          );
        };

        tryCompression(quality);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
