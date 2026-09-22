import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { SOPLibraryView } from './components/SOPLibraryView';
import { CannedCommandsStore } from './components/CannedCommandsStore';
import { SOPDrawer } from './components/SOPDrawer';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { AuthModal } from './components/AuthModal';
import { WatermarkFooter } from './components/WatermarkFooter';
import {
  getLocalTasks,
  saveLocalTasks,
  getLocalUser,
  saveLocalUser,
  clearLocalUser,
} from './lib/supabaseHelpdesk';
import { HelpdeskTask, UserProfile, TaskStatus, SOPStep, SOPTemplate } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'sops' | 'commands'>('landing');
  const [user, setUser] = useState<UserProfile | null>(() => getLocalUser());
  const [tasks, setTasks] = useState<HelpdeskTask[]>(() => getLocalTasks());

  // Search query in navbar
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedTaskForSOP, setSelectedTaskForSOP] = useState<HelpdeskTask | null>(null);
  const [isSOPDrawerOpen, setIsSOPDrawerOpen] = useState(false);

  // Sync tasks to local storage whenever they change
  useEffect(() => {
    saveLocalTasks(tasks);
  }, [tasks]);

  // Urgent tasks: P1 or P2 tasks with less than 30 minutes left
  const nowMs = Date.now();
  const urgentTasks = tasks.filter((t) => {
    if (t.status === 'done') return false;
    const deadlineMs = new Date(t.slaDeadline).getTime();
    const secsLeft = (deadlineMs - nowMs) / 1000;
    return secsLeft < 1800; // < 30 minutes or breached
  });

  // Task Handlers
  const handleAddTask = (newTaskData: Omit<HelpdeskTask, 'id' | 'createdAt'>) => {
    const newTask: HelpdeskTask = {
      ...newTaskData,
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleToggleHandover = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, flaggedForHandover: !t.flaggedForHandover } : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForSOP?.id === taskId) {
      setIsSOPDrawerOpen(false);
      setSelectedTaskForSOP(null);
    }
  };

  // SOP Handlers
  const handleOpenSOPDrawer = (task: HelpdeskTask) => {
    setSelectedTaskForSOP(task);
    setIsSOPDrawerOpen(true);
  };

  const handleUpdateTaskSOP = (taskId: string, steps: SOPStep[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, sopSteps: steps };
          if (selectedTaskForSOP?.id === taskId) {
            setSelectedTaskForSOP(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleApplyTemplateToTask = (taskId: string, template: SOPTemplate) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            sopId: template.id,
            sopTitle: template.title,
            sopSteps: JSON.parse(JSON.stringify(template.steps)),
          };
          if (selectedTaskForSOP?.id === taskId) {
            setSelectedTaskForSOP(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleSpawnTicketFromTemplate = (template: SOPTemplate) => {
    const newTask: HelpdeskTask = {
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      ticketId: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: template.title,
      description: template.description,
      priority: 'P3',
      category: template.category,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + template.estimatedMinutes * 60 * 1000).toISOString(),
      targetResolutionMinutes: template.estimatedMinutes,
      assignedTo: user?.name || 'Ethan Krewu',
      flaggedForHandover: false,
      sopId: template.id,
      sopTitle: template.title,
      sopSteps: JSON.parse(JSON.stringify(template.steps)),
    };
    setTasks((prev) => [newTask, ...prev]);
    setCurrentView('dashboard');
  };

  // Auth Handlers
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    saveLocalUser(authenticatedUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    clearLocalUser();
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 relative">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenHandover={() => setIsHandoverModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        urgentTasks={urgentTasks}
        onSelectTask={(task) => {
          setSelectedTaskForSOP(task);
          setIsSOPDrawerOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onLaunchWorkspace={() => {
              if (user) {
                setCurrentView('dashboard');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onViewDemo={() => setCurrentView('dashboard')}
            onExploreSOPs={() => setCurrentView('sops')}
            onExploreCommands={() => setCurrentView('commands')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateStatus={handleUpdateStatus}
            onToggleHandover={handleToggleHandover}
            onDeleteTask={handleDeleteTask}
            onOpenSOPDrawer={handleOpenSOPDrawer}
            onOpenCommands={() => setCurrentView('commands')}
            onOpenHandover={() => setIsHandoverModalOpen(true)}
            user={user}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'sops' && (
          <SOPLibraryView onSpawnTicket={handleSpawnTicketFromTemplate} />
        )}

        {currentView === 'commands' && (
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
            <CannedCommandsStore />
          </div>
        )}
      </main>

      {/* Persistent Watermark Footer with Ethan Krewu */}
      <WatermarkFooter />

      {/* SOP Checklist Drawer */}
      <SOPDrawer
        isOpen={isSOPDrawerOpen}
        onClose={() => {
          setIsSOPDrawerOpen(false);
          setSelectedTaskForSOP(null);
        }}
        task={selectedTaskForSOP}
        onUpdateTaskSOP={handleUpdateTaskSOP}
        onApplyTemplate={handleApplyTemplateToTask}
      />

      {/* Shift Handover Modal */}
      <ShiftHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        tasks={tasks}
        user={user}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
