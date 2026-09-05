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
  gaugeMin?: number;
  gaugeMax?: number;
  gaugeOptimalLow?: number;
  gaugeOptimalHigh?: number;
  gaugeCurrent?: number;
  unit?: string;
  priorValue?: string;
  trend?: 'elevated_increase' | 'decreased' | 'stable_target' | 'normal_baseline';
  trendLabel?: string;
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

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface MedicationAlert {
  id: string;
  type: 'Drug-Condition' | 'Organ-Clearance' | 'Allergy-Sensitivity' | 'Therapeutic-Target';
  severity: AlertSeverity;
  title: string;
  description: string;
  implicatedItem: string;
  clinicalAction: string;
  sourceSection?: string;
}

export interface ClinicalTakeaway {
  category: string;
  title: string;
  detail: string;
  confidence: number;
  finding?: string;
  supportingData?: string;
  whyItMatters?: string;
  recommendedAction?: string;
  severity?: 'High' | 'Moderate' | 'Low' | 'Routine';
}

export interface MedicalTimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'condition' | 'medication' | 'lab' | 'symptom';
  category: string;
  description: string;
  status: 'active' | 'resolved' | 'monitoring';
}

export interface StructuredClinicalData {
  demographics: { label: string; value: string }[];
  laboratoryFindings: { test: string; result: string; flag: string; range: string; prior?: string }[];
  medications: { name: string; dosage: string; source: string; frequency?: string; indication?: string }[];
  conditionsHistory: { condition: string; source: string; onset?: string }[];
  recommendations: { action: string; note: string; priority: 'Standard' | 'Elevated' }[];
}

export interface ReportProcessingResult {
  reportId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  processedAt: string;
  executiveSummary: string;
  clinicalTakeaways?: ClinicalTakeaway[];
  findings: DetailedFinding[];
  riskItems: RiskAttentionItem[];
  alerts?: MedicationAlert[];
  structuredData: StructuredClinicalData;
  timeline?: MedicalTimelineEvent[];
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
