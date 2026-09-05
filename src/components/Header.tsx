import React from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
                  Med<span className="text-cyan-600">Lens</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                  <Sparkles className="w-3 h-3 text-cyan-600" />
                  SaaS v1.0
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 tracking-wide mt-0.5">
                AI-assisted clinical report intelligence
              </p>
            </div>
          </div>


          {/* Right side status / security badges */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Clinical Intake Ready</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>In-Memory Frontend State</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
