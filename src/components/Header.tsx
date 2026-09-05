import React from 'react';
import { Activity, ShieldCheck, Bell, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Med<span className="text-blue-600">Lens</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                  SaaS v1.0
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 tracking-wide">
                AI-assisted clinical report intelligence
              </p>
            </div>
          </div>

          {/* Right side status pills, notification & Doctor profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Status Pill 1: Intake Ready */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Clinical Intake Ready</span>
            </div>

            {/* Status Pill 2: In-Memory State */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>In-Memory Frontend State</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/70 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Doctor Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-blue-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                  alt="Dr. Smith"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if image is offline
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>DS</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800">Dr. Smith</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
