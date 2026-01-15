import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <header class="bg-[#1E1B4B] text-white shadow-xl sticky top-0 z-50 border-b border-white/5">
    <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
        @if (!isSetupMode()) {
           <button (click)="startOver.emit()" class="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors group" title="Back to Setup">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5 group-hover:-translate-x-1 transition-transform">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
           </button>
        }
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-wide text-white leading-tight">LUMIFLOW</h1>
            <p class="text-cyan-200 text-[10px] font-medium tracking-widest uppercase">Your photos. Your story. One PDF.</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 items-center w-full sm:w-auto justify-end">
        @if (!isSetupMode()) {
           <div class="hidden md:flex gap-4 mr-4 bg-white/5 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
              <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none hover:text-white transition-colors font-medium tracking-wide uppercase">
                <input type="checkbox" [ngModel]="state.stretchImages()" (ngModelChange)="state.stretchImages.set($event)" class="accent-cyan-500 rounded w-4 h-4 bg-white/10 border-white/20 checked:bg-cyan-500" />
                Global Stretch
              </label>
              <div class="w-px h-4 bg-white/10"></div>
              <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none hover:text-white transition-colors font-medium tracking-wide uppercase">
                <input type="checkbox" [ngModel]="state.noMargins()" (ngModelChange)="state.noMargins.set($event)" class="accent-cyan-500 rounded w-4 h-4 bg-white/10 border-white/20 checked:bg-cyan-500" />
                No Margins
              </label>
           </div>

          <button (click)="download.emit()" 
                  [disabled]="isGenerating()"
                  class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 rounded-full shadow-lg shadow-cyan-900/20 font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transform active:scale-95 border border-white/10">
            @if (isGenerating()) {
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export PDF
            }
          </button>
        }
      </div>
    </div>
  </header>
  `
})
export class HeaderComponent {
  state = inject(AppStateService);
  isSetupMode = input.required<boolean>();
  isGenerating = input.required<boolean>();
  startOver = output<void>();
  download = output<void>();
}