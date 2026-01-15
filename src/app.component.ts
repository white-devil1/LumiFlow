import { Component, signal, computed, inject, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGeneratorService, PdfImage } from './services/pdf-generator.service';
import { ImageProcessorService } from './services/image-processor.service';
import { FormsModule } from '@angular/forms';

interface AppImage {
  id: string;
  url: string | null; // Null indicates an empty slot waiting for upload
  name: string;
  originalWidth: number;
  originalHeight: number;
  // Custom sizing in percentage (0-100)
  customWidth?: number; 
  customHeight?: number;
}

interface DragState {
  imgId: string;
  startX: number;
  startY: number;
  startWidthPct: number;
  startHeightPct: number;
  containerWidth: number;
  containerHeight: number;
  direction: string; // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy, OnInit {
  private pdfService = inject(PdfGeneratorService);
  private imageProcessor = inject(ImageProcessorService);

  // State
  showSplash = signal(true);
  showSplashButton = signal(false); // Controls the visibility of the "Dive In" button

  isSetupMode = signal(true); // Toggles between Input Form and Grid View
  
  // UI Modal State
  showExitConfirm = signal(false);
  
  // Mobile/Interaction State
  activeSlotId = signal<string | null>(null); // For mobile "tap to show controls"
  previewImageId = signal<string | null>(null); // For fullscreen lightbox
  
  targetPhotoCount = signal<number>(4); // Default to 4
  targetPageCount = computed(() => Math.ceil(this.targetPhotoCount() / 4));
  
  images = signal<AppImage[]>([]);
  isGenerating = signal(false);
  
  // ID of the image currently being edited
  editingImageId = signal<string | null>(null);
  
  // Temp state for canceling edits
  private tempImageState: { [key: string]: { w?: number, h?: number } } = {};

  // Drag State
  private dragState: DragState | null = null;
  
  // Options
  stretchImages = signal(false);
  noMargins = signal(false);

  // Computed: Group images by pages (4 per page)
  pages = computed(() => {
    const allImages = this.images();
    const pagesArray: AppImage[][] = [];
    for (let i = 0; i < allImages.length; i += 4) {
      pagesArray.push(allImages.slice(i, i + 4));
    }
    return pagesArray;
  });

  // Get active preview image
  previewImage = computed(() => {
    const id = this.previewImageId();
    if (!id) return null;
    return this.images().find(i => i.id === id) || null;
  });

  // Bind the listener functions to 'this' so they can be added/removed properly
  private onMouseMoveBound = this.onMouseMove.bind(this);
  private onMouseUpBound = this.onMouseUp.bind(this);

  ngOnInit() {
    // Wait for splash animations (storytelling) to finish before showing the Enter button
    // Sequence duration ~ 7s for slow cinematic effect
    setTimeout(() => {
      this.showSplashButton.set(true);
    }, 7000);
  }

  dismissSplash() {
    this.showSplash.set(false);
  }

  ngOnDestroy() {
    this.removeGlobalListeners();
  }

  incrementCount() {
    this.targetPhotoCount.update(c => c + 1);
  }

  decrementCount() {
    this.targetPhotoCount.update(c => Math.max(1, c - 1));
  }

  startSession() {
    const count = this.targetPhotoCount();
    if (!count || count < 1) return;

    // Initialize slots
    const newImages: AppImage[] = [];
    for (let i = 0; i < count; i++) {
      newImages.push({
        id: Math.random().toString(36).substring(7),
        url: null,
        name: `Photo ${i + 1}`,
        originalWidth: 0,
        originalHeight: 0
      });
    }
    this.images.set(newImages);
    this.isSetupMode.set(false);
  }

  /**
   * Smart Upload: 
   * If user clicks Slot X and selects 5 files, we fill Slot X, X+1, X+2...
   */
  async onFileSelectedForSlot(event: Event, startIndex: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    // Sort primarily to ensure order matches user expectation (e.g. IMG_1, IMG_2)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const currentImages = [...this.images()];
    let fileIdx = 0;

    // Iterate starting from the clicked slot
    for (let i = startIndex; i < currentImages.length && fileIdx < files.length; i++) {
      // Process file
      try {
        const result = await this.imageProcessor.processFile(files[fileIdx]);
        
        // Update the slot
        currentImages[i] = {
          ...currentImages[i],
          url: result.url,
          originalWidth: result.width,
          originalHeight: result.height,
          name: files[fileIdx].name,
          // Reset custom sizing when replacing image
          customWidth: undefined,
          customHeight: undefined
        };
        
        fileIdx++;
      } catch (err) {
        console.error('Error processing file', files[fileIdx].name, err);
      }
    }

    // If we have more files than slots remaining, append them
    while (fileIdx < files.length) {
       try {
         const result = await this.imageProcessor.processFile(files[fileIdx]);
         currentImages.push({
            id: Math.random().toString(36).substring(7),
            url: result.url,
            originalWidth: result.width,
            originalHeight: result.height,
            name: files[fileIdx].name
         });
         fileIdx++;
       } catch(err) { break; }
    }

    this.images.set(currentImages);
    input.value = ''; // Reset input
  }

