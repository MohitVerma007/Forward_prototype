```markdown
# Private Credit Matching & Feedback Loop Prototype

A synthetic prototype testing how credit fund responses (`QUOTE` or `PASS`) can be used as behavioral learning signals to improve future deal routing[cite: 1]. 

Instead of relying solely on a fund's stated mandate (e.g., max 70% LTV), this system tracks structured pass reasons over time to estimate a fund's **effective appetite** (e.g., ~64–66% LTV) and dynamically adjusts future recommendations[cite: 1].

---

## Core Workflow

The prototype intentionally skips unstructured document extraction—assuming deals arrive as structured JSON—to focus entirely on the matching and feedback engine[cite: 1]:

```text
Synthetic Deals + Fund Mandates
              │
              ▼
       Hard Eligibility      (Deterministic rule checks)
              │
              ▼
        Soft Ranking         (Weighted scoring signals)
              │
              ▼
       Top 5 Matches + Explainability & Warnings
              │
              ▼
    Simulated Fund Response
       ┌──────┴──────┐
       ▼             ▼
     QUOTE          PASS
                       │
                       ▼
                  Pass Reason (e.g., LTV_TOO_HIGH)
                       │
                       ▼
              Update Effective Mandate
                       │
                       ▼
              Better Next Match

```

---

## How It Works

### 1. Hard Eligibility (Deterministic)

Filters out funds that cannot theoretically finance the deal based on strict mandate constraints:

* Asset Type


* Geography


* Loan Amount


* LTV (Loan-to-Value)


* DSCR (Debt Service Coverage Ratio)


* Recourse Structure



Note: Learning signals never override hard eligibility constraints.

### 2. Soft Ranking (Baseline Model)

Eligible funds are scored and ranked using four weighted signals:

* **LTV Headroom (30%):** Distance between deal LTV and the fund's limit.


* **Loan Size Fit (25%):** Alignment within the fund's preferred ticket size.


* **Mandate Freshness (25%):** How recently the fund's criteria were updated.


* **Response Rate (20%):** Historical responsiveness of the fund.



### 3. Explainability & Risk Warnings

Every recommendation outputs a transparent breakdown explaining why a fund ranked where it did, alongside behavioral warnings:

```text
#1 Horizon Real Estate Credit — Score: 82.4
Why:
✓ Strong LTV headroom
✓ Loan size fits mandate
✓ Recently updated mandate
✓ Strong historical response rate

Warnings:
⚠ Deal is close to the fund's learned LTV boundary

```

### 4. Feedback Loop & Effective Appetite

When a simulated fund passes on a deal, the structured reason (`LTV_TOO_HIGH`, `TOO_LARGE`, `WRONG_STRUCTURE`, `WRONG_ASSET`, `OTHER`) is recorded. Rather than rewriting the official mandate from a single data point, the system blends official rules with recency-weighted behavioral observations to refine future rankings.

---

## Evaluation Metrics

The prototype evaluates **Static Mandate Matching** vs. **Feedback-Aware Matching** across multiple simulated rounds using:

* **Precision@5:** Share of top-5 recommended funds that return a positive `QUOTE`.


* **Hit Rate:** Percentage of deals that receive at least one positive response.


* **Pass Rate by Reason:** Tracking reductions in avoidable passes (like `LTV_TOO_HIGH`) over time.


* **Learning Curve:** Routing accuracy improvement across iterative simulation rounds.



---

## Author

**Mohit Verma** · Backend AI Engineer

```

```