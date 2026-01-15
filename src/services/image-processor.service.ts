import { Injectable } from '@angular/core';

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {

  /**
   * Reads a file and returns a compressed JPEG base64 string + dimensions.
   */
  processFile(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const originalWidth = width;
          const originalHeight = height;

          // Max resolution optimization
          const maxDim = 1500;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas context not available');
            return;
          }

          // Fill white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
          resolve({
            url: dataUrl,
            width: originalWidth,
            height: originalHeight
          });
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}