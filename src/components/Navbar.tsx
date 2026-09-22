import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  LogOut,
  User,
  Clock,
  Sparkles,
  Command,
  Sun,
  Moon,
  ChevronDown,
  AlertTriangle,
  Flame,
  LayoutDashboard,
  Layers,
} from 'lucide-react';
import { UserProfile, HelpdeskTask } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'sops' | 'commands';
  onNavigate: (view: 'landing' | 'dashboard' | 'sops' | 'commands') => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenHandover: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  urgentTasks: HelpdeskTask[];
  onSelectTask?: (task: HelpdeskTask) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  onOpenHandover,
  searchQuery,
  onSearchChange,
  urgentTasks,
  onSelectTask,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & App Brand matching screenshot */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-sky-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-white flex items-center space-x-1">
                <span>SLA OPS</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase -mt-0.5">
                Frontline ITIL
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Queue Workspace</span>
            </button>
            <button
              onClick={() => onNavigate('sops')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                currentView === 'sops'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SOP Checklists</span>
            </button>
            <button
              onClick={() => onNavigate('commands')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                currentView === 'commands'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Command className="w-3.5 h-3.5" />
              <span>Canned Snippets</span>
            </button>
          </nav>
        </div>

        {/* Search Bar (searches tasks, canned snippets, and SOP templates) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tickets, SOP steps, or canned commands..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Notifications, Handover, User Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Urgent SLA Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition cursor-pointer"
              title="Urgent SLA Alerts"
            >
              <Bell className="w-4 h-4" />
              {urgentTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                  {urgentTasks.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-glow border border-slate-700/80 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span>Active SLA Warnings</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800">
                    {urgentTasks.length} critical
                  </span>
                </div>

                <div className="py-2 max-h-64 overflow-y-auto space-y-2">
                  {urgentTasks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1 opacity-80" />
                      All SLA targets green. No impending breaches!
                    </div>
                  ) : (
                    urgentTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onNavigate('dashboard');
                          if (onSelectTask) onSelectTask(t);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-red-500/30 hover:border-red-400 hover:bg-slate-850 cursor-pointer transition text-left"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-red-400">{t.ticketId}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-mono">
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-200 mt-1 truncate">{t.title}</p>
                        <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-amber-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>Breach impending</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shift Handover CTA */}
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={onOpenHandover}
            className="hidden sm:inline-flex"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shift Handover</span>
          </AnimatedButton>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono leading-none">
                    {user.roleLabel.split('/')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-glow border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      {user.roleLabel}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition flex items-center space-x-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Workspace Queue</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenHandover();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition flex items-center space-x-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                      <span>Generate Handover</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-950/40 rounded-lg transition flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <AnimatedButton variant="primary" size="sm" onClick={onOpenAuth}>
              <span>Launch workspace</span>
              <span>→</span>
            </AnimatedButton>
          )}
        </div>
      </div>
    </header>
  );
};
