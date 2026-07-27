import { runTier1Tests } from './e2e/tier1_features.test';
import { runTier2Tests } from './e2e/tier2_boundaries.test';
import { runTier3Tests } from './e2e/tier3_combinations.test';
import { runTier4Tests } from './e2e/tier4_realworld.test';
import { runTier5Tests } from './e2e/tier5_adversarial.test';

async function main() {
  console.log('================================================================');
  console.log('         HICM HUB — EXECUTIVE E2E TEST RUNNER (M4)              ');
  console.log('================================================================');
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('Running 5-Tier Test Suite...\n');

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  // --- TIER 1 ---
  console.log('----------------------------------------------------------------');
  console.log('   TIER 1: FEATURE ISOLATION & CORE FUNCTIONALITY               ');
  console.log('----------------------------------------------------------------');
  const tier1 = await runTier1Tests();
  tier1.results.forEach((r) => {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(` [PASS] ${r.name}`);
      console.log(`        -> ${r.details}`);
    } else {
      totalFailed++;
      console.log(` [FAIL] ${r.name}`);
      console.log(`        -> ERROR: ${r.details}`);
    }
  });

  // --- TIER 2 ---
  console.log('\n----------------------------------------------------------------');
  console.log('   TIER 2: BOUNDARY & EDGE CASE VALIDATION                      ');
  console.log('----------------------------------------------------------------');
  const tier2 = await runTier2Tests();
  tier2.results.forEach((r) => {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(` [PASS] ${r.name}`);
      console.log(`        -> ${r.details}`);
    } else {
      totalFailed++;
      console.log(` [FAIL] ${r.name}`);
      console.log(`        -> ERROR: ${r.details}`);
    }
  });

  // --- TIER 3 ---
  console.log('\n----------------------------------------------------------------');
  console.log('   TIER 3: CROSS-FEATURE COMBINATIONS & WORKFLOWS               ');
  console.log('----------------------------------------------------------------');
  const tier3 = await runTier3Tests();
  tier3.results.forEach((r) => {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(` [PASS] ${r.name}`);
      console.log(`        -> ${r.details}`);
    } else {
      totalFailed++;
      console.log(` [FAIL] ${r.name}`);
      console.log(`        -> ERROR: ${r.details}`);
    }
  });

  // --- TIER 4 ---
  console.log('\n----------------------------------------------------------------');
  console.log('   TIER 4: REAL-WORLD END-TO-END USER JOURNEYS                  ');
  console.log('----------------------------------------------------------------');
  const tier4 = await runTier4Tests();
  tier4.results.forEach((r) => {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(` [PASS] ${r.name}`);
      console.log(`        -> ${r.details}`);
    } else {
      totalFailed++;
      console.log(` [FAIL] ${r.name}`);
      console.log(`        -> ERROR: ${r.details}`);
    }
  });

  // --- TIER 5 ---
  console.log('\n----------------------------------------------------------------');
  console.log('   TIER 5: ADVERSARIAL COVERAGE HARDENING & EDGE CASES           ');
  console.log('----------------------------------------------------------------');
  const tier5 = await runTier5Tests();
  tier5.results.forEach((r) => {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(` [PASS] ${r.name}`);
      console.log(`        -> ${r.details}`);
    } else {
      totalFailed++;
      console.log(` [FAIL] ${r.name}`);
      console.log(`        -> ERROR: ${r.details}`);
    }
  });

  // --- SUMMARY LOGS ---
  console.log('\n================================================================');
  console.log('                   E2E TEST SUMMARY REPORT                      ');
  console.log('================================================================');
  console.log(` Total Tiers Executed:   5 / 5`);
  console.log(` Total Test Cases:      ${totalTests}`);
  console.log(` Passed Test Cases:     ${totalPassed}`);
  console.log(` Failed Test Cases:     ${totalFailed}`);
  console.log(` Test Pass Rate:        ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('----------------------------------------------------------------');

  if (totalFailed === 0) {
    console.log(' RESULT: SUCCESS — All 5 Test Tiers Passed Genuine Verification!');
    console.log(' Exiting with Status Code 0.');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.error(` RESULT: FAILURE — ${totalFailed} Test Cases Failed!`);
    console.error(' Exiting with Status Code 1.');
    console.log('================================================================\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Error during Test Runner Execution:', err);
  process.exit(1);
});
