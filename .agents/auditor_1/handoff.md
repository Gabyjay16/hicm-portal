# Forensic Audit Handoff Report

**Work Product**: `c:\Users\DELL\Desktop\SECOND SEM COMPLAINS\hicm-hub`
**Profile**: General Project Forensic Audit
**Verdict**: INTEGRITY VIOLATION

---

## 1. Observation

A forensic audit was performed across all six requested areas of the codebase:

### Check 1: `src/components/GeneralForum.tsx` — PASS
- **Path**: `src/components/GeneralForum.tsx`, lines 20, 30–33, 78–91.
- **Observed**:
  - Line 20: `const URL_REGEX = /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|org|net|edu|io|gov|co|info|biz|site|online|app|xyz|me|ca|uk|de|fr))/i;`
  - Lines 30–33:
    ```tsx
    if (URL_REGEX.test(textToSubmit)) {
      setErrorMessage('Web links are strictly forbidden.');
      return;
    }
    ```
  - Lines 78–91 render a dynamic red alert banner containing `{errorMessage}` when triggered.
- **Finding**: URL regex validation is authentic and genuinely blocks web link submission with the specified error banner.

### Check 2: `src/components/LoginForm.tsx` — PASS
- **Path**: `src/components/LoginForm.tsx`, lines 27–33, 48, 198.
- **Observed**:
  - Lines 27–33:
    ```tsx
    const handleStaffCodeChange = (code: string) => {
      setStaffCodeInput(code);
      if (code.trim().toUpperCase() === 'STF-123') {
        setRole('staff');
        setErrorMessage('');
      }
    };
    ```
  - Line 198: `{role === 'staff' || staffCodeInput.trim().toUpperCase() === 'STF-123' ? (...) : (...)}` dynamically toggles staff registration input fields in the UI state upon typing `"STF-123"`.
- **Finding**: Staff code `"STF-123"` toggle is dynamically integrated into component state.

### Check 3: `src/components/TimedEvaluation.tsx` — PASS
- **Path**: `src/components/TimedEvaluation.tsx`, lines 73–100, 131–142, 157–173.
- **Observed**:
  - Lines 73–100: Uses `useState(600)` and a standard `setInterval` effect to count down `timeLeft` every second.
  - When `prev <= 1` or `timeLeft <= 0`, `setIsSubmitted(true)` is automatically called to force quiz submission.
  - Score calculations (`calculateScore()`) dynamically evaluate user answers against correct answer indices in `SAMPLE_QUESTIONS`.
- **Finding**: Countdown timer and auto-submit logic are genuine and dynamically reactive.

### Check 4: `src/components/PlagiarismTest.tsx` — PASS
- **Path**: `src/components/PlagiarismTest.tsx`, lines 54–68, 76–87, 153–169, 187–199.
- **Observed**:
  - Validates document extension (`.pdf`, `.docx`, `.txt`) and size (`<= 10MB`).
  - Checks token balance (`tokens < 1`) and triggers `onUseToken()` callback prop to decrement token count upon launching analysis.
  - Renders payment status badge (`tokens >= 1 ? 'Token Ready' : 'Token Required'`) and token balance UI widget with redemption button (`onAddTokens(3)`).
- **Finding**: Token counter, document upload validation, and payment status are authentic.

### Check 5: `functions/api/ai.js` — PASS
- **Path**: `functions/api/ai.js`, lines 20–34, 52–62.
- **Observed**:
  - Lines 20–34: Reads `env.GROQ_API_KEY` from context environment and returns HTTP 500 error if unconfigured.
  - Lines 52–62: Performs backend `fetch('https://api.groq.com/openai/v1/chat/completions', ...)` with `Authorization: Bearer ${apiKey}` header.
- **Finding**: Cloudflare Pages Function proxy is authentic and properly handles `GROQ_API_KEY`.

### Check 6: `tests/` Test Runner and Test Suite — FAIL (INTEGRITY VIOLATION)
- **Paths**:
  - `tests/e2e/tier1_features.test.ts` (lines 1, 14–31, 67–89, 95–116, 146–167, 173–194)
  - `tests/e2e/tier2_boundaries.test.ts` (lines 1, 13–41, 46–66, 71–110, 114–144)
  - `tests/e2e/tier3_combinations.test.ts` (lines 2, 76–130)
  - `tests/e2e/tier4_realworld.test.ts` (lines 2, 14–74, 85–153)
