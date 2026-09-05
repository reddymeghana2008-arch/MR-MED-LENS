import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ClinicalAnalysisDashboard } from '../components/ClinicalAnalysisDashboard';
import { PatientProvider, usePatient } from '../context/PatientContext';
import type { ReportProcessingResult } from '../types/patient';

const mockResult: ReportProcessingResult = {
  reportId: 'REP-TEST-1',
  fileName: 'Comprehensive_Metabolic_Panel_Vance_E.pdf',
  fileSize: 1420500,
  fileType: 'application/pdf',
  processedAt: '10:30:00 AM',
  executiveSummary: 'Clinical analysis indicates controlled glycemic control with mild normocytic anemia and elevated hs-CRP.',
  clinicalTakeaways: [
    {
      category: 'Etiology Correlation',
      title: 'Post-Viral Inflammatory Profile',
      detail: 'Recent recovery correlates with acute hs-CRP elevation.',
      confidence: 96,
      finding: 'hs-CRP 3.4 mg/L',
      whyItMatters: 'Post-viral inflammatory pattern',
      recommendedAction: 'Repeat in 4-6 weeks',
    },
    {
      category: 'Glycemic Management',
      title: 'Stable Diabetic Maintenance',
      detail: 'HbA1c of 6.8% demonstrates effective control.',
      confidence: 98,
      finding: 'HbA1c 6.8%',
      whyItMatters: 'Glycemic target met',
      recommendedAction: 'Maintain current regimen',
    },
  ],
  findings: [
    {
      id: 'find-1',
      category: 'Inflammatory Biomarkers',
      finding: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
      observedValue: '3.4 mg/L',
      referenceRange: '< 1.0 mg/L',
      status: 'High',
      provenance: 'Page 3, Section 5',
      sourcePage: 3,
      sourceSection: 'Inflammatory Reactants',
      sourceExcerpt: 'hs-CRP: 3.4 mg/L [H]',
      gaugeMin: 0,
      gaugeMax: 6.0,
      gaugeCurrent: 3.4,
      unit: 'mg/L',
    },
    {
      id: 'find-2',
      category: 'Hematology',
      finding: 'Hemoglobin (Hb)',
      observedValue: '11.4 g/dL',
      referenceRange: '12.0 - 16.0 g/dL',
      status: 'Low',
      provenance: 'Page 2, Section 4',
      sourcePage: 2,
      sourceSection: 'CBC Panel',
      sourceExcerpt: 'Hemoglobin: 11.4 g/dL [L]',
      gaugeMin: 8.0,
      gaugeMax: 18.0,
      gaugeCurrent: 11.4,
      unit: 'g/dL',
    },
    {
      id: 'find-3',
      category: 'Renal Profile',
      finding: 'Serum Creatinine',
      observedValue: '0.92 mg/dL',
      referenceRange: '0.59 - 1.04 mg/dL',
      status: 'Normal',
      provenance: 'Page 1, Section 2',
      sourcePage: 1,
      sourceSection: 'CMP Panel',
      sourceExcerpt: 'Creatinine: 0.92 mg/dL',
      gaugeMin: 0.3,
      gaugeMax: 2.0,
      gaugeCurrent: 0.92,
      unit: 'mg/dL',
    },
  ],
  riskItems: [
    {
      id: 'risk-1',
      severity: 'High Attention',
      title: 'Elevated Inflammatory Index (hs-CRP 3.4 mg/L)',
      description: 'hs-CRP is elevated above the 3.0 mg/L cutoff.',
      observedValue: '3.4 mg/L',
      referenceRange: '< 1.0 mg/L',
      provenance: 'Page 3, Section 5',
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'Drug-Condition',
      severity: 'warning',
      title: 'Cardiovascular & Potassium Surveillance',
      description: 'Monitor potassium on ACE-inhibitor.',
      implicatedItem: 'Lisinopril 10mg',
      clinicalAction: 'Routine 6-month surveillance',
    },
  ],
  structuredData: {
    demographics: [{ label: 'Patient Name', value: 'Eleanor Vance' }],
    laboratoryFindings: [{ test: 'hs-CRP', result: '3.4 mg/L', flag: 'High', range: '< 1.0 mg/L' }],
    medications: [{ name: 'Lisinopril', dosage: '10mg PO Daily', source: 'Intake' }],
    conditionsHistory: [{ condition: 'Hypertension', source: 'History' }],
    recommendations: [{ action: 'Repeat hs-CRP', note: 'In 4-6 weeks', priority: 'Elevated' }],
  },
  summaryNote: 'Decision support summary.',
};

