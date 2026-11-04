import test from 'node:test';
import assert from 'node:assert';
import { calculateWorkingCapitalSavings } from '../src/lib/workingCapital.ts';

test('Working Capital Financial Logic conforms exactly to Company A Problem Statement', () => {
  // Baseline test: reducing from 18 days to 4 days (14 days saved)
  const result = calculateWorkingCapitalSavings(4.0);

  // ₹84.48 Cr * 14 / 365 = ₹3.24 Cr
  assert.strictEqual(result.daysSaved, 14.0);
  assert.strictEqual(result.workingCapitalUnlockedCr, 3.24);

  // 12% interest on ₹3.24 Cr = ₹38.89L (~₹38.9L)
  assert.ok(Math.abs(result.annualInterestSavingsLakhs - 38.89) < 0.1, 'Interest savings matches ₹38.9 Lakh');

  // Dispute savings: 1.0% drop of 26,400 trips * ₹16,000 = ₹42.24 Lakh
  assert.strictEqual(result.disputeSavingsLakhs, 42.24);

  // Total savings should exceed ₹80 Lakh
  assert.ok(result.totalAnnualSavingsLakhs > 80.0);
});

test('Working Capital returns zero savings when cycle time equals baseline', () => {
  const result = calculateWorkingCapitalSavings(18.0);
  assert.strictEqual(result.daysSaved, 0);
  assert.strictEqual(result.workingCapitalUnlockedCr, 0);
  assert.strictEqual(result.annualInterestSavingsLakhs, 0);
});
