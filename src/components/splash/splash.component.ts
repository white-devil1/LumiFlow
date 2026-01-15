import { Component, ChangeDetectionStrategy, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-[#1E1B4B] z-[100] flex flex-col items-center justify-center text-white transition-opacity duration-1000 overflow-hidden px-4">
      
      <!-- Dynamic Background Elements -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#1E1B4B] to-[#1E1B4B]"></div>
      <div class="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px] animate-[spin_60s_linear_infinite] opacity-50"></div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-[pulse-slow_8s_ease-in-out_infinite]"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] animate-[pulse-slow_10s_ease-in-out_infinite_reverse]"></div>

      <!-- Storytelling Logo Container -->
      <div class="relative w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-10 flex items-center justify-center scale-110">
         <div class="absolute inset-0 flex items-center justify-center z-10">
           <div class="w-7 h-10 md:w-10 md:h-14 bg-blue-500/80 rounded-[2px] absolute"
                style="--sx: -100px; --sy: -80px; --sr: -45deg; animation: fly-to-grid 3.0s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; transform-origin: center center; top: 30px; left: 30px;">
           </div>
           <div class="w-7 h-10 md:w-10 md:h-14 bg-cyan-500/80 rounded-[2px] absolute"
                style="--sx: 100px; --sy: -60px; --sr: 30deg; animation: fly-to-grid 3.0s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; transform-origin: center center; top: 30px; right: 30px;">
           </div>
           <div class="w-7 h-10 md:w-10 md:h-14 bg-indigo-500/80 rounded-[2px] absolute"
                style="--sx: -80px; --sy: 100px; --sr: 25deg; animation: fly-to-grid 3.0s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; opacity: 0; transform-origin: center center; bottom: 30px; left: 30px;">
           </div>
           <div class="w-7 h-10 md:w-10 md:h-14 bg-blue-400/80 rounded-[2px] absolute"
                style="--sx: 120px; --sy: 80px; --sr: -20deg; animation: fly-to-grid 3.0s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards; opacity: 0; transform-origin: center center; bottom: 30px; right: 30px;">
           </div>
         </div>

         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_25px_rgba(6,182,212,0.3)] z-20">
            <rect x="20" y="15" width="60" height="74" rx="4" fill="none" stroke="white" stroke-width="2" 
                  class="opacity-0" 
                  style="animation: fade-border-in 2.0s cubic-bezier(0.22, 1, 0.36, 1) 2.5s forwards;">
            </rect>
            <path d="M10 50 Q 30 20, 50 50 T 90 50" fill="none" stroke="url(#lumiGradient)" stroke-width="4" stroke-linecap="round" 
                  stroke-dasharray="100" stroke-dashoffset="100"
                  style="animation: draw-stroke-once 2.5s ease-out 3.5s forwards; opacity: 0;">
            </path>
            <circle cx="10" cy="50" r="4" fill="#FFD966" 
                    style="animation: pop-in 1.0s cubic-bezier(0.34, 1.56, 0.64, 1) 5.5s forwards; opacity: 0;">
            </circle>
            <defs>
              <linearGradient id="lumiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#3B82F6" />
                <stop offset="100%" style="stop-color:#06B6D4" />
              </linearGradient>
            </defs>
         </svg>
      </div>

      <!-- Typography -->
      <div class="text-center relative z-10 flex flex-col items-center max-w-sm md:max-w-none">
        <h1 class="text-4xl md:text-7xl font-black tracking-tight text-white mb-4 md:mb-8 drop-shadow-2xl opacity-0" 
            style="animation: fade-in-down 2.0s cubic-bezier(0.22, 1, 0.36, 1) 5.8s forwards;">
          LUMI<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">FLOW</span>
        </h1>
        
        <div class="flex flex-col items-center gap-2 md:gap-4 min-h-[100px] md:min-h-[140px]">
          <div class="overflow-hidden">
            <p class="text-lg md:text-2xl font-light text-cyan-50 tracking-[0.2em] opacity-0"
               style="animation: slide-up 2.0s cubic-bezier(0.22, 1, 0.36, 1) 6.0s forwards;">
              Your photos. Your story.
            </p>
          </div>
          
          <div class="overflow-hidden">
            <div class="h-[1px] w-12 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 mb-3"
                 style="animation: fade-border-in 1.5s ease-out 6.2s forwards;"></div>
          </div>

          <div class="overflow-hidden mb-6 md:mb-8">
            <p class="text-xs md:text-base font-bold text-white tracking-[0.6em] uppercase opacity-0 bg-white/10 px-5 py-2 rounded-full border border-white/10 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.15)]"
               style="animation: slide-up 2.0s cubic-bezier(0.22, 1, 0.36, 1) 6.4s forwards;">
              One PDF.
            </p>
          </div>

          <!-- DIVE IN Button -->
          @if (showButton()) {
            <div class="animate-[fade-in-down_1.5s_ease-out_forwards]">
               <button (click)="onDismiss()" 
                    class="group relative px-8 py-3 md:px-10 md:py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] border border-white/20">
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span class="relative z-10 text-white font-bold text-base md:text-lg tracking-[0.2em] uppercase flex items-center gap-3">
                     Dive In
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5 group-hover:translate-x-1 transition-transform duration-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SplashComponent implements OnInit {
  dismiss = output<void>();
  showButton = signal(false);

  ngOnInit() {
    setTimeout(() => {
      this.showButton.set(true);
    }, 7000);
  }

  onDismiss() {
    this.dismiss.emit();
  }
}