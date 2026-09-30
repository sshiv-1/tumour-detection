const STEPS = [
  'MRI',
  'Contour Crop',
  'CLAHE',
  '224×224',
  'ResNet18',
  '4-class',
];

export function PipelineDiagram() {
  return (
    <section className="pipeline-section">
      <div className="section-label" style={{ textAlign: 'center', marginBottom: 16 }}>
        Inference pipeline
      </div>

      <div className="pipeline-row">
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'contents' }}>
            {i > 0 && <div className="pipeline-connector" />}
            <div className="pipeline-step">
              <span className="step-label">{step}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
