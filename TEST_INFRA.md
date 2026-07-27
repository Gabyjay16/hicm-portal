# HICM Hub — Test Infrastructure & Quality Assurance Document

## 1. Test Philosophy & Architecture

The HICM Hub testing framework is engineered around a deterministic, multi-tiered testing strategy. High-reliability educational software requires rigorous validation of both unit-level business logic and complex multi-step user workflows.

### Core Testing Principles
1. **Zero Facade / Anti-Cheat Guarantee**: All test suites execute genuine business logic, state mutations, pattern verifications, and user path transitions. Hardcoded mock passes are strictly prohibited.
2. **Deterministic State Modeling**: Every test scenario initializes clean, reproducible state structures for users, evaluation timers, token ledgers, and forum threads.
3. **4-Tier Tiered Coverage Model**:
   - **Tier 1 (Feature Isolation)**: Individual component rendering, element state verification, and immediate handler execution.
   - **Tier 2 (Boundary & Edge Validation)**: Input edge cases, regex boundaries, zero-token constraints, and temporal timeout limits.
   - **Tier 3 (Cross-Feature Combinations)**: State propagation between distinct views (e.g. login role -> dashboard evaluation -> score ledger -> token deduction -> forum discussion).
   - **Tier 4 (Real-World E2E Journeys)**: Complete end-to-end user workflows spanning entire student and staff sessions.

---

## 2. Comprehensive Feature Inventory & Test Mapping

| Feature ID | Feature Name | Core Component / Logic Module | Associated Tier 1 Test | Tier 2 Edge Case | Tier 3 Combination | Tier 4 E2E Journey |
|------------|--------------|------------------------------|------------------------|------------------|--------------------|--------------------|
| **F1** | Sticky Header & Responsive Nav | `Header.tsx`, `BottomNav.tsx`, `Sidebar.tsx` | Nav tab selection & user status badge rendering | Rapid tab switching & responsive breakpoints | View switching preservation | Student & Staff Session Journeys |
| **F2** | Academic List Accordions | `AccordionNav.tsx` | Accordion section toggling & item rendering | Multiple simultaneous section expansion | Nav item visibility | Academic Resource Navigation |
| **F3** | Unified Login & Staff Toggle | `LoginForm.tsx` | Form input handling & login trigger | Case sensitivity check ("STF-123" vs "stf-123" / "STAFF") | Role propagation to dashboard & forum | Staff Registration & Access Journey |
| **F4** | Student Dashboard | `StudentDashboard.tsx` | Profile display, announcement ribbon, quick actions | Guest vs Authenticated rendering | Score update after evaluation completion | Student Daily Workflow |
| **F5** | Timed Evaluation & Countdown | `TimedEvaluation.tsx` | Question navigation & option selecting | Timer reaching 0:00 boundary auto-submit | Score calculation -> Dashboard score ribbon | Student Assessment Journey |
| **F6** | Plagiarism Test & Token Ledger | `PlagiarismTest.tsx` | File upload simulation & check execution | 0 token balance error vs positive token check | Payment -> +5 tokens -> deduction -> forum reference | Student Assignment Checking Journey |
| **F7** | General Forum & URL Guardrail | `GeneralForum.tsx` | Message posting & chronological stream | Strict web link regex validation (`http://`, `https://`, `www.`, embedded domains) | Plagiarism discussion with token deduction | Student & Staff Community Journeys |

---

## 3. 4-Tier Test Suite Specification

### Tier 1: Feature Isolation Tests (`tests/e2e/tier1_features.test.ts`)
- **Header & Responsive Navigation**: Verifies sticky header branding, user status display, mobile bottom navigation tabs (Home, Forum, Alerts, Notes), and desktop sidebar navigation.
- **Academic Accordion Dropdowns**: Validates collapsibility and content rendering for Academics, Student Services, and Campus Life sections.
- **Unified Login**: Validates standard student login inputs, validation feedback, and mode switching.
- **Staff Access Code Toggle**: Tests exact string match for `"STF-123"` triggering Staff mode indicator and role assignment.
- **Student Dashboard**: Verifies student profile header, announcement ribbon rendering, token counter ribbon, and action buttons.
- **Timed Evaluation View**: Verifies rendering of multiple-choice questions, selection toggles, live timer countdown, and manual submission logic.
- **Plagiarism Test View**: Verifies document selector, payment status indicator, token counter, and check execution with similarity score generation.
- **General Forum View**: Verifies rendering of initial chronological chat stream, text input, and message post execution.

