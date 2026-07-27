## 2026-07-27T14:01:12Z

You are the Remediation Worker for "HICM Hub".

Your project root is: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub`
Your working directory is: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\worker_remediation`

Create your working directory `.agents/worker_remediation` and maintain a `progress.md` file with a `Last visited: [timestamp]` header.

Read `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\reviewer_1\handoff.md` for complete review context and finding details.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks for Remediation:

1. Create `src/utils/urlValidator.ts`:
   - Export function `checkForForbiddenLinks(text: string): boolean`.
   - Use regex: `/(https?:\/\/|www\.|(?:\b[a-zA-Z0-9-]+\.(?:com|org|net|edu|gov|io|xyz|info|biz|co|app)\b)(?:\/[^\s]*)?)/i`.
   - Test that sentences with normal punctuation like `"Contact Dr. Nfor. me and Jane will attend"` return `false`.
   - Test that web links like `"http://example.com"`, `"www.hicm.edu"`, `"visit site.org/page"` return `true`.

2. Update `src/components/GeneralForum.tsx`:
   - Import `checkForForbiddenLinks` from `../utils/urlValidator`.
   - Use `checkForForbiddenLinks` inside `handleSubmit` to block links and show `"Web links are strictly forbidden."`.

3. Update `src/types/index.ts`:
   - Export `QuizResult` (`score: number, total: number, percentage: number, passed: boolean, answers: Record<number, number>`).
   - Export `PlagiarismState` (`docName: string, status: string, similarityScore: number, tokensRemaining: number`).
   - Ensure `User` interface includes `isStaff?: boolean`, `matricNo?: string`, `staffCode?: string`.

4. Fix `src/components/LoginForm.tsx`:
   - In `handleStaffCodeChange(code: string)`:
     - If `code.trim().toUpperCase() === 'STF-123'`, set `setRole('staff')`.
     - Else, set `setRole('student')`.

5. Fix `src/components/TimedEvaluation.tsx`:
   - Update `useEffect` timer interval to use functional `setTimeLeft((prev) => ...)` so the interval does not re-create on every tick.

6. Refactor Test Suite in `tests/`:
   - In `tests/e2e/tier1_features.test.ts`, `tier2_boundaries.test.ts`, `tier3_combinations.test.ts`, `tier4_realworld.test.ts`:
     - Import `checkForForbiddenLinks` from `../../src/utils/urlValidator`.
     - Import `QuizResult`, `PlagiarismState`, `User` from `../../src/types`.
     - Ensure test cases call `checkForForbiddenLinks` and exercise exported logic functions directly.

7. Write your handoff report to `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub\.agents\worker_remediation\handoff.md` and send a message to parent.
