# Lumiflow - Photo to PDF Storyteller

Lumiflow is a modern, zoneless Angular application designed to arrange photos into beautiful A4 PDF layouts. Built with performance and user experience in mind, it allows users to upload, arrange, resize, and export photo grids directly from the browser without server-side processing.

## 🚀 Features

### Core Functionality
- **Smart Photo Grid**: Automatically arranges photos into 2x2 grids on A4 pages.
- **Drag & Drop Adjustment**: Resize and move photos within their slots for the perfect crop.
- **High-Quality Export**: Generates high-resolution PDFs using `jsPDF`.
- **Privacy First**: All image processing happens locally in the browser. No images are uploaded to a server.

### User Experience
- **Interactive Setup**: Choose the number of photos to start your session.
- **Dynamic Splash Screen**: A visually stunning introduction with CSS animations.
- **Live Preview**: See exactly how your PDF will look before downloading.
- **Customization**: 
  - **Global Stretch**: Force images to fill their slots.
  - **Margins**: Toggle between "Narrow Margins" (default) and "No Margins".

---

## 🛠 Tech Stack

- **Framework**: [Angular v18+](https://angular.dev) (Zoneless, Signals, Standalone Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (Utility-first styling)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) (Client-side PDF creation)
- **State Management**: Angular Signals (`signal`, `computed`) & RxJS
- **Build Tool**: Angular CLI

---

## 🏗 Architecture

The application follows a **Service-Based Architecture** using Angular's latest reactivity primitives (Signals).

### Project Structure
```
src/
├── app.component.ts          # Root orchestrator (Layout & Modal logic)
├── services/
│   ├── app-state.service.ts      # Global state (Images, Settings, Pagination)
│   ├── pdf-generator.service.ts  # Logic for PDF coordinate calculations & export
│   └── image-processor.service.ts # Image optimization, compression & Base64 conversion
├── components/
│   ├── header/               # Navigation & Global Actions (Download, Reset)
│   ├── splash/               # Intro Animation
│   ├── setup/                # Initial configuration (Photo count)
│   └── workspace/            # Main editor (Grid, Drag logic, Uploads)
```

### Key Architectural Decisions

1.  **Zoneless Change Detection**: The app uses `provideZonelessChangeDetection()` for high performance, relying on Signals to trigger UI updates only when necessary.
2.  **OnPush Strategy**: All components use `ChangeDetectionStrategy.OnPush` to minimize render cycles.
3.  **Client-Side Processing**: Heavy tasks like image resizing (Canvas) and PDF generation occur in the main thread (or microtasks) using Services to keep Components lean.
4.  **Signal-Based State**: `AppStateService` acts as the single source of truth. Components read signals (`this.state.images()`) and call methods (`this.state.updateImage(...)`) to mutate state.

---

## 🔄 User Workflow

1.  **Splash Screen**: The user is greeted by an animated entry screen.
2.  **Setup Phase**:
    - User selects the total number of photos they wish to arrange.
    - User clicks "Create Your PDF".
3.  **Workspace Phase**:
    - The app generates empty slots arranged in pages (4 slots per page).
    - User clicks a slot to upload an image.
    - **Adjustment**: 
        - Users can click "Adjust Size" to enter Edit Mode.
        - In Edit Mode, drag the image edges to resize or the center to move it within the cell.
    - **Reordering**: Move images between slots using the arrow buttons.
4.  **Export Phase**:
    - User configures global settings (Stretch, Margins) in the header.
    - Clicking "Export PDF" compiles the visual grid into a PDF file.

---

## 📦 Deployment

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

### Workflow File: `.github/workflows/deploy.yml`
- **Trigger**: Pushes to the `main` branch.
- **Process**:
  1.  Checkout code.
  2.  Install dependencies (`npm ci`).
  3.  Build Angular app (`npm run build`).
  4.  Upload build artifacts.
  5.  Deploy to GitHub Pages environment.

### Prerequisites for Deployment
1.  Go to your GitHub Repository **Settings** > **Pages**.
2.  Set **Source** to "GitHub Actions".
3.  Ensure your `angular.json` output path matches the workflow config (default: `dist/lumiflow/browser`).

---

## 💻 Running Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200`.

3.  **Build for Production**:
    ```bash
    npm run build
    ```

---

*Lumiflow is a demonstration of modern Angular capabilities, combining complex state management with intuitive UI design.*
