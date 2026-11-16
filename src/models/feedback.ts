export type FeedbackDecision =
  | "QUOTE"
  | "PASS";

export type FeedbackReason =
  | "LTV_TOO_HIGH"
  | "LOAN_TOO_LARGE"
  | "WRONG_ASSET"
  | "WRONG_GEOGRAPHY"
  | "DSCR_TOO_LOW"
  | "RECOURSE_NOT_SUPPORTED"
  | "OTHER";

export interface Feedback {
  id: string;
  lenderId: string;
  dealId: string;
  decision: FeedbackDecision;
  reason?: FeedbackReason;
  createdAt: string;
}