interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-fg-subtle mb-4 w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-fg-muted mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}