# Project: HICM Hub

## Architecture
- React + Vite + TypeScript single-page application (SPA) with Tailwind CSS styling
- Custom color palette: deep navy blue (`#0f172a` / `#1e293b`), off-white (`#f8fafc`), emerald green (`#10b981`), red (`#ef4444`)
- Lucide React icons for clean UI iconography
- Cloudflare Pages Functions backend proxy (`functions/api/ai.js`) for Groq API integration
- Local storage & React state management for authentication, view navigation, quiz timers, plagiarism tokens, and forum messages

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Base Architecture & Setup | Vite+React+TS+Tailwind setup, package.json dependencies, functions/api/ai.js, .dev.vars, .gitignore, README.md | None | DONE |
| 2 | M2: Mobile-First Navigation & Layout | Sticky top header, mobile bottom nav (Home, Forum, Alerts, Notes), desktop left sidebar responsive layout, Academic List accordion dropdown (Academics, Student Services, Campus Life), color scheme | M1 | DONE |
| 3 | M3: Core Views & Functional Features | Unified Login Form (staff code "STF-123" toggle), Student Dashboard (user info, announcement ribbon, accordion nav), Timed Evaluation View (MC quiz + countdown), Plagiarism Test View (upload, payment, token counter), General Forum (chronological chat, no web links warning & validation) | M2 | DONE |
| 4 | M4: E2E Test Suite & Test Track | Comprehensive test suite (Tiers 1-4: Feature coverage, Boundary/Edge cases, Cross-feature, Real-world scenarios), test runner script, TEST_INFRA.md, TEST_READY.md | M3 | DONE |
| 5 | M5: E2E Verification, Hardening & GitHub Deployment | Phase 1 E2E test verification, Phase 2 Adversarial coverage hardening (Tier 5), Forensic Auditor validation, git init, commit, `gh repo create hicm-hub --public --source=. --remote=origin --push` | M4 | DONE |

## Interface Contracts
### Client ↔ Functions API
- `POST /api/ai`: Proxy to Groq API using `GROQ_API_KEY` from environment variables. Accepts JSON payload `{ model, messages }` or `{ prompt }`, forwards request to `https://api.groq.com/openai/v1/chat/completions`, and returns JSON response.

### View Navigation & Session Contracts
- Navigation tabs: `'home'`, `'forum'`, `'alerts'`, `'notes'`
- Sub-views/features: `'dashboard'`, `'evaluation'`, `'plagiarism'`, `'login'`
- Forum validation contract: strictly forbid web links (regex check for `http://`, `https://`, `www.`, `.com`, `.org`, `.net`, `.edu`, etc., showing explicit warning).
- Staff code contract: Entering "STF-123" in login form toggles Staff Registration mode.

## Code Layout
- `src/components/`: Header, BottomNav, Sidebar, AccordionNav, LoginForm, StudentDashboard, TimedEvaluation, PlagiarismTest, GeneralForum, AlertsView, NotesView
- `src/types/`: `index.ts` (User, QuizQuestion, ForumMessage, PlagiarismState)
- `src/styles/`: Tailwind configuration (`tailwind.config.js` or Vite PostCSS setup)
- `functions/api/ai.js`: Cloudflare Pages Function proxy
- `.dev.vars`: Local environment secrets (`GROQ_API_KEY=`)
- `.gitignore`: Standard Node, Vite, build, `.dev.vars` ignore rules
- `README.md`: Setup, Cloudflare Pages Secrets deployment instructions
