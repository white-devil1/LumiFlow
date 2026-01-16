import { Injectable, signal, computed } from '@angular/core';

export interface AppImage {
  id: string;
  url: string | null;
  name: string;
  originalWidth: number;
  originalHeight: number;
  customWidth?: number; 
  customHeight?: number;
  customX?: number;
  customY?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // Global State
  images = signal<AppImage[]>([]);
  targetPhotoCount = signal<number>(4);
  
  // Settings
  stretchImages = signal(false);
  noMargins = signal(false);

  // Derived State
  targetPageCount = computed(() => Math.ceil(this.targetPhotoCount() / 4));
  
  pages = computed(() => {
    const allImages = this.images();
    const pagesArray: AppImage[][] = [];
    for (let i = 0; i < allImages.length; i += 4) {
      pagesArray.push(allImages.slice(i, i + 4));
    }
    return pagesArray;
  });

  // Actions
  incrementCount() {
    this.targetPhotoCount.update(c => c + 1);
  }

  decrementCount() {
    this.targetPhotoCount.update(c => Math.max(1, c - 1));
  }

  startSession() {
    const count = this.targetPhotoCount();
    if (!count || count < 1) return;

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
  }

  addMoreSlots(count: number = 4) {
    const current = this.images();
    const newSlots: AppImage[] = [];
    for(let i = 0; i < count; i++) {
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

  updateImage(index: number, data: Partial<AppImage>) {
    this.images.update(imgs => {
      const newImgs = [...imgs];
      if (newImgs[index]) {
        newImgs[index] = { ...newImgs[index], ...data };
      }
      return newImgs;
    });
  }
  
  addImage(data: AppImage) {
      this.images.update(imgs => [...imgs, data]);
  }

  removeImage(id: string) {
    this.images.update(imgs => imgs.map(img => {
      if (img.id === id) {
        // Clear the data to reset the slot to empty state
        return {
          ...img,
          url: null,
          originalWidth: 0,
          originalHeight: 0,
          customWidth: undefined, 
          customHeight: undefined, 
          customX: undefined, 
          customY: undefined
        };
      }
      return img;
    }));
  }

  resetAll() {
    this.images.set([]);
    this.targetPhotoCount.set(4);
  }

  updateImageById(id: string, updateFn: (img: AppImage) => AppImage) {
    this.images.update(imgs => imgs.map(img => {
        if (img.id === id) {
            return updateFn(img);
        }
        return img;
    }));
  }

  swapImages(index1: number, index2: number) {
      this.images.update(imgs => {
          const newImgs = [...imgs];
          if (newImgs[index1] && newImgs[index2]) {
              [newImgs[index1], newImgs[index2]] = [newImgs[index2], newImgs[index1]];
          }
          return newImgs;
      });
  }
}