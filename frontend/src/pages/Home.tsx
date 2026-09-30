import { ModelInfo } from '@/components/model-info/ModelInfo';
import { PipelineDiagram } from '@/components/pipeline/PipelineDiagram';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { AnalyzingState } from '@/components/upload/AnalyzingState';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { UploadZone } from '@/components/upload/UploadZone';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { HealthIndicator } from '@/components/ui/HealthIndicator';
import { usePrediction } from '@/hooks/usePrediction';
import { formatFileSize } from '@/lib/utils';

export function Home() {
  const {
    appState,
    imageMeta,
    prediction,
    error,
    health,
    selectImage,
    analyze,
    reset,
    dismissError,
  } = usePrediction();

  const handleReplace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) selectImage(file);
    };
    input.click();
  };

  const handlePrimaryAction = () => {
    if (appState === 'success') {
      handleReplace();
    } else {
      analyze();
    }
  };

  const handleSecondaryAction = () => {
    if (appState === 'success') {
      reset();
    } else {
      reset();
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-name">NeuroScan</span>
          <div className="topbar-divider" />
          
          <div className={`study-tab ${imageMeta ? 'active' : ''}`}>
            {imageMeta ? (
              <>
                <div className="study-filename">{imageMeta.name}</div>
                <div className="study-meta tabular-nums">
                  {formatFileSize(imageMeta.size)}
                  {imageMeta.width && imageMeta.height && (
                    <> · {imageMeta.width} × {imageMeta.height}</>
                  )}
                </div>
              </>
            ) : (
              <div className="study-filename" style={{ color: 'var(--muted)' }}>
                No image loaded
              </div>
            )}
          </div>
        </div>

        <HealthIndicator health={health} />
      </header>

      <main className="main-area">
        {/* ── Sidebar (Left) ─────────────────────────────────── */}
        <div className="sidebar">
          <h2 className="sidebar-title">Results</h2>

          {imageMeta && (
            <div className="info-block animate-fade-in">
              <div className="info-title">Image info</div>
              <div className="info-row">
                <span className="info-label">File name</span>
                <span className="info-value">{imageMeta.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">File size</span>
                <span className="info-value tabular-nums">{formatFileSize(imageMeta.size)}</span>
              </div>
              {imageMeta.width && imageMeta.height && (
                <div className="info-row tabular-nums">
                  <span className="info-label">Dimensions</span>
                  <span className="info-value">{imageMeta.width} × {imageMeta.height}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Format</span>
                <span className="info-value">{imageMeta.file.type || 'Unknown'}</span>
              </div>
            </div>
          )}

          {appState === 'idle' || (appState === 'selected' && !error) ? (
            <div className="state-hint animate-fade-in">
              Upload an MRI image, then choose Analyze MRI
            </div>
          ) : null}

          {appState === 'analyzing' && <AnalyzingState />}

          {appState === 'error' && error && (
            <ErrorDisplay
              error={error}
              onDismiss={dismissError}
              onRetry={imageMeta ? analyze : undefined}
            />
          )}

          {appState === 'success' && prediction && (
            <ResultsPanel prediction={prediction} />
          )}

          <div className="sidebar-bottom">
            <button
              className="pill-btn pill-btn-grey focus-ring"
              disabled={!imageMeta || appState === 'analyzing'}
              onClick={handleSecondaryAction}
            >
              {appState === 'success' ? 'Analyze another image' : 'Remove'}
            </button>
            <button
              className="pill-btn pill-btn-accent focus-ring"
              disabled={!imageMeta || appState === 'analyzing'}
              onClick={handlePrimaryAction}
            >
              {appState === 'success' ? 'Replace image' : 'Analyze MRI'}
            </button>
          </div>
        </div>

        {/* ── Viewport (Right) ───────────────────────────────── */}
        <div className="viewport-container">
          {appState === 'idle' ? (
            <UploadZone onFileSelect={selectImage} />
          ) : (
            imageMeta ? (
              <ImagePreview
                image={imageMeta}
                isAnalyzing={appState === 'analyzing'}
              />
            ) : null
          )}
        </div>
      </main>

      <PipelineDiagram />
      <ModelInfo />

      <footer className="disclaimer">
        <p>
          This application is for educational and research purposes only
          and is not a medical diagnostic tool. Predictions should not be
          used as a substitute for professional medical evaluation.
        </p>
      </footer>
    </>
  );
}
