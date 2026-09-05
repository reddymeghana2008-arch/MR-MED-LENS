import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportProcessing } from '../components/ReportProcessing';
import { PatientProvider } from '../context/PatientContext';

describe('ReportProcessing Component', () => {
  const renderReportProcessing = () => {
    return render(
      <PatientProvider>
        <ReportProcessing />
      </PatientProvider>
    );
  };

  beforeEach(() => {
    window.scrollTo = vi.fn();
    vi.useRealTimers();
  });

  it('renders upload zone and sample report button', () => {
    renderReportProcessing();

    expect(screen.getByText(/Upload Medical Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your report here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use Sample Report/i })).toBeInTheDocument();
  });

  it('loads sample report when clicking Use Sample Report', async () => {
    const user = userEvent.setup();
    renderReportProcessing();

    const sampleBtn = screen.getByRole('button', { name: /Use Sample Report/i });
    await user.click(sampleBtn);

    expect(screen.getByText('Comprehensive_Metabolic_Panel_Vance_E.pdf')).toBeInTheDocument();
    expect(screen.getByText(/Report validated/i)).toBeInTheDocument();
  });

  it('removes uploaded report when clicking remove button', async () => {
    const user = userEvent.setup();
    renderReportProcessing();

    // Load sample report first
    await user.click(screen.getByRole('button', { name: /Use Sample Report/i }));
    expect(screen.getByText('Comprehensive_Metabolic_Panel_Vance_E.pdf')).toBeInTheDocument();

    // Click remove report
    const removeBtn = screen.getByTitle(/Remove this file/i);
    await user.click(removeBtn);

    expect(screen.queryByText('Comprehensive_Metabolic_Panel_Vance_E.pdf')).not.toBeInTheDocument();
  });

  it('validates file upload format and size', () => {
    renderReportProcessing();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Create mock invalid file
    const invalidFile = new File(['mock content'], 'image.exe', { type: 'application/x-msdownload' });
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(screen.getByText(/Invalid file format/i)).toBeInTheDocument();
  });

  it('runs multi-stage processing simulation and renders Clinical Analysis Dashboard upon completion', async () => {
    const user = userEvent.setup();
    renderReportProcessing();

    // Load sample report
    await user.click(screen.getByRole('button', { name: /Use Sample Report/i }));

    // Click Process Report
    const processBtn = screen.getByRole('button', { name: /Process Medical Report/i });
    await user.click(processBtn);

    // Should display active processing stages
    expect(screen.getAllByText(/Securely reading uploaded report/i).length).toBeGreaterThan(0);

    // Wait for simulation to complete (~2.5s) and render dashboard
    await waitFor(
      () => {
        expect(screen.getAllByText(/High-Sensitivity C-Reactive Protein/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Active Pharmaceuticals/i)).toBeInTheDocument();
      },
      { timeout: 7000 }
    );
  }, 12000);
});
