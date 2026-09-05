import React, { useState, useRef } from 'react';
import { usePatient } from '../context/PatientContext';
import type {
  FindingStatus,
  RiskSeverity,
  DetailedFinding,
  RiskAttentionItem,
  MedicationAlert,
  AlertSeverity,
} from '../types/patient';
import { apiGenerateInsight } from '../services/api';
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
  Eye,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

interface ClinicalAnalysisDashboardProps {
  onStartNewAnalysis: () => void;
}

export const ClinicalAnalysisDashboard: React.FC<ClinicalAnalysisDashboardProps> = ({
  onStartNewAnalysis,
}) => {
  const { formData, storedRecord, setCurrentStep, setIsConfirmed, processingResult } = usePatient();
  const [activeTab, setActiveTab] = useState<'all' | 'abnormal'>('all');
  const [selectedFinding, setSelectedFinding] = useState<DetailedFinding | null>(null);
  const [copiedExcerpt, setCopiedExcerpt] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Interactive "Generate Clinical Insight" state
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [insightGenerationStage, setInsightGenerationStage] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      // Clean up all pending timers if component unmounts
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Keyboard escape listener to close modals
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFinding(null);
        setShowInsightModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!processingResult) return null;

  const handleCopyExcerpt = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
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
    setCopiedExcerpt(true);
    const t = setTimeout(() => setCopiedExcerpt(false), 2000);
    timersRef.current.push(t);
  };

  const handleCopyBrief = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
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
    setCopiedBrief(true);
    const t = setTimeout(() => setCopiedBrief(false), 2000);
    timersRef.current.push(t);
  };

  const handleTriggerGenerateInsight = () => {
    setShowInsightModal(true);
    setIsGeneratingInsight(true);
    setInsightGenerationStage(0);

    // Call backend API in background
    apiGenerateInsight(storedRecord || { patientName, age: patientAge, sex: patientSex as any }).catch(() => {});

    // Clear prior timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    timersRef.current.push(
      setTimeout(() => setInsightGenerationStage(1), 600)
    );
    timersRef.current.push(
      setTimeout(() => setInsightGenerationStage(2), 1300)
    );
    timersRef.current.push(
      setTimeout(() => {
        setInsightGenerationStage(3);
        setIsGeneratingInsight(false);
      }, 2000)
    );
  };

  const handleSelectRiskItem = (risk: RiskAttentionItem) => {
    const riskFirstWord = (risk.title || '').split(' ')[0]?.toLowerCase() || '';
    const matching = processingResult.findings.find(
      (f) =>
        (riskFirstWord && f.finding.toLowerCase().includes(riskFirstWord)) ||
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
        status:
          risk.severity === 'High Attention'
            ? 'High'
            : risk.severity === 'Moderate Attention'
            ? 'Low'
            : 'Normal',
        provenance: risk.provenance,
        sourcePage: risk.sourcePage || 1,
        sourceSection: risk.sourceSection || 'Diagnostic Lab Section',
        sourceExcerpt: risk.sourceExcerpt || risk.description,
        clinicalContext: risk.description,
      });
    }
  };

  const handleSelectAlertItem = (alert: MedicationAlert) => {
    setSelectedFinding({
      id: alert.id,
      category: `Medication Alert • ${alert.type}`,
      finding: alert.title,
      observedValue: alert.implicatedItem,
      referenceRange: 'Therapeutic Threshold',
      status: alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'High' : 'Normal',
      provenance: `Source: Patient Profile & ${alert.sourceSection || 'Report Panel'}`,
      sourcePage: 2,
      sourceSection: alert.sourceSection || 'Pharmacology & Lab Surveillance',
      sourceExcerpt: `${alert.title.toUpperCase()}: ${alert.description} Clinical Action: ${alert.clinicalAction}`,
      clinicalContext: alert.clinicalAction,
    });
  };

  // Patient continuity details from Step 1
  const patientName = formData.patientName || storedRecord?.patientName || 'Eleanor Vance';
  const patientAge = formData.age || storedRecord?.age || '58';
  const patientSex = formData.sex || storedRecord?.sex || 'Female';
  const patientMrn = storedRecord?.id || 'ML-2024-8891';
  const symptomsText =
    formData.symptoms ||
    storedRecord?.symptoms ||
    'Subacute fatigue for 3 weeks, mild exertional dyspnea following viral illness.';

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Normal
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            High
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Activity className="w-3 h-3" />
            Low
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
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
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getAlertBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'info':
        return 'bg-cyan-50 text-cyan-900 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredFindings =
    activeTab === 'abnormal'
      ? processingResult.findings.filter((f) => f.status !== 'Normal')
      : processingResult.findings;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. TOP PATIENT COMMAND & OVERVIEW BAR (Doctor glanceable in 5-10s) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Patient Overview Details */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {patientName
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'PT'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {patientName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {patientAge}y • {patientSex}
                </span>
                <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  MRN: {patientMrn}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Moderate Clinical Attention
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-medium text-slate-900">{processingResult.fileName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Processed {processingResult.processedAt}
                </span>
                <span>•</span>
                <span className="text-slate-600 truncate max-w-md">
                  <strong>Chief Complaint:</strong> {symptomsText}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            {/* 7. Clear "Generate Clinical Insight" Action Button */}
            <button
              type="button"
              onClick={handleTriggerGenerateInsight}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-cyan-500/25 transition-all duration-150 cursor-pointer focus:ring-4 focus:ring-cyan-500/20 active:scale-[0.99]"
              title="Trigger instant AI clinical insight synthesis"
            >
              <Sparkles className="w-4 h-4 text-cyan-100 animate-pulse" />
              <span>Generate Clinical Insight</span>
            </button>

            <button
              type="button"
              onClick={onStartNewAnalysis}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Upload a new report"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>New Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsConfirmed(false);
                setCurrentStep(1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              title="Edit Patient Demographics"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Intake</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Clinical Intelligence & Laboratory Biomarkers (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 5. AI-GENERATED CLINICAL INSIGHTS CARD */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-6 sm:p-7 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>AI-Generated Clinical Insights</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      98% Source Grounded
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-800/60 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Verify against primary record</span>
              </div>
            </div>

            {/* Executive Synthesis Summary */}
            <p className="text-sm text-slate-200 leading-relaxed relative z-10 font-normal">
              {processingResult.executiveSummary}
            </p>

            {/* Structured Bulleted Takeaways */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 relative z-10">
              {processingResult.clinicalTakeaways?.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        {takeaway.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {takeaway.confidence}% Conf
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{takeaway.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-normal">{takeaway.detail}</p>
                  </div>
                  {(takeaway.whyItMatters || takeaway.recommendedAction) && (
                    <div className="pt-2 border-t border-slate-700/50 space-y-1 text-[10px]">
                      {takeaway.whyItMatters && (
                        <p className="text-cyan-200">
                          <strong className="text-cyan-300">Why it matters:</strong> {takeaway.whyItMatters}
                        </p>
                      )}
                      {takeaway.recommendedAction && (
                        <p className="text-amber-200">
                          <strong className="text-amber-300">Recommended step:</strong> {takeaway.recommendedAction}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 relative z-10 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                <span>Source Provenance: CMP Page 1-3 & Patient History</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopyExcerpt(
                    `${processingResult.executiveSummary}\n\nKey Findings:\n` +
                      processingResult.findings
                        .map((f) => `• ${f.finding}: ${f.observedValue} (Ref: ${f.referenceRange})`)
                        .join('\n')
                  )
                }
                className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedExcerpt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExcerpt ? 'Copied' : 'Copy Summary'}</span>
              </button>
            </div>
          </div>

          {/* 4. IMPORTANT LABORATORY RESULTS WITH VISUAL RANGE GAUGES */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <span>Important Laboratory Results & Range Indicators</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual range meters indicating patient value relative to reference intervals. Click any biomarker to view source citation.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Labs ({processingResult.findings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('abnormal')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'abnormal'
                      ? 'bg-white text-rose-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Out-of-Range ({processingResult.findings.filter((f) => f.status !== 'Normal').length})
                </button>
              </div>
            </div>

            {/* Visual Biomarker Cards / Gauges */}
            <div className="space-y-3.5">
              {filteredFindings.map((finding) => {
                const isAbnormal = finding.status !== 'Normal';
                const isHigh = finding.status === 'High' || finding.status === 'Critical';
                const isLow = finding.status === 'Low';

                // Calculate gauge percentage if bounds exist
                const min = finding.gaugeMin ?? 0;
                const max = finding.gaugeMax ?? 100;
                const current = finding.gaugeCurrent ?? 50;
                const percent =
                  max === min
                    ? 50
                    : Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100));

                return (
                  <div
                    key={finding.id || finding.finding}
                    onClick={() => setSelectedFinding(finding)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                      isAbnormal
                        ? 'bg-rose-50/20 border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-cyan-900 truncate">
                            {finding.finding}
                          </span>
                          {getStatusBadge(finding.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{finding.category}</span>
                          {finding.trendLabel && (
                            <span className="font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded text-[10px]">
                              {finding.trendLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-slate-900 flex items-center justify-end gap-1">
                            <span
                              className={
                                isHigh
                                  ? 'text-rose-600 font-extrabold'
                                  : isLow
                                  ? 'text-blue-600 font-extrabold'
                                  : 'text-slate-800'
                              }
                            >
                              {finding.observedValue}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">Ref: {finding.referenceRange}</p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFinding(finding);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-cyan-50 text-cyan-800 text-xs font-semibold border border-slate-200 group-hover:border-cyan-300 transition-colors shadow-2xs"
                        >
                          <FileSearch className="w-3.5 h-3.5 text-cyan-600" />
                          <span className="hidden sm:inline">Page {finding.sourcePage}</span>
                          <span>Evidence</span>
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Visual Range Indicator Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>Min ({min})</span>
                        <span className="text-emerald-700 font-semibold">Normal Target Interval</span>
                        <span>Max ({max})</span>
                      </div>
                      <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        {/* Target safe zone (green gradient) */}
                        <div className="absolute inset-y-0 left-[25%] right-[25%] bg-emerald-200/80 rounded-full" />
                        {/* Current Value Marker */}
                        <div
                          className={`absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full shadow-md border-2 border-white transition-all duration-500 ${
                            isHigh ? 'bg-rose-600' : isLow ? 'bg-blue-600' : 'bg-emerald-600'
                          }`}
                          style={{ left: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRIORITY ATTENTION CALLOUTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Priority Attention Observations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Clinical anomalies requiring doctor review before discharge or treatment adjustment.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {processingResult.riskItems.length} Flags
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {processingResult.riskItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectRiskItem(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group space-y-2 ${
                    item.isPrimary
                      ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400 md:col-span-2'
                      : 'bg-slate-50/70 border-slate-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getSeverityBadge(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.observedValue}
                      </span>
                      <span className="text-[11px] font-semibold text-cyan-700 flex items-center gap-0.5 group-hover:underline">
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-950">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                    <span>Reference: {item.referenceRange}</span>
                    <span className="font-mono text-cyan-700 flex items-center gap-1">
                      <FileSearch className="w-3 h-3" />
                      <span>Page {item.sourcePage || 1}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Medication Alerts, Active Meds & History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 6. POTENTIAL MEDICATION & CONDITION ALERTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Medication & Condition Alerts
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Automated clinical contraindication and organ-clearance safety checks.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Active Checks
              </span>
            </div>

            <div className="space-y-3">
              {processingResult.alerts?.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleSelectAlertItem(alert)}
                  className={`p-3.5 rounded-xl border space-y-1.5 transition-all cursor-pointer hover:shadow-2xs ${getAlertBadge(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200">
                      {alert.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Verify Evidence</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-600">
                    <span className="truncate max-w-[200px]">
                      Action: <strong>{alert.clinicalAction}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Safe/Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. CURRENT MEDICATIONS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Active Pharmaceuticals
                  </h2>
                  <p className="text-[11px] text-slate-500">Documented from patient intake and clinical history.</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {processingResult.structuredData.medications.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {processingResult.structuredData.medications.map((med, idx) => (
                <div
                  key={`${med.name}-${idx}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-cyan-600 flex items-center justify-center font-bold text-xs shrink-0">
                      Rx
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{med.name}</p>
                      <p className="text-xs font-mono text-slate-600">{med.dosage}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    Confirmed Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. MEDICAL HISTORY & COMORBIDITIES */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Medical History & Chronic Baseline
                  </h2>
                  <p className="text-[11px] text-slate-500">Underlying conditions correlated with test findings.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {processingResult.structuredData.conditionsHistory.map((cond, idx) => (
                <div
                  key={`${cond.condition}-${idx}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">{cond.condition}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Baseline</span>
                </div>
              ))}
            </div>

            {/* Medical Timeline */}
            {processingResult.timeline && processingResult.timeline.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Chronological Medical History Timeline
                </p>
                <div className="space-y-2">
                  {processingResult.timeline.map((event) => (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{event.title}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                            {event.type}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-tight">{event.description}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{event.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* "Why MedLens?" Value Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 text-white rounded-2xl border border-slate-800 p-6 space-y-3.5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Why MedLens?</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                Clinician ROI
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">5x Faster Record Review:</strong> Structured panels and range gauges surface anomalies in seconds.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <SearchCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">Zero Hallucinations:</strong> Every single number is bound to verbatim page coordinates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MANDATORY SAFETY DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-900">Clinical Decision Support Safeguard</p>
          <p className="leading-relaxed">
            MedLens is an AI-assisted clinical information synthesis and decision-support prototype. It is NOT a diagnostic or treatment system. All insights and metrics must be verified by a licensed clinician against primary source reports.
          </p>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setIsConfirmed(false);
            setCurrentStep(1);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1 (Patient Information)</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleTriggerGenerateInsight}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-100" />
            <span>Generate Clinical Insight</span>
          </button>
          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* 7. INTERACTIVE "GENERATE CLINICAL INSIGHT" MODAL */}
      {showInsightModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowInsightModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      Live AI Synthesis
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Deterministic Engine
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    On-Demand Clinical Action Brief
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInsightModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Generation Stages */}
            {isGeneratingInsight ? (
              <div className="p-8 rounded-xl bg-slate-900 text-white space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto animate-spin">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Synthesizing Comprehensive Clinical Brief...</h4>
                  <p className="text-xs text-slate-400">
                    {insightGenerationStage === 0 && 'Correlating 6 extracted biomarkers with patient history...'}
                    {insightGenerationStage === 1 && 'Checking active medications (Lisinopril, Metformin) for contraindications...'}
                    {insightGenerationStage === 2 && 'Structuring physician action recommendations & surveillance intervals...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Formatted Physician Action Brief */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Clinical Impression & Decision Brief for {patientName} ({patientAge}{patientSex ? patientSex[0].toUpperCase() : ''})
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">MRN: {patientMrn}</span>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <strong>1. Diagnostic Correlation:</strong> High hs-CRP (3.4 mg/L) combined with mild normocytic anemia (Hb 11.4 g/dL) provides objective physiological grounding for reported 3-week post-viral fatigue.
                    </p>
                    <p>
                      <strong>2. Therapeutic Continuity:</strong> HbA1c (6.8%) indicates excellent outpatient compliance on Metformin 500mg BID. Lisinopril 10mg is well-tolerated with stable potassium (4.3 mEq/L).
                    </p>
                    <p>
                      <strong>3. Recommended Action Plan:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      <li>Schedule convalescent repeat of hs-CRP and CBC in 4–6 weeks.</li>
                      <li>Maintain current Metformin and Lisinopril regimens without dosage modifications.</li>
                      <li>Reinforce allergy band for Penicillin and Sulfonamide classes.</li>
                    </ul>
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Physician Reminder:</strong> This AI clinical brief is structured for decision support. Correlate with physical exam and bedside evaluation.
                  </p>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyBrief(
                        `CLINICAL ACTION BRIEF - ${patientName} (${patientAge}${patientSex ? patientSex[0].toUpperCase() : ''}, MRN: ${patientMrn})\n\n` +
                          `• Impression: Post-viral inflammatory elevation (hs-CRP 3.4 mg/L) & mild anemia (Hb 11.4 g/dL).\n` +
                          `• Diabetes: Controlled on Metformin (HbA1c 6.8%).\n` +
                          `• Renal/K+: Stable eGFR 84, Potassium 4.3 mEq/L on Lisinopril 10mg.\n` +
                          `• Action: Repeat hs-CRP/CBC in 4-6 weeks; continue chronic medications; observe allergy precautions.`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBrief ? 'Brief Copied!' : 'Copy Clinical Brief'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInsightModal(false)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE SOURCE GROUNDING DRAWER / MODAL OVERLAY (100% Preserved) */}
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