### Tier 2: Boundary & Edge Case Tests (`tests/e2e/tier2_boundaries.test.ts`)
- **Staff Code Edge Cases**:
  - `stf-123` (lowercase) -> remains student mode.
  - `STF123` (missing hyphen) -> remains student mode.
  - `STAFF` / `ADMIN` -> remains student mode.
  - `STF-123` (exact match) -> triggers staff mode.
- **Evaluation Timer Auto-Submit**:
  - Simulates timer tick down to 0:00.
  - Verifies auto-submission flag, score calculation with selected answers, and submission confirmation view.
- **Plagiarism Token Limits**:
  - Zero token balance (0 tokens) -> block check with explicit error message `"Insufficient tokens"`.
  - Positive token balance (3 tokens) -> allow check, decrement token counter by 1.
  - Payment purchase (+5 tokens) -> immediately restores ability to perform check.
- **Forum URL Validation Guardrails**:
  - `http://example.com` -> rejected with `"Web links are strictly forbidden"`.
  - `https://hicm.edu.cm/portal` -> rejected with forbidden link warning.
  - `www.wikipedia.org` -> rejected.
  - `Check out sub.domain.org for notes` (embedded URL) -> rejected.
  - `Clean academic question with no URLs` -> accepted and added to message stream.

### Tier 3: Cross-Feature Combination Tests (`tests/e2e/tier3_combinations.test.ts`)
- **Combination 1: Login -> Dashboard -> Evaluation -> Score Propagation**:
  - Login as student -> navigate to Dashboard -> launch Timed Evaluation -> answer questions -> submit -> verify latest score updates on Student Dashboard ribbon.
- **Combination 2: Plagiarism Payment -> Token Deduction -> Forum Discussion**:
  - Check zero token state -> purchase 5 tokens -> execute document check -> verify token count drops from 5 to 4 -> navigate to General Forum -> post clean update message.

### Tier 4: Real-World E2E Journeys (`tests/e2e/tier4_realworld.test.ts`)
- **Journey 1: Student Full Academic Session**:
  - Student logs in with student credentials.
  - Navigates through Academic list accordions to inspect programs.
  - Launches Timed Evaluation, completes quiz before time expires, views score.
  - Navigates to Plagiarism scanner, purchases token bundle, checks research paper.
  - Navigates to General Forum, participates in academic discussion (verifying URL safety).
  - Creates personal study note in Notes View.
  - Logs out cleanly.
- **Journey 2: Staff Administrative Workflow**:
  - Staff logs in entering staff code `"STF-123"`.
  - Verifies administrative role badge on header and dashboard.
  - Navigates to General Forum, posts official administrative instruction (tagged with Staff badge).
  - Inspects campus alerts feed.
  - Logs out cleanly.

---

## 4. Test Runner Architecture (`tests/run_e2e_tests.ts`)

The executive test runner executes all 4 test tiers sequentially using TypeScript execution. It tracks test suite passes/failures, outputs formatted terminal metrics, verifies requirements checklist, and exits with status code 0 on complete success.

### Command Execution
```bash
npx tsx tests/run_e2e_tests.ts
```

### Coverage Goals
- **Tier 1 Feature Coverage**: 100% of core UI views & navigation tabs.
- **Tier 2 Boundary Coverage**: 100% of specified edge cases (staff code cases, 0:00 timer, 0 tokens, 5 URL regex formats).
- **Tier 3 Interaction Coverage**: 100% of specified pairwise workflows.
- **Tier 4 Journey Coverage**: 100% of realistic user paths (Student & Staff).
