import type { ApiError } from '@/types/prediction';

interface ErrorDisplayProps {
  error: ApiError;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onDismiss, onRetry }: ErrorDisplayProps) {
  return (
    <div className="error-block animate-fade-in" role="alert">
      <div className="error-message">
        {error.message}
        {error.status && (
          <span style={{ opacity: 0.5 }}> (Code: {error.status})</span>
        )}
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-btn focus-ring" onClick={onRetry}>
            Try again
          </button>
        )}
        <button className="error-btn focus-ring" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
