import { randomUUID } from "node:crypto";
import {
  CaseAnalysisRequestSchema,
  PolicyCompilationRequestSchema,
  type CaseAnalysis,
  type CaseAnalysisRequest,
  type PolicyCompilation,
} from "@/src/domain/ai-schemas";
import {
  diagnoseOpenAIError,
  logOpenAIErrorDiagnostic,
  safeOpenAIErrorFor,
  type OpenAIErrorDiagnostic,
  type OpenAIOperation,
} from "@/src/openai/error-diagnostics";
import { ZodError } from "zod";

type ApiErrorCode = "AI_NOT_CONFIGURED" | "INVALID_REQUEST";

type DiagnosticDependencies = {
  createCorrelationId?: () => string;
  logDiagnostic?: (diagnostic: OpenAIErrorDiagnostic) => void;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function errorResponse(code: ApiErrorCode, message: string, status: number): Response {
  return json({ error: { code, message } }, status);
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ZodError([]);
  }
}

function openAIErrorResponse(
  error: unknown,
  operation: OpenAIOperation,
  dependencies: DiagnosticDependencies,
): Response {
  const correlationId = (dependencies.createCorrelationId ?? randomUUID)();
  const diagnostic = diagnoseOpenAIError(error, operation, correlationId);
  (dependencies.logDiagnostic ?? logOpenAIErrorDiagnostic)(diagnostic);
  const safe = safeOpenAIErrorFor(diagnostic.category);

  return json(
    {
      error: {
        code: safe.code,
        category: safe.category,
        message: safe.message,
        correlationId,
        ...(diagnostic.requestId ? { requestId: diagnostic.requestId } : {}),
      },
    },
    safe.status,
  );
}

export function createPolicyCompilationHandler(
  dependencies: {
    isConfigured: () => boolean;
    compile: (policyText: string) => Promise<PolicyCompilation>;
  } & DiagnosticDependencies,
) {
  return async function handlePolicyCompilation(request: Request): Promise<Response> {
    if (!dependencies.isConfigured()) {
      return errorResponse(
        "AI_NOT_CONFIGURED",
        "Live GPT-5.6 mode is disabled. Add OPENAI_API_KEY to .env.local and restart the server.",
        503,
      );
    }

    let input;
    try {
      input = PolicyCompilationRequestSchema.parse(await readJson(request));
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse("INVALID_REQUEST", "Provide policy text between 50 and 50,000 characters.", 400);
      }
      throw error;
    }

    try {
      return json({ compilation: await dependencies.compile(input.policyText) });
    } catch (error) {
      return openAIErrorResponse(error, "policy_compilation", dependencies);
    }
  };
}

export function createCaseAnalysisHandler(
  dependencies: {
    isConfigured: () => boolean;
    analyze: (request: CaseAnalysisRequest) => Promise<CaseAnalysis>;
  } & DiagnosticDependencies,
) {
  return async function handleCaseAnalysis(request: Request): Promise<Response> {
    if (!dependencies.isConfigured()) {
      return errorResponse(
        "AI_NOT_CONFIGURED",
        "Live GPT-5.6 mode is disabled. Add OPENAI_API_KEY to .env.local and restart the server.",
        503,
      );
    }

    let input;
    try {
      input = CaseAnalysisRequestSchema.parse(await readJson(request));
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse("INVALID_REQUEST", "Provide valid controls and 1 to 10 text documents.", 400);
      }
      throw error;
    }

    try {
      return json({ analysis: await dependencies.analyze(input) });
    } catch (error) {
      return openAIErrorResponse(error, "case_analysis", dependencies);
    }
  };
}
