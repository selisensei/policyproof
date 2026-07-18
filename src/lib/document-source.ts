export type ExactExcerptMatch = {
  before: string;
  match: string;
  after: string;
};

export function locateExactExcerpt(content: string, excerpt: string): ExactExcerptMatch | null {
  if (!excerpt.trim()) return null;
  const index = content.indexOf(excerpt);
  if (index < 0) return null;
  return {
    before: content.slice(0, index),
    match: excerpt,
    after: content.slice(index + excerpt.length),
  };
}

export async function computeDocumentContentHash(content: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto SHA-256 is unavailable in this runtime.");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}
