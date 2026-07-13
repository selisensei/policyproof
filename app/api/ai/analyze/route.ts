import { createCaseAnalysisHandler } from "@/src/openai/api-handlers";
import { analyzeCaseWithOpenAI } from "@/src/openai/case-analyzer";
import { getOpenAIClient, isOpenAIConfigured } from "@/src/openai/client";

export const runtime = "nodejs";

export const POST = createCaseAnalysisHandler({
  isConfigured: isOpenAIConfigured,
  analyze: (request) => analyzeCaseWithOpenAI(getOpenAIClient(), request),
});
