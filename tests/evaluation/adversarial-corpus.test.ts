import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { adversarialCases, runAdversarialCorpus } from "@/src/evaluation/adversarial-corpus";

describe("private adversarial corpus", () => {
  it("defines and passes the ten required fictional adversarial cases", async () => {
    expect(adversarialCases.map(({ adversarialId }) => adversarialId)).toEqual([
      "ADV-001", "ADV-002", "ADV-003", "ADV-004", "ADV-005",
      "ADV-006", "ADV-007", "ADV-008", "ADV-009", "ADV-010",
    ]);
    const results = await runAdversarialCorpus();
    expect(results).toHaveLength(10);
    expect(results.every(({ passed }) => passed), results.filter(({ passed }) => !passed).map(({ adversarialId, detail }) => `${adversarialId}: ${detail}`).join("\n")).toBe(true);
  });

  it("renders prompt-like HTML and script content as inert escaped text", () => {
    const content = adversarialCases.find(({ adversarialId }) => adversarialId === "ADV-007")!.controlledContent;
    const html = renderToStaticMarkup(React.createElement("pre", null, content));
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("onerror=alert(1)");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
  });
});
