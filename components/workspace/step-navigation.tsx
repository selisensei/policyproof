const steps = [
  ["policy", "1", "Policy"],
  ["controls", "2", "Controls"],
  ["documents", "3", "Case documents"],
  ["review", "4", "Review"],
  ["decision", "5", "Decision"],
] as const;

export function StepNavigation() {
  return (
    <nav aria-label="Review progress" className="border-b border-slate-200 bg-slate-50">
      <ol className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {steps.map(([id, number, label]) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-950"
            >
              <span className="grid size-6 place-items-center rounded-full border border-slate-300 bg-white text-xs font-bold">
                {number}
              </span>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
