import { z } from "zod";
import { ControlStatusSchema } from "@/src/domain/schemas";
import type { RunSnapshot } from "@/src/lib/review-intelligence";

export const REVIEW_RUN_HISTORY_KEY = "policyproof.review-run-history.v1";

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
  return RunHistorySchema.parse({ version: 1, previous: history.latest, latest });
}

export function serializeRunHistory(history: RunHistory): string {
  return JSON.stringify(RunHistorySchema.parse(history));
}

export function loadRunHistory(storage: RunHistoryStorage): RunHistory {
  try {
    return parseRunHistory(storage.getItem(REVIEW_RUN_HISTORY_KEY));
  } catch {
    return { version: 1, previous: null, latest: null };
  }
}

export function persistRunHistory(storage: RunHistoryStorage, history: RunHistory): boolean {
  try {
    storage.setItem(REVIEW_RUN_HISTORY_KEY, serializeRunHistory(history));
    return true;
  } catch {
    return false;
  }
}

export function removeRunHistory(storage: RunHistoryStorage): boolean {
  try {
    storage.removeItem(REVIEW_RUN_HISTORY_KEY);
    return true;
  } catch {
    return false;
  }
}
