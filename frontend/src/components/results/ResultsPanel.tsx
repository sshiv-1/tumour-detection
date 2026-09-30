import { formatClassName } from '@/lib/utils';
import type { PredictionResponse } from '@/types/prediction';
import { ProbabilityBars } from './ProbabilityBars';

interface ResultsPanelProps {
  prediction: PredictionResponse;
}

export function ResultsPanel({ prediction }: ResultsPanelProps) {
  return (
    <div className="animate-fade-in" style={{ marginTop: 16 }}>
      <div className="result-label">Model result</div>

      <div className="result-class">
        {formatClassName(prediction.predicted_class)}
      </div>

      <div className="result-confidence-wrap tabular-nums">
        <span className="result-confidence">
          {(prediction.confidence * 100).toFixed(1)}
        </span>
        <span className="result-confidence-unit">%</span>
        <span className="result-confidence-label">confidence</span>
      </div>

      <ProbabilityBars
        probabilities={prediction.probabilities}
        predictedClass={prediction.predicted_class}
      />
    </div>
  );
}
