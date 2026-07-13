import { describe, expect, it } from "vitest";
import {
  ControlDefinitionSchema,
  ControlResultSchema,
  ControlStatusSchema,
} from "@/src/domain/schemas";
import { demoControls, demoDocuments } from "@/src/fixtures/demo-case";
import { runDeterministicReview } from "@/src/lib/review-engine";

describe("domain schemas", () => {
  it("accepts every demo control definition", () => {
    expect(() => demoControls.forEach((control) => ControlDefinitionSchema.parse(control))).not.toThrow();
  });

  it("supports exactly the four required result statuses", () => {
    expect(ControlStatusSchema.options).toEqual(["PASS", "FAIL", "MISSING", "WARNING"]);
    expect(ControlStatusSchema.safeParse("UNKNOWN").success).toBe(false);
  });

  it("validates every deterministic control result", () => {
    const results = runDeterministicReview(demoControls, demoDocuments);
    expect(results).toHaveLength(7);
    expect(() => results.forEach((result) => ControlResultSchema.parse(result))).not.toThrow();
  });
});
