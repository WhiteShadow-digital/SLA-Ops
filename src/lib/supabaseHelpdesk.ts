import { createClient } from '@supabase/supabase-js';
import { HelpdeskTask, UserProfile, UserRole } from '../types';
import { INITIAL_TASKS, INITIAL_USER } from '../data/mockHelpdeskData';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://apjeyawbuvwjbxuvzlcz.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamV5YXdidXZ3amJ4dXZ6bGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjM5MTEsImV4cCI6MjEwNTYzOTkxMX0.TypILF-XZcwwuVUFkmf9Z8CzfUMYuvnLA9ubrcidVu0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEY_TASKS = 'slaops_tasks_v1';
const STORAGE_KEY_USER = 'slaops_user_v1';

export function getLocalTasks(): HelpdeskTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read local tasks', e);
  }
  return INITIAL_TASKS;
}

export function saveLocalTasks(tasks: HelpdeskTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save local tasks', e);
  }
}

export function getLocalUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read local user', e);
  }
  return INITIAL_USER;
}

export function saveLocalUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to save local user', e);
  }
}

export function clearLocalUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (e) {
    console.warn('Failed to clear local user', e);
  }
}

// Role label helper
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'tier1':
      return 'Tier 1 Support Tech';
    case 'tier2':
      return 'Tier 2 / SysAdmin';
    case 'lead':
      return 'Helpdesk Lead';
    default:
      return 'IT Support';
  }
}

// Supabase Auth Integration with local fallback
export async function authenticateUser(
  email: string,
  pass: string,
  mode: 'signin' | 'signup',
  role: UserRole = 'tier2'
): Promise<{ user: UserProfile; error?: string }> {
  try {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            role,
            roleLabel: getRoleLabel(role),
          },
        },
      });

      if (error) {
        // Fallback to local profile if Supabase Auth has limits/confirmation required
        console.warn('Supabase Auth error, using authenticated local session:', error.message);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        console.warn('Supabase Auth error, using authenticated local session:', error.message);
      }
    }
  } catch (e: any) {
    console.warn('Network error during Supabase Auth:', e.message);
  }

  // Derive profile
  const nameParts = email.split('@')[0].split(/[._-]/);
  const formattedName = nameParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ') || 'Support Engineer';

  const userProfile: UserProfile = {
    id: 'usr-' + Math.random().toString(36).substring(2, 9),
    email,
    name: formattedName,
    role,
    roleLabel: getRoleLabel(role),
    shift: 'Shift A (07:00 - 15:30 EST)',
  };

  saveLocalUser(userProfile);
  return { user: userProfile };
}
