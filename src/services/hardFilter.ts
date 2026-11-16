import { Deal } from "../models/deal";
import { Lender } from "../models/lender";

export type FilterFailureReason =
  | "LOAN_TOO_SMALL"
  | "LOAN_TOO_LARGE"
  | "ASSET_NOT_SUPPORTED"
  | "GEOGRAPHY_NOT_SUPPORTED"
  | "LTV_TOO_HIGH"
  | "DSCR_TOO_LOW"
  | "RECOURSE_NOT_SUPPORTED";

export interface HardFilterResult {
  eligible: boolean;
  reasons: FilterFailureReason[];
}

export function evaluateHardFilters(
  deal: Deal,
  lender: Lender
): HardFilterResult {
  const mandate = lender.statedMandate;

  const reasons: FilterFailureReason[] = [];

  // Loan size
  if (deal.loanAmount < mandate.minLoanAmount) {
    reasons.push("LOAN_TOO_SMALL");
  }

  if (deal.loanAmount > mandate.maxLoanAmount) {
    reasons.push("LOAN_TOO_LARGE");
  }

  // Asset type
  if (!mandate.assetTypes.includes(deal.assetType)) {
    reasons.push("ASSET_NOT_SUPPORTED");
  }

  // Geography
  if (!mandate.geographies.includes(deal.geography)) {
    reasons.push("GEOGRAPHY_NOT_SUPPORTED");
  }

  // LTV
  if (deal.ltv > mandate.maxLtv) {
    reasons.push("LTV_TOO_HIGH");
  }

  // DSCR
  if (deal.dscr < mandate.minDscr) {
    reasons.push("DSCR_TOO_LOW");
  }

  // Recourse
  if (!mandate.acceptedRecourse.includes(deal.recourse)) {
    reasons.push("RECOURSE_NOT_SUPPORTED");
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}