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
    <section id={id} aria-labelledby={`${id}-heading`} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/55 px-5 py-5 sm:flex-row sm:items-start sm:justify-between lg:px-7">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{step}</p>
          <h2 id={`${id}-heading`} className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5 lg:p-7">{children}</div>
    </section>
  );
}
