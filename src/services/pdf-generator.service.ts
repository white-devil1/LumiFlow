import { Injectable } from '@angular/core';

export interface PdfOptions {
  stretch: boolean;
  noMargins: boolean;
}

export interface PdfImage {
  url: string;
  customWidth?: number; // 0-100
  customHeight?: number; // 0-100
}

// Declare the global window object to access jsPDF from CDN
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  // Accepts an array of PdfImage objects now
  async generatePdf(images: PdfImage[], filename: string = 'photos.pdf', options: PdfOptions = { stretch: false, noMargins: false }): Promise<void> {
    if (!window.jspdf) {
      console.error('jsPDF not loaded');
      return;
    }

    const { jsPDF } = window.jspdf;
    // A4 size: 210 x 297 mm
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;
    
    // Config based on options
    const margin = options.noMargins ? 5 : 10;
    // Inner padding between cell edge and image
    const padding = options.noMargins ? 0 : 5;

    // Grid configuration: 2x2
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    const cellWidth = availableWidth / 2;
    const cellHeight = availableHeight / 2;
    
    const maxImgWidth = cellWidth - (padding * 2);
    const maxImgHeight = cellHeight - (padding * 2);

    for (let i = 0; i < images.length; i++) {
      // Add new page if we filled the previous one (4 images per page)
      if (i > 0 && i % 4 === 0) {
        pdf.addPage();
      }

      const imgObj = images[i];
      const positionIndex = i % 4; // 0, 1, 2, 3
      
      const col = positionIndex % 2; // 0 or 1
      const row = Math.floor(positionIndex / 2); // 0 or 1

      const xCellStart = margin + (col * cellWidth);
      const yCellStart = margin + (row * cellHeight);

      let finalWidth = 0;
      let finalHeight = 0;

      // Logic:
      // 1. If custom dimensions are set for this specific image, use them (percentage of max cell size).
      // 2. Else if global stretch is ON, use max size.
      // 3. Else use Aspect Ratio fit.

      if (imgObj.customWidth !== undefined && imgObj.customHeight !== undefined) {
         finalWidth = maxImgWidth * (imgObj.customWidth / 100);
         finalHeight = maxImgHeight * (imgObj.customHeight / 100);
      } else if (options.stretch) {
        // Force fit to the cell box (minus padding)
        finalWidth = maxImgWidth;
        finalHeight = maxImgHeight;
      } else {
        // Preserve aspect ratio
        const dims = await this.getImageDimensions(imgObj.url);
        const scale = Math.min(
          maxImgWidth / dims.width,
          maxImgHeight / dims.height
        );
        finalWidth = dims.width * scale;
        finalHeight = dims.height * scale;
      }

      // Center in cell
      const xObj = xCellStart + padding + (maxImgWidth - finalWidth) / 2;
      const yObj = yCellStart + padding + (maxImgHeight - finalHeight) / 2;

      pdf.addImage(imgObj.url, 'JPEG', xObj, yObj, finalWidth, finalHeight);
    }

    pdf.save(filename);
  }

  private getImageDimensions(base64: string): Promise<{width: number, height: number}> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
    });
  }
}