import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle2,
  Terminal,
  FileSpreadsheet,
  Layers,
  Copy,
  Check,
  Zap,
  Flame,
  Activity,
  Server,
  Lock,
  Workflow,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';
import { SOPTemplate } from '../types';

interface LandingPageProps {
  onLaunchWorkspace: () => void;
  onViewDemo: () => void;
  onExploreSOPs: () => void;
  onExploreCommands: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchWorkspace,
  onViewDemo,
  onExploreSOPs,
  onExploreCommands,
}) => {
  // Live ticking counter for the hero demo box
  const [secondsLeft, setSecondsLeft] = useState(615); // 00:10:15
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [sopSteps, setSopSteps] = useState([
    { id: '1', label: 'Wipe disk', completed: true },
    { id: '2', label: 'Install OS image', completed: true },
    { id: '3', label: 'Join Active Directory', completed: false },
    { id: '4', label: 'Assign asset tag', completed: false },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  const handleCopyDemoCommand = () => {
    navigator.clipboard.writeText('ipconfig /flushdns');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const toggleSopStep = (id: string) => {
    setSopSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step))
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Fluctuating Ambient Mesh Gradient Cycling Azure, Turquoise, Teal & Frost */}
      <div className="absolute inset-0 animate-ambient-mesh pointer-events-none" />

      {/* Cybernetic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hero Section Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>BUILT FOR THE FRONT LINE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              Master Your Helpdesk Queue.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
                Eliminate SLA Breaches.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              The operational task manager built for IT Support Technicians, System Admins, and
              Service Desk teams.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={onLaunchWorkspace}
                className="shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                <span>Launch workspace</span>
                <ArrowRight className="w-4 h-4" />
              </AnimatedButton>

              <AnimatedButton
                variant="secondary"
                size="lg"
                onClick={onViewDemo}
                className="border-slate-700 bg-slate-900/60"
              >
                <span>View live demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </AnimatedButton>
            </div>

            {/* Trust and Feature Points */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Secure per-user workspace</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Live SLA telemetry</span>
              </div>
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>SOP checklists &amp; canned scripts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Product Demo Preview (Pixel-perfect to reference screenshot) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl glass-panel-glow p-5 sm:p-6 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,127,255,0.15)] backdrop-blur-xl">
              {/* Header with Shift details and dots */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Live queue</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Tuesday • Shift A</p>
                </div>
                {/* Traffic dots */}
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                </div>
              </div>

              {/* Main Preview Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-4">
                {/* Left Card: P1 INC-4821 */}
                <div className="sm:col-span-7 flex flex-col space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/40 relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-red-400 flex items-center space-x-1">
                        <span>P1 • INC-4821</span>
                      </span>
                      {/* Red countdown badge */}
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-red-500/60 bg-red-950/80 text-red-400 tracking-wider animate-pulse">
                        {formatCountdown(secondsLeft)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      Identity service unavailable
                    </h4>

                    {/* Progress indicator bar */}
                    <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-red-600 to-red-400 h-full w-4/5 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Second Task: P3 SR-3107 */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold text-sky-400">
                        P3 • SR-3107
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">2h 18m</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Prepare laptop for new starter
                    </h4>
                  </div>
                </div>

                {/* Right Card: ONBOARDING SOP Checklist */}
                <div className="sm:col-span-5 p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ONBOARDING SOP</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {sopSteps.map((step) => (
                        <div
                          key={step.id}
                          onClick={() => toggleSopStep(step.id)}
                          className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none group"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center transition ${
                              step.completed
                                ? 'bg-teal-500 text-slate-950'
                                : 'border border-slate-600 group-hover:border-cyan-400'
                            }`}
                          >
                            {step.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-[11px] ${
                              step.completed ? 'line-through text-slate-400' : 'text-slate-200'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-cyan-400 font-mono text-right">
                    {sopSteps.filter((s) => s.completed).length}/4 completed
                  </div>
                </div>
              </div>

              {/* Bottom Command Snippet Bar matching screenshot */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-between font-mono text-xs shadow-md">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">$</span>
                  <span className="font-semibold text-slate-900">ipconfig /flushdns</span>
                </div>
                <button
                  onClick={handleCopyDemoCommand}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                >
                  {copiedCmd ? (
                    <>
                      <Check className="w-3 h-3 text-teal-600" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Cards Section */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineered for Real-World Helpdesk Stress
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed specifically for frontline support operations with zero irrelevant fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: SLA Breach Prevention */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover border border-slate-800 relative group text-left">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">SLA Breach Prevention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Color-coded countdown timers calibrated to ITIL priorities. Visual pulsing alerts
                warn technicians 15 minutes prior to contractual breach.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] font-mono text-red-400">
                <span>P1 Critical: 15m target</span>
              </div>
            </div>

            {/* Card 2: SOP Checklist Engine */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover border border-slate-800 relative group text-left">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">SOP Checklist Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-built procedural templates for onboarding, offboarding, and patching. Ensure
                standard compliance across every ticket resolution.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] font-mono text-teal-400">
                <span>Step-by-step enforcement</span>
              </div>
            </div>

            {/* Card 3: Canned Command Store */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover border border-slate-800 relative group text-left">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Canned Command Store</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click PowerShell, CMD, macOS, and Linux snippet copier. Includes validated email
                responses for instant user communications.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] font-mono text-sky-400">
                <span>Instant 1-click clipboard</span>
              </div>
            </div>

            {/* Card 4: Shift Handover Log */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover border border-slate-800 relative group text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Shift Handover Log</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single-click summary generator for shift handoffs. Compiles completed tasks, blocked
                items, and open P1s formatted for Slack or Teams.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[11px] font-mono text-cyan-400">
                <span>Zero lost handover context</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Banner */}
        <div className="mt-20 p-8 rounded-3xl glass-panel-glow border border-cyan-500/30 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to take control of your shift?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Launch your personal helpdesk command station with integrated SOP checklists, SLA
              telemetry, and handover automation.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <AnimatedButton variant="primary" size="md" onClick={onLaunchWorkspace}>
                <span>Enter Workspace Now</span>
                <ArrowRight className="w-4 h-4" />
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="md" onClick={onExploreCommands}>
                <span>Browse Commands</span>
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
