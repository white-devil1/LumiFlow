<div align="center">

![Lumiflow Banner](https://placehold.co/1200x400/1E1B4B/38bdf8?text=LUMIFLOW&font=montserrat)

# LUMIFLOW
### Photo to PDF Storyteller

**Your photos. Your story. One PDF.**

[![Angular](https://img.shields.io/badge/Angular-v18%2B-dd0031.svg?style=flat&logo=angular)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<p class="description">
  Lumiflow is a cutting-edge, zoneless Angular application designed to curate, arrange, and export high-resolution photo grids into A4 PDFs. Built for performance and privacy, it performs all image processing client-side.
</p>

[View Demo](https://lumiflow.app/) · [Report Bug](https://github.com/lumiflow/issues) · [Request Feature](https://github.com/lumiflow/issues)

</div>

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🔧 Dependencies & Versions](#-dependencies--versions)
- [🏗 Architecture & Design](#-architecture--design)
- [💻 Installation & Setup](#-installation--setup)
- [📱 Usage Guide](#-usage-guide)
- [🧠 Technical Highlights](#-technical-highlights)
- [🛣 Roadmap](#-roadmap)

---

## ✨ Key Features

### 🎨 Visual & Layout Engine
*   **Smart 2x2 Grid System**: Automatically calculates layout matrices to fit 4 photos per A4 page perfectly.
*   **Dynamic Pagination**: Seamlessly adds new pages as you upload more photos (4, 8, 12... unlimited).
*   **Drag & Drop Editing**:
    *   **Pan**: Click and drag inside a cell to reposition the image.
    *   **Resize**: Use 8-point handle controls to scale images with precision.
    *   **Aspect Ratio Locking**: Smart scaling preserves image quality.
*   **Reordering**: Intuitive "Move Left" and "Move Right" controls to swap image positions across the grid.

### 🖨 PDF Generation (jsPDF)
*   **Client-Side Rendering**: Generates PDFs directly in the browser using `jsPDF`. No server required.
*   **Margin Modes**:
    *   **Narrow Margins (Default)**: Optimized 6mm outer / 4mm gap for a crisp, professional look.
    *   **No Margins**: Maximizes image size with minimal 5mm printer-safe edges.
*   **Global Stretch**: Optional mode to force all images to fill their grid cells entirely.

### 🛡 Privacy & Performance
*   **Local Processing**: Images are processed via HTML5 Canvas and `FileReader` locally. **Zero data upload**.
*   **Image Optimization**: Automatic downscaling of massive images to 1500px max dimension to prevent browser crashes and reduce PDF size while maintaining print quality.
*   **Zoneless Rendering**: Built with `provideZonelessChangeDetection()` for next-gen Angular performance.

---

## 🔧 Dependencies & Versions

This project leverages the latest web technologies.

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| **Angular** | `^21.1.0` | Core Framework (Zoneless, Signals) |
| **TypeScript** | `~5.x` | Static Typing |
| **RxJS** | `^7.8.2` | Reactive Streams (Drag logic, file reading) |
| **Tailwind CSS** | `3.4 (CDN)` | Utility-first Styling |
| **jsPDF** | `2.5.1` | PDF Generation Engine |
| **Google Fonts** | `Inter & Poppins` | Typography |

---

## 🏗 Architecture & Design

Lumiflow follows a **Service-Based, Signal-Driven** architecture.

### Directory Structure
```
src/
├── app.component.ts           # Root Orchestrator (Modal handling, global layout)
├── services/
│   ├── app-state.service.ts       # Single Source of Truth (Signals)
│   ├── pdf-generator.service.ts   # Mathematical logic for PDF coordinates
│   └── image-processor.service.ts # Canvas manipulation & Base64 encoding
├── components/
│   ├── header/                # Global Settings & Actions
│   ├── splash/                # Intro Animations (CSS Keyframes)
│   ├── setup/                 # Initial Configuration Form
│   └── workspace/             # The Core Editor (Grids, Drag Logic)
└── index.html                 # SEO, Meta Tags, Tailwind Injection
```

### State Management Strategy
1.  **AppStateService**: Holds the state (`images`, `settings`) in **Signals**.
2.  **Computed Signals**: Derived state (e.g., `pages` array calculated from linear `images` array) updates automatically.
3.  **OnPush Components**: All components use `ChangeDetectionStrategy.OnPush` for maximum efficiency.
4.  **RxJS Interop**: Used primarily for complex DOM events (Drag & Drop streams) and File Reading, bridging back to Signals for UI updates.

---

## 💻 Installation & Setup

### Prerequisites
*   Node.js v18 or higher
*   NPM v9 or higher

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/lumiflow.git
    cd lumiflow
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm start
    ```
    Open `http://localhost:4200` in your browser.

4.  **Build for Production**
    ```bash
    npm run build
    ```
    Artifacts will be stored in `dist/`.

---

## 📱 Usage Guide

1.  **Welcome Screen**: Wait for the animation to complete and click **"Dive In"**.
2.  **Setup**: Select the number of photos you want to arrange (e.g., 4, 8, 12).
3.  **Upload**: Click any "+" slot to upload images. You can select multiple files at once.
4.  **Edit**:
    *   Click **"Adjust Size"** on an image.
    *   Drag corners to resize. Drag center to move.
    *   Click **"Done"** to save.
5.  **Configure**: Use the top bar to toggle **"No Margins"** or **"Global Stretch"**.
6.  **Export**: Click **"Export PDF"** to download your file.

---

## 🧠 Technical Highlights

### The PDF Coordinate System
The `PdfGeneratorService` treats the A4 page (210mm x 297mm) as a coordinate system.
*   **Logic**: Iterates through the `images` array.
*   **Math**: Calculates `x, y, width, height` based on:
    *   Current Column (0 or 1)
    *   Current Row (0 or 1)
    *   Selected Margin (6mm vs 5mm)
    *   Grid Gap (4mm vs 0mm)
*   **Customization**: If a user manually resizes an image in the UI, those percentage-based values (`customWidth`, `customX`) are projected onto the PDF cell dimensions mathematically.

### Zoneless Drag & Drop
The drag logic in `WorkspaceComponent` uses `RxJS` streams (`fromEvent`, `switchMap`, `takeUntil`) to handle mouse and touch events outside of the Angular zone where possible, only updating the specific Signal (`updateImageById`) on frame updates to ensure smooth 60fps interactions on mobile devices.

---

## 🛣 Roadmap

*   [ ] **Filters & Effects**: Add grayscale, sepia, and brightness controls.
*   [ ] **Custom Grid Layouts**: Support for 1x1, 3x3, and collage layouts.
*   [ ] **Text Captions**: Allow users to add text descriptions below photos.
*   [ ] **PWA Support**: Install Lumiflow as a native app on iOS/Android.
*   [ ] **Cloud Sync (Optional)**: Save sessions to LocalStorage or Firebase.

---

<div align="center">
  <sub>Built with ❤️ by the Lumiflow Team. Powered by Angular.</sub>
</div>
