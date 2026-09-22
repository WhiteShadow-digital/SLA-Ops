# SLA OPS — IT Helpdesk Task & SLA Tracker

> **"Master Your Helpdesk Queue. Eliminate SLA Breaches."**  
> Built & Designed by **Ethan Krewu**

---

## 📌 Core Objective & Overview

**SLA OPS** is a specialized operational task manager and service desk station engineered specifically for frontline IT support technicians, system administrators, and helpdesk leads. Unlike generic to-do list applications, SLA OPS is purpose-built to solve real-world helpdesk challenges:

- **ITIL Priority & SLA Breach Prevention**: Real-time per-second countdown timers calibrated to ITIL priorities (P1 Critical, P2 High, P3 Medium, P4 Low) with visual pulsing warnings 15 minutes before contractual breach.
- **SOP Checklist Compliance**: Standard operating procedure checklists for high-risk operations (laptop provisioning, employee offboarding, zero-day patching, boardroom A/V triage).
- **Canned Diagnostic Command Store**: One-click executable CLI scripts (PowerShell, Windows CMD, macOS, Linux) and verified response templates.
- **Automated Shift Handover Logs**: Single-click generation of formatted Markdown reports summarizing resolved tickets, pending queues, and active P1 escalations for Microsoft Teams, Slack, or ticketing systems.

---

## 🛠️ Tech Stack

SLA OPS is built with a modern, high-performance web development stack:

| Technology | Role & Purpose |
| :--- | :--- |
| **React (v19)** | Declarative component architecture, custom hooks, and reactive UI state |
| **Vite** | Blazing-fast development server, HMR, and optimized production bundler |
| **TypeScript** | Strict type safety across ITIL models, tasks, SOP steps, and user profiles |
| **Tailwind CSS (v4)** | Utility-first styling with custom cyber-slate theme and ambient mesh keyframes |
| **Shadcn UI** | Accessible, ergonomic component patterns and glassmorphic card primitives |
| **Supabase** | Authentication (Auth), PostgreSQL database, and Row Level Security (RLS) integration with local-first offline fallback |
| **Framer Motion (`motion/react`)** | Fluid spring physics for button interactions and sliding drawers |
| **Lucide React** | Clean, recognizable IT and systems iconography |

---

## 🎨 Design System: "Cyber Slate & Fluid Azure"

- **Palette**: Deep slate background (`#020617` / `#0F172A`) elevated by translucent glassmorphic surfaces (`backdrop-blur-md`).
- **Fluctuating Ambient Mesh**: Dynamic radial gradient shifting between **Azure** (`#007FFF`), **Turquoise** (`#40E0D0`), **Teal** (`#008080`), and **Frost White**.
- **ITIL Priority Hierarchy**:
  - 🚨 **P1 Critical**: Pulsing Crimson (`#EF4444`) — 15m resolution target
  - ⚡ **P2 High**: Vibrant Amber (`#F59E0B`) — 1h resolution target
  - 🔷 **P3 Medium**: Azure Blue (`#007FFF`) — 4h resolution target
  - 🟢 **P4 Low**: Emerald Teal (`#14B8A6`) — 8h resolution target

---

## 🚀 Key Modules

1. **Landing Page (`/`)**: Frontline hero section with live queue simulation, ticking P1 countdown, interactive SOP steps, and feature breakdown.
2. **Queue Workspace (`/dashboard`)**: Split-view operational console featuring:
   - **4 KPI Stat Cards**: Active tasks, impending SLA warnings, today's completion progress, and handover-flagged items.
   - **Quick Ticket Dispatch**: Add tickets with inline ITIL priority, category, target SLA duration, and pre-attached SOPs.
   - **Live Per-Second Countdowns**: Automatic alerts when tickets breach or enter danger thresholds.
   - **Triage Filters**: Instant filtering by status, priority, handover flag, or text query.
3. **SOP Checklist Engine (`/sops` & Drawer)**: Procedural step-by-step verification with step toggles, progress bars, and custom step injection.
4. **Canned Command Store (`/commands`)**: One-click clipboard copy for diagnostic scripts and validated email templates.
5. **Shift Handover Modal**: Generates structured Markdown logs with one click.
6. **Authentication & Roles (`/auth`)**: Role-based profiles for Tier 1 Support, Tier 2 / SysAdmin, and Helpdesk Lead.

---

## 📂 Directory Structure

```text
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # Application metadata
├── package.json                 # Dependencies & npm scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript compiler settings
└── src/
    ├── main.tsx                 # Application entry point
    ├── App.tsx                  # Root layout, routing & state coordination
    ├── index.css                # Global Tailwind CSS & animation keyframes
    ├── types.ts                 # TypeScript interfaces (Task, SOP, UserProfile)
    ├── data/
    │   └── mockHelpdeskData.ts  # Pre-seeded ITIL tickets, SOPs & commands
    ├── lib/
    │   └── supabaseHelpdesk.ts  # Supabase Auth client & persistence engine
    └── components/
        ├── Navbar.tsx           # Global header with SLA alerts & search
        ├── LandingPage.tsx      # Hero, interactive demo & feature grid
        ├── DashboardView.tsx    # Live ticket queue & KPI telemetry
        ├── SOPDrawer.tsx        # Slide-out SOP checklist drawer
        ├── SOPLibraryView.tsx   # Comprehensive SOP template catalog
        ├── CannedCommandsStore.tsx # CLI snippet browser & copy engine
        ├── ShiftHandoverModal.tsx # Shift report generator
        ├── AuthModal.tsx        # Supabase sign-in/sign-up & role picker
        ├── AnimatedButton.tsx   # Spring-animated motion button
        └── WatermarkFooter.tsx  # Persistent "Ethan Krewu" attribution
```

---

## 💻 Local Setup & Development Instructions

Follow these steps to run the application locally on your workstation:

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** (v9+) or **bun** / **pnpm**

### 2. Clone or Extract the Repository
```bash
git clone <repository-url>
cd sla-ops
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file and configure your credentials if using a custom Supabase instance:

```bash
cp .env.example .env
```

Inside `.env`, optionally provide your Supabase project parameters:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
> **Note**: If Supabase variables are left blank, SLA OPS automatically operates in resilient local-first mode using persistent browser storage, allowing full offline development and testing.

### 5. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:3000
```

### 6. Available Scripts
- `npm run dev`: Starts the Vite development server with fast refresh.
- `npm run build`: Type-checks and builds optimized static production assets in the `dist/` folder.
- `npm run lint`: Runs TypeScript (`tsc --noEmit`) to validate type safety across the entire codebase.
- `npm run preview`: Serves the production build locally for verification.

---

## 👤 Author & Attribution
- **Creator & Designer**: Ethan Krewu
- **Project**: SLA OPS — IT Service Desk Operational Task & SLA Tracker