// Test wrapper that injects processingResult
const DashboardTestWrapper: React.FC<{ onStartNew?: () => void }> = ({ onStartNew = vi.fn() }) => {
  const { setProcessingResult } = usePatient();

  React.useEffect(() => {
    setProcessingResult(mockResult);
  }, [setProcessingResult]);

  return <ClinicalAnalysisDashboard onStartNewAnalysis={onStartNew} />;
};

describe('ClinicalAnalysisDashboard Component', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    if (!navigator.clipboard) {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
    }
  });

  it('renders executive summary, biomarkers, and pharmaceutical cards when processingResult is active', () => {
    render(
      <PatientProvider>
        <DashboardTestWrapper />
      </PatientProvider>
    );

    expect(screen.getByText('Eleanor Vance')).toBeInTheDocument();
    expect(screen.getByText(/Post-Viral Inflammatory Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/High-Sensitivity C-Reactive Protein/i)).toBeInTheDocument();
    expect(screen.getByText(/Cardiovascular & Potassium Surveillance/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Pharmaceuticals/i)).toBeInTheDocument();
  });

  it('filters out-of-range biomarkers when Out-of-Range tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PatientProvider>
        <DashboardTestWrapper />
      </PatientProvider>
    );

    // Click Out-of-Range filter tab
    const outOfRangeBtn = screen.getByRole('button', { name: /Out-of-Range/i });
    await user.click(outOfRangeBtn);

    // Normal biomarker (Serum Creatinine) should be filtered out
    expect(screen.queryByText(/Serum Creatinine/i)).not.toBeInTheDocument();
    // Abnormal biomarkers should still be visible
    expect(screen.getByText(/High-Sensitivity C-Reactive Protein/i)).toBeInTheDocument();
    expect(screen.getByText(/Hemoglobin \(Hb\)/i)).toBeInTheDocument();
  });

  it('opens source evidence drawer when clicking a biomarker row', async () => {
    const user = userEvent.setup();
    render(
      <PatientProvider>
        <DashboardTestWrapper />
      </PatientProvider>
    );

    const biomarkerRow = screen.getByText(/High-Sensitivity C-Reactive Protein/i);
    await user.click(biomarkerRow);

    // Should open evidence modal drawer
    expect(screen.getByText(/Source Verification Chain/i)).toBeInTheDocument();
    expect(screen.getByText(/Document Location:/i)).toBeInTheDocument();
  });

  it('opens interactive AI insight generation modal and allows copying brief', async () => {
    const user = userEvent.setup();
    render(
      <PatientProvider>
        <DashboardTestWrapper />
      </PatientProvider>
    );

    const insightBtn = screen.getAllByRole('button', { name: /Generate Clinical Insight/i })[0];
    await user.click(insightBtn);

    expect(screen.getByText(/On-Demand Clinical Action Brief/i)).toBeInTheDocument();

    // Wait for simulated generation to complete
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /Copy Clinical Brief/i })).toBeInTheDocument();
      },
      { timeout: 3500 }
    );
  }, 5000);

  it('filters biomarkers dynamically when typing in search input', async () => {
    const user = userEvent.setup();
    render(
      <PatientProvider>
        <DashboardTestWrapper />
      </PatientProvider>
    );

    const searchInput = screen.getByLabelText(/Filter biomarkers by name/i);
    await user.type(searchInput, 'Hemoglobin');

    expect(screen.getByText(/Hemoglobin \(Hb\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/High-Sensitivity C-Reactive Protein/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Serum Creatinine/i)).not.toBeInTheDocument();
  });

  it('triggers window.print when clicking Export PDF / Print button', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <PatientProvider>
        <DashboardTestWrapper />
      </PatientProvider>
    );

    const exportBtn = screen.getByRole('button', { name: /Export PDF \/ Print/i });
    await user.click(exportBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
