import type { ControlResult, ReviewDecision } from "@/src/domain/schemas";
import type { DecisionReceipt } from "@/src/lib/decision-receipt";
import type { ResultSummary } from "@/src/lib/review-summary";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";

const labels: Record<ReviewDecision["state"], string> = {
  PENDING: "Pending review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  ACCEPTED_EXCEPTION: "Accepted exception",
};

export function DecisionPanel({
  selectedResult,
  summary,
  receipt,
  reviewError,
  onCommentChange,
  onDecision,
}: {
  selectedResult: ControlResult | null;
  summary: ResultSummary;
  receipt: DecisionReceipt | null;
  reviewError: string;
  onCommentChange: (comment: string) => void;
  onDecision: (state: ReviewDecision["state"]) => void;
}) {
  return (
    <SectionShell
      id="decision"
      step="Step 5"
      title="Human decision and receipt"
      description="Record human judgment without replacing the original control outcome, then review the local decision receipt."
    >
      {!receipt ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
          <p className="font-semibold text-slate-800">No decision receipt yet</p>
          <p className="mt-1 text-sm text-slate-500">Run a review to create a timestamped receipt.</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
          <div className="rounded-xl border border-slate-200 p-5">
            {selectedResult ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected control</p>
                    <h3 className="mt-1 font-semibold text-slate-950">{selectedResult.title}</h3>
                  </div>
                  <StatusBadge status={selectedResult.status} />
                </div>
                <label htmlFor="review-comment" className="mt-5 block text-sm font-semibold text-slate-900">Reviewer comment</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={selectedResult.reviewerDecision.comment}
                  onChange={(event) => onCommentChange(event.target.value)}
                  placeholder="Required when rejecting a result or accepting an exception."
                  className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-900"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">Overrides require context so another reviewer can understand the decision later.</p>
                {reviewError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{reviewError}</p>}
                <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <DecisionButton label="Confirm" onClick={() => onDecision("CONFIRMED")} />
                  <DecisionButton label="Reject" onClick={() => onDecision("REJECTED")} />
                  <DecisionButton label="Accept exception" onClick={() => onDecision("ACCEPTED_EXCEPTION")} />
                </div>
                <p className="mt-3 text-xs text-slate-500">Current decision: <span className="font-semibold text-slate-800">{labels[selectedResult.reviewerDecision.state]}</span></p>
              </>
            ) : <p className="text-sm text-slate-500">Select a control result before recording a human decision.</p>}
          </div>

          <article aria-label="Decision receipt" className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Decision receipt</p>
                <h3 className="mt-1 font-semibold text-slate-950">{receipt.reviewId}</h3>
              </div>
              <div className="text-sm text-slate-600"><span className="font-semibold text-emerald-800">{summary.reviewed}</span> reviewed · {summary.pending} pending</div>
            </div>
            <dl className="grid gap-px bg-slate-200 text-sm sm:grid-cols-3">
              <div className="bg-white p-4"><dt className="text-xs text-slate-500">Policy</dt><dd className="mt-1 font-semibold text-slate-900">{receipt.policyVersion}</dd></div>
              <div className="bg-white p-4"><dt className="text-xs text-slate-500">Case</dt><dd className="mt-1 font-semibold text-slate-900">{receipt.caseName}</dd></div>
              <div className="bg-white p-4"><dt className="text-xs text-slate-500">Run mode</dt><dd className="mt-1 font-semibold text-slate-900">{receipt.runMode.replaceAll("_", " ")}</dd></div>
            </dl>
            <div className="max-h-72 divide-y divide-slate-200 overflow-y-auto">
              {receipt.outcomes.map((outcome) => (
                <div key={outcome.controlId} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_6rem_9rem] sm:items-center">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{outcome.title}</p>
                    {outcome.reviewerComment && <p className="mt-1 break-words text-xs text-slate-500">{outcome.reviewerComment}</p>}
                  </div>
                  <span className="font-semibold text-slate-700">{outcome.status}</span>
                  <span className="text-slate-600">{labels[outcome.reviewerDecision]}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 bg-amber-50 px-5 py-4">
              <p className="text-xs leading-5 text-amber-950">{receipt.disclaimer}</p>
              <p className="mt-1 text-xs text-amber-800">Generated {new Date(receipt.generatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>
          </article>
        </div>
      )}
    </SectionShell>
  );
}

function DecisionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-900">
      {label}
    </button>
  );
}
