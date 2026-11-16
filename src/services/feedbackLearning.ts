import {
  Feedback,
  FeedbackReason
} from "../models/feedback";

import { Deal } from "../models/deal";
import { Lender } from "../models/lender";

const LEARNING_RATE = 0.5;

export function applyFeedback(
  lender: Lender,
  deal: Deal,
  feedback: Feedback
): Lender {
  const updatedLender: Lender = {
    ...lender,
    revealedMandate: {
      ...lender.revealedMandate
    }
  };

  if (
    feedback.reason === "LTV_TOO_HIGH"
  ) {
    if (feedback.decision === "PASS") {
      updatedLender.revealedMandate
        .effectiveMaxLtv =
        Math.min(
          updatedLender.revealedMandate
            .effectiveMaxLtv,
          deal.ltv - LEARNING_RATE
        );
    }

    if (feedback.decision === "QUOTE") {
      updatedLender.revealedMandate
        .effectiveMaxLtv =
        Math.min(
          lender.statedMandate.maxLtv,
          updatedLender.revealedMandate
            .effectiveMaxLtv +
            LEARNING_RATE
        );
    }
  }

  if (
    feedback.reason === "LOAN_TOO_LARGE" &&
    feedback.decision === "PASS"
  ) {
    updatedLender.revealedMandate
      .effectiveMaxLoanAmount =
      Math.min(
        updatedLender.revealedMandate
          .effectiveMaxLoanAmount,
        deal.loanAmount - 0.25
      );
  }

  return updatedLender;
}