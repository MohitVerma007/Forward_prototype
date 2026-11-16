import "./style.css";

interface Deal {
  id: string;
  assetType: string;
  propertySubtype: string;
  geography: string;
  loanAmount: number;
  ltv: number;
  dscr: number;
  loanPurpose: string;
  termMonths: number;
  recourse: string;
}

interface MatchResult {
  lender: {
    id: string;
    name: string;
    fundType: string;
  };

  score: {
    ltvHeadroom: number;
    sizeFit: number;
    mandateFreshness: number;
    responseRate: number;
    totalScore: number;
  };

  explanation: {
    positiveSignals: string[];
    warnings: string[];
  };

  response: {
    decision: "QUOTE" | "PASS";
    reason?: string;
  };
}

interface MatchApiResponse {
  deal: Deal;

  matches: MatchResult[];

  metrics: {
    precisionAt5: number;
  };
}


const API_URL =
  import.meta.env.VITE_API_URL;


const dealSelect =
  document.querySelector<HTMLSelectElement>(
    "#deal-select"
  );

const dealId =
  document.querySelector<HTMLElement>(
    "#deal-id"
  );

const assetType =
  document.querySelector<HTMLElement>(
    "#asset-type"
  );

const geography =
  document.querySelector<HTMLElement>(
    "#geography"
  );

const loanAmount =
  document.querySelector<HTMLElement>(
    "#loan-amount"
  );

const ltv =
  document.querySelector<HTMLElement>(
    "#ltv"
  );

const dscr =
  document.querySelector<HTMLElement>(
    "#dscr"
  );

const recourse =
  document.querySelector<HTMLElement>(
    "#recourse"
  );

const findLendersButton =
  document.querySelector<HTMLButtonElement>(
    "#find-lenders-btn"
  );

const matchesContainer =
  document.querySelector<HTMLElement>(
    "#matches-container"
  );

const precision =
  document.querySelector<HTMLElement>(
    "#precision"
  );

const hitRate =
  document.querySelector<HTMLElement>(
    "#hit-rate"
  );

const passRate =
  document.querySelector<HTMLElement>(
    "#pass-rate"
  );


let deals: Deal[] = [];


function formatLoanAmount(
  amount: number
): string {
  return `$${(
    amount / 1_000_000
  ).toFixed(1)}M`;
}


function updateDealSummary(
  deal: Deal
): void {

  if (dealId) {
    dealId.textContent =
      deal.id;
  }

  if (assetType) {
    assetType.textContent =
      deal.assetType;
  }

  if (geography) {
    geography.textContent =
      deal.geography;
  }

  if (loanAmount) {
    loanAmount.textContent =
      formatLoanAmount(
        deal.loanAmount
      );
  }

  if (ltv) {
    ltv.textContent =
      `${deal.ltv}%`;
  }

  if (dscr) {
    dscr.textContent =
      `${deal.dscr}x`;
  }

  if (recourse) {
    recourse.textContent =
      deal.recourse;
  }
}


function findDeal(
  id: string
): Deal | undefined {

  return deals.find(
    (deal) =>
      deal.id === id
  );
}


function populateDealDropdown(): void {

  if (!dealSelect) {
    return;
  }

  dealSelect.innerHTML = "";

  for (const deal of deals) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      deal.id;

    option.textContent =
      `${deal.id} — ` +
      `${deal.assetType} · ` +
      `${deal.geography} · ` +
      `${formatLoanAmount(
        deal.loanAmount
      )}`;

    dealSelect.appendChild(
      option
    );
  }
}


function renderLoading(): void {

  if (!matchesContainer) {
    return;
  }

  matchesContainer.innerHTML = `
    <div style="
      padding: 40px;
      text-align: center;
      color: #7b8496;
    ">
      Finding the best lender matches...
    </div>
  `;
}


function renderEmptyState(
  message: string
): void {

  if (!matchesContainer) {
    return;
  }

  matchesContainer.innerHTML = `
    <div style="
      padding: 40px;
      text-align: center;
      color: #7b8496;
    ">
      ${message}
    </div>
  `;
}


