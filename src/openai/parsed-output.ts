import { OpenAIIntegrationError } from "@/src/openai/errors";

type ParsedResponse<T> = {
  output_parsed?: T | null;
  status?: string;
  incomplete_details?: unknown;
  output?: unknown;
};

export function requireParsedOutput<T>(response: ParsedResponse<T>, operation: string): T {
  if (response.output_parsed) return response.output_parsed;

  const refused = Array.isArray(response.output) && response.output.some((item) => {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) return false;
    return item.content.some((content: unknown) => Boolean(content && typeof content === "object" && "type" in content && content.type === "refusal"));
  });
  if (refused) throw new OpenAIIntegrationError(`GPT-5.6 refused the ${operation} request; no structured output was accepted.`);
  if (response.status === "incomplete" || response.incomplete_details) {
    throw new OpenAIIntegrationError(`GPT-5.6 returned an incomplete ${operation} response; no structured output was accepted.`);
  }
  throw new OpenAIIntegrationError(`GPT-5.6 returned no validated ${operation} output.`);
}
