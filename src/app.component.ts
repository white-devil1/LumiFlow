import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGeneratorService, PdfImage } from './services/pdf-generator.service';
import { AppStateService } from './services/app-state.service';
import { HeaderComponent } from './components/header/header.component';
import { SplashComponent } from './components/splash/splash.component';
import { SetupComponent } from './components/setup/setup.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SplashComponent, SetupComponent, WorkspaceComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  pdfService = inject(PdfGeneratorService);
  state = inject(AppStateService);

  // App Modes
  showSplash = signal(true);
  isSetupMode = signal(true);
  
  // UI State
  showExitConfirm = signal(false);
  isGenerating = signal(false);

  dismissSplash() {
    this.showSplash.set(false);
  }

  finishSetup() {
    this.isSetupMode.set(false);
  }

  requestStartOver() {
    this.showExitConfirm.set(true);
  }

  confirmStartOver() {
    this.state.resetAll();
    this.isSetupMode.set(true);
    this.showExitConfirm.set(false);
  }

  getValidImages() {
      return this.state.images().filter(img => img.url !== null);
  }

  createPdfImages(validImages: any[]) {
      return validImages.map(img => ({
          url: img.url!,
          customWidth: img.customWidth,
          customHeight: img.customHeight,
          customX: img.customX,
          customY: img.customY
      }));
  }

  getFilename() {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      return `lumiflow-story-${dateStr}_${timeStr}.pdf`;
  }

  downloadPdf() {
    const validImages = this.getValidImages();
    if (validImages.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }
    
    this.isGenerating.set(true);
    const pdfImages: PdfImage[] = this.createPdfImages(validImages);
    const filename = this.getFilename();

    this.pdfService.generatePdf(pdfImages, filename, {
      stretch: this.state.stretchImages(),
      noMargins: this.state.noMargins()
    }).subscribe({
      next: () => this.isGenerating.set(false),
      error: (err) => {
        console.error(err);
        alert('Error generating PDF');
        this.isGenerating.set(false);
      }
    });
  }

  sharePdf() {
      const validImages = this.getValidImages();
      if (validImages.length === 0) {
          alert('Please upload at least one photo.');
          return;
      }

      if (!navigator.share) {
          alert('Sharing is not supported on this browser/device. Please use the Export PDF button instead.');
          return;
      }

      this.isGenerating.set(true);
      const pdfImages: PdfImage[] = this.createPdfImages(validImages);
      const filename = this.getFilename();

      this.pdfService.getPdfBlob(pdfImages, {
          stretch: this.state.stretchImages(),
          noMargins: this.state.noMargins()
      }).subscribe({
          next: async (blob) => {
              const file = new File([blob], filename, { type: 'application/pdf' });
              
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                      await navigator.share({
                          files: [file],
                          title: 'Lumiflow Story',
                          text: 'Check out my photo story created with Lumiflow!'
                      });
                  } catch (error) {
                      if ((error as any).name !== 'AbortError') {
                          console.error('Share failed:', error);
                          alert('Failed to share the file.');
                      }
                  }
              } else {
                  alert('Your browser does not support sharing files directly.');
              }
              this.isGenerating.set(false);
          },
          error: (err) => {
              console.error(err);
              alert('Error preparing PDF for share');
              this.isGenerating.set(false);
          }
      });
  }
}