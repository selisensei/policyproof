import { createPolicyCompilationHandler } from "@/src/openai/api-handlers";
import { getOpenAIClient, isOpenAIConfigured } from "@/src/openai/client";
import { compilePolicyWithOpenAI } from "@/src/openai/policy-compiler";

export const runtime = "nodejs";

export const POST = createPolicyCompilationHandler({
  isConfigured: isOpenAIConfigured,
  compile: (policyText) => compilePolicyWithOpenAI(getOpenAIClient(), policyText),
});
