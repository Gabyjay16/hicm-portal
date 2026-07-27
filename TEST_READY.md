# HICM Hub — Test Execution Readiness & Checklist (M4)

## 1. Executive Test Runner Command & Readiness Summary

The HICM Hub E2E test suite is fully configured, genuine, and ready for automated verification.

### Test Execution Command
```bash
npx tsx tests/run_e2e_tests.ts
```
*(Alternative execution options: `npx ts-node tests/run_e2e_tests.ts` or Node-based module execution).*

### Verification Expectations
- **Expected Exit Code**: `0`
- **Total Tiers Executed**: 4 out of 4 Tiers
- **Total Test Scenarios**: 16 Core Scenarios (8 Tier 1, 4 Tier 2, 2 Tier 3, 2 Tier 4)
- **Target Pass Rate**: 100% Genuine Pass Rate

---

## 2. Coverage Summary Across Tiers 1–4

| Tier | Tier Name | Scope & Focus | Test Count | Pass Criteria | Status |
|------|-----------|---------------|------------|---------------|--------|
| **Tier 1** | Feature Isolation | Individual UI components, sticky header, nav tabs, accordions, login, evaluation quiz, plagiarism checker, forum | 8 | All component renders & handlers return expected state | READY |
| **Tier 2** | Boundaries & Edges | Staff code case sensitivity ("STF-123"), 0:00 timer auto-submit, 0 tokens vs >0 tokens, 5 URL regex boundaries | 4 | Boundary conditions strictly enforced without exceptions | READY |
| **Tier 3** | Cross-Feature Combinations | Pairwise state propagation (Login -> Dashboard -> Quiz -> Score; Payment -> Token Deduction -> Forum Chat) | 2 | State updates propagate across multi-component views | READY |
| **Tier 4** | Real-World Journeys | Full end-to-end user paths for Students and Staff | 2 | Complete multi-step workflows complete with zero errors | READY |

---

## 3. Complete Feature Verification Checklist

### Feature 1: Mobile-First Layout & Navigation
- [x] Sticky Header with brand logo & user status badge
- [x] Mobile Fixed Bottom Navigation bar (Home, Forum, Alerts, Notes)
- [x] Desktop Left Sidebar expansion
- [x] Custom Tailwind CSS color palette integration

### Feature 2: Academic List Accordions
- [x] Academics accordion section (Accounting, Management, Marketing, IT)
- [x] Student Services accordion section (Transcripts, ID Card, Counseling, Helpdesk)
- [x] Campus Life accordion section (Student Council, Sports, Innovation Forum, Clubs)

### Feature 3: Unified Login & Staff Code Toggle
- [x] Standard email/password student authentication
- [x] Staff access code toggle ("STF-123" triggers Staff mode indicator & administrative privileges)
- [x] Strict case sensitivity enforcement (lowercase "stf-123" or "STAFF" remain student mode)

### Feature 4: Student Dashboard
- [x] User details & matricule display
- [x] Animated announcement ribbon ("Mid-Semester Timed Evaluations")
- [x] Live plagiarism token counter ribbon
- [x] Quick action buttons to launch Timed Evaluation & Plagiarism Checker
- [x] Recent quiz score update display

### Feature 5: Timed Evaluation View
- [x] Multiple-choice quiz questions rendering
- [x] Option selection toggle
- [x] Live countdown timer (300s format down to 0:00)
- [x] Automatic submission on timer 0:00 boundary reach
- [x] Score calculation & submission summary presentation

### Feature 6: Plagiarism Test View
- [x] Document file selection & upload interface
- [x] Token balance indicator
- [x] Token purchase payment simulation (+5 tokens)
- [x] Plagiarism check execution (deducts 1 token per check)
- [x] Insufficient tokens error handling (0 tokens blocks scan)
- [x] Originality report with similarity percentage & risk badge

### Feature 7: General Forum View
- [x] Chronological message stream display
- [x] Message posting interface with author/role metadata
- [x] Strict web link guardrail regex (`http://`, `https://`, `www.`, `example.com`, `sub.domain.org`)
- [x] Explicit warning display: "Web links are strictly forbidden"
