export type VisaModelTypes = {
  results: "Negative" | "Unknown" | "Positive" | undefined,
  origin: string,
  destination: string,
  action: () => void
}