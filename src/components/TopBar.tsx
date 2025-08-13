interface TopBarProps {
  title: string;
  action?: React.ReactNode;
}

export function TopBar({ title, action }: TopBarProps) {
  return (
    <header className="sticky top-0 bg-surface border-b border-border z-10">
      <div className="container">
        <div className="flex items-center justify-between h-14 py-2">
          <h1 className="text-xl font-semibold truncate">{title}</h1>
          {action && (
            <div className="flex items-center gap-2 ml-4">
              {action}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}