import { z } from "zod";

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".txt", ".md", ".json"] as const;
export const MAX_DOCUMENT_BYTES = 1024 * 1024;
export const MAX_DOCUMENT_COUNT = 10;

export const LocalDocumentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
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
  text: () => Promise<string>;
};

export class LocalDocumentError extends Error {}

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
    throw new LocalDocumentError(`Select no more than ${MAX_DOCUMENT_COUNT} files.`);
  }

  return Promise.all(
    files.map(async (file, index) => {
      const extension = extensionOf(file.name);
      if (!extension) {
        throw new LocalDocumentError(`${file.name} is not a supported .txt, .md, or .json file.`);
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        throw new LocalDocumentError(`${file.name} exceeds the 1 MB file-size limit.`);
      }

      const content = (await file.text()).trim();
      if (!content) throw new LocalDocumentError(`${file.name} is empty.`);
      if (extension === ".json") {
        try {
          JSON.parse(content);
        } catch {
          throw new LocalDocumentError(`${file.name} is not valid JSON.`);
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
