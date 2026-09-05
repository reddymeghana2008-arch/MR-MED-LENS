import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  PatientFormData,
  StoredPatientRecord,
  UploadedReport,
  ReportProcessingResult,
} from '../types/patient';
import { INITIAL_PATIENT_DATA, SAMPLE_PATIENT_DATA } from '../types/patient';
import { apiSavePatient } from '../services/api';

interface PatientContextType {
  formData: PatientFormData;
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData>>;
  updateField: <K extends keyof PatientFormData>(field: K, value: PatientFormData[K]) => void;
  storedRecord: StoredPatientRecord | null;
  savePatientData: () => StoredPatientRecord;
  clearFormData: () => void;
  loadSampleData: () => void;
  isConfirmed: boolean;
  setIsConfirmed: (confirmed: boolean) => void;
  currentStep: 1 | 2 | 3;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  uploadedReport: UploadedReport | null;
  setUploadedReport: React.Dispatch<React.SetStateAction<UploadedReport | null>>;
  processingResult: ReportProcessingResult | null;
  setProcessingResult: React.Dispatch<React.SetStateAction<ReportProcessingResult | null>>;
  clearReport: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Temporary frontend state for live form editing
  const [formData, setFormData] = useState<PatientFormData>(INITIAL_PATIENT_DATA);

  // Temporary frontend state for persisted record after validation & "Continue"
  const [storedRecord, setStoredRecord] = useState<StoredPatientRecord | null>(null);

  // State to track if user proceeded past the intake form
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Multi-step workflow navigation state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Uploaded report state
  const [uploadedReport, setUploadedReport] = useState<UploadedReport | null>(null);

  // Demo processing result state
  const [processingResult, setProcessingResult] = useState<ReportProcessingResult | null>(null);

  const updateField = <K extends keyof PatientFormData>(field: K, value: PatientFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const savePatientData = (): StoredPatientRecord => {
    const record: StoredPatientRecord = {
      ...formData,
      id: `ML-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      status: 'ready_for_structuring',
    };
    setStoredRecord(record);
    setIsConfirmed(true);
    setCurrentStep(2);

    // Seamlessly synchronize with backend API in background
    apiSavePatient(formData).catch(() => {});

    return record;
  };

  const clearFormData = () => {
    setFormData(INITIAL_PATIENT_DATA);
    setStoredRecord(null);
    setIsConfirmed(false);
    setUploadedReport(null);
    setProcessingResult(null);
  };

  const clearReport = () => {
    setUploadedReport(null);
    setProcessingResult(null);
  };

  const loadSampleData = () => {
    setFormData(SAMPLE_PATIENT_DATA);
  };

  return (
    <PatientContext.Provider
      value={{
        formData,
        setFormData,
        updateField,
        storedRecord,
        savePatientData,
        clearFormData,
        loadSampleData,
        isConfirmed,
        setIsConfirmed,
        currentStep,
        setCurrentStep,
        uploadedReport,
        setUploadedReport,
        processingResult,
        setProcessingResult,
        clearReport,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};


// oxlint-disable-next-line react/only-export-components
export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
