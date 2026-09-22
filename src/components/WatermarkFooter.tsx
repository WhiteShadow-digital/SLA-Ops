import React from 'react';
import { ShieldCheck, Sparkles, Terminal, Activity } from 'lucide-react';

export const WatermarkFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">SLA OPS</span>
          <span className="text-slate-600">•</span>
          <span>IT Helpdesk Operational Task &amp; SLA Tracker</span>
        </div>

        {/* User Watermark Requirement: Ethan Krewu */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Built &amp; Designed by</span>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
            Ethan Krewu
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
            VERIFIED AUTHOR
          </span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>SLA Telemetry Live</span>
          </span>
          <span>ITIL v4 Compliant</span>
        </div>
      </div>
    </footer>
  );
};
