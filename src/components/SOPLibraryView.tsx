import React, { useState } from 'react';
import {
  Layers,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Search,
  Shield,
  Check,
  FileText,
} from 'lucide-react';
import { SOPTemplate, SOPStep, HelpdeskTask } from '../types';
import { SOP_TEMPLATES } from '../data/mockHelpdeskData';
import { AnimatedButton } from './AnimatedButton';

interface SOPLibraryViewProps {
  onSpawnTicket: (template: SOPTemplate) => void;
}

export const SOPLibraryView: React.FC<SOPLibraryViewProps> = ({ onSpawnTicket }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<SOPTemplate>(SOP_TEMPLATES[0]);
  const [search, setSearch] = useState('');

  const filtered = SOP_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Standard Operating Procedure (SOP) Engine
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              ITIL Standardized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-flight procedural checklists for high-risk system operations, onboarding, and
            incident response.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOP templates..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
          />
        </div>
      </div>

      {/* Split layout: Template Catalog & Active Template Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Catalog */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Available SOP Templates ({filtered.length})
          </h3>
          {filtered.map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-900/90 border-teal-500/60 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                    {tmpl.category}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>{tmpl.estimatedMinutes}m target</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{tmpl.title}</h4>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                  {tmpl.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    {tmpl.steps.length} procedural checks
                  </span>
                  <span className="text-teal-400 font-semibold flex items-center space-x-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Template Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel-glow border border-slate-700/80 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  {selectedTemplate.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Est. {selectedTemplate.estimatedMinutes} mins
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1.5">
                {selectedTemplate.title}
              </h2>
            </div>

            <AnimatedButton
              variant="primary"
              size="md"
              onClick={() => onSpawnTicket(selectedTemplate)}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Spawn Ticket in Queue</span>
            </AnimatedButton>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 my-4 leading-relaxed">
            {selectedTemplate.description}
          </p>

          <div className="space-y-3 mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Mandatory Diagnostic &amp; Execution Steps
            </h4>

            {selectedTemplate.steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3"
              >
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">{step.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Step verification is tracked and automatically logged to ticket history upon completion.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>SOP ID: <code className="text-teal-300 font-mono">{selectedTemplate.id}</code></span>
            <span>Version: 2026.4 • ITIL Compliance Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
