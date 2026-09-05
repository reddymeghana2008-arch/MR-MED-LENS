import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientForm } from '../components/PatientForm';
import { PatientProvider } from '../context/PatientContext';

describe('PatientForm Component', () => {
  const renderPatientForm = (onSuccess = vi.fn()) => {
    return {
      ...render(
        <PatientProvider>
          <PatientForm onSuccessContinue={onSuccess} />
        </PatientProvider>
      ),
      onSuccess,
    };
  };

  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('renders all form section headers and input fields', () => {
    renderPatientForm();

    expect(screen.getByText('Patient Information')).toBeInTheDocument();
    expect(screen.getByText('Clinical Presentation & Symptoms')).toBeInTheDocument();
    expect(screen.getByText('Medications & Known Allergies')).toBeInTheDocument();
    expect(screen.getByText('Additional Clinical Notes')).toBeInTheDocument();

    expect(screen.getByLabelText(/Patient Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sex/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Symptoms/i)).toBeInTheDocument();
  });

  it('displays validation error messages when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderPatientForm();

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueBtn);

    expect(screen.getByText('Patient Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Age is required.')).toBeInTheDocument();
    expect(screen.getByText('Please select a sex option.')).toBeInTheDocument();
    expect(screen.getByText('Symptoms are required for clinical intake.')).toBeInTheDocument();
  });

  it('populates test data when clicking Fill Sample button', async () => {
    const user = userEvent.setup();
    renderPatientForm();

    const fillSampleBtn = screen.getByRole('button', { name: /Fill Sample/i });
    await user.click(fillSampleBtn);

    const nameInput = screen.getByLabelText(/Patient Name/i) as HTMLInputElement;
    const ageInput = screen.getByLabelText(/Age/i) as HTMLInputElement;
    const sexSelect = screen.getByLabelText(/Sex/i) as HTMLSelectElement;

    expect(nameInput.value).toBe('Eleanor Vance');
    expect(ageInput.value).toBe('58');
    expect(sexSelect.value).toBe('Female');
  });

  it('submits form successfully when valid data is entered', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderPatientForm(onSuccess);

    // Auto-fill valid data
    const fillSampleBtn = screen.getByRole('button', { name: /Fill Sample/i });
    await user.click(fillSampleBtn);

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueBtn);

    // After brief delay, onSuccessContinue callback should be triggered
    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('clears form inputs when Reset button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn().mockReturnValue(true);
    renderPatientForm();

    // Fill sample first
    await user.click(screen.getByRole('button', { name: /Fill Sample/i }));
    const nameInput = screen.getByLabelText(/Patient Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Eleanor Vance');

    // Click Reset
    await user.click(screen.getByRole('button', { name: /Reset/i }));
    expect(nameInput.value).toBe('');
  });
});
