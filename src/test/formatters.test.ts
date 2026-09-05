import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getFileTypeLabel,
  getInitials,
  calculateGaugePercent,
} from '../utils/formatters';

describe('formatFileSize', () => {
  it('returns 0 B for zero, negative or NaN values', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(-100)).toBe('0 B');
    expect(formatFileSize(NaN)).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('getFileTypeLabel', () => {
  it('identifies PDF documents', () => {
    expect(getFileTypeLabel('application/pdf', 'report.pdf')).toBe('PDF Document');
    expect(getFileTypeLabel('', 'test.PDF')).toBe('PDF Document');
  });

  it('identifies PNG images', () => {
    expect(getFileTypeLabel('image/png', 'scan.png')).toBe('PNG Image');
  });

  it('identifies JPEG/JPG images', () => {
    expect(getFileTypeLabel('image/jpeg', 'photo.jpg')).toBe('JPEG Image');
    expect(getFileTypeLabel('image/jpg', 'photo.jpeg')).toBe('JPEG Image');
  });

  it('falls back to default label for unknown or missing types', () => {
    expect(getFileTypeLabel('', '')).toBe('Medical Report File');
    expect(getFileTypeLabel('text/plain', 'notes.txt')).toBe('Medical Report File');
  });
});

describe('getInitials', () => {
  it('extracts two-letter initials from full name', () => {
    expect(getInitials('Eleanor Vance')).toBe('EV');
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single word names', () => {
    expect(getInitials('Cher')).toBe('C');
  });

  it('handles multiple names with extra spaces', () => {
    expect(getInitials('  Sarah   Jane   Smith  ')).toBe('SJ');
  });

  it('returns fallback for empty, whitespace, or invalid names', () => {
    expect(getInitials('')).toBe('PT');
    expect(getInitials('   ')).toBe('PT');
    expect(getInitials(null as any, 'DS')).toBe('DS');
  });
});

describe('calculateGaugePercent', () => {
  it('calculates linear percentage within bounds', () => {
    expect(calculateGaugePercent(50, 0, 100)).toBe(50);
    expect(calculateGaugePercent(25, 0, 100)).toBe(25);
    expect(calculateGaugePercent(75, 0, 100)).toBe(75);
  });

  it('clamps values below minimum to 0', () => {
    expect(calculateGaugePercent(-20, 0, 100)).toBe(0);
    expect(calculateGaugePercent(5, 10, 20)).toBe(0);
  });

  it('clamps values above maximum to 100', () => {
    expect(calculateGaugePercent(150, 0, 100)).toBe(100);
    expect(calculateGaugePercent(25, 10, 20)).toBe(100);
  });

  it('prevents division by zero when min equals max', () => {
    expect(calculateGaugePercent(50, 50, 50)).toBe(50);
    expect(calculateGaugePercent(10, 10, 10)).toBe(50);
  });

  it('handles missing or NaN values gracefully', () => {
    expect(calculateGaugePercent(undefined, 0, 100)).toBe(50);
    expect(calculateGaugePercent(NaN, 0, 100)).toBe(50);
  });
});
