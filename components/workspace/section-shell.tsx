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
        <div className="task-heading-copy">
          <p className="eyebrow">{step}</p>
          <h2 id={`${id}-heading`}>{title}</h2>
          <p>{description}</p>
        </div>
        {action}
      </div>
      <div className="task-content">{children}</div>
    </section>
  );
}
