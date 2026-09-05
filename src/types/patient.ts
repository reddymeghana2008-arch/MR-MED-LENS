export type SexOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';

export interface PatientFormData {
  patientName: string;
  age: string;
  sex: SexOption;
  symptoms: string;
  existingConditions: string;
  allergies: string;
  currentMedications: string;
  additionalNotes: string;
}

export interface PatientFormErrors {
  patientName?: string;
  age?: string;
  sex?: string;
  symptoms?: string;
  existingConditions?: string;
  allergies?: string;
  currentMedications?: string;
  additionalNotes?: string;
}

export interface StoredPatientRecord extends PatientFormData {
  id: string;
  timestamp: string;
  status: 'draft' | 'ready_for_structuring';
}

export interface UploadedReport {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  previewUrl?: string;
  uploadDate: string;
}

export type FindingStatus = 'Normal' | 'High' | 'Low' | 'Critical';
export type RiskSeverity = 'High Attention' | 'Moderate Attention' | 'Observation';

export interface DetailedFinding {
  id?: string;
  category: string;
  finding: string;
  observedValue: string;
  referenceRange: string;
  status: FindingStatus;
  provenance: string; // e.g. "Source: uploaded report • Page 1, Section 2"
  sourcePage: number | string;
  sourceSection: string;
  sourceExcerpt: string;
  clinicalContext?: string;
}

export interface RiskAttentionItem {
  id: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  observedValue: string;
  referenceRange: string;
  provenance: string;
  sourcePage?: number | string;
  sourceSection?: string;
  sourceExcerpt?: string;
  isPrimary?: boolean;
}

export interface StructuredClinicalData {
  demographics: { label: string; value: string }[];
  laboratoryFindings: { test: string; result: string; flag: string; range: string }[];
  medications: { name: string; dosage: string; source: string }[];
  conditionsHistory: { condition: string; source: string }[];
  recommendations: { action: string; note: string; priority: 'Standard' | 'Elevated' }[];
}

export interface ReportProcessingResult {
  reportId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  processedAt: string;
  executiveSummary: string;
  findings: DetailedFinding[];
  riskItems: RiskAttentionItem[];
  structuredData: StructuredClinicalData;
  summaryNote: string;
}

export const INITIAL_PATIENT_DATA: PatientFormData = {
  patientName: '',
  age: '',
  sex: '',
  symptoms: '',
  existingConditions: '',
  allergies: '',
  currentMedications: '',
  additionalNotes: '',
};

export const SAMPLE_PATIENT_DATA: PatientFormData = {
  patientName: 'Eleanor Vance',
  age: '58',
  sex: 'Female',
  symptoms: 'Subacute progressive fatigue over 3 weeks, mild exertional dyspnea, and intermittent bilateral ankle swelling noted primarily in late evenings.',
  existingConditions: 'Primary hypertension (controlled), Type 2 Diabetes Mellitus (HbA1c 6.8%), Mild osteopenia.',
  allergies: 'Penicillin (urticaria/rash), Sulfonamides (mild nausea).',
  currentMedications: 'Lisinopril 10mg PO daily, Metformin 500mg PO BID with meals, Vitamin D3 1000 IU daily.',
  additionalNotes: 'Patient notes symptoms started shortly after recent upper respiratory infection resolved. No chest pain, syncope, or orthopnea reported.',
};


