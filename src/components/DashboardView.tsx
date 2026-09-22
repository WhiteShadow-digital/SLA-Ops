import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  Filter,
  Layers,
  Flag,
  Trash2,
  Check,
  ChevronRight,
  Flame,
  Terminal,
  Search,
  Sparkles,
  ArrowUpDown,
  Tag,
  Share2,
  PlayCircle,
  PauseCircle,
  AlertOctagon,
} from 'lucide-react';
import { HelpdeskTask, Priority, Category, TaskStatus, UserProfile, SOPTemplate } from '../types';
import { SOP_TEMPLATES } from '../data/mockHelpdeskData';
import { AnimatedButton } from './AnimatedButton';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  tasks: HelpdeskTask[];
  onAddTask: (task: Omit<HelpdeskTask, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onToggleHandover: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenSOPDrawer: (task: HelpdeskTask) => void;
  onOpenCommands: () => void;
  onOpenHandover: () => void;
  user: UserProfile | null;
  searchQuery: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onAddTask,
  onUpdateStatus,
  onToggleHandover,
  onDeleteTask,
  onOpenSOPDrawer,
  onOpenCommands,
  onOpenHandover,
  user,
  searchQuery,
}) => {
  // Live ticking clock to update all countdowns every second
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTicketId, setQuickTicketId] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('P2');
  const [quickCategory, setQuickCategory] = useState<Category>('Incident');
  const [quickDurationMins, setQuickDurationMins] = useState<number>(60);
  const [selectedSopTemplate, setSelectedSopTemplate] = useState<string>('');

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyHandover, setOnlyHandover] = useState(false);

  // Helper to calculate seconds remaining to SLA deadline
  const getSecondsRemaining = (deadlineIso: string) => {
    const deadlineMs = new Date(deadlineIso).getTime();
    return Math.floor((deadlineMs - currentTime) / 1000);
  };

  // Helper to format countdown string
  const formatSlaCountdown = (seconds: number) => {
    if (seconds <= 0) {
      const overdueSecs = Math.abs(seconds);
      const overdueMins = Math.floor(overdueSecs / 60);
      return `BREACHED -${overdueMins}m`;
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // KPI Calculations
  const totalActive = tasks.filter((t) => t.status !== 'done').length;
  const completedToday = tasks.filter((t) => t.status === 'done').length;
  const flaggedHandoverCount = tasks.filter((t) => t.flaggedForHandover).length;
  const warningCount = tasks.filter((t) => {
    if (t.status === 'done') return false;
    const secs = getSecondsRemaining(t.slaDeadline);
    return secs < 1800; // within 30 minutes or breached
  }).length;

  const completionPercentage =
    tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (onlyHandover && !t.flaggedForHandover) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchId = t.ticketId.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchSop = t.sopTitle?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchDesc && !matchSop) return false;
    }
    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const generatedTicketId =
      quickTicketId.trim() ||
      (quickCategory === 'Incident'
        ? `INC-${Math.floor(1000 + Math.random() * 9000)}`
        : quickCategory === 'Service Request'
        ? `SR-${Math.floor(1000 + Math.random() * 9000)}`
        : `MN-${Math.floor(1000 + Math.random() * 9000)}`);

    const deadline = new Date(Date.now() + quickDurationMins * 60 * 1000).toISOString();

    const matchedSop = SOP_TEMPLATES.find((s) => s.id === selectedSopTemplate);

    onAddTask({
      ticketId: generatedTicketId,
      title: quickTitle.trim(),
      priority: quickPriority,
      category: quickCategory,
      status: 'todo',
      slaDeadline: deadline,
      targetResolutionMinutes: quickDurationMins,
      assignedTo: user?.name || 'Ethan Krewu',
      flaggedForHandover: quickPriority === 'P1',
      sopId: matchedSop?.id,
      sopTitle: matchedSop?.title,
      sopSteps: matchedSop ? JSON.parse(JSON.stringify(matchedSop.steps)) : undefined,
    });

    setQuickTitle('');
    setQuickTicketId('');
    setSelectedSopTemplate('');
  };

  const handleMarkDone = (task: HelpdeskTask) => {
    onUpdateStatus(task.id, task.status === 'done' ? 'in_progress' : 'done');
    if (task.status !== 'done') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#007FFF', '#40E0D0', '#008080'],
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      {/* Top Header / Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Frontline Queue Workspace
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Shift A Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{user?.name}</strong> •{' '}
            <span className="text-cyan-400 font-medium">{user?.roleLabel}</span> • High-velocity
            ITIL triage
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <AnimatedButton variant="secondary" size="sm" onClick={onOpenCommands}>
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Canned Commands</span>
          </AnimatedButton>
          <AnimatedButton variant="primary" size="sm" onClick={onOpenHandover}>
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-950" />
            <span>Generate Handover</span>
          </AnimatedButton>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Tickets/Tasks */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 transition shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active Queue Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{totalActive}</span>
            <span className="text-xs text-slate-400 font-medium">unresolved tickets</span>
          </div>
          <div className="mt-3 text-[11px] text-cyan-400 font-mono">
            {tasks.filter((t) => t.priority === 'P1').length} P1 Critical in queue
          </div>
        </div>

        {/* KPI 2: SLA Warnings (within 30m of breach) */}
        <div
          className={`p-5 rounded-2xl glass-card border transition shadow-sm ${
            warningCount > 0
              ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Impending SLA Breach</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                warningCount > 0
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                warningCount > 0 ? 'text-red-400' : 'text-white'
              }`}
            >
              {warningCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">&lt; 30m to breach</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-red-400">
            {warningCount > 0 ? '🚨 Immediate action required' : '✓ All targets within bounds'}
          </div>
        </div>

        {/* KPI 3: Completed Today (Progress Bar) */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-teal-500/40 transition shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Completed Today</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{completedToday}</span>
            <span className="text-xs text-teal-400 font-mono">({completionPercentage}%)</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Pending Handover */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/40 transition shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Flagged For Shift Handover</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {flaggedHandoverCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">marked for next tech</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-400 font-mono">
            Included in automatic shift log
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left & Center Panel: Task & SLA Queue */}
        <div className="lg:col-span-8 space-y-5">
          {/* Quick-Add Task Bar */}
          <div className="p-4 sm:p-5 rounded-2xl glass-panel-glow border border-slate-700/80 shadow-md">
            <div className="flex items-center space-x-2 mb-3">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Quick Ticket &amp; SLA Dispatch
              </span>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={quickTicketId}
                    onChange={(e) => setQuickTicketId(e.target.value)}
                    placeholder="Ticket ID (e.g. INC-4890)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="sm:col-span-8">
                  <input
                    type="text"
                    required
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Incident summary or service request..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Inline Dropdowns: Priority, Category, SLA Limit, SOP Template */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* Priority */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Priority (ITIL)</label>
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as Priority)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="P1">P1 Critical (15m)</option>
                    <option value="P2">P2 High (1h)</option>
                    <option value="P3">P3 Medium (4h)</option>
                    <option value="P4">P4 Low (8h)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as Category)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Incident">Incident</option>
                    <option value="Service Request">Service Request</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                {/* SLA Target Duration */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">SLA Target</label>
                  <select
                    value={quickDurationMins}
                    onChange={(e) => setQuickDurationMins(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value={15}>15 Minutes (P1)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={120}>2 Hours</option>
                    <option value={240}>4 Hours</option>
                    <option value={480}>8 Hours</option>
                  </select>
                </div>

                {/* SOP Template */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Attach SOP</label>
                  <select
                    value={selectedSopTemplate}
                    onChange={(e) => setSelectedSopTemplate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 truncate"
                  >
                    <option value="">None (Standard)</option>
                    {SOP_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!quickTitle.trim()}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Queue</span>
                </AnimatedButton>
              </div>
            </form>
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            {/* Status Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['all', 'todo', 'in_progress', 'blocked', 'done'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Quick Priority & Handover Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono"
              >
                <option value="all">All Priorities</option>
                <option value="P1">P1 Critical</option>
                <option value="P2">P2 High</option>
                <option value="P3">P3 Medium</option>
                <option value="P4">P4 Low</option>
              </select>

              <button
                onClick={() => setOnlyHandover(!onlyHandover)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                  onlyHandover
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Flag className="w-3 h-3 text-amber-400" />
                <span>Handover Only</span>
              </button>
            </div>
          </div>

          {/* Task Cards List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 p-6 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-60" />
                No tasks match current filter criteria.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const secsRemaining = getSecondsRemaining(task.slaDeadline);
                const isBreached = secsRemaining <= 0;
                const isUnder15Mins = secsRemaining < 900 && secsRemaining > 0;
                const isDone = task.status === 'done';

                // Priority color badges
                const priorityBadge = {
                  P1: 'bg-red-950 text-red-400 border-red-500/50',
                  P2: 'bg-amber-950 text-amber-400 border-amber-500/50',
                  P3: 'bg-sky-950 text-sky-400 border-sky-500/50',
                  P4: 'bg-emerald-950 text-emerald-400 border-emerald-500/50',
                }[task.priority];

                return (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 rounded-2xl glass-card transition-all border relative ${
                      isDone
                        ? 'opacity-60 bg-slate-900/30 border-slate-800/60'
                        : task.priority === 'P1' || isBreached
                        ? 'border-red-500/50 bg-slate-900/90 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-p1-pulse'
                        : isUnder15Mins
                        ? 'border-amber-500/50 bg-slate-900/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'border-slate-800/90 hover:border-cyan-500/40 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Top Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${priorityBadge}`}
                        >
                          {task.priority} • {task.ticketId}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {task.category}
                        </span>
                        {task.flaggedForHandover && (
                          <span className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono">
                            <Flag className="w-2.5 h-2.5" />
                            <span>HANDOVER</span>
                          </span>
                        )}
                      </div>

                      {/* Live SLA Countdown Badge */}
                      <div className="flex items-center space-x-2">
                        {!isDone && (
                          <div
                            className={`flex items-center space-x-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                              isBreached
                                ? 'bg-red-950 text-red-400 border-red-500 animate-pulse'
                                : isUnder15Mins
                                ? 'bg-red-950/70 text-red-300 border-red-500/70 animate-pulse'
                                : secsRemaining < 1800
                                ? 'bg-amber-950/70 text-amber-300 border-amber-500/60'
                                : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatSlaCountdown(secsRemaining)}</span>
                          </div>
                        )}
                        {isDone && (
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-950 text-teal-300 border border-teal-600/50 flex items-center space-x-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>RESOLVED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Title & Description */}
                    <div className="my-2">
                      <h3
                        className={`text-sm sm:text-base font-bold text-white ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* SOP Progress Bar if attached */}
                    {task.sopSteps && task.sopSteps.length > 0 && (
                      <div
                        onClick={() => onOpenSOPDrawer(task)}
                        className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Layers className="w-3.5 h-3.5 text-teal-400" />
                          <span className="text-xs font-medium text-slate-200">
                            {task.sopTitle || 'Attached SOP'}:
                          </span>
                          <span className="text-xs font-mono font-bold text-teal-400">
                            {task.sopSteps.filter((s) => s.completed).length}/
                            {task.sopSteps.length} steps completed
                          </span>
                        </div>
                        <span className="text-[11px] text-cyan-400 font-medium flex items-center space-x-1">
                          <span>Verify</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                    {/* Action Controls Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      {/* Status Selector */}
                      <div className="flex items-center space-x-1.5 text-xs">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                          className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-medium focus:outline-none"
                        >
                          <option value="todo">To-Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="done">Done / Resolved</option>
                        </select>

                        {/* SOP Button */}
                        <button
                          onClick={() => onOpenSOPDrawer(task)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Layers className="w-3 h-3" />
                          <span>SOP Checklist</span>
                        </button>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center space-x-2">
                        {/* Handover Toggle */}
                        <button
                          onClick={() => onToggleHandover(task.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            task.flaggedForHandover
                              ? 'bg-amber-950 text-amber-400 border-amber-500/60'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                          title={
                            task.flaggedForHandover
                              ? 'Remove from handover list'
                              : 'Flag for shift handover'
                          }
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark Done */}
                        <AnimatedButton
                          variant={isDone ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => handleMarkDone(task)}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Reopen' : 'Resolve'}</span>
                        </AnimatedButton>

                        {/* Delete Task */}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Procedural SOP Library & Quick Command Drawer */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Shift Handover Snapshot */}
          <div className="p-5 rounded-2xl glass-panel-glow border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Shift Handover Preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800">
                {flaggedHandoverCount} items flagged
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Flag tasks during your shift. When your shift ends, generate a formatted handover log
              for Teams, Slack, or email in one click.
            </p>

            <AnimatedButton
              variant="primary"
              size="md"
              onClick={onOpenHandover}
              className="w-full py-2.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Compile Handover Log</span>
            </AnimatedButton>
          </div>

          {/* ITIL SOP Templates Explorer */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>SOP Checklist Library</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">4 templates</span>
            </div>

            <div className="space-y-2.5">
              {SOP_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                      {tmpl.title}
                    </h4>
                    <span className="text-[10px] font-mono text-teal-400">
                      {tmpl.estimatedMinutes}m
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2 leading-snug">
                    {tmpl.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>{tmpl.steps.length} procedural checks</span>
                    <button
                      onClick={() => {
                        // Quick create task from this SOP
                        onAddTask({
                          ticketId: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
                          title: tmpl.title,
                          priority: 'P3',
                          category: tmpl.category,
                          status: 'in_progress',
                          slaDeadline: new Date(
                            Date.now() + tmpl.estimatedMinutes * 60 * 1000
                          ).toISOString(),
                          targetResolutionMinutes: tmpl.estimatedMinutes,
                          assignedTo: user?.name || 'Ethan Krewu',
                          flaggedForHandover: false,
                          sopId: tmpl.id,
                          sopTitle: tmpl.title,
                          sopSteps: JSON.parse(JSON.stringify(tmpl.steps)),
                        });
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                    >
                      + Spawn Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick-Copy Canned Snippet Widget */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>Quick Diagnostic Snippets</span>
              </div>
              <button
                onClick={onOpenCommands}
                className="text-[10px] text-sky-400 hover:underline font-bold cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {[
                { label: 'Flush DNS', cmd: 'ipconfig /flushdns' },
                { label: 'Force GPO', cmd: 'gpupdate /force' },
                { label: 'Repair Windows', cmd: 'sfc /scannow' },
              ].map((item) => (
                <div
                  key={item.cmd}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]"
                >
                  <span className="text-sky-300 truncate max-w-[180px]">{item.cmd}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.cmd);
                      confetti({
                        particleCount: 15,
                        spread: 40,
                        origin: { y: 0.8 },
                      });
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition cursor-pointer"
                  >
                    COPY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
