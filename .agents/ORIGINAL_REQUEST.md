# Original User Request

## Initial Request — 2026-07-27T13:44:08Z

# Teamwork Project Prompt

Build "HICM Hub", a mobile-first web application for students and staff with features like unified login, timed evaluations, and plagiarism testing, using React, Vite, TypeScript, Tailwind CSS, and Cloudflare Pages Functions.

Working directory: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub`
Integrity mode: demo

## Requirements

### R1. UI & Mobile-First Design
- Sticky top header and fixed bottom navigation bar (Home, Forum, Alerts, Notes) on mobile.
- Clean Academic List concept with compact accordion-style dropdown menus for Academics, Student Services, Campus Life.
- Expand bottom nav into a left sidebar on desktop.
- Tailwind CSS styling with deep navy blues, off-whites, emerald (success), red (errors).

### R2. Required Features
- Unified Login Form: staff code "STF-123" toggles Staff Registration.
- Student Dashboard: user details, announcement ribbon, accordion navigation.
- Timed Evaluation View: multiple-choice quiz with countdown timer.
- Plagiarism Test View: document upload, payment status, token counter.
- General Forum: chronological chat, warning: "Web links are strictly forbidden."

### R3. Backend & Deployment Setup
- Create `functions/api/ai.js` to proxy Groq API requests securely.
- Create `.dev.vars` with `GROQ_API_KEY=` and a comprehensive `.gitignore`.
- Write a `README.md` explaining how to add the API key to CF Pages Secrets.
- Initialize Git, commit files, and push to a new GitHub repo using `gh repo create hicm-hub --public --source=. --remote=origin --push`. (Note: `gh` CLI is already authenticated).

## Acceptance Criteria

### Verification (Agent-as-judge)
- [ ] The Vite development server starts without errors and the build succeeds (`npm run build`).
- [ ] An agent can open the web application in a browser and visually verify that the mobile layout is implemented with the sticky header and bottom navigation bar.
- [ ] The GitHub CLI successfully creates the repository and pushes the initial commit.
