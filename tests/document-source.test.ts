import { describe, expect, it } from "vitest";
import { computeDocumentContentHash, locateExactExcerpt } from "@/src/lib/document-source";

describe("full source evidence helpers", () => {
  it("locates only the exact excerpt and preserves the complete source", () => {
    const content = "Header\nPurchase order amount: 12,480 EUR.\nFooter";
    const excerpt = "Purchase order amount: 12,480 EUR.";
    const located = locateExactExcerpt(content, excerpt);

    expect(located).toEqual({ before: "Header\n", match: excerpt, after: "\nFooter" });
    expect(`${located?.before}${located?.match}${located?.after}`).toBe(content);
  });

  it("fails closed for missing, altered, or whitespace-only excerpts", () => {
    const content = "Invoice amount: 12,480 USD.";
    expect(locateExactExcerpt(content, "Invoice amount: 12,480 EUR.")).toBeNull();
    expect(locateExactExcerpt(content, "invoice amount: 12,480 USD.")).toBeNull();
    expect(locateExactExcerpt(content, "   ")).toBeNull();
  });

  it("computes a stable lowercase SHA-256 over the exact UTF-8 content", async () => {
    const hash = await computeDocumentContentHash("PolicyProof");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(await computeDocumentContentHash("PolicyProof"));
    expect(hash).not.toBe(await computeDocumentContentHash("PolicyProof\n"));
  });
});
