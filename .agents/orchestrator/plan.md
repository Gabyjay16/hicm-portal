# HICM Hub Orchestration Plan

## Overview
Decomposed execution plan for HICM Hub, a mobile-first web application for students and staff built with React, Vite, TypeScript, Tailwind CSS, Cloudflare Pages Functions, and deployed to GitHub.

## Milestone Breakdown & Strategy

### Milestone 1: Base Architecture & Project Setup
- Spawn Worker to initialize Vite + React + TS project, install dependencies (Tailwind CSS, Lucide React, postcss, autoprefixer), set up `functions/api/ai.js`, `.dev.vars`, `.gitignore`, and `README.md`.
- Verify build execution (`npm run build`).

### Milestone 2: Mobile-First Navigation & Responsive Layout
- Implement Sticky Top Header, Mobile Bottom Nav (Home, Forum, Alerts, Notes), Desktop Left Sidebar, Deep Navy / Off-White / Emerald / Red color palette.
- Implement Academic List concept with compact accordion dropdowns: Academics, Student Services, Campus Life.

### Milestone 3: Core Functional Views & Features
- Implement Unified Login Form with staff code "STF-123" toggle for Staff Registration.
- Implement Student Dashboard with user details, announcement ribbon, and accordion navigation.
- Implement Timed Evaluation View with multiple-choice quiz and countdown timer.
- Implement Plagiarism Test View with document upload interface, payment status indicator, and token counter.
- Implement General Forum with chronological message chat and strictly enforced web link forbidden warning & validation.

### Milestone 4: E2E Test Suite & Test Track
- Build opaque-box E2E test suite covering Tiers 1-4 (Feature coverage, Boundary/Edge cases, Cross-feature interactions, Real-world application scenarios).
- Create `TEST_INFRA.md` and publish `TEST_READY.md`.

### Milestone 5: Verification, Hardening & GitHub Deployment
- Execute Phase 1 (100% E2E test pass) and Phase 2 (Adversarial Coverage Hardening).
- Execute Forensic Auditor check to verify zero integrity violations / cheating.
- Initialize Git repository, commit files, and create/push to GitHub via `gh repo create hicm-hub --public --source=. --remote=origin --push`.
- Claim victory to Sentinel and Parent.
