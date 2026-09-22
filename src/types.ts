export type UserRole = 'tier1' | 'tier2' | 'lead';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  shift: string;
  avatar?: string;
}

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type Category = 'Incident' | 'Service Request' | 'Maintenance' | 'Security';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export interface SOPStep {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
}

export interface SOPTemplate {
  id: string;
  title: string;
  category: Category;
  description: string;
  estimatedMinutes: number;
  steps: SOPStep[];
}

export interface HelpdeskTask {
  id: string;
  ticketId: string; // e.g. INC-4821, SR-3107
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  status: TaskStatus;
  createdAt: string; // ISO string
  slaDeadline: string; // ISO string
  targetResolutionMinutes: number;
  assignedTo?: string;
  sopId?: string;
  sopTitle?: string;
  sopSteps?: SOPStep[];
  flaggedForHandover: boolean;
  notes?: string;
}

export interface CannedCommand {
  id: string;
  title: string;
  category: 'Network' | 'Windows/AD' | 'macOS/Linux' | 'Email Responses';
  command: string;
  description: string;
  osBadge?: string;
}

export interface ShiftHandoverReport {
  shiftName: string;
  date: string;
  author: string;
  role: string;
  completedTasks: HelpdeskTask[];
  pendingTasks: HelpdeskTask[];
  blockedTasks: HelpdeskTask[];
  generalNotes: string;
}
