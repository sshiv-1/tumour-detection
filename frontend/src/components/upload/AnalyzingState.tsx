import { useEffect, useState } from 'react';

const STAGES = [
  'Uploading image',
  'Preprocessing',
  'Running model',
  'Generating prediction',
];

export function AnalyzingState() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="info-block animate-fade-in">
      <div className="info-title">Analyzing</div>
      
      <div className="analyzing-stage">
        {STAGES[active] ?? 'Processing...'}
      </div>
      
      <div className="analyzing-bar-track">
        <div className="analyzing-bar-fill" />
      </div>
    </div>
  );
}
