import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type ResponseLike = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

type CaptureArtifact = {
  version: 1;
  capturedAt: string;
  endpoint: "/api/ai/analyze";
  httpStatus: 200;
  latencyMs: number;
  response: { analysis: { documentFindings: unknown[] } };
};

type CaptureOptions = {
  request: () => Promise<ResponseLike>;
  persist: (artifact: CaptureArtifact) => Promise<void>;
  cleanup?: () => Promise<void>;
  now?: () => number;
  capturedAt?: () => string;
};

export class FinalAnalysisHttpError extends Error {
  public readonly status: number;
  public readonly safeBody: unknown;

  constructor(status: number, safeBody: unknown) {
    super("The PolicyProof analysis route returned an error.");
    this.name = "FinalAnalysisHttpError";
    this.status = status;
    this.safeBody = safeBody;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The analysis route did not return a JSON object.");
  }
  return value as Record<string, unknown>;
}

function projectStructuredResponse(value: unknown): CaptureArtifact["response"] {
  const body = asRecord(value);
  const analysis = asRecord(body.analysis);
  if (!Array.isArray(analysis.documentFindings)) {
    throw new Error("The analysis route response has no document findings.");
  }

  return {
    analysis: {
      documentFindings: analysis.documentFindings.map((findingInput) => {
        const finding = asRecord(findingInput);
        if (!Array.isArray(finding.evidence)) throw new Error("A document finding has no evidence array.");
        return {
          documentIdentifier: finding.documentIdentifier,
          documentName: finding.documentName,
          documentType: finding.documentType,
          evidence: finding.evidence.map((itemInput) => {
            const item = asRecord(itemInput);
            return {
              id: item.id,
              factKey: item.factKey,
              factValue: item.factValue,
              documentIdentifier: item.documentIdentifier,
              documentName: item.documentName,
              pageOrSection: item.pageOrSection,
              exactExcerpt: item.exactExcerpt,
              evidenceType: item.evidenceType,
              confidence: item.confidence,
              relationToControl: item.relationToControl,
            };
          }),
        };
      }),
    },
  };
}

export async function captureFinalCaseAnalysis({
  request,
  persist,
  cleanup = async () => undefined,
  now = () => performance.now(),
  capturedAt = () => new Date().toISOString(),
}: CaptureOptions): Promise<CaptureArtifact> {
  const startedAt = now();
  try {
    const response = await request();
    const bodyText = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      throw new Error("The analysis route returned invalid JSON.");
    }
    if (!response.ok) throw new FinalAnalysisHttpError(response.status, body);
    if (response.status !== 200) throw new Error(`Unexpected successful HTTP status: ${response.status}.`);

    const artifact: CaptureArtifact = {
      version: 1,
      capturedAt: capturedAt(),
      endpoint: "/api/ai/analyze",
      httpStatus: 200,
      latencyMs: Math.max(0, Math.round(now() - startedAt)),
      response: projectStructuredResponse(body),
    };
    await persist(artifact);
    return artifact;
  } finally {
    await cleanup();
  }
}

async function writeArtifact(path: string, artifact: CaptureArtifact): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  await rename(temporaryPath, path);
}

function safeErrorSummary(error: unknown) {
  if (error instanceof FinalAnalysisHttpError) {
    const body = error.safeBody && typeof error.safeBody === "object" ? error.safeBody as Record<string, unknown> : {};
    const apiError = body.error && typeof body.error === "object" ? body.error as Record<string, unknown> : {};
    return {
      success: false,
      httpStatus: error.status,
      errorCode: typeof apiError.code === "string" ? apiError.code : null,
      errorCategory: typeof apiError.category === "string" ? apiError.category : null,
      correlationId: typeof apiError.correlationId === "string" ? apiError.correlationId : null,
      requestId: typeof apiError.requestId === "string" ? apiError.requestId : null,
    };
  }
  return { success: false, errorName: error instanceof Error ? error.name : "UnknownError" };
}

async function main(): Promise<void> {
  const repositoryRoot = new URL("../", import.meta.url);
  const fixture = JSON.parse(await readFile(new URL("src/fixtures/evaluation/live-gpt56-northstar.json", repositoryRoot), "utf8"));
  const approvedControlIds = new Set(fixture.approvedControlIds);
  const requestBody = {
    documents: fixture.documents,
    controls: fixture.compilation.controls.map((control: Record<string, unknown>) => ({
      ...control,
      enabled: approvedControlIds.has(control.id),
    })),
  };
  const outputPath = fileURLToPath(new URL("test-results/live-gpt56/final-case-analysis.json", repositoryRoot));

  try {
    const artifact = await captureFinalCaseAnalysis({
      request: () => fetch("http://127.0.0.1:3200/api/ai/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(75_000),
      }),
      persist: (value) => writeArtifact(outputPath, value),
    });
    console.log(JSON.stringify({
      success: true,
      httpStatus: artifact.httpStatus,
      latencyMs: artifact.latencyMs,
      findingsCount: artifact.response.analysis.documentFindings.length,
      artifact: "test-results/live-gpt56/final-case-analysis.json",
    }));
  } catch (error) {
    console.error(JSON.stringify(safeErrorSummary(error)));
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) await main();
