import { describe, expect, it } from "vitest";
import {
  LocalDocumentError,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_COUNT,
  MAX_DOCUMENT_NAME_LENGTH,
  MAX_DOCUMENT_LINE_LENGTH,
  inferDocumentType,
  readLocalDocuments,
} from "@/src/lib/local-documents";

function mockFile(name: string, content: string, size = content.length, type = "") {
  return { name, size, type, text: async () => content };
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

  it("rejects empty files, duplicate names, excessive counts, and long filenames", async () => {
    await expect(readLocalDocuments([mockFile("empty.txt", "   ")])).rejects.toThrow("is empty");
    await expect(
      readLocalDocuments([mockFile("Invoice.txt", "first"), mockFile("invoice.TXT", "second")]),
    ).rejects.toThrow("duplicated");
    await expect(
      readLocalDocuments(Array.from({ length: MAX_DOCUMENT_COUNT + 1 }, (_, index) => mockFile(`${index}.txt`, "value"))),
    ).rejects.toThrow("no more than 10");
    await expect(
      readLocalDocuments([mockFile(`${"x".repeat(MAX_DOCUMENT_NAME_LENGTH)}.txt`, "value")]),
    ).rejects.toThrow("filename limit");
  });

  it("accepts UTF-8 text and compatible MIME types but rejects a mismatched declared type", async () => {
    const [document] = await readLocalDocuments([
      mockFile("vérification.md", "Société : Étoile. Montant : 10 000 €.", undefined, "text/markdown; charset=utf-8"),
    ]);
    expect(document.content).toContain("Étoile");
    await expect(
      readLocalDocuments([mockFile("disguised.txt", "<script>alert(1)</script>", undefined, "text/html")]),
    ).rejects.toThrow("unsupported declared file type");
  });

  it("keeps HTML-like text inert as plain document content", async () => {
    const [document] = await readLocalDocuments([
      mockFile("notes.txt", "<img src=x onerror=alert(1)>", undefined, "text/plain"),
    ]);
    expect(document.content).toBe("<img src=x onerror=alert(1)>");
  });

  it("rejects unsupported decoding markers, null characters, and excessively long lines", async () => {
    await expect(readLocalDocuments([mockFile("encoding.txt", "Amount: \uFFFD")])).rejects.toThrow("UTF-8");
    await expect(readLocalDocuments([mockFile("binary.txt", "Amount:\0 100")])).rejects.toThrow("binary");
    await expect(readLocalDocuments([mockFile("long.txt", "x".repeat(MAX_DOCUMENT_LINE_LENGTH + 1))])).rejects.toThrow("line longer");
  });

  it("uses document content to resist a misleading filename", async () => {
    const [document] = await readLocalDocuments([mockFile("invoice-notes.txt", "Purchase order PO-1042 amount: 12,480 EUR.")]);
    expect(document.inferredType).toBe("PURCHASE_ORDER");
  });

  it("infers the supported business document labels", () => {
    expect(inferDocumentType("PO-1042.txt", "Purchase order")).toBe("PURCHASE_ORDER");
    expect(inferDocumentType("notes.txt", "Independent bank details change")).toBe("VENDOR_CHANGE");
  });
});
