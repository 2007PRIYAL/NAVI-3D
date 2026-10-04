# NAVI-3D: Neural Accessibility & Vision-guided Indoor 3D Navigator

> **Autonomous Spatial Digital Twin Engine with 3D Gaussian Splats, Dynamic ADA Wheelchair Pathfinding, Multi-Storey Transit, and Real-Time Spatial Guidance.**

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r165-black?style=flat&logo=three.js)](https://threejs.org/)
[![Gaussian Splatting](https://img.shields.io/badge/3D%20Splats-WebGL2-blueviolet?style=flat)](https://github.com/mkkellogg/GaussianSplats3D)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🏛️ Overview

**NAVI-3D** is a high-performance spatial digital twin engine engineered to solve complex indoor navigation challenges where satellite GPS signals fail. Powered by WebGL2 and neural rendering techniques (3D Gaussian Splatting), NAVI-3D turns commodity smartphone video captures into photorealistic, interactive 3D environments equipped with ADA-compliant wheelchair routing, multi-storey elevator transit, and real-time audio guidance.

---

## ✨ Features

- **Photorealistic 3D Gaussian Splatting**:
  - Live streaming of `.splat`, `.ksplat`, and `.ply` point cloud models via `@mkkellogg/gaussian-splats-3d`.
  - Built-in multi-storey showroom fallback with ADA-certified ramps (1:12 slope), elevator shafts, and architectural props.
- **Dynamic ADA Accessibility Routing**:
  - Real-time Catmull-Rom floor path splines styled with signature sunset gradient (`#7C3AED` → `#C026D3` → `#F43F5E` → `#FB923C`) and animated forward chevrons.
  - Perspective toggle between **Standard Walk** (1.6m eye height, 4.5 m/s roaming speed) and **Wheelchair Accessible** (1.2m seated eye height, step-free incline routing, stairs obstruction barriers).
  - Dynamic forward-walking 3D floor pointer with project-ahead orientation tracking.
- **Multi-Storey Storey & Vertical Transit**:
  - Level switcher HUD supporting Ground, Mezzanine, and Terrace floors with seamless height transition animations.
  - Priority elevator transit and tactile warning guidance.
- **2D Live Radar Minimap & Telemetry**:
  - Top-down circular radar minimap with dynamic player FOV sweep, active route trail (`#E11D48` / `#C026D3`), and floor-aware POI highlighting.
  - Live spatial telemetry tracking GPS coordinates, altitude, velocity, and distance/ETA metrics.
- **Universal Data Ingestion & SQLite Authentication**:
  - Ingest any file format (`.csv`, `.json`, `.geojson`, `.splat`, `.ply`, spreadsheets) with automatic node extraction and ADA compliance grading.
  - SQLite backend database for user profiles, roles (Student, Faculty, Safety Officer), and campus identities.
- **ScamShield Dark Tech Landing Experience**:
  - Production-grade landing portal showcasing architecture pillars, interactive telemetry previews, and 1-click scene launch.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nammatwin-indoor-engine

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Project Structure

```
nammatwin-indoor-engine/
├── public/
│   ├── assets/              # Architectural twin renders & banners
│   ├── dataset/             # Spatial POI JSON definitions
│   ├── models/              # Pre-processed 3D Gaussian Splat models (.splat)
│   └── logo.png             # Official NAVI-3D brand mark
├── server/
│   ├── db.js                # SQLite persistence layer (better-sqlite3)
│   └── authPlugin.js        # Vite middleware API endpoints
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx             # SQLite authentication dialog
│   │   ├── CommandPalette.jsx        # ⌘K global spatial search
│   │   ├── DatasetModal.jsx          # Universal file ingestion modal
│   │   ├── DirectorySidebar.jsx      # Left spatial directory & routes
│   │   ├── FloorSwitcher.jsx         # Level & storey elevation selector
│   │   ├── LandingPage.jsx           # Dark tech architectural landing page
│   │   ├── Minimap.jsx               # 2D Canvas radar minimap
│   │   ├── NavigationHud.jsx         # Bottom turn guidance & mobility toggles
│   │   ├── NotificationsPopover.jsx  # Building emergency egress alerts
│   │   ├── RightMapTelemetryTray.jsx # Live map & spatial telemetry cards
│   │   ├── SplatViewer.jsx           # Three.js 3D WebGL engine & path ribbons
│   │   └── UserProfileModal.jsx      # Active profile & database account modal
│   ├── data/                         # Mock POIs, floor levels, datasets
│   ├── utils/                        # Audio synthesizers, file analyzers
│   ├── App.jsx                       # Main application coordinator
│   ├── index.css                     # NAVI-3D gradient tokens & design system
│   └── main.jsx                      # React 18 DOM root
├── index.html
├── package.json
└── vite.config.js
```

---

## ⌨️ Controls & Keybindings

| Key / Input | Action |
| --- | --- |
| **W, A, S, D** / Arrows | Roam / Walk forward, backward, strafe |
| **Mouse Drag / Click** | First-person look / Orbit camera |
| **⌘K / Ctrl+K** | Open global spatial search palette |
| **ESC** | Unlock mouse cursor & access UI overlay |
| **1 / 2 / 3** | Switch storey levels (Ground / Mezzanine / Terrace) |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
