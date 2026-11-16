import fs from "fs";
import path from "path";

import { Deal } from "./models/deal";
import { Lender } from "./models/lender";

import { matchLenders } from "./services/matchingEngine";

import {
  simulateLenderResponse,
  SimulatedResponse
} from "./services/simulation";

import {
  calculatePrecisionAt5
} from "./services/metrics";

const dealsPath = path.join(
  process.cwd(),
  "data/deals.json"
);

const lendersPath = path.join(
  process.cwd(),
  "data/lenders.json"
);

const deals: Deal[] = JSON.parse(
  fs.readFileSync(dealsPath, "utf-8")
);

const lenders: Lender[] = JSON.parse(
  fs.readFileSync(lendersPath, "utf-8")
);

// Change this index to test another deal
const deal = deals[11];

if (!deal) {
  console.error("No deal found at index 0");
  process.exit(1);
}

const matches = matchLenders(
  deal,
  lenders,
  5,
  new Date("2026-11-14")
);

console.log("\n================================");
console.log(`Deal: ${deal.id}`);
console.log("================================");

console.log(
  `${deal.assetType} | ${deal.geography} | $${(
    deal.loanAmount / 1_000_000
  ).toFixed(1)}M | LTV ${deal.ltv}% | DSCR ${deal.dscr}x`
);

console.log("\nTop Matches:\n");

matches.forEach((match, index) => {
  console.log(
    `${index + 1}. ${match.lender.name}`
  );

  console.log(
    `   Score: ${match.score.totalScore.toFixed(2)}`
  );

  console.log("   Why matched:");

  for (const signal of match.explanation.positiveSignals) {
    console.log(`     ✓ ${signal}`);
  }

  for (const warning of match.explanation.warnings) {
    console.log(`     ⚠ ${warning}`);
  }

  console.log();
});


// --------------------------------
// Simulate lender responses ONCE
// --------------------------------

console.log("\nSimulated Responses:\n");

const responses: SimulatedResponse[] = [];

for (const match of matches) {
  const response = simulateLenderResponse(
    deal,
    match.lender
  );

  responses.push(response);

  console.log(
    `${match.lender.name}: ${response.decision}`
  );

  if (response.reason) {
    console.log(
      `  Reason: ${response.reason}`
    );
  }
}


// --------------------------------
// Metrics
// --------------------------------

const precisionAt5 =
  calculatePrecisionAt5(responses);

console.log("\n================================");
console.log("METRICS");
console.log("================================");

console.log(
  `Precision@5: ${(precisionAt5 * 100).toFixed(2)}%`
);