import React from 'react';
import { UserCheck, FileUp, FileText, CheckCircle2 } from 'lucide-react';
import { usePatient } from '../context/PatientContext';

interface StepIndicatorProps {
  currentStep?: 1 | 2 | 3;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep: propStep }) => {
  const { currentStep: contextStep, setCurrentStep, isConfirmed, processingResult, clearReport } = usePatient();
  const activeStep = processingResult ? 3 : (propStep ?? contextStep);

  const steps = [
    {
      id: 1,
      name: 'Patient Information',
      description: 'Demographics & Clinical History',
      icon: UserCheck,
      status: activeStep === 1 ? 'current' : 'complete',
      clickable: true,
      onClick: () => setCurrentStep(1),
    },
    {
      id: 2,
      name: 'Medical Report Processing',
      description: 'Document Upload & Structuring',
      icon: FileUp,
      status: activeStep === 2 ? 'current' : activeStep > 2 ? 'complete' : 'upcoming',
      clickable: isConfirmed || activeStep >= 2,
      onClick: () => {
        if (processingResult) {
          // If viewing dashboard, returning to Step 2 clears the result so user can upload another or change file
          clearReport();
        }
        setCurrentStep(2);
      },
    },
    {
      id: 3,
      name: 'Clinical Summary',
      description: 'Organized Intelligence View',
      icon: FileText,
      status: activeStep === 3 ? 'current' : 'upcoming',
      clickable: Boolean(processingResult),
      onClick: () => {
        if (processingResult) {
          setCurrentStep(2);
        }
      },
    },
  ];


  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-2 sm:px-0">
      <nav aria-label="Progress">
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCurrent = step.status === 'current';
            const isComplete = step.status === 'complete';

            return (
              <li
                key={step.name}
                onClick={() => {
                  if (step.clickable && step.onClick) {
                    step.onClick();
                  }
                }}
                role={step.clickable ? 'button' : undefined}
                tabIndex={step.clickable ? 0 : undefined}
                className={`relative flex items-center p-3.5 rounded-xl border transition-all duration-200 ${
                  step.clickable && step.id !== activeStep ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
                } ${
                  isCurrent
                    ? 'bg-white border-cyan-500 shadow-sm ring-1 ring-cyan-500/20'
                    : isComplete
                    ? 'bg-white border-emerald-400/80 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 text-slate-400'
                }`}
              >

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold text-sm mr-3 ${
                    isCurrent
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isComplete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs uppercase tracking-wider font-bold ${
                        isCurrent
                          ? 'text-cyan-700'
                          : isComplete
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      Step 0{step.id}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-ping" />
                    )}
                  </div>
                  <p
                    className={`text-sm font-semibold truncate ${
                      isCurrent
                        ? 'text-slate-900'
                        : isComplete
                        ? 'text-slate-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
