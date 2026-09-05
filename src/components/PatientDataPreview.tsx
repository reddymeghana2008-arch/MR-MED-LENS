import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import {
  CheckCircle2,
  Edit3,
  Copy,
  Check,
  Calendar,
  User,
  Shield,
  FileCode,
  Activity,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface PatientDataPreviewProps {
  onBackToEdit: () => void;
}

export const PatientDataPreview: React.FC<PatientDataPreviewProps> = ({ onBackToEdit }) => {
  const { storedRecord, setIsConfirmed, setCurrentStep } = usePatient();

  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!storedRecord) return null;

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(storedRecord, null, 2);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonStr).catch(() => {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = jsonStr;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch {
          // Fallback ignored
        }
      });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setIsConfirmed(false);
    onBackToEdit();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Confirmation Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-emerald-950">
              Patient Information Captured in Frontend State
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800">
              Record ID: <span className="font-mono font-semibold">{storedRecord.id}</span> • Ready to be passed to Step 2 (Structuring & Intelligence Pipeline).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Form</span>
          </button>
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Card View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {storedRecord.patientName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{storedRecord.age} yrs</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{storedRecord.sex}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(storedRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>{showJson ? 'Card View' : 'Raw JSON State'}</span>
          </button>
        </div>

        {showJson ? (
          <div className="p-6 bg-slate-900 text-slate-100 overflow-x-auto">
            <pre className="text-xs font-mono leading-relaxed">
              {JSON.stringify(storedRecord, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symptoms */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reported Symptoms
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {storedRecord.symptoms || <span className="text-slate-400 italic">None documented</span>}
              </p>
            </div>

            {/* Existing Conditions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Existing Conditions
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {storedRecord.existingConditions || <span className="text-slate-400 italic">None documented</span>}
              </p>
            </div>

            {/* Allergies */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Documented Allergies
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {storedRecord.allergies || <span className="text-slate-400 italic">No known allergies</span>}
              </p>
            </div>

            {/* Current Medications */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Medications
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {storedRecord.currentMedications || <span className="text-slate-400 italic">No active medications</span>}
              </p>
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Additional Clinical Notes
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {storedRecord.additionalNotes || <span className="text-slate-400 italic">No additional notes</span>}
              </p>
            </div>
          </div>
        )}

        {/* State Notice Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-600" />
            <span>State Status: Held in React Context memory (`PatientContext`). No backend or external DB contacted.</span>
          </div>

          <button
            type="button"
            onClick={handleEdit}
            className="text-cyan-700 hover:text-cyan-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Edit Patient Form</span>
          </button>
        </div>
      </div>

      {/* Next Step Preview Card (Disabled placeholder demonstrating future roadmap without building backend/AI) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <Activity className="w-3 h-3" />
            <span>Upcoming Step 2: Information Structuring</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Frontend State Ready for Clinical Intelligence Engine
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            In subsequent development phases, this verified patient record will feed into MedLens's structuring pipeline to categorize timelines and symptoms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <span>Proceed to Step 2: Upload Medical Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
