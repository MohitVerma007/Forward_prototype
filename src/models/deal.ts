import { RecourseType } from "./lender";

export type LoanPurpose =
  | "ACQUISITION"
  | "REFINANCE"
  | "CONSTRUCTION";

export interface Deal {
  id: string;

  assetType: string;
  propertySubtype: string;
  geography: string;

  loanAmount: number;
  ltv: number;
  dscr: number;

  loanPurpose: LoanPurpose;
  termMonths: number;

  recourse: RecourseType;
}