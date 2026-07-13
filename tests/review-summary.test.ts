import { describe, expect, it } from "vitest";
import { demoControls, demoDocuments } from "@/src/fixtures/demo-case";
import { filterResults, summarizeResults } from "@/src/lib/review-summary";
import { runDeterministicReview } from "@/src/lib/review-engine";

const results = runDeterministicReview(demoControls, demoDocuments);

describe("review summary and filtering", () => {
  it("counts every deterministic status", () => {
    expect(summarizeResults(results)).toMatchObject({
      PASS: 3,
      FAIL: 2,
      MISSING: 1,
      WARNING: 1,
      total: 7,
      reviewed: 0,
      pending: 7,
    });
  });

  it("filters results without changing their order", () => {
    expect(filterResults(results, "FAIL").map((result) => result.controlId)).toEqual([
      "CTRL-APPROVAL",
      "CTRL-CURRENCY",
    ]);
    expect(filterResults(results, "ALL")).toEqual(results);
  });
});
