import type { ControlResult } from "@/src/domain/schemas";

const styles: Record<ControlResult["status"], string> = {
  PASS: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAIL: "border-red-200 bg-red-50 text-red-800",
  MISSING: "border-slate-300 bg-slate-100 text-slate-700",
  WARNING: "border-amber-200 bg-amber-50 text-amber-900",
};

export function StatusBadge({ status }: { status: ControlResult["status"] }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}
