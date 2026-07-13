import {
  CaseAnalysisRequestSchema,
  PolicyCompilationRequestSchema,
  type CaseAnalysis,
  type CaseAnalysisRequest,
  type PolicyCompilation,
} from "@/src/domain/ai-schemas";
import { ZodError } from "zod";

type ApiErrorCode = "AI_NOT_CONFIGURED" | "INVALID_REQUEST" | "AI_REQUEST_FAILED";

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

export function createPolicyCompilationHandler(dependencies: {
  isConfigured: () => boolean;
  compile: (policyText: string) => Promise<PolicyCompilation>;
}) {
  return async function handlePolicyCompilation(request: Request): Promise<Response> {
    if (!dependencies.isConfigured()) {
      return errorResponse(
        "AI_NOT_CONFIGURED",
        "Live GPT-5.6 mode is disabled. Add OPENAI_API_KEY to .env.local and restart the server.",
        503,
      );
    }

    try {
      const input = PolicyCompilationRequestSchema.parse(await readJson(request));
      return json({ compilation: await dependencies.compile(input.policyText) });
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse("INVALID_REQUEST", "Provide policy text between 50 and 50,000 characters.", 400);
      }
      return errorResponse(
        "AI_REQUEST_FAILED",
        "Policy compilation failed. Deterministic demo mode remains available.",
        502,
      );
    }
  };
}

export function createCaseAnalysisHandler(dependencies: {
  isConfigured: () => boolean;
  analyze: (request: CaseAnalysisRequest) => Promise<CaseAnalysis>;
}) {
  return async function handleCaseAnalysis(request: Request): Promise<Response> {
    if (!dependencies.isConfigured()) {
      return errorResponse(
        "AI_NOT_CONFIGURED",
        "Live GPT-5.6 mode is disabled. Add OPENAI_API_KEY to .env.local and restart the server.",
        503,
      );
    }

    try {
      const input = CaseAnalysisRequestSchema.parse(await readJson(request));
      return json({ analysis: await dependencies.analyze(input) });
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse("INVALID_REQUEST", "Provide valid controls and 1 to 10 text documents.", 400);
      }
      return errorResponse(
        "AI_REQUEST_FAILED",
        "Case analysis failed. No documents were changed and deterministic demo mode remains available.",
        502,
      );
    }
  };
}
