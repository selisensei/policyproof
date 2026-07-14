import { z } from "zod";

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".txt", ".md", ".json"] as const;
export const MAX_DOCUMENT_BYTES = 1024 * 1024;
export const MAX_DOCUMENT_COUNT = 10;
export const MAX_DOCUMENT_NAME_LENGTH = 160;
export const MAX_DOCUMENT_LINE_LENGTH = 20_000;

const ACCEPTED_MIME_TYPES: Record<(typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number], ReadonlySet<string>> = {
  ".txt": new Set(["text/plain"]),
  ".md": new Set(["text/markdown", "text/plain"]),
  ".json": new Set(["application/json", "text/json", "text/plain"]),
};

export const LocalDocumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(MAX_DOCUMENT_NAME_LENGTH),
  label: z.string().min(1),
  format: z.enum(["TEXT", "MARKDOWN", "JSON"]),
  inferredType: z.enum([
    "PURCHASE_ORDER",
    "INVOICE",
    "DELIVERY_NOTE",
    "WORKFLOW",
    "VENDOR_CHANGE",
    "OTHER",
  ]),
  size: z.number().int().nonnegative().max(MAX_DOCUMENT_BYTES),
  content: z.string().min(1),
});

export type LocalDocument = z.infer<typeof LocalDocumentSchema>;

type ReadableFile = {
  name: string;
  size: number;
  type?: string;
  text: () => Promise<string>;
};

export type LocalDocumentErrorCode =
  | "TOO_MANY"
  | "DUPLICATE_NAME"
  | "NAME_TOO_LONG"
  | "UNSUPPORTED_EXTENSION"
  | "TOO_LARGE"
  | "UNSUPPORTED_MIME"
  | "EMPTY"
  | "BINARY"
  | "UNSUPPORTED_ENCODING"
  | "LINE_TOO_LONG"
  | "INVALID_JSON";

export class LocalDocumentError extends Error {
  constructor(public readonly code: LocalDocumentErrorCode, message: string, public readonly filename?: string) {
    super(message);
    this.name = "LocalDocumentError";
  }
}

function extensionOf(name: string): (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number] | null {
  const normalized = name.toLowerCase();
  return ACCEPTED_DOCUMENT_EXTENSIONS.find((extension) => normalized.endsWith(extension)) ?? null;
}

function formatFor(extension: (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number]): LocalDocument["format"] {
  if (extension === ".md") return "MARKDOWN";
  if (extension === ".json") return "JSON";
  return "TEXT";
}

export function inferDocumentType(name: string, content: string): LocalDocument["inferredType"] {
  const searchable = `${name} ${content}`.toLowerCase();
  if (/purchase order|\bpo[-_ ]?\d/.test(searchable)) return "PURCHASE_ORDER";
  if (/invoice|\binv[-_ ]?\d/.test(searchable)) return "INVOICE";
  if (/delivery note|proof of delivery|\bdn[-_ ]?\d/.test(searchable)) return "DELIVERY_NOTE";
  if (/workflow|approver|approval/.test(searchable)) return "WORKFLOW";
  if (/vendor change|bank details|supplier change/.test(searchable)) return "VENDOR_CHANGE";
  return "OTHER";
}

export async function readLocalDocuments(
  files: ReadableFile[],
  createId: (file: ReadableFile, index: number) => string = (file, index) =>
    `LOCAL-${index + 1}-${file.name.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`,
): Promise<LocalDocument[]> {
  if (files.length > MAX_DOCUMENT_COUNT) {
    throw new LocalDocumentError("TOO_MANY", `Select no more than ${MAX_DOCUMENT_COUNT} files.`);
  }

  const normalizedNames = files.map((file) => file.name.normalize("NFC").toLocaleLowerCase());
  const duplicateName = normalizedNames.find((name, index) => normalizedNames.indexOf(name) !== index);
  if (duplicateName) {
    const duplicate = files[normalizedNames.lastIndexOf(duplicateName)];
    throw new LocalDocumentError("DUPLICATE_NAME", `${duplicate.name} is duplicated in the selection.`, duplicate.name);
  }

  return Promise.all(
    files.map(async (file, index) => {
      const extension = extensionOf(file.name);
      if (file.name.length > MAX_DOCUMENT_NAME_LENGTH) {
        throw new LocalDocumentError("NAME_TOO_LONG", `${file.name.slice(0, 40)}… exceeds the ${MAX_DOCUMENT_NAME_LENGTH}-character filename limit.`, file.name);
      }
      if (!extension) {
        throw new LocalDocumentError("UNSUPPORTED_EXTENSION", `${file.name} is not a supported .txt, .md, or .json file.`, file.name);
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        throw new LocalDocumentError("TOO_LARGE", `${file.name} exceeds the 1 MB file-size limit.`, file.name);
      }
      const mimeType = file.type?.toLowerCase().split(";", 1)[0].trim();
      if (mimeType && !ACCEPTED_MIME_TYPES[extension].has(mimeType)) {
        throw new LocalDocumentError("UNSUPPORTED_MIME", `${file.name} has an unsupported declared file type.`, file.name);
      }

      const content = (await file.text()).trim();
      if (!content) throw new LocalDocumentError("EMPTY", `${file.name} is empty.`, file.name);
      if (content.includes("\0")) throw new LocalDocumentError("BINARY", `${file.name} contains unsupported binary content.`, file.name);
      if (content.includes("\uFFFD")) throw new LocalDocumentError("UNSUPPORTED_ENCODING", `${file.name} is not valid supported UTF-8 text.`, file.name);
      if (content.split(/\r?\n/).some((line) => line.length > MAX_DOCUMENT_LINE_LENGTH)) {
        throw new LocalDocumentError("LINE_TOO_LONG", `${file.name} contains a line longer than ${MAX_DOCUMENT_LINE_LENGTH} characters.`, file.name);
      }
      if (extension === ".json") {
        try {
          JSON.parse(content);
        } catch {
          throw new LocalDocumentError("INVALID_JSON", `${file.name} is not valid JSON.`, file.name);
        }
      }

      return LocalDocumentSchema.parse({
        id: createId(file, index),
        name: file.name,
        label: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        format: formatFor(extension),
        inferredType: inferDocumentType(file.name, content),
        size: file.size,
        content,
      });
    }),
  );
}
