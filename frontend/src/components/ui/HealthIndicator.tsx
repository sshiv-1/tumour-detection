import type { HealthResponse } from '@/types/prediction';

interface HealthIndicatorProps {
  health: HealthResponse | null;
}

export function HealthIndicator({ health }: HealthIndicatorProps) {
  const isOnline = health?.status === 'ok' && health.model_loaded;

  return (
    <div className="topbar-status" role="status" aria-live="polite">
      <span>Inference API</span>
      <span style={{ color: 'var(--border)' }}>·</span>
      <span className={`topbar-dot ${isOnline ? 'online' : 'offline'}`} />
      <span style={{ color: isOnline ? 'var(--accent)' : 'var(--red)' }}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
      {isOnline && health?.device && (
        <span style={{ fontSize: 12, color: 'var(--muted)', opacity: 0.6 }}>
          {health.device.toUpperCase()}
        </span>
      )}
    </div>
  );
}
