import type {
  PatientFormData,
  StoredPatientRecord,
  UploadedReport,
  ReportProcessingResult,
} from '../types/patient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ClinicalBrief {
  patientName: string;
  demographics: string;
  mrn: string;
  impression: string;
  glycemicStatus: string;
  renalStatus: string;
  recommendations: string[];
  generatedAt: string;
}

/**
 * Check backend health status
 */
export const checkBackendHealth = async (): Promise<{ status: string; online: boolean }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { status: data.status || 'healthy', online: true };
    }
    return { status: 'offline', online: false };
  } catch {
    return { status: 'offline', online: false };
  }
};

/**
 * Save patient intake record to backend or local fallback
 */
export const apiSavePatient = async (
  formData: PatientFormData
): Promise<StoredPatientRecord> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.patient) return json.patient;
    }
  } catch {
    // Graceful fallback to client-side deterministic state
  }

  // Fallback in-memory creation
  return {
    ...formData,
    id: `ML-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    status: 'ready_for_structuring',
  };
};

/**
 * Process report with clinical data
 */
export const apiProcessReport = async (
  report: UploadedReport,
  patientData: PatientFormData
): Promise<ReportProcessingResult | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/reports/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, patientData }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.result) return json.result;
    }
  } catch {
    // Graceful fallback
  }

  return null;
};

/**
 * Generate AI Insight Brief
 */
export const apiGenerateInsight = async (
  patient: Partial<StoredPatientRecord>
): Promise<ClinicalBrief | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/insights/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.brief) return json.brief;
    }
  } catch {
    // Graceful fallback
  }

  return null;
};
