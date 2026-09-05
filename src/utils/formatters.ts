/**
 * Formats file byte sizes cleanly into B, KB, MB, GB.
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Returns human-friendly label for report file types.
 */
export const getFileTypeLabel = (fileType: string = '', fileName: string = ''): string => {
  const fType = (fileType || '').toLowerCase();
  const fName = (fileName || '').toLowerCase();

  if (fType.includes('pdf') || fName.endsWith('.pdf')) {
    return 'PDF Document';
  }
  if (fType.includes('png') || fName.endsWith('.png')) {
    return 'PNG Image';
  }
  if (
    fType.includes('jpeg') ||
    fType.includes('jpg') ||
    fName.endsWith('.jpg') ||
    fName.endsWith('.jpeg')
  ) {
    return 'JPEG Image';
  }
  return 'Medical Report File';
};

/**
 * Safely generates patient initials without runtime crashes or undefined output.
 */
export const getInitials = (name?: string, fallback: string = 'PT'): string => {
  if (!name || typeof name !== 'string') return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return initials || fallback;
};

/**
 * Calculates range gauge percentage with safe zero-division guard.
 */
export const calculateGaugePercent = (
  current?: number,
  min?: number,
  max?: number
): number => {
  const c = typeof current === 'number' && !isNaN(current) ? current : 50;
  const mn = typeof min === 'number' && !isNaN(min) ? min : 0;
  const mx = typeof max === 'number' && !isNaN(max) ? max : 100;

  if (mx <= mn) return 50;
  const rawPercent = ((c - mn) / (mx - mn)) * 100;
  return Math.min(100, Math.max(0, parseFloat(rawPercent.toFixed(1))));
};
