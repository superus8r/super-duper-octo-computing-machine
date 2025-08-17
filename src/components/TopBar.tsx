interface TopBarProps {
  title: string;
  action?: React.ReactNode;
}

export function TopBar({ title, action }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="container-page">
        <div className="flex h-14 items-center justify-between">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
          {action && (
            <div className="ml-4 flex items-center gap-2">{action}</div>
          )}
        </div>
      </div>
    </header>
  );
}