function renderMatches(
  data: MatchApiResponse
): void {

  if (!matchesContainer) {
    return;
  }

  const matches =
    data.matches;


  if (matches.length === 0) {

    renderEmptyState(
      "No eligible lenders found for this deal."
    );

    updateMetrics(
      data
    );

    return;
  }


  matchesContainer.innerHTML =
    matches
      .map(
        (match, index) => {

          const positiveSignals =
            match.explanation
              .positiveSignals
              .map(
                (signal) => `
                  <div class="signal positive">
                    <span>✓</span>
                    ${signal}
                  </div>
                `
              )
              .join("");


          const warnings =
            match.explanation
              .warnings
              .map(
                (warning) => `
                  <div class="signal warning">
                    <span>⚠</span>
                    ${warning}
                  </div>
                `
              )
              .join("");


          const responseClass =
            match.response.decision ===
            "QUOTE"
              ? "quote"
              : "pass";


          const reason =
            match.response.reason
              ? `
                <span class="pass-reason">
                  ${match.response.reason}
                </span>
              `
              : "";


          return `
            <article class="lender-card">

              <div class="lender-header">

                <div class="rank">
                  #${index + 1}
                </div>

                <div class="lender-info">

                  <h3>
                    ${match.lender.name}
                  </h3>

                  <span>
                    ${match.lender.fundType}
                  </span>

                </div>

                <div class="score">

                  <span>
                    Score
                  </span>

                  <strong>
                    ${match.score.totalScore.toFixed(2)}
                  </strong>

                </div>

              </div>


              <div class="match-content">

                <div class="signals">

                  <h4>
                    Why matched
                  </h4>

                  ${positiveSignals}
                  ${warnings}

                </div>


                <div class="response">

                  <span class="response-label">
                    Simulated Response
                  </span>

                  <span class="response-badge ${responseClass}">
                    ${match.response.decision}
                  </span>

                  ${reason}

                </div>

              </div>

            </article>
          `;
        }
      )
      .join("");


  updateMetrics(
    data
  );
}


function updateMetrics(
  data: MatchApiResponse
): void {

  const responses =
    data.matches.map(
      (match) =>
        match.response
    );


  const quotes =
    responses.filter(
      (response) =>
        response.decision ===
        "QUOTE"
    ).length;


  const passes =
    responses.filter(
      (response) =>
        response.decision ===
        "PASS"
    ).length;


  const total =
    responses.length;


  if (precision) {

    precision.textContent =
      `${(
        data.metrics
          .precisionAt5 * 100
      ).toFixed(0)}%`;
  }


  if (hitRate) {

    hitRate.textContent =
      quotes > 0
        ? "100%"
        : "0%";
  }


  if (passRate) {

    passRate.textContent =
      total > 0
        ? `${(
            (passes / total) * 100
          ).toFixed(0)}%`
        : "0%";
  }
}


async function findLenders(): Promise<void> {

  if (!dealSelect) {
    return;
  }


  const selectedDeal =
    findDeal(
      dealSelect.value
    );


  if (!selectedDeal) {
    return;
  }


  updateDealSummary(
    selectedDeal
  );


  renderLoading();


  if (findLendersButton) {

    findLendersButton.disabled =
      true;

    findLendersButton.textContent =
      "Finding...";
  }


  try {

    const response =
      await fetch(
        `${API_URL}/api/match`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            dealId:
              selectedDeal.id
          })
        }
      );


    if (!response.ok) {

      throw new Error(
        `API error: ${response.status}`
      );
    }


    const data:
      MatchApiResponse =
      await response.json();


    renderMatches(
      data
    );


  } catch (error) {

    console.error(
      "Matching request failed:",
      error
    );


    renderEmptyState(
      "Could not connect to the matching API. Make sure the backend server is running on port 3000."
    );

  } finally {

    if (findLendersButton) {

      findLendersButton.disabled =
        false;

      findLendersButton.textContent =
        "Find Lenders";
    }
  }
}


dealSelect?.addEventListener(
  "change",
  () => {

    if (!dealSelect) {
      return;
    }

    const selectedDeal =
      findDeal(
        dealSelect.value
      );


    if (!selectedDeal) {
      return;
    }


    updateDealSummary(
      selectedDeal
    );
  }
);


findLendersButton?.addEventListener(
  "click",
  findLenders
);


async function loadDeals(): Promise<void> {

  try {

    const response =
      await fetch(
        "/data/deals.json"
      );


    if (!response.ok) {

      throw new Error(
        `Failed to load deals: ${response.status}`
      );
    }


    deals =
      await response.json();


    if (deals.length === 0) {

      throw new Error(
        "No deals found"
      );
    }


    populateDealDropdown();


    const firstDeal =
      deals[0];


    if (dealSelect) {

      dealSelect.value =
        firstDeal.id;
    }


    updateDealSummary(
      firstDeal
    );


  } catch (error) {

    console.error(
      "Failed to load deals:",
      error
    );

    renderEmptyState(
      "Failed to load deals."
    );
  }
}


loadDeals();