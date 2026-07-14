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
    <section id={id} aria-labelledby={`${id}-heading`} className="task-canvas">
      <div className="task-heading">
        <div className="max-w-3xl">
          <p className="eyebrow text-teal-800">{step}</p>
          <h2 id={`${id}-heading`} className="mt-1 text-[1.55rem] font-bold tracking-[-0.035em] text-slate-950 sm:text-[1.8rem]">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="task-content">{children}</div>
    </section>
  );
}
