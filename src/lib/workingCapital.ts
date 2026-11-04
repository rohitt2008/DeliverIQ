/**
 * Financial & Working Capital Analytics Engine
 * Based on Company A's operational metrics (Chhatrapati Sambhajinagar FTL):
 * - 2,200 trips / month
 * - ₹32,000 avg freight = ₹84.48 Crore / year
 * - Baseline POD-to-invoice: 18 days
 * - Target POD-to-invoice: 4 days
 * - Annual Working Capital Cost @ 12% interest
 * - Dispute rate: 1.5% down to 0.5%
 */

export interface WorkingCapitalMetrics {
  annualTurnoverCrores: number;
  monthlyTrips: number;
  averageFreight: number;
  baselineDays: number;
  currentDays: number;
  daysSaved: number;
  workingCapitalUnlockedCr: number;
  annualInterestSavingsLakhs: number;
  disputeSavingsLakhs: number;
  totalAnnualSavingsLakhs: number;
  totalAnnualSavingsFormatted: string;
}

export function calculateWorkingCapitalSavings(currentDays = 4.2): WorkingCapitalMetrics {
  const annualTurnoverInr = 844800000; // ₹84.48 Crore
  const monthlyTrips = 2200;
  const annualTrips = monthlyTrips * 12; // 26,400 trips
  const avgFreight = 32000;
  const baselineDays = 18;
  const daysSaved = Math.max(0, baselineDays - currentDays);

  // ₹84.48 Cr * (Days Saved / 365)
  const workingCapitalUnlocked = (annualTurnoverInr * daysSaved) / 365;
  const workingCapitalUnlockedCr = workingCapitalUnlocked / 10000000;

  // Annual interest cost at 12%
  const annualInterestSavings = workingCapitalUnlocked * 0.12;
  const annualInterestSavingsLakhs = annualInterestSavings / 100000;

  // Dispute reduction: 1.5% -> 0.5% (1.0% drop)
  // 1% of 26,400 trips = 264 trips saved * ₹16,000 (half freight)
  const disputeSavingsInr = 264 * 16000;
  const disputeSavingsLakhs = disputeSavingsInr / 100000;

  const totalSavingsInr = annualInterestSavings + disputeSavingsInr;
  const totalSavingsLakhs = totalSavingsInr / 100000;

  return {
    annualTurnoverCrores: 84.48,
    monthlyTrips,
    averageFreight: avgFreight,
    baselineDays,
    currentDays,
    daysSaved: Number(daysSaved.toFixed(1)),
    workingCapitalUnlockedCr: Number(workingCapitalUnlockedCr.toFixed(2)),
    annualInterestSavingsLakhs: Number(annualInterestSavingsLakhs.toFixed(2)),
    disputeSavingsLakhs: Number(disputeSavingsLakhs.toFixed(2)),
    totalAnnualSavingsLakhs: Number(totalSavingsLakhs.toFixed(2)),
    totalAnnualSavingsFormatted: `₹${(totalSavingsInr / 10000000).toFixed(2)} Cr`,
  };
}
