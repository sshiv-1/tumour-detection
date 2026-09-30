import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format a probability (0–1) as a percentage string.
 */
export function formatProbability(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Display a class name in human-readable form.
 * Maps internal labels like "notumor" → "No Tumor".
 */
const CLASS_DISPLAY_NAMES: Record<string, string> = {
  glioma: 'Glioma',
  meningioma: 'Meningioma',
  notumor: 'No Tumor',
  pituitary: 'Pituitary',
};

export function formatClassName(name: string): string {
  return CLASS_DISPLAY_NAMES[name.toLowerCase()] ?? name;
}
