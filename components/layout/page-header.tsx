interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ label, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        {label ? (
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
            {label}
          </p>
        ) : null}
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}