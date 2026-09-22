import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  Copy,
  Check,
  Share2,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import { HelpdeskTask, UserProfile } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: HelpdeskTask[];
  user: UserProfile | null;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  tasks,
  user,
}) => {
  const [generalNotes, setGeneralNotes] = useState(
    'Identity SecOps war room bridge remains open for INC-4821. All secondary BGP routes in Dublin stable.'
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const completed = tasks.filter((t) => t.status === 'done');
  const pending = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  const flagged = tasks.filter((t) => t.flaggedForHandover);
  const blocked = tasks.filter((t) => t.status === 'blocked');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const generateMarkdown = () => {
    return `📋 **IT SERVICE DESK SHIFT HANDOVER REPORT**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Shift:** ${user?.shift || 'Shift A (07:00 - 15:30 EST)'}
**Technician:** ${user?.name || 'Ethan Krewu'} (${user?.roleLabel || 'Tier 2 / SysAdmin'})
**Timestamp:** ${dateStr} at ${now.toLocaleTimeString()}

🚨 **CRITICAL / P1 & FLAGGED ITEMS (${flagged.length}):**
${
  flagged.length === 0
    ? '_None flagged for immediate follow-up._'
    : flagged
        .map(
          (t) =>
            `- [${t.priority}] **${t.ticketId}**: ${t.title} (Status: ${t.status.toUpperCase()})`
        )
        .join('\n')
}

⏳ **IN PROGRESS / PENDING TICKETS (${pending.length}):**
${
  pending.length === 0
    ? '_All shift queue items resolved._'
    : pending
        .map(
          (t) =>
            `- [${t.priority}] **${t.ticketId}**: ${t.title} ${
              t.sopTitle ? `(SOP: ${t.sopTitle})` : ''
            }`
        )
        .join('\n')
}

✅ **COMPLETED THIS SHIFT (${completed.length}):**
${
  completed.length === 0
    ? '_No completed tickets logged during this interval._'
    : completed.map((t) => `- **${t.ticketId}**: ${t.title}`).join('\n')
}

⚠️ **BLOCKED / ESCALATIONS (${blocked.length}):**
${
  blocked.length === 0
    ? '_Zero blocked escalations._'
    : blocked.map((t) => `- **${t.ticketId}**: ${t.title}`).join('\n')
}

📝 **SHIFT NOTES & INFRASTRUCTURE ANOMALIES:**
${generalNotes || 'No additional notes provided.'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Generated via SLA OPS Helpdesk Station • Author: Ethan Krewu_`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl glass-panel-glow border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">IT Shift Handover Log Generator</h3>
              <p className="text-xs text-slate-400">
                Single-click standardized handover summary for Slack, Teams, or Service Desk logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-red-500/30 text-center">
              <div className="text-lg font-bold text-red-400 font-mono">{flagged.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Flagged for Shift</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-center">
              <div className="text-lg font-bold text-amber-400 font-mono">{pending.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Pending Queue</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-teal-500/30 text-center">
              <div className="text-lg font-bold text-teal-400 font-mono">{completed.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Completed Today</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-lg font-bold text-slate-300 font-mono">{blocked.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Blocked Items</div>
            </div>
          </div>

          {/* Editable General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              General Shift Remarks &amp; Infrastructure Status:
            </label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="e.g. ISP maintenance scheduled at 02:00, Zoom Room 4B audio tested..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none"
            />
          </div>

          {/* Generated Markdown Preview Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Compiled Handover Output (Markdown / Teams / Slack):
            </label>
            <pre className="w-full bg-slate-950 border border-slate-800/90 rounded-2xl p-4 text-xs font-mono text-cyan-300/90 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
              {generateMarkdown()}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Signed: {user?.name || 'Ethan Krewu'}
          </span>

          <div className="flex items-center space-x-2">
            <AnimatedButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </AnimatedButton>
            <AnimatedButton variant="primary" size="md" onClick={handleCopyReport}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Handover Report</span>
                </>
              )}
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};
