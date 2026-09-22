import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Search,
  Filter,
  Code2,
  Mail,
  Server,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CANNED_COMMANDS } from '../data/mockHelpdeskData';
import { CannedCommand } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface CannedCommandsStoreProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const CannedCommandsStore: React.FC<CannedCommandsStoreProps> = ({
  onClose,
  isModal = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  const categories = ['All', 'Network', 'Windows/AD', 'macOS/Linux', 'Email Responses'];

  const filteredCommands = CANNED_COMMANDS.filter((cmd) => {
    const matchesCat = activeCategory === 'All' || cmd.category === activeCategory;
    const matchesSearch =
      cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (cmd: CannedCommand) => {
    navigator.clipboard.writeText(cmd.command);
    setCopiedId(cmd.id);
    setToastText(`Copied: "${cmd.title}" to clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
      setToastText(null);
    }, 2500);
  };

  return (
    <div className={`flex flex-col h-full ${isModal ? 'p-6' : 'p-4 sm:p-6'}`}>
      {/* Toast notification */}
      {toastText && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-teal-950 border border-teal-500/60 text-teal-300 px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastText}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Canned Command &amp; Snippet Store</h3>
            <p className="text-xs text-slate-400">
              One-click executable diagnostic commands and verified response templates
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search commands..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto py-3 scrollbar-none border-b border-slate-800/80">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Commands Grid */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredCommands.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No snippets found matching your query.
          </div>
        ) : (
          filteredCommands.map((cmd) => (
            <div
              key={cmd.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/40 transition shadow-sm text-left group"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                      {cmd.title}
                    </span>
                    {cmd.osBadge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {cmd.osBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cmd.description}</p>
                </div>

                {/* Copy Button */}
                <AnimatedButton
                  variant={copiedId === cmd.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleCopy(cmd)}
                  className="shrink-0"
                >
                  {copiedId === cmd.id ? (
                    <>
                      <Check className="w-3 h-3 text-slate-950" />
                      <span className="text-slate-950">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-white" />
                      <span>COPY</span>
                    </>
                  )}
                </AnimatedButton>
              </div>

              {/* Code snippet block */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-sky-300 overflow-x-auto whitespace-pre-wrap select-all">
                {cmd.command}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