  addMoreSlots() {
    // Add 4 more empty slots
    const current = this.images();
    const newSlots: AppImage[] = [];
    for(let i=0; i<4; i++) {
      newSlots.push({
        id: Math.random().toString(36).substring(7),
        url: null,
        name: `Photo ${current.length + i + 1}`,
        originalWidth: 0,
        originalHeight: 0
      });
    }
    this.images.update(imgs => [...imgs, ...newSlots]);
  }

  removeImage(id: string) {
    this.images.update(imgs => imgs.filter(img => img.id !== id));
    if (this.editingImageId() === id) {
      this.editingImageId.set(null);
    }
  }

  moveImage(index: number, direction: 'up' | 'down') {
    this.images.update(imgs => {
      const newImgs = [...imgs];
      if (direction === 'up' && index > 0) {
        [newImgs[index], newImgs[index - 1]] = [newImgs[index - 1], newImgs[index]];
      } else if (direction === 'down' && index < newImgs.length - 1) {
        [newImgs[index], newImgs[index + 1]] = [newImgs[index + 1], newImgs[index]];
      }
      return newImgs;
    });
  }

  moveItem(pageIndex: number, itemIndexInPage: number, direction: 'left' | 'right') {
    const globalIndex = (pageIndex * 4) + itemIndexInPage;
    if (direction === 'left') {
        this.moveImage(globalIndex, 'up');
    } else {
        this.moveImage(globalIndex, 'down');
    }
  }
  
  // Interaction Logic
  toggleSlotActive(id: string, event?: Event) {
    if (event) event.stopPropagation();
    
    // If currently editing this image, ignore toggle (edit mode controls handle it)
    if (this.editingImageId() === id) return;

    // Toggle logic
    if (this.activeSlotId() === id) {
      this.activeSlotId.set(null);
    } else {
      this.activeSlotId.set(id);
    }
  }

  openPreview(id: string, event?: Event) {
    if (event) event.stopPropagation();
    this.previewImageId.set(id);
  }

  closePreview() {
    this.previewImageId.set(null);
  }

  toggleEdit(id: string, event?: Event) {
    if (event) event.stopPropagation();

    if (this.editingImageId() === id) {
      // Commit changes (Done)
      this.editingImageId.set(null);
      this.tempImageState = {};
    } else {
      // Enter edit mode
      // Save state before editing for "Cancel"
      const img = this.images().find(i => i.id === id);
      if (img) {
         this.tempImageState[id] = { w: img.customWidth, h: img.customHeight };
      }

      // Logic: Initialize wrapper size to match natural aspect ratio within the cell
      this.images.update(imgs => imgs.map(img => {
        if (img.id === id && img.customWidth === undefined) {
           let initW = 100;
           let initH = 100;

           if (img.originalWidth > 0 && img.originalHeight > 0) {
              const imgRatio = img.originalWidth / img.originalHeight;
              // A4 quadrant ratio ~ 0.707 (210/297)
              const cellRatio = 0.707; 

              if (imgRatio > cellRatio) {
                 // Image is wider than cell (relative to height) -> Fit to Width (100%)
                 initW = 100;
                 initH = (cellRatio / imgRatio) * 100; 
              } else {
                 // Image is taller than cell -> Fit to Height (100%)
                 initH = 100;
                 initW = (imgRatio / cellRatio) * 100;
              }
           }
           
           return { ...img, customWidth: initW, customHeight: initH };
        }
        return img;
      }));
      this.editingImageId.set(id);
      this.activeSlotId.set(null); // Clear active selection when editing
    }
  }
  
