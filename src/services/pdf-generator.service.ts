import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

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
    return from(this.savePdfAsync(images, filename, options));
  }

  getPdfBlob(images: PdfImage[], options: PdfOptions = { stretch: false, noMargins: false }): Observable<Blob> {
    return from(this.getBlobAsync(images, options));
  }

  private async savePdfAsync(images: PdfImage[], filename: string, options: PdfOptions): Promise<void> {
      const pdf = await this.buildPdf(images, options);
      pdf.save(filename);
  }

  private async getBlobAsync(images: PdfImage[], options: PdfOptions): Promise<Blob> {
      const pdf = await this.buildPdf(images, options);
      return pdf.output('blob');
  }

  private async buildPdf(images: PdfImage[], options: PdfOptions): Promise<any> {
    if (!window.jspdf) {
      throw new Error('jsPDF not loaded');
    }

    const { jsPDF } = window.jspdf;
    // A4 size: 210 x 297 mm
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const pageHeight = 297;
    
    // Config based on options
    // "Narrow Margin" (Default): Outer 6mm, Gap 4mm. Very sleek, distinct gap.
    // "No Margins": Outer 5mm (Printer safety), Gap 1mm (Minimal separation).
    
    const outerMargin = options.noMargins ? 5 : 6; 
    const gap = options.noMargins ? 0 : 4; 

    // Calculate dimensions of a single grid cell
    // We have 2 columns and 2 rows per page.
    // Width available for 2 cells = PageWidth - LeftMargin - RightMargin - GapBetweenColumns
    const availableWidth = pageWidth - (outerMargin * 2) - gap; 
    
    // Height available for 2 cells = PageHeight - TopMargin - BottomMargin - GapBetweenRows
    const availableHeight = pageHeight - (outerMargin * 2) - gap;

    const cellWidth = availableWidth / 2;
    const cellHeight = availableHeight / 2;

    for (let i = 0; i < images.length; i++) {
      // Add new page for every 4th image (starting from index 4, 8, etc.)
      if (i > 0 && i % 4 === 0) {
        pdf.addPage();
      }

      const imgObj = images[i];
      const positionIndex = i % 4; 
      const col = positionIndex % 2; 
      const row = Math.floor(positionIndex / 2); 

      // Calculate the top-left coordinate of the CELL
      // Col 0: outerMargin
      // Col 1: outerMargin + cellWidth + gap
      const cellXStart = outerMargin + (col * (cellWidth + gap));
      const cellYStart = outerMargin + (row * (cellHeight + gap));

      let finalWidth = 0;
      let finalHeight = 0;
      let finalX = 0;
      let finalY = 0;

      if (imgObj.customWidth !== undefined && imgObj.customHeight !== undefined) {
         if (imgObj.customX !== undefined && imgObj.customY !== undefined) {
            // Fully custom position (Absolute in cell)
            // Percentages are relative to the CELL dimensions
            finalWidth = cellWidth * (imgObj.customWidth / 100);
            finalHeight = cellHeight * (imgObj.customHeight / 100);
            finalX = cellXStart + (cellWidth * (imgObj.customX / 100));
            finalY = cellYStart + (cellHeight * (imgObj.customY / 100));
         } else {
            // Centered custom size (Fallback)
            finalWidth = cellWidth * (imgObj.customWidth / 100);
            finalHeight = cellHeight * (imgObj.customHeight / 100);
            finalX = cellXStart + (cellWidth - finalWidth) / 2;
            finalY = cellYStart + (cellHeight - finalHeight) / 2;
         }

      } else if (options.stretch) {
        // Force fit to cell
        finalWidth = cellWidth;
        finalHeight = cellHeight;
        finalX = cellXStart;
        finalY = cellYStart;
      } else {
        // Preserve aspect ratio & Center (Contain)
        const dims = await this.getImageDimensions(imgObj.url);
        const scale = Math.min(
          cellWidth / dims.width,
          cellHeight / dims.height
        );
        finalWidth = dims.width * scale;
        finalHeight = dims.height * scale;
        
        // Center in cell
        finalX = cellXStart + (cellWidth - finalWidth) / 2;
        finalY = cellYStart + (cellHeight - finalHeight) / 2;
      }

      pdf.addImage(imgObj.url, 'JPEG', finalX, finalY, finalWidth, finalHeight);
    }

    return pdf;
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