import { Deal } from "../models/deal";
import { Lender } from "../models/lender";
import { evaluateHardFilters } from "./hardFilter";
import { calculateScore, ScoreBreakdown } from "./scoring";
import {
  explainMatch,
  MatchExplanation
} from "./explainability";

export interface MatchResult {
  lender: Lender;
  score: ScoreBreakdown;
  explanation: MatchExplanation;
}

export function matchLenders(
  deal: Deal,
  lenders: Lender[],
  topK: number = 5,
  now: Date = new Date()
): MatchResult[] {
  const eligibleLenders = lenders.filter((lender) => {
    return evaluateHardFilters(
      deal,
      lender
    ).eligible;
  });

  const scoredLenders = eligibleLenders.map(
    (lender) => {
      const score = calculateScore(
        deal,
        lender,
        now
      );

      const explanation = explainMatch(
        deal,
        lender,
        score
      );

      return {
        lender,
        score,
        explanation
      };
    }
  );

  scoredLenders.sort(
    (a, b) =>
      b.score.totalScore -
      a.score.totalScore
  );

  return scoredLenders.slice(0, topK);
}