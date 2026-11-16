import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";

import { Deal } from "./models/deal";
import { Lender } from "./models/lender";

import { matchLenders } from "./services/matchingEngine";

import {
  simulateLenderResponse
} from "./services/simulation";

import {
  calculatePrecisionAt5
} from "./services/metrics";


const app = express();

const PORT = 3000;


// -----------------------------
// Middleware
// -----------------------------

app.use(cors());

app.use(express.json());


// -----------------------------
// Load data
// -----------------------------

const dealsPath =
  path.join(
    process.cwd(),
    "data/deals.json"
  );

const lendersPath =
  path.join(
    process.cwd(),
    "data/lenders.json"
  );


const deals: Deal[] =
  JSON.parse(
    fs.readFileSync(
      dealsPath,
      "utf-8"
    )
  );


const lenders: Lender[] =
  JSON.parse(
    fs.readFileSync(
      lendersPath,
      "utf-8"
    )
  );


// -----------------------------
// Health
// -----------------------------

app.get(
  "/api/health",
  (_req, res) => {

    res.json({
      status: "ok"
    });

  }
);


// -----------------------------
// Get deals
// -----------------------------

app.get(
  "/api/deals",
  (_req, res) => {

    res.json(
      deals
    );

  }
);


// -----------------------------
// Match lenders
// -----------------------------

app.post(
  "/api/match",
  (req, res) => {

    try {

      const {
        dealId
      } = req.body;


      if (!dealId) {

        return res
          .status(400)
          .json({
            error:
              "dealId is required"
          });

      }


      const deal =
        deals.find(
          (item) =>
            item.id === dealId
        );


      if (!deal) {

        return res
          .status(404)
          .json({
            error:
              "Deal not found"
          });

      }


      // Keep the date fixed for
      // deterministic prototype results.
      const matches =
        matchLenders(
          deal,
          lenders,
          5,
          new Date(
            "2026-11-14"
          )
        );


      const matchesWithResponses =
        matches.map(
          (match) => {

            const response =
              simulateLenderResponse(
                deal,
                match.lender
              );


            return {
              ...match,
              response
            };

          }
        );


      const responses =
        matchesWithResponses.map(
          (match) =>
            match.response
        );


      const precisionAt5 =
        calculatePrecisionAt5(
          responses
        );


      return res.json({

        deal,

        matches:
          matchesWithResponses,

        metrics: {

          precisionAt5

        }

      });

    } catch (error) {

      console.error(
        "Matching error:",
        error
      );


      return res
        .status(500)
        .json({
          error:
            "Internal server error"
        });

    }

  }
);


// -----------------------------
// Start server
// -----------------------------

// app.listen(
//   PORT,
//   () => {

//     console.log(
//       `API server running on http://localhost:${PORT}`
//     );

//   }
// );


// Do not use app.listen() when deploying to Vercel, as Vercel handles the server startup automatically. Instead, export the app for Vercel to use.

export default app;