export type RecourseType =
  | "FULL"
  | "PARTIAL"
  | "NON_RECOURSE";

export interface Lender {
  id: string;
  name: string;

  fundType: string;

  statedMandate: {
    minLoanAmount: number;
    maxLoanAmount: number;

    assetTypes: string[];
    geographies: string[];

    maxLtv: number;
    minDscr: number;

    acceptedRecourse: RecourseType[];
  };

  revealedMandate: {
    effectiveMaxLtv: number;
    effectiveMaxLoanAmount: number;
  };

  behavior: {
    responseRate: number;
    lastUpdated: string;
  };
  hiddenPreference: {
    trueMaxLtv: number;
    trueMaxLoanAmount: number;
  };
}