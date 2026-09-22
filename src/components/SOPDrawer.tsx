import React, { useState } from 'react';
import {
  Layers,
  X,
  CheckCircle2,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { HelpdeskTask, SOPStep, SOPTemplate } from '../types';
import { SOP_TEMPLATES } from '../data/mockHelpdeskData';
import { AnimatedButton } from './AnimatedButton';

interface SOPDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: HelpdeskTask | null;
  onUpdateTaskSOP: (taskId: string, steps: SOPStep[]) => void;
  onApplyTemplate: (taskId: string, template: SOPTemplate) => void;
}

export const SOPDrawer: React.FC<SOPDrawerProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTaskSOP,
  onApplyTemplate,
}) => {
  const [newStepLabel, setNewStepLabel] = useState('');

  if (!isOpen || !task) return null;

  const currentSteps = task.sopSteps || [];
  const completedCount = currentSteps.filter((s) => s.completed).length;
  const progressPercent =
    currentSteps.length > 0 ? Math.round((completedCount / currentSteps.length) * 100) : 0;

  const handleToggleStep = (stepId: string) => {
    const updated = currentSteps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
    onUpdateTaskSOP(task.id, updated);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepLabel.trim()) return;
    const newStep: SOPStep = {
      id: 'step-' + Math.random().toString(36).substring(2, 7),
      label: newStepLabel.trim(),
      completed: false,
    };
    const updated = [...currentSteps, newStep];
    onUpdateTaskSOP(task.id, updated);
    setNewStepLabel('');
  };

  const handleResetSteps = () => {
    const reset = currentSteps.map((s) => ({ ...s, completed: false }));
    onUpdateTaskSOP(task.id, reset);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">SOP Checklist Drawer</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {task.ticketId} • {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOP Info & Progress */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>{task.sopTitle || 'Active Procedural SOP'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-teal-400">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {completedCount} of {currentSteps.length} procedures verified
            </span>
            {completedCount > 0 && (
              <button
                onClick={handleResetSteps}
                className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset steps</span>
              </button>
            )}
          </div>
        </div>

        {/* Steps List */}
        <div className="mt-5 flex-1">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Procedural Verification Steps
          </h4>

          {currentSteps.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 p-4 border border-dashed border-slate-800 rounded-xl">
              No SOP checklist attached to this ticket.
              <div className="mt-3">
                <span className="text-[11px] text-cyan-400 block mb-2 font-medium">
                  Attach an ITIL template below:
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {currentSteps.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => handleToggleStep(step.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer select-none flex items-start space-x-3 ${
                    step.completed
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/50 text-slate-200'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition ${
                      step.completed
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'border border-slate-600'
                    }`}
                  >
                    {step.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${step.completed ? 'line-through' : ''}`}>
                      <span className="text-slate-500 font-mono mr-1.5">{index + 1}.</span>
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add custom step form */}
          <form onSubmit={handleAddStep} className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              value={newStepLabel}
              onChange={(e) => setNewStepLabel(e.target.value)}
              placeholder="Add custom diagnostic step..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
            <AnimatedButton
              type="submit"
              variant="secondary"
              size="sm"
              disabled={!newStepLabel.trim()}
              className="shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </AnimatedButton>
          </form>
        </div>

        {/* Change or Apply Template */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Switch / Apply ITIL Template
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {SOP_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onApplyTemplate(task.id, tmpl)}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                  task.sopId === tmpl.id
                    ? 'bg-teal-950/40 border-teal-500/50 text-teal-300'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{tmpl.title}</div>
                  <div className="text-[10px] text-slate-400">{tmpl.steps.length} steps • {tmpl.estimatedMinutes}m avg</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
