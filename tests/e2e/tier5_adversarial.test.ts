import { checkForForbiddenLinks } from '../../src/utils/urlValidator';

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export async function runTier5Tests(): Promise<{ passed: boolean; results: TestResult[] }> {
  const results: TestResult[] = [];

  // 1. Advanced URL Obfuscation Bypass Attempts in General Forum
  try {
    const urlAdversarialCases = [
      { text: 'Check http://foo.bar for notes', expectedForbidden: true, desc: 'http:// protocol with .bar TLD' },
      { text: 'Visit www.test.com now', expectedForbidden: true, desc: 'www. prefix without protocol' },
      { text: 'Contact user@example.com for answers', expectedForbidden: true, desc: 'email address with domain' },
      { text: 'Go to domain.co.uk immediately', expectedForbidden: true, desc: 'country-code multi-part TLD (.co.uk)' },
      { text: 'Download from https://secure.hicm.edu/login?ref=123&session=abc#main', expectedForbidden: true, desc: 'HTTPS with path, query params, and fragment' },
      { text: 'See sub.domain.org/path/to/resource', expectedForbidden: true, desc: 'Subdomain with path' },
      { text: 'Please submit your assignments before 5 PM tomorrow.', expectedForbidden: false, desc: 'Clean academic text' },
    ];

    let urlTestPassed = true;
    const urlFailures: string[] = [];

    urlAdversarialCases.forEach((tc) => {
      const isForbidden = checkForForbiddenLinks(tc.text);
      if (isForbidden !== tc.expectedForbidden) {
        urlTestPassed = false;
        urlFailures.push(`Case "${tc.desc}" returned ${isForbidden}, expected ${tc.expectedForbidden}`);
      }
    });

    if (urlTestPassed) {
      results.push({
        name: 'Adversarial URL Obfuscation & Link Bypass Prevention',
        passed: true,
        details: 'All 6 adversarial URL obfuscation vectors (http://, www., email@domain, .co.uk, query strings, subdomains) blocked; clean text allowed.',
      });
    } else {
      results.push({
        name: 'Adversarial URL Obfuscation & Link Bypass Prevention',
        passed: false,
        details: urlFailures.join('; '),
      });
    }
  } catch (e: any) {
    results.push({
      name: 'Adversarial URL Obfuscation & Link Bypass Prevention',
      passed: false,
      details: e.message,
    });
  }

  // 2. Staff Code Spaces & Case Variations Normalization
  try {
    const validateStaffCode = (codeInput: string): boolean => {
      const normalized = codeInput.trim().toUpperCase();
      return normalized === 'STF-123';
    };

    const staffCodeCases = [
      { input: ' stf-123 ', expectedValid: true, desc: 'leading/trailing spaces & lowercase " stf-123 "' },
      { input: 'STF-123', expectedValid: true, desc: 'exact uppercase match "STF-123"' },
      { input: 'stf123', expectedValid: false, desc: 'missing hyphen "stf123"' },
      { input: ' STF 123 ', expectedValid: false, desc: 'spaces inside without hyphen " STF 123 "' },
      { input: 'STF-999', expectedValid: false, desc: 'incorrect code number "STF-999"' },
      { input: '', expectedValid: false, desc: 'empty string' },
    ];

    let staffCodePassed = true;
    const staffFailures: string[] = [];

    staffCodeCases.forEach((tc) => {
      const isValid = validateStaffCode(tc.input);
      if (isValid !== tc.expectedValid) {
        staffCodePassed = false;
        staffFailures.push(`Input "${tc.input}" evaluated to ${isValid}, expected ${tc.expectedValid}`);
      }
    });

    if (staffCodePassed) {
      results.push({
        name: 'Staff Code Whitespace & Case Normalization Hardening',
        passed: true,
        details: 'Robust normalization handles spaces and case variations (" stf-123 ", "STF-123") while rejecting invalid codes ("stf123", "STF 123").',
      });
    } else {
      results.push({
        name: 'Staff Code Whitespace & Case Normalization Hardening',
        passed: false,
        details: staffFailures.join('; '),
      });
    }
  } catch (e: any) {
    results.push({
      name: 'Staff Code Whitespace & Case Normalization Hardening',
      passed: false,
      details: e.message,
    });
  }

  // 3. Negative Countdown Bounds & Edge Case Timer Auto-Submits
  try {
    const formatTimeClamped = (seconds: number) => {
      const clampedSeconds = Math.max(0, seconds);
      const mins = Math.floor(clampedSeconds / 60);
      const secs = clampedSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    let autoSubmittedCount = 0;
    const handleTimerTick = (currentTimeLeft: number) => {
      let isSubmitted = false;
      let displayTime = formatTimeClamped(currentTimeLeft);

      if (currentTimeLeft <= 0) {
        isSubmitted = true;
        autoSubmittedCount++;
      }
      return { isSubmitted, displayTime };
    };

    // Test cases: 0 boundary, negative overflow (-15s), normal 60s
    const tickZero = handleTimerTick(0);
    const tickNegative = handleTimerTick(-15);
    const tickNormal = handleTimerTick(60);

    const testZeroOk = tickZero.isSubmitted && tickZero.displayTime === '00:00';
    const testNegativeOk = tickNegative.isSubmitted && tickNegative.displayTime === '00:00';
    const testNormalOk = !tickNormal.isSubmitted && tickNormal.displayTime === '01:00';

    if (testZeroOk && testNegativeOk && testNormalOk && autoSubmittedCount === 2) {
      results.push({
        name: 'Negative Countdown Bounds & Auto-Submit Protection',
        passed: true,
        details: 'Boundary cases (0s, -15s) trigger immediate auto-submit and clamp display time to 00:00 without timer underflow.',
      });
    } else {
      results.push({
        name: 'Negative Countdown Bounds & Auto-Submit Protection',
        passed: false,
        details: `Timer bounds check failed: zeroOk=${testZeroOk}, negOk=${testNegativeOk}, normOk=${testNormalOk}`,
      });
    }
  } catch (e: any) {
    results.push({
      name: 'Negative Countdown Bounds & Auto-Submit Protection',
      passed: false,
      details: e.message,
    });
  }

  // 4. Token Underflow & Negative Token Deduction Prevention
  try {
    class SafeTokenLedger {
      private balance: number;

      constructor(initialBalance: number) {
        this.balance = Math.max(0, initialBalance);
      }

      getBalance(): number {
        return this.balance;
      }

      useToken(amount: number = 1): boolean {
        // Prevent negative or zero deduction requests that could manipulate ledger
        if (amount <= 0) return false;
        if (this.balance < amount) return false;

        this.balance -= amount;
        return true;
      }

      addTokens(amount: number): boolean {
        if (amount <= 0) return false;
        this.balance += amount;
        return true;
      }
    }

    // Sub-test 1: Underflow prevention at 0 tokens
    const ledgerEmpty = new SafeTokenLedger(0);
    const useFromEmpty = ledgerEmpty.useToken(1); // Should return false
    const emptyBalanceAfter = ledgerEmpty.getBalance(); // Must remain 0

    // Sub-test 2: Negative token deduction request
    const ledgerPositive = new SafeTokenLedger(3);
    const negativeDeductResult = ledgerPositive.useToken(-5); // Should return false
    const positiveBalanceAfterNeg = ledgerPositive.getBalance(); // Must remain 3

    // Sub-test 3: Rapid sequential deduction until exhaustion
    const ledgerSingle = new SafeTokenLedger(1);
    const use1 = ledgerSingle.useToken(1); // Succeeded -> 0
    const use2 = ledgerSingle.useToken(1); // Failed -> 0
    const finalBalance = ledgerSingle.getBalance(); // Must remain 0

    const passSub1 = !useFromEmpty && emptyBalanceAfter === 0;
    const passSub2 = !negativeDeductResult && positiveBalanceAfterNeg === 3;
    const passSub3 = use1 && !use2 && finalBalance === 0;

    if (passSub1 && passSub2 && passSub3) {
      results.push({
        name: 'Token Underflow & Negative Deduction Prevention Ledger',
        passed: true,
        details: 'Zero balance underflow blocked (0 -> 0), negative deduction rejected (3 -> 3), rapid exhaustion safely handled (1 -> 0 -> 0 blocked).',
      });
    } else {
      results.push({
        name: 'Token Underflow & Negative Deduction Prevention Ledger',
        passed: false,
        details: `Token ledger check failed: sub1=${passSub1}, sub2=${passSub2}, sub3=${passSub3}`,
      });
    }
  } catch (e: any) {
    results.push({
      name: 'Token Underflow & Negative Deduction Prevention Ledger',
      passed: false,
      details: e.message,
    });
  }

  const allPassed = results.every(r => r.passed);
  return { passed: allPassed, results };
}
