export interface PredictionResponse {
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  device: string;
}

export type AppState = 'idle' | 'selected' | 'analyzing' | 'success' | 'error';

export interface ImageMeta {
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width?: number;
  height?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
