import { Component, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <div class="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] animate-fade-in-up py-4">
        <div class="bg-white p-6 md:p-12 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full text-center relative overflow-hidden mx-4">
           
           <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>

           <div class="relative z-10">
             <div class="bg-blue-50 text-blue-600 w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 md:size-10">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            
            <h2 class="text-2xl md:text-3xl font-bold text-[#1E1B4B] mb-2 md:mb-3 leading-tight">Turn Your Photos Into a <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Beautiful PDF Story</span></h2>
            <p class="text-slate-500 mb-6 md:mb-10 text-sm md:text-base">How many photos would you like to arrange today?</p>

            <div id="setup-counter-area" class="mb-6 md:mb-10 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
              <div class="flex items-center justify-center gap-6">
                <button class="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white shadow-sm hover:shadow-md text-slate-600 hover:text-blue-600 font-bold text-lg md:text-2xl transition-all border border-slate-200 hover:border-blue-200"
                        (click)="state.decrementCount()">
                  -
                </button>
                <div class="flex flex-col items-center">
                  <input type="number" 
                         [ngModel]="state.targetPhotoCount()" 
                         (ngModelChange)="state.targetPhotoCount.set($event)"
                         min="1" 
                         max="100"
                         class="w-16 md:w-24 text-center text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-500 outline-none py-2 bg-transparent font-['Poppins']">
                  <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Photos</span>
                </div>
                <button class="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white shadow-sm hover:shadow-md text-slate-600 hover:text-blue-600 font-bold text-lg md:text-2xl transition-all border border-slate-200 hover:border-blue-200"
                        (click)="state.incrementCount()">
                  +
                </button>
              </div>
              <p class="text-xs md:text-sm font-medium text-slate-400 mt-4 bg-white inline-block px-4 py-1.5 rounded-full border border-slate-100">
                Creates <span class="text-blue-600 font-bold">{{ state.targetPageCount() }}</span> Page{{ state.targetPageCount() !== 1 ? 's' : '' }}
              </p>
            </div>

            <button id="setup-start-btn" (click)="onStart()" 
                    class="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-base md:text-lg font-bold rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group">
              Create Your PDF
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-5 group-hover:translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
           </div>
        </div>
      </div>
  `
})
export class SetupComponent {
  state = inject(AppStateService);
  finished = output<void>();

  onStart() {
    this.state.startSession();
    this.finished.emit();
  }
}