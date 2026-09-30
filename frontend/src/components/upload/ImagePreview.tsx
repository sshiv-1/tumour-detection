import type { ImageMeta } from '@/types/prediction';

interface ImagePreviewProps {
  image: ImageMeta;
  isAnalyzing?: boolean;
}

export function ImagePreview({
  image,
  isAnalyzing,
}: ImagePreviewProps) {
  return (
    <div className="viewport" style={isAnalyzing ? { opacity: 0.6 } : undefined}>
      <img
        src={image.previewUrl}
        alt={`Uploaded MRI: ${image.name}`}
      />

      <div className="viewport-overlay-tr">
        Original upload
      </div>

      <div className="viewport-zoom-slider">
        <div className="zoom-chevron" aria-label="Zoom in">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </div>
        <div className="zoom-chevron" aria-label="Zoom out">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  );
}
