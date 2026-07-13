import { describe, expect, it } from "vitest";
import {
  LocalDocumentError,
  MAX_DOCUMENT_BYTES,
  inferDocumentType,
  readLocalDocuments,
} from "@/src/lib/local-documents";

function mockFile(name: string, content: string, size = content.length) {
  return { name, size, text: async () => content };
}

describe("local document handling", () => {
  it("reads supported text files and infers a document type", async () => {
    const documents = await readLocalDocuments(
      [mockFile("invoice.md", "Invoice amount: 12,480 USD.")],
      () => "LOCAL-1",
    );
    expect(documents[0]).toMatchObject({
      id: "LOCAL-1",
      format: "MARKDOWN",
      inferredType: "INVOICE",
    });
  });

  it("rejects unsupported file types and oversized files", async () => {
    await expect(readLocalDocuments([mockFile("invoice.csv", "value")])).rejects.toBeInstanceOf(
      LocalDocumentError,
    );
    await expect(
      readLocalDocuments([mockFile("large.txt", "content", MAX_DOCUMENT_BYTES + 1)]),
    ).rejects.toThrow("exceeds the 1 MB");
  });

  it("rejects malformed JSON", async () => {
    await expect(readLocalDocuments([mockFile("case.json", "{broken")])).rejects.toThrow(
      "not valid JSON",
    );
  });

  it("infers the supported business document labels", () => {
    expect(inferDocumentType("PO-1042.txt", "Purchase order")).toBe("PURCHASE_ORDER");
    expect(inferDocumentType("notes.txt", "Independent bank details change")).toBe("VENDOR_CHANGE");
  });
});
