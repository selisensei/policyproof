import "server-only";

import OpenAI from "openai";
import { OPENAI_REQUEST_TIMEOUT_MS } from "@/src/openai/config";
import { OpenAIConfigurationError } from "@/src/openai/errors";

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new OpenAIConfigurationError();

  return new OpenAI({
    apiKey,
    maxRetries: 1,
    timeout: OPENAI_REQUEST_TIMEOUT_MS,
  });
}
