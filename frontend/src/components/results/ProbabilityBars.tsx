import { formatProbability } from '@/lib/utils';
import type { PredictionResponse } from '@/types/prediction';

interface ProbabilityBarsProps {
  probabilities: PredictionResponse['probabilities'];
  predictedClass: string;
}

const CLASS_DISPLAY: Record<string, string> = {
  glioma: 'Glioma',
  meningioma: 'Meningioma',
  notumor: 'No Tumor',
  pituitary: 'Pituitary',
};

export function ProbabilityBars({
  probabilities,
  predictedClass,
}: ProbabilityBarsProps) {
  const sorted = Object.entries(probabilities).sort(([, a], [, b]) => b - a);
  const maxProb = Math.max(...Object.values(probabilities));

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sorted.map(([cls, prob]) => {
        const isPredicted = cls.toLowerCase() === predictedClass.toLowerCase();
        const widthPct = maxProb > 0 ? (prob / maxProb) * 100 : 0;

        return (
          <div key={cls} className="prob-row animate-fade-in">
            <div className="prob-info">
              <span className="prob-name">{CLASS_DISPLAY[cls] ?? cls}</span>
              <span className="prob-pct tabular-nums">{formatProbability(prob)}</span>
            </div>
            <div className="prob-track">
              <div
                className="prob-fill"
                style={{
                  width: `${widthPct}%`,
                  background: isPredicted ? 'var(--accent)' : '#666',
                  transition: 'width 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
