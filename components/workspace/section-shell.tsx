import type { ReactNode } from "react";

export function SectionShell({
  id,
  step,
  title,
  description,
  action,
  children,
}: {
  id: string;
  step: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between lg:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">{step}</p>
          <h2 id={`${id}-heading`} className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5 lg:p-6">{children}</div>
    </section>
  );
}
