import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CONTROL_REFERENCE_REGISTRY,
  requireRegisteredControlReference,
  resolveControlReference,
} from "@/src/domain/control-references";
import { demoControls, demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { serializeDecisionReceipt, serializeDecisionReceiptMarkdown, serializeEvidenceMatrixCsv } from "@/src/lib/receipt-export";
import { runDeterministicReview } from "@/src/lib/review-engine";

describe("traceability contracts", () => {
  it("keeps stable control IDs and display references unique", () => {
    const ids = CONTROL_REFERENCE_REGISTRY.map((entry) => entry.controlId);
    const references = CONTROL_REFERENCE_REGISTRY.map((entry) => entry.displayReference);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(references).size).toBe(references.length);
    expect(requireRegisteredControlReference("CTRL-APPROVAL")).toEqual({
      controlId: "CTRL-APPROVAL",
      displayReference: "CTRL-01",
      mapped: true,
    });
  });

  it("falls back safely for an unregistered live control and rejects strict lookup", () => {
    expect(resolveControlReference("PVC-004")).toEqual({
      controlId: "PVC-004",
      displayReference: "PVC-004",
      mapped: false,
    });
    expect(() => requireRegisteredControlReference("PVC-004")).toThrow(/No registered display reference/);
    expect(() => resolveControlReference(" ")).toThrow(/non-empty stable control ID/);
  });

  it("preserves both identifiers in JSON, Markdown, and CSV exports", () => {
    const results = runDeterministicReview(demoControls, demoDocuments);
    const receipt = createDecisionReceipt({
      results,
      policyName: demoPolicy.title,
      policyVersion: demoPolicy.version,
      caseName: "Northstar Facilities — Mixed-Risk Case",
      selectedLanguage: "en",
      runMode: "DETERMINISTIC_DEMO",
      generatedAt: "2026-07-16T08:00:00.000Z",
      enabledControlCount: 7,
    });
    const json = serializeDecisionReceipt(receipt);
    const markdown = serializeDecisionReceiptMarkdown(receipt);
    const csv = serializeEvidenceMatrixCsv({ caseName: receipt.caseName, results, locale: "en" });

    expect(receipt.outcomes[0]).toMatchObject({ controlId: "CTRL-APPROVAL", displayReference: "CTRL-01" });
    expect(json).toContain('"controlId": "CTRL-APPROVAL"');
    expect(json).toContain('"displayReference": "CTRL-01"');
    expect(markdown).toContain("| CTRL-01 | CTRL-APPROVAL | Approval threshold |");
    expect(csv).toContain("Control reference,Technical control ID");
    expect(csv).toContain("CTRL-01,CTRL-APPROVAL,Approval threshold");
  });

  it("documents the correct live-validation commit and redesign baseline", () => {
    const report = readFileSync(new URL("../docs/evaluation/LIVE_GPT56_VALIDATION.md", import.meta.url), "utf8");
    expect(report).toContain("eb120feaca78bf3cdbc71b7b7198045f86a44852");
    expect(report).toContain("Validation commit");
    expect(report).toContain("76c6ce62a0fdbefa721e40d6f321fcea4b9e8db4");
    expect(report).toContain("Application baseline used for the supervised run");
  });
});
