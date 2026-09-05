import React from 'react';
import {
  Home,
  FileText,
  History,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { usePatient } from '../context/PatientContext';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { setCurrentStep } = usePatient();

  const navItems = [
    { label: 'Home', icon: Home, active: false, onClick: () => setCurrentStep(1) },
    { label: 'New Report', icon: FileText, active: true, onClick: () => setCurrentStep(1) },
    { label: 'History', icon: History, active: false, onClick: () => setCurrentStep(2) },
    { label: 'Settings', icon: Settings, active: false, onClick: () => {} },
  ];

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col justify-between py-6 px-4 bg-white border-r border-slate-200/80 min-h-[calc(100vh-5rem)] ${className}`}
    >
      {/* Top Nav List */}
      <div className="space-y-2">
        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.active;

            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left ${
                  isItemActive
                    ? 'bg-blue-50/90 text-blue-700 shadow-2xs border-l-4 border-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isItemActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo AI Doctor Card */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-cyan-50/80 via-sky-50/50 to-blue-50/80 border border-cyan-200/70 shadow-xs overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              Smarter Insights<br />Better Healthcare
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Powered by AI for faster, accurate and reliable clinical analysis.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-transform active:scale-95 cursor-pointer"
                title="Launch Intelligence Workflow"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Robot Doctor Graphic Illustration */}
          <div className="mt-4 flex items-center justify-center relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/90 border border-cyan-200/80 shadow-sm flex items-center justify-center relative p-2">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-blue-600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Cute 3D Bot Head */}
                <rect x="20" y="24" width="60" height="46" rx="16" fill="#0284c7" />
                <rect x="25" y="29" width="50" height="36" rx="12" fill="#0f172a" />
                {/* Glowing Bot Eyes */}
                <circle cx="38" cy="47" r="5" fill="#38bdf8" />
                <circle cx="62" cy="47" r="5" fill="#38bdf8" />
                <circle cx="40" cy="45" r="2" fill="#ffffff" />
                <circle cx="64" cy="45" r="2" fill="#ffffff" />
                {/* Medical Cross Antenna */}
                <path d="M50 12v12M44 18h12" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                {/* Bot Body */}
                <rect x="30" y="72" width="40" height="20" rx="8" fill="#e2e8f0" />
                <path d="M50 78v8M46 82h8" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              {/* Floating Sparkle */}
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
