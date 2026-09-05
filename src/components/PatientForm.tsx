import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { FormField } from './FormField';
import type { PatientFormErrors, SexOption } from '../types/patient';
import {
  ArrowRight,
  Sparkles,
  RotateCcw,
  FileText,
  User,
  Calendar,
  HeartPulse,
  Pill,
  FileSpreadsheet,
  Info,
  Stethoscope,
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
    currentStep,
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

    // 4. Symptoms Validation
    if (!formData.symptoms.trim()) {
      newErrors.symptoms = 'Symptoms are required for clinical intake.';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  };

  const handleFieldChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    updateField(field, value);

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

    setTouched({
      patientName: true,
      age: true,
      sex: true,
      symptoms: true,
    });

    const { isValid, newErrors } = validate();

    if (!isValid) {
      const firstErrorKey = Object.keys(newErrors)[0] || 'patientName';
      const el = document.getElementById(firstErrorKey);
      el?.focus();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      savePatientData();
      setIsSubmitting(false);
      if (onSuccessContinue) {
        onSuccessContinue();
      }
    }, 200);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset all intake fields?')) {
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
    <div className="w-full space-y-5">
      {/* 1. TOP HEADER & STEP INDICATOR CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                New Report
              </h1>
              {/* Quick Sample Patient Helper */}
              <button
                type="button"
                onClick={handleAutoFill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                title="Populate test clinical data"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Fill Sample</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enter clinical details below to generate an AI-powered clinical report.
            </p>
          </div>
        </div>

        {/* Stepper & Illustration Accent */}
        <div className="flex items-center gap-5 self-start md:self-center">
          {/* Stepper */}
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              Step {currentStep} of 3
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="flex items-center gap-1 text-blue-700 font-bold">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Patient Info</span>
              </span>
              <span className="w-4 h-0.5 bg-slate-200" />
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Report Processing</span>
              </span>
              <span className="w-4 h-0.5 bg-slate-200" />
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Summary</span>
              </span>
            </div>
          </div>

          {/* Stethoscope / Clipboard Graphic Icon */}
          <div className="hidden lg:flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-50 to-blue-100 border border-blue-200/80 items-center justify-center text-blue-600 shadow-2xs shrink-0">
            <Stethoscope className="w-7 h-7 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* FORM BODY CONTAINER */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* SECTION 1: Patient Information (Blue Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50/50 via-slate-50/20 to-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                1
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Patient Information</h2>
                <p className="text-[11px] text-slate-500">Enter the patient's demographic details.</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              Required
            </span>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Patient Name */}
            <div className="sm:col-span-6">
              <FormField
                id="patientName"
                label="Patient Name"
                required
                placeholder="e.g., Sarah Connor"
                icon={<User className="w-4 h-4 text-slate-400" />}
                value={formData.patientName}
                maxLength={100}
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
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                min={0}
                max={130}
                maxLength={3}
                value={formData.age}
                onChange={(e) => handleFieldChange('age', e.target.value)}
                error={touched.age || errors.age ? errors.age : undefined}
                helperText="Years (0–130)"
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

        {/* SECTION 2: Clinical Presentation & Symptoms (Purple Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-50/50 via-slate-50/20 to-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                2
              </div>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Clinical Presentation & Symptoms</h2>
                <p className="text-[11px] text-slate-500">Describe the patient's symptoms, onset, severity, and duration.</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              Required
            </span>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symptoms */}
            <div>
              <FormField
                as="textarea"
                id="symptoms"
                label="Symptoms"
                required
                placeholder="e.g., fever, cough, shortness of breath..."
                rows={3}
                maxLength={500}
                showCount
                value={formData.symptoms}
                onChange={(e) => handleFieldChange('symptoms', e.target.value)}
                error={touched.symptoms || errors.symptoms ? errors.symptoms : undefined}
                helperText="Describe observed symptoms, onset, severity, and duration."
              />
            </div>

            {/* Existing Conditions */}
            <div>
              <FormField
                as="textarea"
                id="existingConditions"
                label="Existing Conditions"
                placeholder="e.g., Asthma, Hypertension, Type 2 Diabetes..."
                rows={3}
                maxLength={500}
                showCount
                value={formData.existingConditions}
                onChange={(e) => handleFieldChange('existingConditions', e.target.value)}
                helperText="Known chronic illnesses or past medical history."
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Medications & Known Allergies (Green Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:px-6 sm:py-4 bg-gradient-to-r from-emerald-50/50 via-slate-50/20 to-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Medications & Known Allergies</h2>
                <p className="text-[11px] text-slate-500">Include current medications, dosages, and any known allergies or adverse reactions.</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Optional
            </span>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allergies */}
            <div>
              <FormField
                as="textarea"
                id="allergies"
                label="Allergies & Adverse Reactions"
                placeholder="e.g., Penicillin - rash, Peanuts - anaphylaxis..."
                rows={3}
                maxLength={500}
                showCount
                value={formData.allergies}
                onChange={(e) => handleFieldChange('allergies', e.target.value)}
                helperText="Include severity or reaction notes if known."
              />
            </div>

            {/* Current Medications */}
            <div>
              <FormField
                as="textarea"
                id="currentMedications"
                label="Current Medications"
                placeholder="e.g., Atorvastatin 20mg once daily..."
                rows={3}
                maxLength={500}
                showCount
                value={formData.currentMedications}
                onChange={(e) => handleFieldChange('currentMedications', e.target.value)}
                helperText="Prescriptions, OTC items, or supplements."
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Additional Clinical Notes (Orange Theme) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:px-6 sm:py-4 bg-gradient-to-r from-amber-50/50 via-slate-50/20 to-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                4
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Additional Clinical Notes</h2>
                <p className="text-[11px] text-slate-500">Add any other relevant information (social history, lifestyle factors, lab tests, etc.).</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Optional
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <FormField
              as="textarea"
              id="additionalNotes"
              label=""
              placeholder="Supplementary notes, social history, lifestyle factors, or relevant lab tests mentioned during intake..."
              rows={3}
              maxLength={1000}
              showCount
              value={formData.additionalNotes}
              onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
            />
          </div>
        </div>

        {/* FOOTER ACTION BAR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Fields marked with <span className="text-rose-500 font-bold">*</span> are required for clinical intake validation.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus:ring-4 focus:ring-blue-600/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
