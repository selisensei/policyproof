import { demoPolicy } from "@/src/fixtures/demo-case";

export type PolicyEvaluationFixture = {
  id: string;
  label: string;
  policyText: string;
  expectation: "VALID" | "INVALID";
  expectedThemes: string[];
};

export const policyEvaluationFixtures: PolicyEvaluationFixture[] = [
  { id: "seven-rule-procurement", label: "Current seven-rule procurement policy", policyText: demoPolicy.text, expectation: "VALID", expectedThemes: ["approval", "timing", "amount", "currency", "delivery", "bank verification", "segregation of duties"] },
  { id: "documented-exception", label: "Policy with an exception", policyText: "Invoices must match purchase orders. A documented emergency exception may be accepted only by the Finance Director, with the exception reason retained in the case file.", expectation: "VALID", expectedThemes: ["amount match", "documented exception"] },
  { id: "ambiguous-wording", label: "Policy with ambiguous wording", policyText: "Large purchases should normally receive appropriate approval before processing, unless circumstances make that impractical.", expectation: "VALID", expectedThemes: ["semantic review", "ambiguity"] },
  { id: "monetary-threshold", label: "Policy with a monetary threshold", policyText: "Transactions above EUR 25,000 require three distinct approvers before the invoice can proceed to payment review.", expectation: "VALID", expectedThemes: ["approval threshold", "EUR 25,000", "three approvers"] },
  { id: "documentary-evidence", label: "Policy requiring documentary evidence", policyText: "Every invoice review must contain a purchase order and dated delivery note. Missing documentary evidence must stop the review.", expectation: "VALID", expectedThemes: ["purchase order", "delivery evidence"] },
  { id: "empty-policy", label: "Malformed empty policy", policyText: "", expectation: "INVALID", expectedThemes: [] },
];