- **Observed**:
  1. **Non-Existent Function Imports**: All 4 test files (`tier1_features.test.ts`, `tier2_boundaries.test.ts`, `tier3_combinations.test.ts`, `tier4_realworld.test.ts`) import `checkForForbiddenLinks` from `../../src/components/GeneralForum`:
     - Line 1 in `tier1_features.test.ts`: `import { checkForForbiddenLinks } from '../../src/components/GeneralForum';`
     - Line 1 in `tier2_boundaries.test.ts`: `import { checkForForbiddenLinks } from '../../src/components/GeneralForum';`
     - Line 2 in `tier3_combinations.test.ts`: `import { checkForForbiddenLinks } from '../../src/components/GeneralForum';`
     - Line 2 in `tier4_realworld.test.ts`: `import { checkForForbiddenLinks } from '../../src/components/GeneralForum';`
     However, `src/components/GeneralForum.tsx` **does not export any function named `checkForForbiddenLinks`**. Attempting to run or compile these tests against the actual source code causes import failures.
  2. **Facade & Self-Certifying Tests**: The test cases inside `tests/e2e/` **do not import, render, or test the actual React components** (`GeneralForum.tsx`, `LoginForm.tsx`, `TimedEvaluation.tsx`, `PlagiarismTest.tsx`). Instead, they create local inline dummy variables inside the test functions and assert on those dummy variables. Examples:
     - `tier1_features.test.ts` (lines 14–31): Tests `const tabs = ['home', ...]; let currentTab = 'home';` created inside the test instead of testing `App.tsx` or navigation components.
     - `tier1_features.test.ts` (lines 96–105): Tests `let staffCode = 'STF-123'; const isStaff = staffCode === 'STF-123';` created inside the test instead of rendering `LoginForm.tsx`.
     - `tier1_features.test.ts` (lines 147–157): Tests `let answers = { 1: 0, 2: 1, 3: 2, 4: 1 };` created inside the test instead of evaluating `TimedEvaluation.tsx`.
     - `tier1_features.test.ts` (lines 173–186): Tests `let tokens = 3; if (tokens > 0) tokens -= 1;` created inside the test instead of evaluating `PlagiarismTest.tsx`.
     - `tier2_boundaries.test.ts` (lines 47–56): Simulates auto-submit by writing `let timeLeft = 0; if (timeLeft <= 0) autoSubmittedFlag = true;` inside the test file instead of testing `TimedEvaluation.tsx`.

---

## 2. Logic Chain

1. **Rule**: Under Integrity Forensics, tests must evaluate genuine target codebase logic rather than using hardcoded dummy results, self-certifying inline logic, or facade execution.
2. **Observation**: Inspection of `tests/e2e/*.test.ts` reveals that the test suite does not mount or invoke the actual application components (`LoginForm`, `GeneralForum`, `TimedEvaluation`, `PlagiarismTest`).
3. **Observation**: The test files simulate operations locally by creating dummy local variables (`let tokens = 3; if (tokens > 0) tokens -= 1;`) and asserting on their own local variables.
4. **Observation**: All test files attempt to import `checkForForbiddenLinks` from `src/components/GeneralForum.tsx`, but no such function is exported by `src/components/GeneralForum.tsx`.
5. **Deduction**: The test suite in `tests/` is facade code containing self-certifying dummy test cases and invalid imports that do not evaluate the real project code.
6. **Conclusion**: Since Check 6 failed, the work product violates project integrity rules.

---

## 3. Caveats

- Source code components (`src/components/*`) and backend Cloudflare function (`functions/api/ai.js`) are genuinely implemented and fully functional.
- The integrity violation is strictly localized to the test suite in `tests/`, which was constructed with facade test cases rather than real component integration tests.

---

## 4. Conclusion

**Verdict**: **`INTEGRITY VIOLATION`**

The target UI components and Cloudflare function proxy pass all functional checks. However, the test runner suite in `tests/` constitutes a facade implementation: it tests local inline dummy variables rather than the actual components, and references non-existent exports (`checkForForbiddenLinks`), violating Forensic Integrity standards.

---

## 5. Verification Method

To independently verify this audit finding:

1. Inspect `src/components/GeneralForum.tsx` lines 1–40 to verify that `checkForForbiddenLinks` is NOT exported:
   ```bash
   view_file src/components/GeneralForum.tsx
   ```
2. Inspect `tests/e2e/tier1_features.test.ts` lines 1–120 to observe facade test cases operating on local inline variables:
   ```bash
   view_file tests/e2e/tier1_features.test.ts
   ```
3. Observe invalid imports in `tests/e2e/tier1_features.test.ts`, `tier2_boundaries.test.ts`, `tier3_combinations.test.ts`, and `tier4_realworld.test.ts`.
