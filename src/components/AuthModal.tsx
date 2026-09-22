import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';
import { UserRole, UserProfile } from '../types';
import { authenticateUser } from '../lib/supabaseHelpdesk';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('ethankrewu@gmail.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('tier2');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await authenticateUser(email, password, mode, role);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: UserRole, demoEmail: string) => {
    setRole(demoRole);
    setEmail(demoEmail);
    const demoUser: UserProfile = {
      id: 'demo-' + Math.random().toString(36).substring(2, 7),
      email: demoEmail,
      name: demoEmail === 'ethankrewu@gmail.com' ? 'Ethan Krewu' : 'Alex Rivera',
      role: demoRole,
      roleLabel:
        demoRole === 'tier1'
          ? 'Tier 1 Support Tech'
          : demoRole === 'tier2'
          ? 'Tier 2 / SysAdmin'
          : 'Helpdesk Lead',
      shift: 'Shift A (07:00 - 15:30 EST)',
    };
    onSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background ambient fluctuating radial glow */}
      <div className="absolute inset-0 animate-ambient-mesh opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl glass-panel-glow border border-slate-700/80 shadow-[0_25px_60px_rgba(0,127,255,0.2)] p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-teal-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">SLA OPS Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your ITIL task queue, SOP library, and handover logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center space-x-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tech@company.com"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Role Selector dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Service Desk Role
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="tier1">Tier 1 Support Tech</option>
                <option value="tier2">Tier 2 / SysAdmin</option>
                <option value="lead">Helpdesk Lead</option>
              </select>
            </div>
          </div>

          <AnimatedButton
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full py-2.5 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Register Technician'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </AnimatedButton>
        </form>

        {/* Quick Demo Access presets */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2.5 flex items-center justify-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Demo Technician Access:</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleQuickDemo('tier2', 'ethankrewu@gmail.com')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-[11px] text-cyan-300 font-mono transition cursor-pointer"
            >
              Ethan Krewu (Tier 2)
            </button>
            <button
              onClick={() => handleQuickDemo('tier1', 'tech1@frontline.it')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-mono transition cursor-pointer"
            >
              Tier 1 Tech
            </button>
            <button
              onClick={() => handleQuickDemo('lead', 'lead@frontline.it')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-mono transition cursor-pointer"
            >
              Helpdesk Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
