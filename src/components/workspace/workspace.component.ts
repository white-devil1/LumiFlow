import { Component, inject, signal, OnDestroy, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService, AppImage } from '../../services/app-state.service';
import { ImageProcessorService } from '../../services/image-processor.service';
import { fromEvent, Subscription, takeUntil, map, Observable } from 'rxjs';

interface DragState {
  imgId: string;
  startX: number;
  startY: number;
  startWidthPct: number;
  startHeightPct: number;
  startXPct: number;
  startYPct: number;
  containerWidth: number;
  containerHeight: number;
  direction: string;
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnDestroy {
  state = inject(AppStateService);
  imageProcessor = inject(ImageProcessorService);
  resetSession = output<void>();

  activeSlotId = signal<string | null>(null);
  previewImageId = signal<string | null>(null);
  editingImageId = signal<string | null>(null);
  
  // Computed signal for the preview image to avoid arrow functions in template
  previewImage = computed(() => {
    const id = this.previewImageId();
    if (!id) return null;
    return this.state.images().find(i => i.id === id) || null;
  });
  
  // Temp state for canceling edits
  private tempImageState: { [key: string]: { w?: number, h?: number, x?: number, y?: number } } = {};
  private dragSub: Subscription | null = null;

  ngOnDestroy() {
    if (this.dragSub) this.dragSub.unsubscribe();
  }

  // --- File Handling ---
  onFileSelectedForSlot(event: Event, startIndex: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    let fileIdx = 0;
    const allImages = [...this.state.images()]; // snapshot
    
    // Process one by one using RxJS would be cleaner, but simple loop works well for sequential update logic here
    const processNext = () => {
        if (fileIdx >= files.length) {
            return;
        }
        const file = files[fileIdx];
        
        this.imageProcessor.processFile(file).subscribe({
            next: (result) => {
                // If fitting into existing slot
                if (startIndex + fileIdx < allImages.length) {
                    this.state.updateImage(startIndex + fileIdx, {
                        url: result.url,
                        originalWidth: result.width,
                        originalHeight: result.height,
                        name: file.name,
                        customWidth: undefined, customHeight: undefined, customX: undefined, customY: undefined
                    });
                } else {
                    // Append new
                    this.state.addImage({
                        id: Math.random().toString(36).substring(7),
                        url: result.url,
                        originalWidth: result.width,
                        originalHeight: result.height,
                        name: file.name
                    });
                }
                fileIdx++;
                processNext();
            },
            error: (err) => {
                console.error(err);
                fileIdx++;
                processNext();
            }
        });
    };
    processNext();
    input.value = '';
  }

  // --- Interaction ---
  toggleSlotActive(id: string, event?: Event) {
    if (event) event.stopPropagation();
    if (this.editingImageId() === id) return;
    this.activeSlotId.set(this.activeSlotId() === id ? null : id);
  }

  toggleEdit(id: string, event?: Event) {
    if (event) event.stopPropagation();

    if (this.editingImageId() === id) {
      this.editingImageId.set(null);
      this.tempImageState = {};
    } else {
      const img = this.state.images().find(i => i.id === id);
      if (img) {
         this.tempImageState[id] = { w: img.customWidth, h: img.customHeight, x: img.customX, y: img.customY };
      }
      
      this.state.updateImageById(id, (img) => {
           let initW = img.customWidth;
           let initH = img.customHeight;
           let initX = img.customX;
           let initY = img.customY;

           if (initW === undefined) {
             if (img.originalWidth > 0 && img.originalHeight > 0) {
                const imgRatio = img.originalWidth / img.originalHeight;
                const cellRatio = 0.707;
                if (imgRatio > cellRatio) {
                   initW = 100;
                   initH = (cellRatio / imgRatio) * 100; 
                } else {
                   initH = 100;
                   initW = (imgRatio / cellRatio) * 100;
                }
             } else {
               initW = 100; initH = 100;
             }
           }
           if (initX === undefined) initX = (100 - initW!) / 2;
           if (initY === undefined) initY = (100 - initH!) / 2;
           
           return { ...img, customWidth: initW, customHeight: initH, customX: initX, customY: initY };
      });

      this.editingImageId.set(id);
      this.activeSlotId.set(null);
    }
  }

  cancelEdit(id: string) {
    const original = this.tempImageState[id];
    this.state.updateImageById(id, (img) => {
        if (original && original.w === undefined) {
             const { customWidth, customHeight, customX, customY, ...rest } = img;
             return rest;
        } else if (original) {
            return { ...img, customWidth: original.w, customHeight: original.h, customX: original.x, customY: original.y };
        }
        return img;
    });
    this.editingImageId.set(null);
    this.tempImageState = {};
  }

  resetImageSize(id: string) {
    this.state.updateImageById(id, (img) => {
        const { customWidth, customHeight, customX, customY, ...rest } = img;
        return rest;
    });
  }

  moveItem(pageIndex: number, itemIndexInPage: number, direction: 'left' | 'right') {
     const globalIndex = (pageIndex * 4) + itemIndexInPage;
     if (direction === 'left' && globalIndex > 0) {
         this.state.swapImages(globalIndex, globalIndex - 1);
     } else if (direction === 'right' && globalIndex < this.state.images().length - 1) {
         this.state.swapImages(globalIndex, globalIndex + 1);
     }
  }

  // --- Drag Logic using RxJS ---
  startResize(event: MouseEvent | TouchEvent, img: AppImage, container: HTMLElement, direction: string) {
    event.preventDefault();
    event.stopPropagation();

    const containerRect = container.getBoundingClientRect();
    const isTouch = 'touches' in event;
    const clientX = isTouch ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = isTouch ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

    const startState: DragState = {
      imgId: img.id,
      startX: clientX,
      startY: clientY,
      startWidthPct: img.customWidth || 100,
      startHeightPct: img.customHeight || 100,
      startXPct: img.customX || 0,
      startYPct: img.customY || 0,
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
      direction
    };

    let move$: Observable<{clientX: number, clientY: number}>;
    let up$: Observable<unknown>;

    if (isTouch) {
        move$ = fromEvent<TouchEvent>(window, 'touchmove', { passive: false }).pipe(
            map(e => { 
                if (e.cancelable) e.preventDefault();
                return e.touches[0];
            })
        );
        up$ = fromEvent(window, 'touchend');
    } else {
        move$ = fromEvent<MouseEvent>(window, 'mousemove');
        up$ = fromEvent(window, 'mouseup');
    }

    this.dragSub = move$.pipe(
        takeUntil(up$)
    ).subscribe((moveEvent) => {
        this.handleDrag(moveEvent, startState);
    });
  }

  private handleDrag(e: { clientX: number, clientY: number }, start: DragState) {
    const dx = e.clientX - start.startX;
    const dy = e.clientY - start.startY;

    const dxPct = (dx / start.containerWidth) * 100;
    const dyPct = (dy / start.containerHeight) * 100;

    let newWidth = start.startWidthPct;
    let newHeight = start.startHeightPct;
    let newX = start.startXPct;
    let newY = start.startYPct;

    if (start.direction.includes('e')) {
        newWidth = start.startWidthPct + dxPct;
    } else if (start.direction.includes('w')) {
        newWidth = start.startWidthPct - dxPct;
        newX = start.startXPct + dxPct;
    }

    if (start.direction.includes('s')) {
        newHeight = start.startHeightPct + dyPct;
    } else if (start.direction.includes('n')) {
        newHeight = start.startHeightPct - dyPct;
        newY = start.startYPct + dyPct;
    }

    if (newWidth < 5) {
      newWidth = 5; 
      if (start.direction.includes('w')) newX = start.startXPct + (start.startWidthPct - 5);
    }
    
    if (newHeight < 5) {
      newHeight = 5;
      if (start.direction.includes('n')) newY = start.startYPct + (start.startHeightPct - 5);
    }

    this.state.updateImageById(start.imgId, (img) => ({
        ...img,
        customWidth: newWidth,
        customHeight: newHeight,
        customX: newX,
        customY: newY
    }));
  }
}