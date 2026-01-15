import { Injectable } from '@angular/core';
import { Observable, from, switchMap, map } from 'rxjs';

export interface PdfOptions {
  stretch: boolean;
  noMargins: boolean;
}

export interface PdfImage {
  url: string;
  customWidth?: number; // 0-100% of cell width
  customHeight?: number; // 0-100% of cell height
  customX?: number; // 0-100% (Left offset)
  customY?: number; // 0-100% (Top offset)
}

// Declare the global window object to access jsPDF from CDN
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  generatePdf(images: PdfImage[], filename: string = 'photos.pdf', options: PdfOptions = { stretch: false, noMargins: false }): Observable<void> {
    // Wrap the async process in an Observable
    return from(this.createPdf(images, filename, options));
  }

  private async createPdf(images: PdfImage[], filename: string, options: PdfOptions): Promise<void> {
    if (!window.jspdf) {
      throw new Error('jsPDF not loaded');
    }

    const { jsPDF } = window.jspdf;
    // A4 size: 210 x 297 mm
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;
    
    // Config based on options
    const margin = options.noMargins ? 5 : 10;
    const padding = options.noMargins ? 0 : 5;

    // Grid configuration: 2x2
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    const cellWidth = availableWidth / 2;
    const cellHeight = availableHeight / 2;
    
    const maxImgWidth = cellWidth - (padding * 2);
    const maxImgHeight = cellHeight - (padding * 2);

    for (let i = 0; i < images.length; i++) {
      if (i > 0 && i % 4 === 0) {
        pdf.addPage();
      }

      const imgObj = images[i];
      const positionIndex = i % 4; 
      const col = positionIndex % 2; 
      const row = Math.floor(positionIndex / 2); 

      const xCellStart = margin + (col * cellWidth);
      const yCellStart = margin + (row * cellHeight);

      let finalWidth = 0;
      let finalHeight = 0;
      let finalX = 0;
      let finalY = 0;

      if (imgObj.customWidth !== undefined && imgObj.customHeight !== undefined) {
         if (imgObj.customX !== undefined && imgObj.customY !== undefined) {
            // Fully custom position (Absolute in cell)
            finalWidth = cellWidth * (imgObj.customWidth / 100);
            finalHeight = cellHeight * (imgObj.customHeight / 100);
            finalX = xCellStart + (cellWidth * (imgObj.customX / 100));
            finalY = yCellStart + (cellHeight * (imgObj.customY / 100));
         } else {
            // Centered custom size (Fallback)
            finalWidth = maxImgWidth * (imgObj.customWidth / 100);
            finalHeight = maxImgHeight * (imgObj.customHeight / 100);
            finalX = xCellStart + padding + (maxImgWidth - finalWidth) / 2;
            finalY = yCellStart + padding + (maxImgHeight - finalHeight) / 2;
         }

      } else if (options.stretch) {
        // Force fit
        finalWidth = maxImgWidth;
        finalHeight = maxImgHeight;
        finalX = xCellStart + padding;
        finalY = yCellStart + padding;
      } else {
        // Preserve aspect ratio
        const dims = await this.getImageDimensions(imgObj.url);
        const scale = Math.min(
          maxImgWidth / dims.width,
          maxImgHeight / dims.height
        );
        finalWidth = dims.width * scale;
        finalHeight = dims.height * scale;
        
        // Center in cell
        finalX = xCellStart + padding + (maxImgWidth - finalWidth) / 2;
        finalY = yCellStart + padding + (maxImgHeight - finalHeight) / 2;
      }

      pdf.addImage(imgObj.url, 'JPEG', finalX, finalY, finalWidth, finalHeight);
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