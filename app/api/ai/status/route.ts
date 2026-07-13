import { isOpenAIConfigured } from "@/src/openai/client";
import { OPENAI_MODEL } from "@/src/openai/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ available: isOpenAIConfigured(), model: OPENAI_MODEL });
}
