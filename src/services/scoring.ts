import { Deal } from "../models/deal";
import { Lender } from "../models/lender";

export interface ScoreBreakdown {
  ltvHeadroom: number;
  sizeFit: number;
  mandateFreshness: number;
  responseRate: number;
  totalScore: number;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}

function calculateLtvHeadroom(
  deal: Deal,
  lender: Lender
): number {
  const maxLtv = lender.revealedMandate.effectiveMaxLtv;

  const headroom = maxLtv - deal.ltv;

  // 10 percentage points of headroom = perfect score
  return clamp(headroom / 10);
}

function calculateSizeFit(
  deal: Deal,
  lender: Lender
): number {
  const min = lender.statedMandate.minLoanAmount;
  const max = lender.revealedMandate.effectiveMaxLoanAmount;

  if (deal.loanAmount < min || deal.loanAmount > max) {
    return 0;
  }

  const midpoint = (min + max) / 2;
  const halfRange = (max - min) / 2;

  if (halfRange === 0) {
    return 1;
  }

  const distance = Math.abs(deal.loanAmount - midpoint);

  return clamp(1 - distance / halfRange);
}

function calculateFreshness(
  lender: Lender,
  now: Date
): number {
  const updatedAt = new Date(
    lender.behavior.lastUpdated
  );

  const ageInDays =
    (now.getTime() - updatedAt.getTime()) /
    (1000 * 60 * 60 * 24);

  // 30-day half-life
  return Math.pow(0.5, ageInDays / 30);
}

export function calculateScore(
  deal: Deal,
  lender: Lender,
  now: Date = new Date()
): ScoreBreakdown {
  const ltvHeadroom = calculateLtvHeadroom(
    deal,
    lender
  );

  const sizeFit = calculateSizeFit(
    deal,
    lender
  );

  const mandateFreshness = calculateFreshness(
    lender,
    now
  );

  const responseRate =
    lender.behavior.responseRate;

  const totalScore =
    ltvHeadroom * 30 +
    sizeFit * 25 +
    mandateFreshness * 25 +
    responseRate * 20;

  return {
    ltvHeadroom,
    sizeFit,
    mandateFreshness,
    responseRate,
    totalScore
  };
}