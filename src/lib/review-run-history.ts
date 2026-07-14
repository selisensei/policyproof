import { z } from "zod";
import { ControlStatusSchema } from "@/src/domain/schemas";
import type { RunSnapshot } from "@/src/lib/review-intelligence";

const DEFAULT_SCENARIO_ID = "northstar-mixed-risk";

export function reviewRunHistoryKey(scenarioId: string): string {
  return `policyproof.review-run-history.v2.${scenarioId}`;
}

export const REVIEW_RUN_HISTORY_KEY = reviewRunHistoryKey(DEFAULT_SCENARIO_ID);

const summarySchema = z.object({
  PASS: z.number().int().nonnegative(),
  FAIL: z.number().int().nonnegative(),
  MISSING: z.number().int().nonnegative(),
  WARNING: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  reviewed: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});

export const RunSnapshotSchema = z.object({
  scenarioId: z.string().min(1),
  id: z.string().min(1),
  generatedAt: z.iso.datetime(),
  threshold: z.number().nonnegative(),
  summary: summarySchema,
  statuses: z.record(z.string(), ControlStatusSchema),
});

export const RunHistorySchema = z.object({
  version: z.literal(1),
  previous: RunSnapshotSchema.nullable(),
  latest: RunSnapshotSchema.nullable(),
});

export type RunHistory = z.infer<typeof RunHistorySchema>;

export type RunHistoryStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function parseRunHistory(value: string | null): RunHistory {
  if (!value) return { version: 1, previous: null, latest: null };
  try {
    return RunHistorySchema.parse(JSON.parse(value));
  } catch {
    return { version: 1, previous: null, latest: null };
  }
}

export function advanceRunHistory(history: RunHistory, latest: RunSnapshot): RunHistory {
  const previous = history.latest?.scenarioId === latest.scenarioId ? history.latest : null;
  return RunHistorySchema.parse({ version: 1, previous, latest });
}

export function serializeRunHistory(history: RunHistory): string {
  return JSON.stringify(RunHistorySchema.parse(history));
}

export function loadRunHistory(storage: RunHistoryStorage, scenarioId = DEFAULT_SCENARIO_ID): RunHistory {
  try {
    const history = parseRunHistory(storage.getItem(reviewRunHistoryKey(scenarioId)));
    if (history.latest && history.latest.scenarioId !== scenarioId) return { version: 1, previous: null, latest: null };
    return history;
  } catch {
    return { version: 1, previous: null, latest: null };
  }
}

export function persistRunHistory(storage: RunHistoryStorage, history: RunHistory, scenarioId = history.latest?.scenarioId ?? DEFAULT_SCENARIO_ID): boolean {
  try {
    storage.setItem(reviewRunHistoryKey(scenarioId), serializeRunHistory(history));
    return true;
  } catch {
    return false;
  }
}

export function removeRunHistory(storage: RunHistoryStorage, scenarioId = DEFAULT_SCENARIO_ID): boolean {
  try {
    storage.removeItem(reviewRunHistoryKey(scenarioId));
    return true;
  } catch {
    return false;
  }
}
