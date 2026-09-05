import React, { useState, useRef } from 'react';
import { usePatient } from '../context/PatientContext';
import type { UploadedReport, ReportProcessingResult } from '../types/patient';
import { ClinicalAnalysisDashboard } from './ClinicalAnalysisDashboard';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Clock,
  FileCheck,
  Activity,
  User
} from 'lucide-react';



const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const ReportProcessing: React.FC = () => {
  const {
    formData,
    storedRecord,
    setCurrentStep,
    uploadedReport,
    setUploadedReport,
    processingResult,
    setProcessingResult,
    clearReport,
  } = usePatient();


  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Active patient display name
  const patientDisplayName =
    formData.patientName || storedRecord?.patientName || 'Anonymous Patient';
  const patientAge = formData.age || storedRecord?.age;
  const patientSex = formData.sex || storedRecord?.sex;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (fileType: string, fileName: string): string => {
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      return 'PDF Document';
    }
    if (fileType.includes('png') || fileName.toLowerCase().endsWith('.png')) {
      return 'PNG Image';
    }
    if (
      fileType.includes('jpeg') ||
      fileType.includes('jpg') ||
      fileName.toLowerCase().endsWith('.jpg') ||
      fileName.toLowerCase().endsWith('.jpeg')
    ) {
      return 'JPEG Image';
    }
    return 'Medical Report File';
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);
    setProcessingResult(null);

    // Validate type
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setErrorMessage(
        'Invalid file format. Please upload a PDF, PNG, JPG, or JPEG file.'
      );
      return false;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed file size is 25 MB.`
      );
      return false;
    }

    const report: UploadedReport = {
      id: `REP-${Date.now().toString().slice(-6)}`,
      name: file.name,
      size: file.size,
      type: file.type || (lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      lastModified: file.lastModified,
      uploadDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setUploadedReport(report);
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleRemoveFile = () => {
    clearReport();
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleReport = () => {
    setErrorMessage(null);
    setProcessingResult(null);

    const sampleReport: UploadedReport = {
      id: `REP-SAMPLE-842`,
      name: 'Comprehensive_Metabolic_Panel_Vance_E.pdf',
      size: 1420500, // ~1.35 MB
      type: 'application/pdf',
      lastModified: Date.now(),
      uploadDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setUploadedReport(sampleReport);
  };

  const handleStartNewAnalysis = () => {
    setProcessingResult(null);
    clearReport();
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [processingStage, setProcessingStage] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  const PROCESSING_STAGES = [
    { title: 'Securely reading uploaded report', desc: 'Parsing PDF structure and validating format integrity' },
    { title: 'Extracting clinical measurements', desc: 'Isolating laboratory panels, units, and timestamps' },
    { title: 'Structuring findings', desc: 'Organizing biomarkers into standard clinical categories' },
    { title: 'Checking reference ranges', desc: 'Flagging out-of-range anomalies and computing variances' },
    { title: 'Building clinical summary', desc: 'Synthesizing executive summary and preserving patient intake context' },
  ];

  const handleProcessReport = () => {
    // Requirement: Validate that a file has been selected
    if (!uploadedReport) {
      setErrorMessage('Please select or upload a medical report file first.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStage(0);
    setProcessingProgress(15);

    // Multi-stage realistic AI processing simulation sequence (~2.5 seconds total)
    const stageTimeouts: Array<ReturnType<typeof setTimeout>> = [];

    stageTimeouts.push(
      setTimeout(() => {
        setProcessingStage(1);
        setProcessingProgress(38);
      }, 500)
    );

    stageTimeouts.push(
      setTimeout(() => {
        setProcessingStage(2);
        setProcessingProgress(62);
      }, 1000)
    );

    stageTimeouts.push(
      setTimeout(() => {
        setProcessingStage(3);
        setProcessingProgress(84);
      }, 1500)
    );

    stageTimeouts.push(
      setTimeout(() => {
        setProcessingStage(4);
        setProcessingProgress(98);
      }, 2000)
    );

    stageTimeouts.push(
      setTimeout(() => {
        setProcessingProgress(100);

        // Create polished clinical analysis result with executive summary, key findings, risk items, and structured data
        const result: ReportProcessingResult = {
          reportId: uploadedReport.id,
          fileName: uploadedReport.name,
          fileSize: uploadedReport.size,
          fileType: uploadedReport.type,
          processedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          executiveSummary:
            'Clinical analysis of the uploaded diagnostic report indicates controlled glycemic control (HbA1c 6.8%) alongside mild normocytic anemia (Hemoglobin 11.4 g/dL) and elevated inflammatory marker activity (hs-CRP 3.4 mg/L). Renal clearance parameters and serum electrolytes remain within standard reference intervals. Findings correlate with documented patient complaints of persistent fatigue and exertional shortness of breath, requiring primary clinical review.',
          findings: [
            {
              id: 'find-1',
              category: 'Inflammatory Biomarkers',
              finding: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
              observedValue: '3.4 mg/L',
              referenceRange: '< 1.0 mg/L (Normal) | > 3.0 (Elevated)',
              status: 'High',
              provenance: 'Source: uploaded report • Page 3, Section 5',
              sourcePage: 3,
              sourceSection: 'Inflammatory & Acute Phase Reactants',
              sourceExcerpt: 'HIGH-SENSITIVITY C-REACTIVE PROTEIN: 3.4 mg/L [H] (Reference Range: < 1.0 mg/L). Result validated by automated turbidimetry. Marked acute elevation noted post-viral episode.',
              clinicalContext: 'Elevated acute phase reactant consistent with recent respiratory illness',
            },
            {
              id: 'find-2',
              category: 'Hematology / Red Blood Cells',
              finding: 'Hemoglobin (Hb)',
              observedValue: '11.4 g/dL',
              referenceRange: '12.0 – 16.0 g/dL',
              status: 'Low',
              provenance: 'Source: uploaded report • Page 2, Section 4',
              sourcePage: 2,
              sourceSection: 'Complete Blood Count (CBC) with Differential',
              sourceExcerpt: 'HEMOGLOBIN: 11.4 g/dL [L] (Reference Range: 12.0 - 16.0 g/dL). RBC Count: 3.92 M/uL. Mild normochromic, normocytic indices consistent with reported fatigue profile.',
              clinicalContext: 'Mild decrease in oxygen-carrying capacity; correlates with fatigue',
            },
            {
              id: 'find-3',
              category: 'Glycemic Control',
              finding: 'Hemoglobin A1c (HbA1c)',
              observedValue: '6.8%',
              referenceRange: '< 5.7% (Normal) | < 7.0% (Therapeutic Goal)',
              status: 'Normal',
              provenance: 'Source: uploaded report • Page 1, Section 1',
              sourcePage: 1,
              sourceSection: 'Endocrine & Glycemic Biomarkers',
              sourceExcerpt: 'HEMOGLOBIN A1c: 6.8 % (Reference: < 5.7 % Normal; < 7.0 % Therapeutic Goal). Estimated Average Glucose: 148 mg/dL. Current regimen Metformin 500mg BID shows stable outpatient control.',
              clinicalContext: 'Adequate chronic glycemic management on oral Metformin',
            },
            {
              id: 'find-4',
              category: 'Renal & Kidney Profile',
              finding: 'Serum Creatinine',
              observedValue: '0.92 mg/dL',
              referenceRange: '0.59 – 1.04 mg/dL',
              status: 'Normal',
              provenance: 'Source: uploaded report • Page 1, Section 2',
              sourcePage: 1,
              sourceSection: 'Comprehensive Metabolic Panel (CMP)',
              sourceExcerpt: 'CREATININE: 0.92 mg/dL (Reference Range: 0.59 - 1.04 mg/dL). Blood Urea Nitrogen (BUN): 14 mg/dL. Normal renal filtration baseline.',
              clinicalContext: 'Preserved glomerular filtration function',
            },
            {
              id: 'find-5',
              category: 'Renal & Kidney Profile',
              finding: 'Estimated GFR (CKD-EPI)',
              observedValue: '84 mL/min/1.73m²',
              referenceRange: '> 60 mL/min/1.73m²',
              status: 'Normal',
              provenance: 'Source: uploaded report • Page 1, Section 2',
              sourcePage: 1,
              sourceSection: 'Comprehensive Metabolic Panel (CMP)',
              sourceExcerpt: 'eGFR (CKD-EPI 2021): 84 mL/min/1.73m2 (Reference Range: > 60 mL/min/1.73m2). Stage 2 age-appropriate glomerular clearance.',
              clinicalContext: 'No laboratory evidence of renal impairment',
            },
            {
              id: 'find-6',
              category: 'Electrolytes & Fluid Balance',
              finding: 'Serum Potassium (K+)',
              observedValue: '4.3 mEq/L',
              referenceRange: '3.5 – 5.0 mEq/L',
              status: 'Normal',
              provenance: 'Source: uploaded report • Page 2, Section 3',
              sourcePage: 2,
              sourceSection: 'Electrolytes & Fluid Homeostasis',
              sourceExcerpt: 'POTASSIUM, SERUM: 4.3 mEq/L (Reference Range: 3.5 - 5.0 mEq/L). Stable electrolyte balance on ACE-inhibitor (Lisinopril 10mg).',
              clinicalContext: 'Normal electrolyte homeostasis during Lisinopril therapy',
            },
          ],
          riskItems: [
            {
              id: 'risk-1',
              severity: 'High Attention',
              title: 'Elevated Inflammatory Index (hs-CRP 3.4 mg/L)',
              description:
                'High-sensitivity C-reactive protein is elevated above the standard cardiovascular and systemic inflammatory cutoff (> 3.0 mg/L). Correlates with recent upper respiratory illness reported by patient.',
              observedValue: '3.4 mg/L',
              referenceRange: '< 1.0 mg/L',
              provenance: 'Source: uploaded report • Page 3, Section 5',
              sourcePage: 3,
              sourceSection: 'Inflammatory & Acute Phase Reactants',
              sourceExcerpt: 'HIGH-SENSITIVITY C-REACTIVE PROTEIN: 3.4 mg/L [H] (Reference Range: < 1.0 mg/L). Marked acute elevation noted post-viral episode.',
              isPrimary: true,
            },
            {
              id: 'risk-2',
              severity: 'Moderate Attention',
              title: 'Mild Normocytic Anemia (Hb 11.4 g/dL)',
              description:
                'Hemoglobin levels are mildly sub-therapeutic (11.4 g/dL vs. lower limit 12.0 g/dL). Plausible contributing factor to documented 3-week fatigue and exertional shortness of breath.',
              observedValue: '11.4 g/dL',
              referenceRange: '12.0 – 16.0 g/dL',
              provenance: 'Source: uploaded report • Page 2, Section 4',
              sourcePage: 2,
              sourceSection: 'Complete Blood Count (CBC) with Differential',
              sourceExcerpt: 'HEMOGLOBIN: 11.4 g/dL [L] (Reference Range: 12.0 - 16.0 g/dL). Mild normochromic, normocytic indices consistent with reported fatigue profile.',
              isPrimary: false,
            },
            {
              id: 'risk-3',
              severity: 'Observation',
              title: 'Diabetic Glycemic Range Monitored (HbA1c 6.8%)',
              description:
                'HbA1c remains within the therapeutic target (< 7.0%) for type 2 diabetes on Metformin BID, reflecting stable outpatient maintenance.',
              observedValue: '6.8%',
              referenceRange: '< 7.0% Target',
              provenance: 'Source: uploaded report • Page 1, Section 1',
              sourcePage: 1,
              sourceSection: 'Endocrine & Glycemic Biomarkers',
              sourceExcerpt: 'HEMOGLOBIN A1c: 6.8 % (Reference: < 5.7 % Normal; < 7.0 % Therapeutic Goal). Current regimen Metformin 500mg BID shows stable outpatient control.',
              isPrimary: false,
            },
          ],
          structuredData: {
            demographics: [
              { label: 'Patient Name', value: patientDisplayName },
              { label: 'Age / Gender', value: `${patientAge || '58'} yrs • ${patientSex || 'Female'}` },
              { label: 'Intake Record ID', value: storedRecord?.id || 'ML-973700' },
              { label: 'Report Source', value: uploadedReport.name },
            ],
            laboratoryFindings: [
              { test: 'hs-CRP (Inflammation)', result: '3.4 mg/L', flag: 'Elevated', range: '< 1.0 mg/L' },
              { test: 'Hemoglobin (CBC)', result: '11.4 g/dL', flag: 'Low', range: '12.0 - 16.0 g/dL' },
              { test: 'HbA1c (Glycemic)', result: '6.8%', flag: 'Target Met', range: '< 7.0%' },
              { test: 'Serum Creatinine', result: '0.92 mg/dL', flag: 'Normal', range: '0.59 - 1.04 mg/dL' },
              { test: 'eGFR', result: '84 mL/min', flag: 'Normal', range: '> 60 mL/min' },
              { test: 'Potassium (K+)', result: '4.3 mEq/L', flag: 'Normal', range: '3.5 - 5.0 mEq/L' },
            ],
            medications: [
              { name: 'Lisinopril', dosage: '10mg PO Daily', source: 'Documented Patient Intake' },
              { name: 'Metformin', dosage: '500mg PO BID', source: 'Documented Patient Intake' },
              { name: 'Vitamin D3', dosage: '1000 IU Daily', source: 'Documented Patient Intake' },
            ],
            conditionsHistory: [
              { condition: 'Primary Hypertension (controlled)', source: 'Documented History' },
              { condition: 'Type 2 Diabetes Mellitus (stable on Metformin)', source: 'Documented History & Report' },
              { condition: 'Mild Osteopenia', source: 'Documented History' },
            ],
            recommendations: [
              {
                action: 'Correlate with Clinical Presentation',
                note: 'Evaluate whether observed mild anemia (Hb 11.4 g/dL) correlates with reported fatigue and mild exertional dyspnea.',
                priority: 'Elevated',
              },
              {
                action: 'Consider Repeat Inflammatory Panel',
                note: 'Re-check hs-CRP in 4–6 weeks post-convalescence to verify resolution of post-viral inflammatory elevations.',
                priority: 'Elevated',
              },
              {
                action: 'Maintain Diabetic Routine Monitoring',
                note: 'Continue standard 3-6 month HbA1c surveillance; current regimen shows effective glycemic response.',
                priority: 'Standard',
              },
            ],
          },
          summaryNote:
            'Structured clinical intelligence organized for clinical decision support. All values linked to source document citations.',
        };

        setProcessingResult(result);
        setIsProcessing(false);
      }, 2500)
    );
  };


  const isPdf =
    uploadedReport?.type?.includes('pdf') ||
    uploadedReport?.name?.toLowerCase().endsWith('.pdf');

  // When analysis has completed, display the polished Clinical Analysis Dashboard
  if (processingResult) {
    return <ClinicalAnalysisDashboard onStartNewAnalysis={handleStartNewAnalysis} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Patient Context Continuity Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Patient Intake
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-emerald-700 font-medium">Data Preserved</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {patientDisplayName}
              {patientAge ? ` • ${patientAge} yrs` : ''}
              {patientSex ? ` • ${patientSex}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Step 1 (Edit Patient)</span>
        </button>
      </div>

      {/* Main Upload & Processing Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100">
                  <FileText className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Upload Medical Report
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1.5 ml-0 sm:ml-11">
                Upload a medical report in PDF or image format. MedLens will organize the information into a structured clinical record.
              </p>
            </div>

            {/* Quick Demo Sample Report helper */}
            <div className="self-start sm:self-auto">
              <button
                type="button"
                onClick={handleLoadSampleReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-700 bg-cyan-50/80 hover:bg-cyan-100/80 border border-cyan-200/80 transition-colors cursor-pointer"
                title="Populate a test clinical report"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Use Sample Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Drag & Drop Area */}
          {!uploadedReport ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50/50 scale-[1.005]'
                  : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50/70 bg-slate-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">
                    Drag & drop your report here
                  </p>
                  <p className="text-sm text-cyan-700 font-semibold hover:underline mt-0.5">
                    or browse files
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Supported formats: PDF, JPG, JPEG, PNG</span>
                  <span>•</span>
                  <span>Max size: 25 MB</span>
                </div>
              </div>
            </div>
          ) : (
            /* Selected File Display Card */
            <div className="p-5 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-4">
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-cyan-200 text-cyan-700 flex items-center justify-center shadow-2xs shrink-0">
                    {isPdf ? (
                      <FileText className="w-6 h-6 text-rose-600" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-cyan-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {uploadedReport.name}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                        {getFileTypeLabel(uploadedReport.type, uploadedReport.name)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Size: {formatFileSize(uploadedReport.size)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Selected at {uploadedReport.uploadDate}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer shrink-0"
                  title="Remove this file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Status Note */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-cyan-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Report validated. Click <strong>"Process Medical Report"</strong> to preview clinical structuring.
                </span>
              </div>
            </div>
          )}

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs sm:text-sm text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Safety & Provenance Notice (Requirement 11) */}
          {/* Safety & Provenance Notice (Requirement 11) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-800">
                Clinical Provenance & Safety Notice:
              </p>
              <p>
                Extracted information will be shown with its source and should be verified against the original report.
              </p>
            </div>
          </div>

          {/* Staged AI Processing Overlay Card */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-5 shadow-lg animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Clinical Intelligence Pipeline</span>
                      <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        Demo Mode
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Structuring {uploadedReport?.name} into standardized clinical observations
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {processingProgress}% Complete
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>

              {/* 5 Distinct Processing Stages */}
              <div className="space-y-2.5 pt-1">
                {PROCESSING_STAGES.map((stage, idx) => {
                  const isDone = idx < processingStage;
                  const isActive = idx === processingStage;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-xs'
                          : isDone
                          ? 'bg-slate-850/50 border-emerald-900/40 text-slate-300'
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center animate-spin">
                            <div className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-600 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold ${isActive ? 'text-cyan-200' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                          {stage.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {stage.desc}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-mono text-cyan-400 animate-pulse shrink-0">
                          Active...
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400">
                Frontend demonstration simulation • No medical claims or automated diagnoses generated.
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Information</span>
            </button>

            <button
              type="button"
              onClick={handleProcessReport}
              disabled={isProcessing || !uploadedReport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold text-sm shadow-md shadow-cyan-600/25 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:ring-4 focus:ring-cyan-600/20 focus:outline-none"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{PROCESSING_STAGES[processingStage]?.title || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Process Medical Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

