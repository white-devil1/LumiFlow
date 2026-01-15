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

  downloadPdf() {
    const validImages = this.state.images().filter(img => img.url !== null);

    if (validImages.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }
    
    this.isGenerating.set(true);
    
    const pdfImages: PdfImage[] = validImages.map(img => ({
      url: img.url!,
      customWidth: img.customWidth,
      customHeight: img.customHeight,
      customX: img.customX,
      customY: img.customY
    }));
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `photos-${date}.pdf`;

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
}