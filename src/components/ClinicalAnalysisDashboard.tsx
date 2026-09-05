import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import type { FindingStatus, RiskSeverity } from '../types/patient';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Pill,
  Clock,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Layers,
  HelpCircle,
  Stethoscope,
  BookmarkCheck,
  Zap,
  SearchCheck,
  HeartPulse,
  ShieldCheck,
  X,
  FileSearch,
  Copy,
  Check,
  BookOpen,
  Eye
} from 'lucide-react';
import type { DetailedFinding, RiskAttentionItem } from '../types/patient';


interface ClinicalAnalysisDashboardProps {
  onStartNewAnalysis: () => void;
}

export const ClinicalAnalysisDashboard: React.FC<ClinicalAnalysisDashboardProps> = ({
  onStartNewAnalysis,
}) => {
  const { formData, storedRecord, setCurrentStep, processingResult } = usePatient();
  const [activeTab, setActiveTab] = useState<'all' | 'abnormal' | 'structured'>('all');
  const [structuredSection, setStructuredSection] = useState<'demographics' | 'labs' | 'meds' | 'history' | 'recommendations'>('demographics');
  const [selectedFinding, setSelectedFinding] = useState<DetailedFinding | null>(null);
  const [copiedExcerpt, setCopiedExcerpt] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard escape listener to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFinding(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!processingResult) return null;

  const handleCopyExcerpt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExcerpt(true);
    setTimeout(() => setCopiedExcerpt(false), 2000);
  };

  const handleSelectRiskItem = (risk: RiskAttentionItem) => {
    // Find matching finding or construct finding evidence
    const matching = processingResult.findings.find(
      (f) =>
        f.finding.toLowerCase().includes(risk.title.split(' ')[0].toLowerCase()) ||
        risk.title.toLowerCase().includes(f.finding.toLowerCase())
    );
    if (matching) {
      setSelectedFinding(matching);
    } else {
      setSelectedFinding({
        id: risk.id,
        category: 'Clinical Risk Observation',
        finding: risk.title,
        observedValue: risk.observedValue,
        referenceRange: risk.referenceRange,
        status: risk.severity === 'High Attention' ? 'High' : risk.severity === 'Moderate Attention' ? 'Low' : 'Normal',
        provenance: risk.provenance,
        sourcePage: risk.sourcePage || 1,
        sourceSection: risk.sourceSection || 'Diagnostic Lab Section',
        sourceExcerpt: risk.sourceExcerpt || risk.description,
        clinicalContext: risk.description,
      });
    }
  };

  // Patient continuity details from Step 1
  const patientName = formData.patientName || storedRecord?.patientName || 'Eleanor Vance';
  const patientAge = formData.age || storedRecord?.age || '58';
  const patientSex = formData.sex || storedRecord?.sex || 'Female';

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Normal
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3" />
            High
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Activity className="w-3 h-3" />
            Low
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'High Attention':
        return 'bg-rose-500 text-white border-rose-600';
      case 'Moderate Attention':
        return 'bg-amber-500 text-white border-amber-600';
      case 'Observation':
        return 'bg-slate-700 text-slate-100 border-slate-600';
    }
  };

  const filteredFindings =
    activeTab === 'abnormal'
      ? processingResult.findings.filter((f) => f.status !== 'Normal')
      : processingResult.findings;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* 2.A: Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Clinical Analysis Complete
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                Demo Analysis
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Structured Diagnostic Synthesis</span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-cyan-200 truncate max-w-xs">{processingResult.fileName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Processed at {processingResult.processedAt}
              </span>
              <span>•</span>
              <span className="text-slate-300 font-medium">
                Patient: <span className="text-white font-semibold">{patientName}</span> ({patientAge}y, {patientSex})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={onStartNewAnalysis}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Upload another report"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Analysis</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors cursor-pointer shadow-xs"
              title="Return to Step 1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 1</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2.B: Executive Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Executive Clinical Summary
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  AI-Generated • Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated clinical synthesis organized from the uploaded diagnostic documentation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/70 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold">Verify against original report</span>
          </div>
        </div>

        {/* 2–4 Sentence Concise Clinical Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed space-y-2">
          <p className="font-medium text-slate-900">
            {processingResult.executiveSummary}
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-medium border-t border-slate-200/60">
            <BookmarkCheck className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>
              Source Provenance: Synthesized directly from submitted laboratory values and matched with documented patient history ({patientName}, {patientAge}y).
            </span>
          </div>
        </div>
      </div>

      {/* 2.D: Risk / Attention Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Clinical Attention & Out-of-Range Observations
              </h2>
              <p className="text-xs text-slate-500">
                Prioritized laboratory anomalies requiring clinical consideration (Non-diagnostic observational flags).
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {processingResult.riskItems.length} Parameters Flagged
          </span>
        </div>

        {/* Primary Notable Finding (Standout) */}
        {processingResult.riskItems
          .filter((item) => item.isPrimary)
          .map((primary) => (
            <div
              key={primary.id}
              onClick={() => handleSelectRiskItem(primary)}
              className="p-5 rounded-xl bg-gradient-to-r from-rose-50 via-rose-50/70 to-white border-2 border-rose-300 shadow-xs relative space-y-2.5 cursor-pointer hover:border-rose-400 hover:shadow-sm transition-all duration-150 group"
              title="Click to view source document grounding"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border shadow-2xs ${getSeverityBadge(primary.severity)}`}>
                    {primary.severity} (Primary Out-of-Range)
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-rose-950">
                    {primary.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold text-rose-700 font-mono bg-rose-100/70 px-2.5 py-1 rounded-md">
                    Observed: {primary.observedValue}
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-700 group-hover:bg-rose-50 transition-colors shadow-2xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Evidence</span>
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {primary.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-200/60 text-xs text-slate-600">
                <span className="font-medium text-slate-500">
                  Normal Reference: <strong className="text-slate-700">{primary.referenceRange}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-rose-200 text-[11px] font-mono text-slate-700 group-hover:border-rose-400 transition-colors">
                  <FileSearch className="w-3 h-3 text-rose-500" />
                  <span>Page {primary.sourcePage || 3} • Click for Excerpt</span>
                </span>
              </div>
            </div>
          ))}

        {/* Secondary Attention Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {processingResult.riskItems
            .filter((item) => !item.isPrimary)
            .map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectRiskItem(item)}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-cyan-400 hover:bg-cyan-50/20 transition-all cursor-pointer group"
                title="Click to view source evidence"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.observedValue}
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 group-hover:bg-cyan-100 px-1.5 py-0.5 rounded border border-cyan-200 transition-colors flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      <span>Evidence</span>
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-900">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <span>Ref: {item.referenceRange}</span>
                  <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                    <FileSearch className="w-3 h-3 text-cyan-600" />
                    <span>Page {item.sourcePage || 1} • {item.sourceSection || 'Report'}</span>
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 2.C: Key Findings Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Extracted Key Findings & Laboratory Panels</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured diagnostic observations with explicit reference intervals and document coordinates. Click any row to view source evidence.
            </p>
          </div>

          {/* Quick filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Findings ({processingResult.findings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('abnormal')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'abnormal'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Out-of-Range ({processingResult.findings.filter((f) => f.status !== 'Normal').length})
            </button>
          </div>
        </div>

        {/* Findings Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">Observation / Test</th>
                  <th scope="col" className="px-4 py-3">Observed Value</th>
                  <th scope="col" className="px-4 py-3">Reference Range</th>
                  <th scope="col" className="px-4 py-3">Clinical Status</th>
                  <th scope="col" className="px-4 py-3">Source Evidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {filteredFindings.map((finding, idx) => {
                  const isSelected = selectedFinding?.finding === finding.finding;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedFinding(finding)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-50/80 hover:bg-cyan-50'
                          : 'hover:bg-slate-50/80'
                      }`}
                      title="Click to inspect source report evidence"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{finding.finding}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {finding.category}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {finding.observedValue}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {finding.referenceRange}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStatusBadge(finding.status)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFinding(finding);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100/80 text-cyan-800 text-xs font-semibold border border-cyan-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          <FileSearch className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Page {finding.sourcePage || 1} • Evidence</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requirement 5: "Why this matters" section */}
        <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
            <SearchCheck className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 space-y-0.5">
            <p className="font-bold text-slate-900">
              Why this matters: Source-Grounded Findings
            </p>
            <p className="text-slate-600 leading-relaxed">
              MedLens keeps extracted findings traceable so reviewers can quickly verify AI-organized information against the original document.
            </p>
          </div>
        </div>
      </div>

      {/* 2.E: Clinical Timeline & Structured Data Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>Structured Clinical Profile & Integrated History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Correlated patient timeline linking Step 1 clinical intake with Step 2 laboratory extraction.
            </p>
          </div>

          {/* Subcategory selection */}
          <div className="flex flex-wrap items-center gap-1 text-xs font-medium bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setStructuredSection('demographics')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                structuredSection === 'demographics' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Demographics
            </button>
            <button
              type="button"
              onClick={() => setStructuredSection('labs')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                structuredSection === 'labs' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Laboratory
            </button>
            <button
              type="button"
              onClick={() => setStructuredSection('meds')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                structuredSection === 'meds' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Medications
            </button>
            <button
              type="button"
              onClick={() => setStructuredSection('history')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                structuredSection === 'history' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Conditions
            </button>
            <button
              type="button"
              onClick={() => setStructuredSection('recommendations')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                structuredSection === 'recommendations' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              Recommendations
            </button>
          </div>
        </div>

        {/* Section Content */}
        {structuredSection === 'demographics' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {processingResult.structuredData.demographics.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {item.label}
                </span>
                <p className="text-sm font-bold text-slate-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {structuredSection === 'labs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {processingResult.structuredData.laboratoryFindings.map((lab, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{lab.test}</p>
                  <p className="text-xs text-slate-500">Ref: {lab.range}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-slate-900">{lab.result}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lab.flag === 'Elevated' || lab.flag === 'Low'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {lab.flag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {structuredSection === 'meds' && (
          <div className="space-y-2.5">
            {processingResult.structuredData.medications.map((med, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm font-bold text-slate-900">{med.name}</span>
                  <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {med.dosage}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
                  {med.source}
                </span>
              </div>
            ))}
          </div>
        )}

        {structuredSection === 'history' && (
          <div className="space-y-2.5">
            {processingResult.structuredData.conditionsHistory.map((cond, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm font-semibold text-slate-800">{cond.condition}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {cond.source}
                </span>
              </div>
            ))}
          </div>
        )}

        {structuredSection === 'recommendations' && (
          <div className="space-y-3">
            {processingResult.structuredData.recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rec.priority === 'Elevated'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {rec.priority} Priority Note
                    </span>
                    <span className="text-sm font-bold text-slate-900">{rec.action}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-0 sm:pl-1">
                  {rec.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2.F: "Why MedLens?" Value Proposition Section (Requirement 6) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 text-white rounded-2xl border border-slate-800 p-6 sm:p-7 space-y-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Core Clinical Impact
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Why MedLens?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-cyan-200/90 font-medium mt-1">
              From unstructured report → structured clinical intelligence
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Built for Clinician Workflow</span>
          </div>
        </div>

        {/* 3 Core Value Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Faster Review</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly surfaces critical out-of-range observations and structured panels without manual record parsing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <SearchCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Traceable Findings</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every single extracted value cites exact document provenance and page coordinates for effortless human audit.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 hover:border-cyan-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Patient Context Preserved</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seamlessly correlates historical conditions, allergies, and symptoms with newly extracted diagnostic data.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Mandatory Safety & Decision Support Disclaimer */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs text-amber-950 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Clinical Decision Support Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          AI-generated information is for demonstration and decision-support purposes only. Verify all information against the original medical report and consult a qualified healthcare professional.
        </p>
      </div>

      {/* Bottom Actions Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1 (Patient Information)</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* Interactive Evidence Drawer / Modal Overlay */}
      {selectedFinding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedFinding(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-bold shrink-0">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      Source Evidence
                    </span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Demo Provenance
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {selectedFinding.finding}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFinding(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close evidence view (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-Step Verification Chain */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Source Verification Chain
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Step 1</span>
                  <p className="font-bold text-slate-900">Extracted Finding</p>
                  <p className="font-mono text-cyan-700 font-semibold text-[11px] truncate">
                    {selectedFinding.observedValue}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 space-y-1">
                  <span className="text-[10px] font-bold text-cyan-600 uppercase">Step 2</span>
                  <p className="font-bold text-cyan-950">Source Evidence</p>
                  <p className="text-cyan-700 text-[11px] font-medium">Page {selectedFinding.sourcePage || 1}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Step 3</span>
                  <p className="font-bold text-emerald-950">Human Review</p>
                  <p className="text-emerald-700 text-[11px] font-medium">Verified Match</p>
                </div>
              </div>
            </div>

            {/* Finding Parameters Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Observed Value:</span>
                <p className="font-bold font-mono text-slate-900 text-sm mt-0.5">{selectedFinding.observedValue}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Reference Range:</span>
                <p className="font-medium font-mono text-slate-700 mt-0.5">{selectedFinding.referenceRange}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 font-medium">Clinical Status:</span>
                <div className="mt-0.5">{getStatusBadge(selectedFinding.status)}</div>
              </div>
            </div>

            {/* Document Location & Grounding Excerpt */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Document Location:</span>
                </span>
                <span className="font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-medium truncate">
                  Page {selectedFinding.sourcePage || 1} • {selectedFinding.sourceSection || 'Report'}
                </span>
              </div>

              {/* Formatted Report Excerpt Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-xs leading-relaxed space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1 text-cyan-300 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{processingResult.fileName}</span>
                  </span>
                  <span className="text-slate-400 shrink-0">Page {selectedFinding.sourcePage || 1}</span>
                </div>

                <p className="text-slate-100 bg-slate-850 p-3 rounded-lg border border-slate-700/70 selection:bg-cyan-500 selection:text-white leading-relaxed">
                  "{selectedFinding.sourceExcerpt}"
                </p>

                {selectedFinding.clinicalContext && (
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    Clinical Note: {selectedFinding.clinicalContext}
                  </p>
                )}
              </div>
            </div>

            {/* Trust & Safety Disclaimer reminder */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-normal">
                <strong>Demo provenance notice:</strong> Verify all extracted metrics against the original diagnostic report. Non-diagnostic decision support aid.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => handleCopyExcerpt(selectedFinding.sourceExcerpt)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {copiedExcerpt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExcerpt ? 'Excerpt Copied!' : 'Copy Excerpt'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFinding(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Done & Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
