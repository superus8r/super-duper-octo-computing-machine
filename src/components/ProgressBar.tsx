interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className = '' }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-sm text-fg-muted mb-1">
          <span>{label}</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div 
        className="progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${value} of ${max}`}
      >
        <div 
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}