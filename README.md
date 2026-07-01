# REXDEVCYBER // Next-Generation Security Operations Center Landing Page

A futuristic, high-tech cybersecurity landing page and interactive security operations center (SOC) mockup. This application combines cyberpunk minimalism, high-contrast dark-mode graphics, and real-world full-stack features—including an interactive terminal console and a real-time **Secure Google Drive Vault** integrated with **Firebase Authentication (Google Sign-In)**.

---

## 🌌 Visual Design Concept

Inspired by state-of-the-art cybersecurity defensive platforms, **REXDEVCYBER** leverages:
- **Teal & Neon Red HUD Palette**: An eye-safe, high-contrast dark theme emphasizing threat urgency and systemic absolute security.
- **Glassmorphic Layout Grid**: Clean backdrop blur panels over dynamic canvas grid systems.
- **Live Vector Coordinates**: Adaptive visualizations tracking active nodes and simulated global telemetry flows.
- **Micro-Animations**: Staggered entering transitions, flickering pulse warning indicators, and real-time interactive UI feedbacks.

---

## 🛠️ Feature Modules

### 1. 🛡️ SOC Terminal Console (`Terminal.tsx`)
A fully functional command-line interface mimicking a secure shell:
- **Auto-Suggest Dropdown**: Shows contextual command recommendations in real-time as you type. Includes navigation via `▲`/`▼` keys, `Tab` completion, or mouse click selection.
- **Interactive Commands**:
  - `help` - List available military-grade utility commands.
  - `status` - Dispatches deep system telemetry and defense firewall status metrics.
  - `scan <domain/ip>` - Generates a mock network vulnerability assessment report.
  - `ai <query>` - Interfaces with the local AI security companion model.
  - `decrypt` - Initiates automated decryption checking routines.
  - `clear` - Purges active console output.
  - `exit` - Cleanly disengages current SOC secure terminal session.

### 2. 📁 Secure Google Drive Vault (`DriveVault.tsx` & `drive.ts`)
A fully-functioning, non-mocked integration accessing the user's Google Drive securely:
- **Firebase OAuth Gateway**: Authenticate with your Google account through secure Firebase authentication.
- **Dual-Phase File Upload**: Securely push binaries, reports, or data files directly to Google Drive with automated mime-type mappings.
- **Local Text Dossier Creator**: Author and dispatch custom digital threat intelligence dossiers (.txt) straight to your cloud drive.
- **Live File Explorer**: Search, filter, download, or permanently delete items on your Google Drive directly from the HUD canvas.
- **Integrity Heuristics Scan**: Audit cloud files using a holographic scan process that computes simulated block SHA-256 signatures, entropy distribution, and flags suspicious pattern indices.

### 3. 🌐 Threat Monitoring Widgets (`ThreatMap.tsx`)
Interactive graphical layout showcasing mock real-time firewall telemetry, target node vectors, threat level indices, and incoming honeypot alerts on an animated SVG-based world map.

---

## ⚙️ Setup & Deployment Configuration

### 1. Environment Variables
To get the application up and running, specify your secrets in `.env` following `.env.example`:
```env
# Google Gemini API key for server side AI assistance
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

### 2. Firebase & Drive Integration
The application uses the credentials supplied in `firebase-applet-config.json` to handle client-side authentication and request Google Drive scopes:
- Scopes requested: `https://www.googleapis.com/auth/drive` (to load, create, and manage files).
- Make sure to configure the OAuth consent screen inside Google Cloud Platform to register authorized redirect URIs when testing in custom cloud containers.

### 3. Quickstart Command List
Initialize dependencies and boot the development container:
```bash
# Install required npm packages
npm install

# Start local dev server (defaulting to host 0.0.0.0 and port 3000)
npm run dev

# Compile production bundle
npm run build
```

---

## 💎 Project Architecture
```text
├── firebase-applet-config.json # Firebase connection credentials
├── src/
│   ├── App.tsx                 # Main layout routing, tab selector, and landing wrapper
│   ├── index.css               # Tailwind CSS global styling declarations
│   ├── types.ts                # TypeScript interfaces and telemetry schemas
│   ├── components/
│   │   ├── Header.tsx          # Nav header with real-time SOC clock and credentials
│   │   ├── ParticlesBg.tsx     # Canvas background particle flow engine
│   │   ├── ThreatMap.tsx       # Interactive global cyber threat visualizer
│   │   ├── Terminal.tsx        # Command-line interface with interactive suggestions
│   │   └── DriveVault.tsx      # Secure Drive file manager and security heuristics scan
│   └── lib/
│       └── drive.ts            # Firebase Auth & Google Drive API client handlers
└── tsconfig.json               # TypeScript path and module resolver rules
```

---
*Crafted with precision as a next-generation security intelligence interface.*
