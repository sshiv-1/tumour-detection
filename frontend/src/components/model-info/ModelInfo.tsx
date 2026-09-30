const INFO = [
  { label: 'Architecture', value: 'ResNet18' },
  { label: 'Framework', value: 'PyTorch' },
  { label: 'Task', value: '4-class brain MRI classification' },
  { label: 'Input size', value: '224 × 224 px' },
  { label: 'Preprocessing', value: 'Contour Crop · CLAHE · Resize · ImageNet Normalization' },
  { label: 'Classes', value: 'Glioma · Meningioma · No Tumor · Pituitary' },
  { label: 'Test accuracy', value: '90.08%' },
  { label: 'Test samples', value: '1,311' },
];

export function ModelInfo() {
  return (
    <section className="model-info-section">
      <div className="section-label" style={{ textAlign: 'center', marginBottom: 16 }}>
        Model information
      </div>

      <div className="model-info-grid">
        {INFO.map(({ label, value }) => (
          <div className="model-info-row" key={label}>
            <span className="model-info-label">{label}</span>
            <span className="model-info-value">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
