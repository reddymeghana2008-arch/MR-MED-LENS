import React from 'react';
import { AlertCircle } from 'lucide-react';
import { usePatient } from '../context/PatientContext';

export const DisclaimerBanner: React.FC = () => {
  const { currentStep, processingResult } = usePatient();
  
  const stepNumber = processingResult ? 3 : currentStep;
  const stepLabel =
    stepNumber === 1
      ? 'Workflow Step 1 of 3: Patient Intake'
      : stepNumber === 2
      ? 'Workflow Step 2 of 3: Report Upload'
      : 'Workflow Step 3 of 3: Clinical Intelligence';

  return (
    <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <span className="font-semibold text-amber-950">Clinical Information Notice:</span>{' '}
            MedLens is an AI-powered clinical information organization application.{' '}
            <span className="font-semibold underline decoration-amber-400 underline-offset-2">
              It is NOT a diagnostic or treatment application.
            </span>
          </p>
        </div>
        <div className="hidden lg:block text-xs text-amber-800 bg-amber-100/80 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-semibold">
          {stepLabel}
        </div>
      </div>
    </div>
  );
};
