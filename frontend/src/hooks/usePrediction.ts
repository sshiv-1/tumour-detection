import { useCallback, useEffect, useRef, useState } from 'react';

import { checkHealth, predictImage } from '@/services/api';
import type {
  ApiError,
  AppState,
  HealthResponse,
  ImageMeta,
  PredictionResponse,
} from '@/types/prediction';

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function usePrediction() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  // Health check on mount and every 30s
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const h = await checkHealth();
        if (active) setHealth(h);
      } catch {
        if (active) setHealth(null);
      }
    };

    poll();
    const id = setInterval(poll, 30_000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const cleanupPreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const validateFile = useCallback(
    (file: File): ApiError | null => {
      if (!file) {
        return { message: 'No file provided.' };
      }
      if (file.size === 0) {
        return { message: 'The selected file is empty.' };
      }
      if (!ACCEPTED_TYPES.has(file.type)) {
        return {
          message: `Unsupported file type "${file.type || 'unknown'}". Please upload a JPG, PNG, or WEBP image.`,
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return { message: 'File is too large. Maximum size is 10 MB.' };
      }
      return null;
    },
    []
  );

  const selectImage = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setAppState('error');
        return;
      }

      cleanupPreview();

      const previewUrl = URL.createObjectURL(file);
      objectUrlRef.current = previewUrl;

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageMeta({
          file,
          name: file.name,
          size: file.size,
          previewUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => {
        setImageMeta({
          file,
          name: file.name,
          size: file.size,
          previewUrl,
        });
      };
      img.src = previewUrl;

      setPrediction(null);
      setError(null);
      setAppState('selected');
    },
    [cleanupPreview, validateFile]
  );

  const analyze = useCallback(async () => {
    if (!imageMeta) return;

    setAppState('analyzing');
    setError(null);

    try {
      const result = await predictImage(imageMeta.file);
      setPrediction(result);
      setAppState('success');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.';
      setError({ message });
      setAppState('error');
    }
  }, [imageMeta]);

  const reset = useCallback(() => {
    cleanupPreview();
    setImageMeta(null);
    setPrediction(null);
    setError(null);
    setAppState('idle');
  }, [cleanupPreview]);

  const dismissError = useCallback(() => {
    // Go back to previous useful state
    if (imageMeta) {
      setError(null);
      setAppState('selected');
    } else {
      reset();
    }
  }, [imageMeta, reset]);

  return {
    appState,
    imageMeta,
    prediction,
    error,
    health,
    selectImage,
    analyze,
    reset,
    dismissError,
  };
}
