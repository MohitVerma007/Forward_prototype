import { Deal } from "../models/deal";
import { Lender } from "../models/lender";

export type SimulatedDecision =
  | "QUOTE"
  | "PASS";

export interface SimulatedResponse {
  decision: SimulatedDecision;
  reason?: string;
}

export function simulateLenderResponse(
  deal: Deal,
  lender: Lender
): SimulatedResponse {
  const preference = lender.hiddenPreference;

  // 1. Hidden loan-size preference
  if (
    deal.loanAmount >
    preference.trueMaxLoanAmount
  ) {
    return {
      decision: "PASS",
      reason: "LOAN_TOO_LARGE"
    };
  }

  // 2. Hidden LTV preference
  if (
    deal.ltv >
    preference.trueMaxLtv
  ) {
    return {
      decision: "PASS",
      reason: "LTV_TOO_HIGH"
    };
  }

  // 3. DSCR requirement
  if (
    deal.dscr <
    lender.statedMandate.minDscr
  ) {
    return {
      decision: "PASS",
      reason: "DSCR_TOO_LOW"
    };
  }

  // If the deal satisfies the lender's
  // hidden preference, lender quotes.
  return {
    decision: "QUOTE"
  };
}