import { SimulatedResponse } from "./simulation";

export function calculatePrecisionAt5(
  responses: SimulatedResponse[]
): number {
  if (responses.length === 0) {
    return 0;
  }

  const interested = responses.filter(
    (response) => response.decision === "QUOTE"
  ).length;

  return interested / responses.length;
}