import type { HealthResponse, PredictionResponse } from '@/types/prediction';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const REQUEST_TIMEOUT_MS = 60_000;

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The inference server may be under heavy load.'
      );
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Check if the backend inference server is available.
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_URL}/health`,
      { method: 'GET' },
      5_000
    );

    if (!response.ok) {
      throw new ApiError('Health check failed.', response.status);
    }

    return (await response.json()) as HealthResponse;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unable to reach the inference server.');
  }
}

/**
 * Send an image to the prediction endpoint.
 */
export async function predictImage(
  file: File
): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unable to reach the inference server. Please check that the backend is running.');
  }

  if (!response.ok) {
    let message = 'Analysis failed. Please try again.';

    try {
      const body = await response.json();
      if (body?.detail) {
        message =
          typeof body.detail === 'string'
            ? body.detail
            : JSON.stringify(body.detail);
      }
    } catch {
      // Could not parse error body
    }

    if (response.status === 415) {
      message = 'Unsupported file type. Please upload a JPG or PNG image.';
    } else if (response.status === 413) {
      message = 'File is too large. Maximum size is 10 MB.';
    } else if (response.status === 400) {
      message = 'Could not process this image. Please upload a valid MRI scan.';
    }

    throw new ApiError(message, response.status);
  }

  const data = await response.json();

  // Validate response shape
  if (
    !data ||
    typeof data.predicted_class !== 'string' ||
    typeof data.confidence !== 'number' ||
    !data.probabilities ||
    typeof data.probabilities !== 'object'
  ) {
    throw new ApiError(
      'Received an unexpected response from the server.'
    );
  }

  return data as PredictionResponse;
}
