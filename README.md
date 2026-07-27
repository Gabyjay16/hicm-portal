# HICM Hub — Student & Academic Portal

HICM Hub is a web application designed for the Higher Institute of Commerce and Management (HICM). Built with a modern, mobile-first responsive layout, HICM Hub streamlines campus communications, timed academic evaluations, plagiarism detection services, and real-time student discussion forums.

---

## 🚀 Key Features Overview

- **Unified Authentication System**: Single login interface supporting both Student and Staff accounts (via a `STF-123` verification code toggle).
- **Responsive Layout**: Sticky header, bottom navigation bar for mobile screens, and collapsible sidebar for desktop with an Academic List accordion dropdown.
- **Student Dashboard**: Live campus announcement ticker, profile details, and interactive academic quick links.
- **Timed Evaluations**: Multiple-choice quiz engine with automated countdown timers and auto-submission on expiration.
- **Plagiarism Detection Service**: Document upload simulation with token counter, automated analysis, and status indicators.
- **Student Discussion Forum**: Real-time chronological messaging platform equipped with client-side URL link prevention & validation.
- **AI Backend Proxy**: Cloudflare Pages Function at `functions/api/ai.js` proxying requests securely to the Groq API.

---

## 🎨 Color System & Palette

- **Navy Blue (Dark)**: `#0f172a` (Primary Background) & `#1e293b` (Card Background / Secondary Surface)
- **Off-white**: `#f8fafc` (Primary Text & Foreground Elements)
- **Emerald Green**: `#10b981` & `#059669` (Accents, Active States, Success Badges)
- **Crimson Red**: `#ef4444` & `#dc2626` (Warnings, Badges, Error States)

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Step-by-Step Guide

1. **Navigate to project directory**:
   ```bash
   cd hicm-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   The local application will launch at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   This compiles TypeScript and bundles assets using Vite into the `dist/` directory.

5. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## 🔑 Setting Up Cloudflare Pages Secrets (`GROQ_API_KEY`)

HICM Hub uses Cloudflare Pages Functions to proxy requests to the Groq API without exposing secrets in client-side code.

### Local Development Environment Secrets
For local development using Cloudflare Wrangler:
1. Ensure `.dev.vars` exists in the root directory:
   ```ini
   GROQ_API_KEY=your_groq_api_key_here
   ```
2. Wrangler will automatically load variables in `.dev.vars` during local execution.

### Production Environment Setup via Cloudflare Dashboard

Follow these steps to configure your `GROQ_API_KEY` for production deployments:

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select **Workers & Pages** from the left-hand navigation menu.
3. Click on your **HICM Hub** Pages project.
4. Go to **Settings** -> **Environment variables**.
5. Under the **Production** section (and optionally **Preview**), click **Add variables** (or **Edit variables**).
6. Enter the variable details:
   - **Variable name**: `GROQ_API_KEY`
   - **Value**: Enter your Groq API secret key (e.g. `gsk_...`).
7. Click **Save**.
8. Trigger a new deployment (or push a new commit) for Cloudflare Pages to inject the environment variable into `functions/api/ai.js`.

---

## 📂 Project Structure

```
hicm-hub/
├── .dev.vars              # Local environment secrets for Cloudflare Wrangler
├── .gitignore             # Git ignore rules for node_modules, dist, secrets
├── functions/
│   └── api/
│       └── ai.js          # Cloudflare Pages Function backend proxy for Groq API
├── index.html             # Single-page application root HTML template
├── package.json           # Dependencies and scripts configuration
├── postcss.config.js      # PostCSS configuration for Tailwind CSS
├── tailwind.config.js     # Custom Tailwind color palette & theme extensions
├── tsconfig.json          # TypeScript compiler configuration
├── tsconfig.node.json     # TypeScript configuration for Vite build tools
├── vite.config.ts         # Vite bundler configuration
└── src/
    ├── main.tsx           # React entrypoint
    ├── App.tsx            # Root React component
    └── index.css          # Global CSS & Tailwind imports
```
