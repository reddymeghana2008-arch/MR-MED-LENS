import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { FormField } from './FormField';
import type { PatientFormErrors, SexOption } from '../types/patient';
import {
  ArrowRight,
  Sparkles,
  RotateCcw,
  ClipboardList,
  User,
  HeartPulse,
  Pill,
  FileSpreadsheet
} from 'lucide-react';

interface PatientFormProps {
  onSuccessContinue?: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onSuccessContinue }) => {
  const {
    formData,
    updateField,
    savePatientData,
    clearFormData,
    loadSampleData,
  } = usePatient();

  const [errors, setErrors] = useState<PatientFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sexOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
  ];

  const validate = (): { isValid: boolean; newErrors: PatientFormErrors } => {
    const newErrors: PatientFormErrors = {};

    // 1. Patient Name Validation
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient Name is required.';
    } else if (formData.patientName.trim().length < 2) {
      newErrors.patientName = 'Patient Name must be at least 2 characters.';
    }

    // 2. Age Validation
    if (!formData.age || formData.age.toString().trim() === '') {
      newErrors.age = 'Age is required.';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
        newErrors.age = 'Please enter a valid whole number for age.';
      } else if (ageNum < 0 || ageNum > 130) {
        newErrors.age = 'Age must be between 0 and 130.';
      }
    }

    // 3. Sex Validation
    if (!formData.sex) {
      newErrors.sex = 'Please select a sex option.';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  };

  const handleFieldChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    updateField(field, value);

    // Clear error for this field if it was previously invalid
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark key fields as touched
    setTouched({
      patientName: true,
      age: true,
      sex: true,
    });

    const { isValid, newErrors } = validate();

    if (!isValid) {
      // Focus on first error element
      const firstErrorKey = Object.keys(newErrors)[0] || 'patientName';
      const el = document.getElementById(firstErrorKey);
      el?.focus();
      return;
    }

    setIsSubmitting(true);

    // Store temporarily in frontend state
    setTimeout(() => {
      savePatientData();
      setIsSubmitting(false);
      if (onSuccessContinue) {
        onSuccessContinue();
      }
    }, 250);
  };

  const handleClear = () => {
    if (
      formData.patientName ||
      formData.age ||
      formData.symptoms
    ) {
      if (window.confirm('Are you sure you want to clear the patient form?')) {
        clearFormData();
        setErrors({});
        setTouched({});
      }
    } else {
      clearFormData();
      setErrors({});
      setTouched({});
    }
  };

  const handleAutoFill = () => {
    loadSampleData();
    setErrors({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Form Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100">
                  <ClipboardList className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Patient Information Intake
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1.5 ml-0 sm:ml-11">
                Enter core demographic parameters and clinical background to begin organizing the patient record.
              </p>
            </div>

            {/* Quick Demo Autofill for hackathon evaluation */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleAutoFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-700 bg-cyan-50/80 hover:bg-cyan-100/80 border border-cyan-200/80 transition-colors cursor-pointer"
                title="Populate realistic test clinical data"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Fill Sample Patient</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset form fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Demographics */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <User className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                1. Patient Demographics (Required)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              {/* Patient Name */}
              <div className="sm:col-span-6">
                <FormField
                  id="patientName"
                  label="Patient Name"
                  required
                  placeholder="e.g., Sarah Connor"
                  value={formData.patientName}
                  onChange={(e) => handleFieldChange('patientName', e.target.value)}
                  error={touched.patientName || errors.patientName ? errors.patientName : undefined}
                  helperText="Full legal name or clinical identifier"
                />
              </div>

              {/* Age */}
              <div className="sm:col-span-3">
                <FormField
                  id="age"
                  type="number"
                  label="Age"
                  required
                  placeholder="e.g., 42"
                  min={0}
                  max={130}
                  value={formData.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  error={touched.age || errors.age ? errors.age : undefined}
                  helperText="Years (0-130)"
                />
              </div>

              {/* Sex */}
              <div className="sm:col-span-3">
                <FormField
                  as="select"
                  id="sex"
                  label="Sex"
                  required
                  placeholder="Select sex..."
                  value={formData.sex}
                  onChange={(e) => handleFieldChange('sex', e.target.value as SexOption)}
                  options={sexOptions}
                  error={touched.sex || errors.sex ? errors.sex : undefined}
                  helperText="Biological or self-reported"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Presentation */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <HeartPulse className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                2. Clinical Presentation & Symptoms
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Symptoms */}
              <div>
                <FormField
                  as="textarea"
                  id="symptoms"
                  label="Symptoms & Chief Complaint"
                  placeholder="Describe observed symptoms, onset, severity, and duration (e.g. episodic migraines with visual aura for 4 days)..."
                  rows={4}
                  value={formData.symptoms}
                  onChange={(e) => handleFieldChange('symptoms', e.target.value)}
                  helperText="List primary patient-reported complaints"
                />
              </div>

              {/* Existing Conditions */}
              <div>
                <FormField
                  as="textarea"
                  id="existingConditions"
                  label="Existing Conditions"
                  placeholder="Known chronic illnesses or past medical history (e.g., Asthma, Hypertension, Type 2 Diabetes)..."
                  rows={4}
                  value={formData.existingConditions}
                  onChange={(e) => handleFieldChange('existingConditions', e.target.value)}
                  helperText="Comorbidities and ongoing diagnoses"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pharmacology & Sensitivities */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Pill className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                3. Medications & Known Allergies
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Allergies */}
              <div>
                <FormField
                  as="textarea"
                  id="allergies"
                  label="Allergies & Adverse Reactions"
                  placeholder="Document drug, food, or environmental allergies and the reaction type (e.g., Penicillin - rash, Peanuts - anaphylaxis)..."
                  rows={3}
                  value={formData.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  helperText="Include severity or reaction notes if known"
                />
              </div>

              {/* Current Medications */}
              <div>
                <FormField
                  as="textarea"
                  id="currentMedications"
                  label="Current Medications"
                  placeholder="Active pharmaceuticals, dosages, and regimens (e.g., Atorvastatin 20mg once daily at bedtime)..."
                  rows={3}
                  value={formData.currentMedications}
                  onChange={(e) => handleFieldChange('currentMedications', e.target.value)}
                  helperText="Prescriptions, OTC items, or supplements"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Context & Notes */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                4. Additional Clinical Notes
              </h2>
            </div>

            <div>
              <FormField
                as="textarea"
                id="additionalNotes"
                label="Additional Notes & Observations"
                placeholder="Supplementary notes, social history, lifestyle factors, or relevant lab tests mentioned during intake..."
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                helperText="Any auxiliary context that will aid subsequent AI information organization"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              Fields marked with <span className="text-rose-500 font-bold">*</span> are required for clinical intake validation.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-semibold text-sm shadow-md shadow-cyan-600/25 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus:ring-4 focus:ring-cyan-600/20 focus:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Intake...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
