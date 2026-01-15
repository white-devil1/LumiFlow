import { Injectable } from '@angular/core';

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
    
    // Max Dimensions for Auto-Layout (Standard/Stretch)
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
      let finalX = 0;
      let finalY = 0;

      // Logic:
      // 1. If custom dimensions AND POSITION are set, use them as absolute percentages of the cell.
      // 2. Else if global stretch is ON, use max size centered.
      // 3. Else use Aspect Ratio fit centered.

      if (imgObj.customWidth !== undefined && imgObj.customHeight !== undefined) {
         // Manual sizing logic
         // If customX/Y exists, use absolute positioning relative to cell start (ignoring padding)
         // If not exists (legacy/centered), calculate centered relative to maxImgWidth/Height area + padding

         if (imgObj.customX !== undefined && imgObj.customY !== undefined) {
            // Fully custom position
            finalWidth = cellWidth * (imgObj.customWidth / 100);
            finalHeight = cellHeight * (imgObj.customHeight / 100);
            finalX = xCellStart + (cellWidth * (imgObj.customX / 100));
            finalY = yCellStart + (cellHeight * (imgObj.customY / 100));
         } else {
            // Centered custom size (fallback for old behavior if needed, though app updates usually populate X/Y now)
            // Use maxImgWidth as base for percentage to match previous logic?
            // Actually, let's migrate to cell-based percentage for consistency if X/Y is used.
            // But to be safe, if no X/Y, assume centered in the padding box.
            
            finalWidth = maxImgWidth * (imgObj.customWidth / 100);
            finalHeight = maxImgHeight * (imgObj.customHeight / 100);
            finalX = xCellStart + padding + (maxImgWidth - finalWidth) / 2;
            finalY = yCellStart + padding + (maxImgHeight - finalHeight) / 2;
         }

      } else if (options.stretch) {
        // Force fit to the cell box (minus padding)
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