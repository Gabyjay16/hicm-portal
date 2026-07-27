## 2026-07-27T13:50:59Z

You are the E2E Testing Track Worker (Milestone 4) for "HICM Hub".

Your project root is: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub`
Your working directory is: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\worker_m4_e2e`

Create your working directory `.agents/worker_m4_e2e` and maintain a `progress.md` file with a `Last visited: [timestamp]` liveness header.

Read `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\PROJECT.md` and `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\ORIGINAL_REQUEST.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks for Milestone 4 (E2E Testing Track):

1. Create `TEST_INFRA.md` at `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\TEST_INFRA.md` following the project template:
   - Document test philosophy, feature inventory, 4-tier methodology, coverage goals.

2. Implement 4-tier test suite in `tests/`:
   - `tests/e2e/tier1_features.test.ts`:
     - Test sticky header & responsive navigation (Home, Forum, Alerts, Notes).
     - Test Academic List accordion dropdowns (Academics, Student Services, Campus Life).
     - Test Unified Login form & standard authentication.
     - Test Staff Code toggle mode when "STF-123" is entered.
     - Test Student Dashboard rendering & announcement ribbon.
     - Test Timed Evaluation view (quiz questions, timer countdown, submission logic).
     - Test Plagiarism Test view (document upload, payment status indicator, token counter).
     - Test General Forum view (chronological message stream, message submission).
   - `tests/e2e/tier2_boundaries.test.ts`:
     - Test staff code case sensitivity and non-staff codes.
     - Test evaluation timer reaching 0:00 boundary auto-submit.
     - Test plagiarism check with 0 tokens vs positive token balance.
     - Test general forum URL validation edge cases (`http://`, `https://`, `www.`, `example.com`, `sub.domain.org`, link embedded inside sentence).
   - `tests/e2e/tier3_combinations.test.ts`:
     - Test pairwise interaction of login -> student dashboard -> taking evaluation -> score update.
     - Test pairwise interaction of plagiarism test payment -> token deduction -> forum discussion.
   - `tests/e2e/tier4_realworld.test.ts`:
     - Full realistic E2E user journeys for students and staff.

3. Create Test Runner (`tests/run_e2e_tests.ts`):
   - Executive test runner that imports and executes all 4 test tiers, verifies requirements, outputs structured tier logs, and exits with code 0 on success.

4. Create `TEST_READY.md` at `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\TEST_READY.md`:
   - Summarize test runner command, expected exit code 0, coverage summary across Tiers 1-4, and complete feature checklist.

5. Execute the test runner using `run_command` (e.g. `npx ts-node` or `npx tsx` or node runner) and document execution results.

6. Write complete handoff report to `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\worker_m4_e2e\handoff.md`.
7. Send completion message to parent.
