import { describe, it, expect } from 'vitest';
import {
  validatePatientFormData,
  sanitizeFileName,
  validateReportFile,
  MAX_FILE_SIZE_BYTES,
} from '../utils/validation';
import type { PatientFormData } from '../types/patient';

describe('Patient Form Data Validation', () => {
  const validData: PatientFormData = {
    patientName: 'Sarah Connor',
    age: '42',
    sex: 'Female',
    symptoms: 'Subacute fatigue and exertional shortness of breath',
    existingConditions: 'Hypertension',
    allergies: 'Penicillin',
    currentMedications: 'Lisinopril 10mg',
    additionalNotes: 'Non-smoker',
  };

  it('passes validation with complete valid data', () => {
    const result = validatePatientFormData(validData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  describe('Patient Name validation', () => {
    it('fails when patient name is empty or whitespace', () => {
      const result = validatePatientFormData({ ...validData, patientName: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.errors.patientName).toBe('Patient Name is required.');
    });

    it('fails when patient name is shorter than 2 characters', () => {
      const result = validatePatientFormData({ ...validData, patientName: 'A' });
      expect(result.isValid).toBe(false);
      expect(result.errors.patientName).toBe('Patient Name must be at least 2 characters.');
    });

    it('fails when patient name exceeds 100 characters', () => {
      const result = validatePatientFormData({
        ...validData,
        patientName: 'A'.repeat(101),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.patientName).toBe('Patient Name must not exceed 100 characters.');
    });
  });

  describe('Age validation', () => {
    it('fails when age is missing', () => {
      const result = validatePatientFormData({ ...validData, age: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Age is required.');
    });

    it('fails when age is non-numeric', () => {
      const result = validatePatientFormData({ ...validData, age: 'forty' });
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Please enter a valid whole number for age.');
    });

    it('fails when age is a decimal number', () => {
      const result = validatePatientFormData({ ...validData, age: '45.5' });
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Please enter a valid whole number for age.');
    });

    it('fails when age is negative', () => {
      const result = validatePatientFormData({ ...validData, age: '-5' });
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Age must be between 0 and 130.');
    });

    it('fails when age exceeds 130', () => {
      const result = validatePatientFormData({ ...validData, age: '140' });
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Age must be between 0 and 130.');
    });

    it('accepts valid boundary ages 0 and 130', () => {
      expect(validatePatientFormData({ ...validData, age: '0' }).isValid).toBe(true);
      expect(validatePatientFormData({ ...validData, age: '130' }).isValid).toBe(true);
    });
  });

  describe('Sex option validation', () => {
    it('fails when sex is empty', () => {
      const result = validatePatientFormData({ ...validData, sex: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.sex).toBe('Please select a sex option.');
    });

    it('accepts all valid sex options', () => {
      expect(validatePatientFormData({ ...validData, sex: 'Male' }).isValid).toBe(true);
      expect(validatePatientFormData({ ...validData, sex: 'Female' }).isValid).toBe(true);
      expect(validatePatientFormData({ ...validData, sex: 'Other' }).isValid).toBe(true);
      expect(validatePatientFormData({ ...validData, sex: 'Prefer not to say' }).isValid).toBe(true);
    });
  });

  describe('Symptoms validation', () => {
    it('fails when symptoms are missing', () => {
      const result = validatePatientFormData({ ...validData, symptoms: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.symptoms).toBe('Symptoms are required for clinical intake.');
    });

    it('fails when symptoms are shorter than 3 characters', () => {
      const result = validatePatientFormData({ ...validData, symptoms: 'Hi' });
      expect(result.isValid).toBe(false);
      expect(result.errors.symptoms).toContain('min 3 characters');
    });

    it('fails when symptoms exceed 500 characters', () => {
      const result = validatePatientFormData({
        ...validData,
        symptoms: 'x'.repeat(501),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.symptoms).toBe('Symptoms must not exceed 500 characters.');
    });
  });

  describe('Optional fields length guards', () => {
    it('flags existing conditions exceeding 500 characters', () => {
      const result = validatePatientFormData({
        ...validData,
        existingConditions: 'C'.repeat(501),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.existingConditions).toBe('Existing conditions must not exceed 500 characters.');
    });

    it('flags allergies exceeding 500 characters', () => {
      const result = validatePatientFormData({
        ...validData,
        allergies: 'A'.repeat(501),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.allergies).toBe('Allergies must not exceed 500 characters.');
    });

    it('flags medications exceeding 500 characters', () => {
      const result = validatePatientFormData({
        ...validData,
        currentMedications: 'M'.repeat(501),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.currentMedications).toBe('Current medications must not exceed 500 characters.');
    });

    it('flags additional notes exceeding 1000 characters', () => {
      const result = validatePatientFormData({
        ...validData,
        additionalNotes: 'N'.repeat(1001),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.additionalNotes).toBe('Additional notes must not exceed 1000 characters.');
    });
  });
});

describe('File Name Sanitization', () => {
  it('replaces special and unsafe characters with underscores', () => {
    expect(sanitizeFileName('../../secret#report!.pdf')).toBe('.._.._secret_report_.pdf');
    expect(sanitizeFileName('Patient Report (v1.2).pdf')).toBe('Patient_Report__v1.2_.pdf');
  });

  it('handles empty and non-string inputs safely', () => {
    expect(sanitizeFileName('')).toBe('report.pdf');
    expect(sanitizeFileName(null as any)).toBe('report.pdf');
    expect(sanitizeFileName(undefined as any)).toBe('report.pdf');
  });

  it('truncates excessively long file names to 120 characters', () => {
    const longName = 'A'.repeat(200) + '.pdf';
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(120);
  });
});

describe('Report File Validation', () => {
  it('validates correct PDF and Image files', () => {
    expect(validateReportFile({ name: 'lab_report.pdf', size: 1024 * 100, type: 'application/pdf' }).isValid).toBe(true);
    expect(validateReportFile({ name: 'scan.png', size: 1024 * 200, type: 'image/png' }).isValid).toBe(true);
    expect(validateReportFile({ name: 'photo.jpg', size: 1024 * 300, type: 'image/jpeg' }).isValid).toBe(true);
  });

  it('fails on null or undefined file', () => {
    expect(validateReportFile(null).isValid).toBe(false);
    expect(validateReportFile(undefined).isValid).toBe(false);
  });

  it('fails on zero byte / empty file', () => {
    const res = validateReportFile({ name: 'empty.pdf', size: 0, type: 'application/pdf' });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('0 bytes');
  });

  it('fails when file size exceeds 25 MB limit', () => {
    const res = validateReportFile({
      name: 'large.pdf',
      size: MAX_FILE_SIZE_BYTES + 1024,
      type: 'application/pdf',
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('25 MB');
  });

  it('fails on unsupported file extensions/mime types', () => {
    const res = validateReportFile({ name: 'malware.exe', size: 1024, type: 'application/x-msdownload' });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Invalid file format');
  });
});
