import React from 'react';
import { PatientProvider, usePatient } from './context/PatientContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PatientForm } from './components/PatientForm';
import { PatientDataPreview } from './components/PatientDataPreview';
import { ReportProcessing } from './components/ReportProcessing';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShieldCheck, HeartPulse } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentStep, setCurrentStep, isConfirmed, setIsConfirmed } = usePatient();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900 font-sans">
      {/* 1. Header with branding & Dr. Smith Profile */}
      <Header />

      {/* 2. Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 3. Main Workspace Area: Sidebar + Dynamic Step Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Center Main Stage Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
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
          </div>
        </main>
      </div>

      {/* 4. Healthcare SaaS Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-auto">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-800">MedLens</span>
              <span>— AI-assisted clinical report intelligence</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Deterministic Provenance Engine
              </span>
              <span>•</span>
              <span>Healthcare SaaS v1.0</span>
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
    <ErrorBoundary>
      <PatientProvider>
        <MainContent />
      </PatientProvider>
    </ErrorBoundary>
  );
};

export default App;
