import { ZodError } from "zod";
import { OpenAIIntegrationError } from "@/src/openai/errors";

export type OpenAIErrorCategory =
  | "authentication"
  | "permission"
  | "billing_or_quota"
  | "rate_limit"
  | "schema"
  | "timeout"
  | "connection"
  | "provider"
  | "unknown";

export type OpenAIOperation = "policy_compilation" | "case_analysis";

export type OpenAIErrorDiagnostic = {
  correlationId: string;
  operation: OpenAIOperation;
  category: OpenAIErrorCategory;
  errorName: string;
  upstreamStatus: number | null;
  openaiCode: string | null;
  openaiType: string | null;
  parameter: string | null;
  sanitizedMessage: string;
  requestId: string | null;
};

export type SafeOpenAIError = {
  code:
    | "AI_AUTHENTICATION_ERROR"
    | "AI_PERMISSION_ERROR"
    | "AI_BILLING_QUOTA_ERROR"
    | "AI_RATE_LIMIT_ERROR"
    | "AI_SCHEMA_ERROR"
    | "AI_TIMEOUT_ERROR"
    | "AI_CONNECTION_ERROR"
    | "AI_PROVIDER_ERROR";
  category: OpenAIErrorCategory;
  message: string;
  status: number;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function requestIdFromHeaders(headers: unknown): string | null {
  if (headers instanceof Headers) {
    return firstString(headers.get("x-request-id"), headers.get("request-id"));
  }
  const record = asRecord(headers);
  if (!record) return null;
  if (typeof record.get === "function") {
    try {
      const get = record.get as (name: string) => unknown;
      return firstString(get("x-request-id"), get("request-id"));
    } catch {
      return null;
    }
  }
  return firstString(record["x-request-id"], record["request-id"]);
}

export function sanitizeOpenAIErrorMessage(message: unknown): string {
  const raw = typeof message === "string" && message.trim() ? message : "No provider message was available.";
  return raw
    .replace(/sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]+/gi, "[REDACTED_API_KEY]")
    .replace(
      /((?:authorization|openai_api_key|api[_ -]?key)\s*[:=]\s*)(?:bearer\s+)?(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "$1[REDACTED]",
    )
    .replace(/(bearer\s+)[^\s,;]+/gi, "$1[REDACTED]")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function classifyError(input: {
  error: unknown;
  name: string;
  status: number | null;
  code: string | null;
  type: string | null;
  parameter: string | null;
  message: string;
}): OpenAIErrorCategory {
  const combined = [input.name, input.code, input.type, input.parameter, input.message].join(" ").toLowerCase();

  if (combined.includes("apiconnectiontimeouterror") || combined.includes("timed out") || combined.includes("timeout")) {
    return "timeout";
  }
  if (input.status === 401 || combined.includes("authenticationerror") || combined.includes("invalid_api_key")) {
    return "authentication";
  }
  if (
    input.status === 403 ||
    combined.includes("permissiondeniederror") ||
    combined.includes("permission_denied") ||
    (input.status === 404 && (combined.includes("model_not_found") || combined.includes("model access")))
  ) {
    return "permission";
  }
  if (
    (input.status === 429 || input.status === 402) &&
    (combined.includes("quota") || combined.includes("billing") || combined.includes("credit"))
  ) {
    return "billing_or_quota";
  }
  if (input.status === 429 || combined.includes("ratelimiterror") || combined.includes("rate_limit")) {
    return "rate_limit";
  }
  if (
    input.error instanceof ZodError ||
    input.error instanceof OpenAIIntegrationError ||
    input.status === 400 ||
    input.status === 422 ||
    combined.includes("invalid_json_schema") ||
    combined.includes("response_format") ||
    combined.includes("unknown_parameter") ||
    combined.includes("unsupported_parameter")
  ) {
    return "schema";
  }
  if (
    combined.includes("apiconnectionerror") ||
    combined.includes("connection") ||
    combined.includes("fetch failed") ||
    combined.includes("econn") ||
    combined.includes("enotfound")
  ) {
    return "connection";
  }
  if (input.status !== null && input.status >= 500) return "provider";
  return "unknown";
}

export function diagnoseOpenAIError(
  error: unknown,
  operation: OpenAIOperation,
  correlationId: string,
): OpenAIErrorDiagnostic {
  const record = asRecord(error);
  const providerRecord = asRecord(record?.error);
  const nestedProviderRecord = asRecord(providerRecord?.error) ?? providerRecord;
  const name = firstString(record?.name, error instanceof Error ? error.name : null) ?? "UnknownError";
  const status = firstNumber(record?.status, nestedProviderRecord?.status);
  const code = firstString(record?.code, nestedProviderRecord?.code);
  const type = firstString(record?.type, nestedProviderRecord?.type);
  const parameter = firstString(record?.param, nestedProviderRecord?.param);
  const rawMessage =
    firstString(record?.message, nestedProviderRecord?.message, error instanceof Error ? error.message : null) ??
    "No provider message was available.";
  const requestId = firstString(
    record?.requestID,
    record?.request_id,
    nestedProviderRecord?.requestID,
    nestedProviderRecord?.request_id,
    requestIdFromHeaders(record?.headers),
  );
  const category = classifyError({ error, name, status, code, type, parameter, message: rawMessage });

  return {
    correlationId,
    operation,
    category,
    errorName: name,
    upstreamStatus: status,
    openaiCode: code,
    openaiType: type,
    parameter,
    sanitizedMessage: sanitizeOpenAIErrorMessage(rawMessage),
    requestId,
  };
}

export function safeOpenAIErrorFor(category: OpenAIErrorCategory): SafeOpenAIError {
  switch (category) {
    case "authentication":
      return {
        code: "AI_AUTHENTICATION_ERROR",
        category,
        message: "Live GPT-5.6 authentication failed. Check the server-side API key configuration.",
        status: 401,
      };
    case "permission":
      return {
        code: "AI_PERMISSION_ERROR",
        category,
        message: "The configured OpenAI project does not have permission to use GPT-5.6.",
        status: 403,
      };
    case "billing_or_quota":
      return {
        code: "AI_BILLING_QUOTA_ERROR",
        category,
        message: "The configured OpenAI project has no available billing capacity or quota.",
        status: 429,
      };
    case "rate_limit":
      return {
        code: "AI_RATE_LIMIT_ERROR",
        category,
        message: "OpenAI rate limiting prevented this request. Wait before trying again.",
        status: 429,
      };
    case "schema":
      return {
        code: "AI_SCHEMA_ERROR",
        category,
        message: "OpenAI rejected or returned an invalid structured response. Review the server diagnostic.",
        status: 502,
      };
    case "timeout":
      return {
        code: "AI_TIMEOUT_ERROR",
        category,
        message: "OpenAI did not respond before the server timeout. Deterministic demo mode remains available.",
        status: 504,
      };
    case "connection":
      return {
        code: "AI_CONNECTION_ERROR",
        category,
        message: "The PolicyProof server could not connect to OpenAI. Deterministic demo mode remains available.",
        status: 503,
      };
    case "provider":
    case "unknown":
      return {
        code: "AI_PROVIDER_ERROR",
        category,
        message: "The OpenAI request failed. Deterministic demo mode remains available.",
        status: 502,
      };
  }
}

export function logOpenAIErrorDiagnostic(diagnostic: OpenAIErrorDiagnostic): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[PolicyProof OpenAI diagnostic]", diagnostic);
  }
}
