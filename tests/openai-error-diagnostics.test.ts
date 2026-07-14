import OpenAI from "openai";
import { describe, expect, it, vi } from "vitest";
import { createPolicyCompilationHandler } from "@/src/openai/api-handlers";
import {
  sanitizeOpenAIErrorMessage,
  type OpenAIErrorCategory,
  type OpenAIErrorDiagnostic,
  type SafeOpenAIError,
} from "@/src/openai/error-diagnostics";

const validPolicyText =
  "Invoices and purchase orders must use the same currency before a payment review can continue.";

type ExpectedError = {
  status: number;
  code: SafeOpenAIError["code"];
  category: OpenAIErrorCategory;
};

function apiError(options: {
  status: number;
  code: string;
  type?: string;
  param?: string | null;
  message: string;
  requestId?: string;
}): Error {
  const headers = new Headers();
  if (options.requestId) headers.set("x-request-id", options.requestId);
  return OpenAI.APIError.generate(
    options.status,
    {
      error: {
        code: options.code,
        type: options.type ?? "invalid_request_error",
        param: options.param ?? null,
        message: options.message,
      },
    },
    undefined,
    headers,
  );
}

async function handleError(error: unknown) {
  const diagnostics: OpenAIErrorDiagnostic[] = [];
  const handler = createPolicyCompilationHandler({
    isConfigured: () => true,
    compile: vi.fn().mockRejectedValue(error),
    createCorrelationId: () => "pp-test-correlation",
    logDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
  });
  const response = await handler(
    new Request("http://localhost/api/ai/policy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ policyText: validPolicyText }),
    }),
  );
  return { response, body: await response.json(), diagnostic: diagnostics[0] };
}

describe("OpenAI error classification", () => {
  it.each<{
    label: string;
    error: () => unknown;
    expected: ExpectedError;
  }>([
    {
      label: "401 authentication",
      error: () =>
        apiError({
          status: 401,
          code: "invalid_api_key",
          message: "Incorrect API key provided.",
          requestId: "req_auth",
        }),
      expected: { status: 401, code: "AI_AUTHENTICATION_ERROR", category: "authentication" },
    },
    {
      label: "403 permission",
      error: () =>
        apiError({
          status: 403,
          code: "permission_denied",
          message: "Project cannot access this model.",
          requestId: "req_permission",
        }),
      expected: { status: 403, code: "AI_PERMISSION_ERROR", category: "permission" },
    },
    {
      label: "404 model access",
      error: () =>
        apiError({
          status: 404,
          code: "model_not_found",
          message: "The model does not exist or this project has no model access.",
          requestId: "req_model",
        }),
      expected: { status: 403, code: "AI_PERMISSION_ERROR", category: "permission" },
    },
    {
      label: "429 quota",
      error: () =>
        apiError({
          status: 429,
          code: "insufficient_quota",
          message: "The project has exceeded its current quota.",
          requestId: "req_quota",
        }),
      expected: { status: 429, code: "AI_BILLING_QUOTA_ERROR", category: "billing_or_quota" },
    },
    {
      label: "429 rate limit",
      error: () =>
        apiError({
          status: 429,
          code: "rate_limit_exceeded",
          message: "Rate limit reached.",
          requestId: "req_rate",
        }),
      expected: { status: 429, code: "AI_RATE_LIMIT_ERROR", category: "rate_limit" },
    },
    {
      label: "400 structured-output schema",
      error: () =>
        apiError({
          status: 400,
          code: "invalid_json_schema",
          param: "text.format.schema",
          message: "Invalid schema for response format.",
          requestId: "req_schema",
        }),
      expected: { status: 502, code: "AI_SCHEMA_ERROR", category: "schema" },
    },
    {
      label: "connection",
      error: () => new OpenAI.APIConnectionError({ message: "fetch failed" }),
      expected: { status: 503, code: "AI_CONNECTION_ERROR", category: "connection" },
    },
    {
      label: "timeout",
      error: () => new OpenAI.APIConnectionTimeoutError({ message: "Request timed out" }),
      expected: { status: 504, code: "AI_TIMEOUT_ERROR", category: "timeout" },
    },
    {
      label: "5xx provider failure",
      error: () =>
        apiError({
          status: 503,
          code: "server_error",
          message: "The provider is temporarily unavailable.",
          requestId: "req_provider",
        }),
      expected: { status: 502, code: "AI_PROVIDER_ERROR", category: "provider" },
    },
  ])("maps $label errors safely", async ({ error, expected }) => {
    const { response, body, diagnostic } = await handleError(error());

    expect(response.status).toBe(expected.status);
    expect(body).toMatchObject({
      error: {
        code: expected.code,
        category: expected.category,
        correlationId: "pp-test-correlation",
      },
    });
    expect(diagnostic).toMatchObject({
      operation: "policy_compilation",
      category: expected.category,
      correlationId: "pp-test-correlation",
    });
  });

  it("redacts credentials and authorization values from diagnostics and responses", async () => {
    const fakeKey = ["sk", "proj", "diagnostic", "secret", "value"].join("-");
    const bearerValue = ["bearer", "diagnostic", "token"].join("-");
    const message = `Incorrect API key provided: ${fakeKey}; Authorization: Bearer ${bearerValue}`;
    const { body, diagnostic } = await handleError(
      apiError({ status: 401, code: "invalid_api_key", message, requestId: "req_redaction" }),
    );

    expect(diagnostic.sanitizedMessage).toContain("[REDACTED_API_KEY]");
    expect(diagnostic.sanitizedMessage).toContain("Authorization: [REDACTED]");
    expect(JSON.stringify(diagnostic)).not.toContain(fakeKey);
    expect(JSON.stringify(diagnostic)).not.toContain(bearerValue);
    expect(JSON.stringify(body)).not.toContain(fakeKey);
    expect(JSON.stringify(body)).not.toContain(bearerValue);
    expect(body.error.requestId).toBe("req_redaction");
  });

  it("limits sanitized provider messages", () => {
    expect(sanitizeOpenAIErrorMessage("x".repeat(800))).toHaveLength(500);
  });
});
