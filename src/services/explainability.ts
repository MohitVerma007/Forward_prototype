import { Deal } from "../models/deal";
import { Lender } from "../models/lender";
import { ScoreBreakdown } from "./scoring";

function formatLoanAmount(
  amount: number
): string {
  return `$${(
    amount / 1_000_000
  ).toFixed(1)}M`;
}

export interface MatchExplanation {
  positiveSignals: string[];
  warnings: string[];
}

export function explainMatch(
  deal: Deal,
  lender: Lender,
  score: ScoreBreakdown
): MatchExplanation {
  const positiveSignals: string[] = [];
  const warnings: string[] = [];

  const mandate = lender.statedMandate;
  const revealed = lender.revealedMandate;

  // Loan size
  if (
    deal.loanAmount >= mandate.minLoanAmount &&
    deal.loanAmount <= revealed.effectiveMaxLoanAmount
  ) {
    // positiveSignals.push(
    //   `Loan size of $${deal.loanAmount}M fits the lender's effective range`
    // );
    positiveSignals.push(
  `Loan size of ${formatLoanAmount(
    deal.loanAmount
  )} fits the lender's effective range`
);
  }

  // Asset
  if (mandate.assetTypes.includes(deal.assetType)) {
    positiveSignals.push(
      `${deal.assetType} is supported`
    );
  }

  // Geography
  if (mandate.geographies.includes(deal.geography)) {
    positiveSignals.push(
      `${deal.geography} is a supported geography`
    );
  }

  // Stated LTV
  if (deal.ltv <= mandate.maxLtv) {
    positiveSignals.push(
      `LTV of ${deal.ltv}% is within stated max LTV of ${mandate.maxLtv}%`
    );
  }

  // Effective LTV
  if (deal.ltv > revealed.effectiveMaxLtv) {
    warnings.push(
      `LTV of ${deal.ltv}% is above effective max LTV of ${revealed.effectiveMaxLtv}%`
    );
  } else {
    positiveSignals.push(
      `LTV has ${revealed.effectiveMaxLtv - deal.ltv}% effective headroom`
    );
  }

  // DSCR
  if (deal.dscr >= mandate.minDscr) {
    positiveSignals.push(
      `DSCR of ${deal.dscr}x meets minimum requirement of ${mandate.minDscr}x`
    );
  }

  // Recourse
  if (
    mandate.acceptedRecourse.includes(deal.recourse)
  ) {
    positiveSignals.push(
      `${deal.recourse} recourse is accepted`
    );
  }

  // Response rate
  if (score.responseRate >= 0.7) {
    positiveSignals.push(
      `Strong historical response rate of ${Math.round(
        score.responseRate * 100
      )}%`
    );
  }

  // Freshness
  if (score.mandateFreshness >= 0.8) {
    positiveSignals.push(
      "Mandate information is recently updated"
    );
  } else {
    warnings.push(
      "Mandate information may be getting stale"
    );
  }

  return {
    positiveSignals,
    warnings
  };
}