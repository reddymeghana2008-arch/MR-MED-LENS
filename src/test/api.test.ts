import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkBackendHealth,
  apiSavePatient,
  apiProcessReport,
  apiGenerateInsight,
} from '../services/api';
import type { PatientFormData, UploadedReport } from '../types/patient';

describe('API Service Layer', () => {
  const samplePatientData: PatientFormData = {
    patientName: 'Eleanor Vance',
    age: '58',
    sex: 'Female',
    symptoms: 'Fatigue and exertional dyspnea',
    existingConditions: 'Hypertension',
    allergies: 'Penicillin',
    currentMedications: 'Lisinopril 10mg',
    additionalNotes: 'Post-viral recovery',
  };

  const sampleReport: UploadedReport = {
    id: 'REP-101',
    name: 'CMP_Report.pdf',
    size: 1024 * 500,
    type: 'application/pdf',
    lastModified: Date.now(),
    uploadDate: '10:00 AM',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkBackendHealth', () => {
    it('returns online true when backend responds with 200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      } as Response);

      const health = await checkBackendHealth();
      expect(health.online).toBe(true);
      expect(health.status).toBe('healthy');
    });

    it('returns online false when network request fails', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const health = await checkBackendHealth();
      expect(health.online).toBe(false);
      expect(health.status).toBe('offline');
    });
  });

  describe('apiSavePatient', () => {
    it('saves patient via backend if server is reachable', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          patient: { ...samplePatientData, id: 'ML-998877', timestamp: '2026-09-05T00:00:00Z', status: 'ready_for_structuring' },
        }),
      } as Response);

      const result = await apiSavePatient(samplePatientData);
      expect(result.id).toBe('ML-998877');
      expect(result.patientName).toBe('Eleanor Vance');
    });

    it('gracefully falls back to local record creation if backend is offline', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend unreachable'));

      const result = await apiSavePatient(samplePatientData);
      expect(result.id).toMatch(/^ML-/);
      expect(result.patientName).toBe('Eleanor Vance');
      expect(result.status).toBe('ready_for_structuring');
    });
  });

  describe('apiProcessReport', () => {
    it('returns processed result when backend is online', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          result: {
            reportId: 'REP-101',
            fileName: 'CMP_Report.pdf',
            findings: [],
            riskItems: [],
          },
        }),
      } as Response);

      const res = await apiProcessReport(sampleReport, samplePatientData);
      expect(res).toBeDefined();
      expect(res?.reportId).toBe('REP-101');
    });

    it('returns null on backend error for client-side engine handling', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Server Error'));

      const res = await apiProcessReport(sampleReport, samplePatientData);
      expect(res).toBeNull();
    });
  });

  describe('apiGenerateInsight', () => {
    it('returns generated brief when backend is online', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          brief: {
            patientName: 'Eleanor Vance',
            demographics: '58F',
            impression: 'Test impression',
            recommendations: ['Follow up in 4 weeks'],
          },
        }),
      } as Response);

      const res = await apiGenerateInsight({ patientName: 'Eleanor Vance', age: '58', sex: 'Female' });
      expect(res).toBeDefined();
      expect(res?.patientName).toBe('Eleanor Vance');
    });

    it('returns null on failure for client-side simulation handling', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Server Error'));

      const res = await apiGenerateInsight({ patientName: 'Eleanor Vance' });
      expect(res).toBeNull();
    });
  });
});
