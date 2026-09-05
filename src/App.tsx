import React from 'react';
import { PatientProvider, usePatient } from './context/PatientContext';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { StepIndicator } from './components/StepIndicator';
import { PatientForm } from './components/PatientForm';
import { PatientDataPreview } from './components/PatientDataPreview';
import { ReportProcessing } from './components/ReportProcessing';
import { ShieldCheck, HeartPulse } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentStep, setCurrentStep, isConfirmed, setIsConfirmed } = usePatient();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* 1. Header with branding & tagline */}
      <Header />

      {/* 2. Clinical Disclaimer Banner (Non-diagnostic, non-treatment) */}
      <DisclaimerBanner />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Dynamic Step Views */}
        {currentStep === 1 && (
          !isConfirmed ? (
            <PatientForm onSuccessContinue={() => setCurrentStep(2)} />
          ) : (
            <PatientDataPreview onBackToEdit={() => setIsConfirmed(false)} />
          )
        )}

        {currentStep === 2 && (
          <ReportProcessing />
        )}
      </main>


      {/* 4. Healthcare SaaS Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-cyan-600/10 text-cyan-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <span className="font-semibold text-slate-800">MedLens</span>
              <span>— AI-assisted clinical report intelligence</span>
            </div>


            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Frontend-Only Architecture
              </span>
              <span>•</span>
              <span>Step 1: Patient Intake</span>
            </div>

            <div className="text-slate-400 text-center sm:text-right">
              Non-Diagnostic & Non-Treatment Tool
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PatientProvider>
      <MainContent />
    </PatientProvider>
  );
};

export default App;