  cancelEdit(id: string) {
      const original = this.tempImageState[id];
      // Revert to original state
      this.images.update(imgs => imgs.map(img => {
        if (img.id === id) {
             // If original state was undefined (no custom size), revert to that
            if (original && original.w === undefined) {
                 const { customWidth, customHeight, ...rest } = img;
                 return rest;
            }
            // Else revert to previous numbers
            if (original) {
                return { ...img, customWidth: original.w, customHeight: original.h };
            }
        }
        return img;
      }));
      this.editingImageId.set(null);
      this.tempImageState = {};
  }

  resetImageSize(id: string) {
     this.images.update(imgs => imgs.map(img => {
      if (img.id === id) {
        // Remove custom width/height to revert to 'Contain' mode
        const { customWidth, customHeight, ...rest } = img;
        return rest;
      }
      return img;
    }));
  }

  // --- Drag Logic ---

  startResize(event: MouseEvent | TouchEvent, img: AppImage, container: HTMLElement, direction: string) {
    event.preventDefault();
    event.stopPropagation();
    
    const containerRect = container.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.dragState = {
      imgId: img.id,
      startX: clientX,
      startY: clientY,
      startWidthPct: img.customWidth || 100,
      startHeightPct: img.customHeight || 100,
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
      direction
    };

    if ('touches' in event) {
        window.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
        window.addEventListener('touchend', this.onMouseUpBound);
    } else {
        window.addEventListener('mousemove', this.onMouseMoveBound);
        window.addEventListener('mouseup', this.onMouseUpBound);
    }
  }

  // Bind for touch
  private onTouchMoveBound = this.onTouchMove.bind(this);

  private onTouchMove(event: TouchEvent) {
     if (!this.dragState) return;
     event.preventDefault(); // Prevent scroll
     const touch = event.touches[0];
     this.handleDragMove(touch.clientX, touch.clientY);
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.dragState) return;
    this.handleDragMove(event.clientX, event.clientY);
  }
  
  private handleDragMove(clientX: number, clientY: number) {
     if (!this.dragState) return;

    const { direction, containerWidth, containerHeight, startX, startY, startWidthPct, startHeightPct } = this.dragState;

    const dx = clientX - startX;
    const dy = clientY - startY;

    // Convert pixels to percentage of container
    const dxPct = (dx / containerWidth) * 100;
    const dyPct = (dy / containerHeight) * 100;

    let newWidth = startWidthPct;
    let newHeight = startHeightPct;

    // Width Logic
    if (direction.includes('e')) {
        // Dragging right increases width
        newWidth += dxPct;
    } else if (direction.includes('w')) {
        // Dragging left increases width (moving mouse left = negative dx, so we subtract)
        newWidth -= dxPct;
    }

    // Height Logic
    if (direction.includes('s')) {
        // Dragging down increases height
        newHeight += dyPct;
    } else if (direction.includes('n')) {
        // Dragging up increases height (moving mouse up = negative dy, so we subtract)
        newHeight -= dyPct;
    }

    // Constraints
    newWidth = Math.max(5, Math.min(100, newWidth));
    newHeight = Math.max(5, Math.min(100, newHeight));

    this.images.update(imgs => imgs.map(img => {
      if (img.id === this.dragState!.imgId) {
        return { ...img, customWidth: newWidth, customHeight: newHeight };
      }
      return img;
    }));
  }

  private onMouseUp() {
    this.removeGlobalListeners();
    this.dragState = null;
  }

  private removeGlobalListeners() {
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
    window.removeEventListener('touchmove', this.onTouchMoveBound);
    window.removeEventListener('touchend', this.onMouseUpBound);
  }

  // --- End Drag Logic ---

  async downloadPdf() {
    const validImages = this.images().filter(img => img.url !== null);

    if (validImages.length === 0) {
      alert('Please upload at least one photo.');
      return;
    }
    
    this.isGenerating.set(true);
    try {
      const pdfImages: PdfImage[] = validImages.map(img => ({
        url: img.url!,
        customWidth: img.customWidth,
        customHeight: img.customHeight
      }));
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `photos-${date}.pdf`;

      await this.pdfService.generatePdf(pdfImages, filename, {
        stretch: this.stretchImages(),
        noMargins: this.noMargins()
      });
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Something went wrong generating the PDF.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  // Navigation Logic
  requestStartOver() {
    this.showExitConfirm.set(true);
  }

  confirmStartOver() {
    this.images.set([]);
    this.editingImageId.set(null);
    this.activeSlotId.set(null);
    this.isSetupMode.set(true);
    this.showExitConfirm.set(false);
  }

  cancelStartOver() {
    this.showExitConfirm.set(false);
  }
}