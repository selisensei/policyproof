import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  PolicyCompilationRequestSchema,
  PolicyCompilationSchema,
  type PolicyCompilation,
} from "@/src/domain/ai-schemas";
import { OPENAI_MODEL, OPENAI_REASONING_EFFORT, OPENAI_REQUEST_TIMEOUT_MS } from "@/src/openai/config";
import { OpenAIIntegrationError } from "@/src/openai/errors";

const POLICY_COMPILER_INSTRUCTIONS = `You compile business policy text into reviewable controls for a human reviewer.
Return only structured output. Do not approve transactions or issue a compliance certification.
Use deterministic control types for amount, currency, date, approval-count, document-presence, and equality checks.
Use SEMANTIC_REVIEW only when the policy requires interpretation that deterministic code cannot perform.
Every proposed control remains unapproved until a human reviews it.`;

export async function compilePolicyWithOpenAI(
  client: OpenAI,
  policyTextInput: string,
): Promise<PolicyCompilation> {
  const { policyText } = PolicyCompilationRequestSchema.parse({ policyText: policyTextInput });
  const response = await client.responses.parse(
    {
      model: OPENAI_MODEL,
      reasoning: { effort: OPENAI_REASONING_EFFORT },
      instructions: POLICY_COMPILER_INSTRUCTIONS,
      input: policyText,
      store: false,
      text: { format: zodTextFormat(PolicyCompilationSchema, "policy_compilation") },
    },
    { timeout: OPENAI_REQUEST_TIMEOUT_MS },
  );

  if (!response.output_parsed) {
    throw new OpenAIIntegrationError("GPT-5.6 returned no validated policy controls.");
  }

  return PolicyCompilationSchema.parse(response.output_parsed);
}
