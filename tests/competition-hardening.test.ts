import { describe, expect, it } from "vitest";
import { appendAuditEvent, createAuditEvent, validateAuditTrail } from "@/src/lib/audit-trail";
import { buildScenarioControls, buildScenarioDocuments } from "@/src/domain/scenario-schema";
import { meridianScenario } from "@/src/fixtures/scenarios";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { serializeEvidenceMatrixCsv } from "@/src/lib/receipt-export";

describe("competition hardening contracts", () => {
  it("creates a bounded, sanitized, schema-validated audit trail", () => {
    const event = createAuditEvent({
      action: "REVIEW_RUN",
      scenarioId: "meridian-clean-procurement",
      description: "Evaluated\nseven\tcontrols without document bodies.",
      timestamp: "2026-07-14T08:00:00.000Z",
    });
    expect(event.description).toBe("Evaluated seven controls without document bodies.");
    expect(appendAuditEvent([], event)).toEqual([event]);
    expect(validateAuditTrail([{ unsafe: true }])).toEqual([]);
    expect(() => createAuditEvent({ ...event, description: "" })).toThrow();
  });

  it("keeps only the 100 most recent safe audit events", () => {
    let events = [] as ReturnType<typeof validateAuditTrail>;
    for (let index = 0; index < 105; index += 1) {
      const timestamp = new Date(Date.UTC(2026, 6, 14, 8, 0, index)).toISOString();
      events = appendAuditEvent(events, createAuditEvent({ action: "REVIEW_RUN", scenarioId: "meridian-clean-procurement", description: `Run ${index}`, timestamp }));
    }
    expect(events).toHaveLength(100);
    expect(events[0].description).toBe("Run 5");
  });

  it("exports a UTF-8 CSV evidence matrix with correct escaping and reviewer fields", () => {
    const results = runDeterministicReview(buildScenarioControls(meridianScenario), buildScenarioDocuments(meridianScenario));
    const first = results[0];
    const reviewed = { ...first, title: 'Approval, "independent"', reviewerDecision: { state: "CONFIRMED" as const, comment: "Vérifié, ligne 1\nligne 2" } };
    const csv = serializeEvidenceMatrixCsv({ caseName: "Meridian — dossier", results: [reviewed], locale: "fr" });
    expect(csv.startsWith("\uFEFFCas,Référence du contrôle,ID technique du contrôle")).toBe(true);
    expect(csv).toContain('"Approval, ""independent"""');
    expect(csv).toContain('"Vérifié, ligne 1\nligne 2"');
    expect(csv).toContain("CONFIRMED");
    expect(csv).not.toContain("OPENAI_API_KEY");
  });
});
