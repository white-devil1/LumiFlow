import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <header class="bg-[#1E1B4B] text-white shadow-xl sticky top-0 z-50 border-b border-white/5">
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
        @if (!isSetupMode()) {
           <button (click)="startOver.emit()" class="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors group" title="Back to Setup">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5 group-hover:-translate-x-1 transition-transform">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
           </button>
        }
        <div class="flex items-center gap-3 select-none">
          <!-- Custom Logo Image -->
          <div class="relative h-12 w-auto hover:scale-105 transition-transform duration-300">
            <img src="https://iili.io/fSIynd7.png" alt="lumiflow logo" class="h-full w-auto object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
          </div>

          <div>
            <h1 class="text-xl font-bold tracking-wide text-white leading-tight font-['Poppins']">LUMIFLOW</h1>
            <p class="text-cyan-200 text-[10px] font-medium tracking-widest uppercase">Your photos. Your story.</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 items-center w-full sm:w-auto justify-end">
        
        @if (canInstall()) {
           <button (click)="installPwa()" 
                   class="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg transition-all animate-pulse-slow font-bold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span class="hidden sm:inline">Install App</span>
              <span class="inline sm:hidden">Install</span>
           </button>
        }

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
export class HeaderComponent implements OnInit {
  state = inject(AppStateService);
  isSetupMode = input.required<boolean>();
  isGenerating = input.required<boolean>();
  startOver = output<void>();
  download = output<void>();
  
  canInstall = signal(false);
  private deferredPrompt: any = null;

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      this.canInstall.set(true);
      console.log('PWA Install Prompt ready');
    });
  }

  async installPwa() {
    if (!this.deferredPrompt) return;
    
    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      this.canInstall.set(false);
    }
  }
}