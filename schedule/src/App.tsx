import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LayoutGrid, 
  CheckSquare, 
  Plus, 
  Settings, 
  Search,
  Layers,
  ChevronRight,
  PlusCircle,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startOfToday, addDays } from 'date-fns';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

import { Shot, Project, ShotStatus } from './types.ts';
import { auth } from './services/firebase.ts';
import { 
  createProject, 
  subscribeProjects, 
  createShot, 
  subscribeShots, 
  updateShotData,
  deleteShot
} from './services/firebaseService.ts';

// View Components
import ScheduleView from './components/ScheduleView.tsx';
import ShotsView from './components/ShotsView.tsx';
import TodoView from './components/TodoView.tsx';
import ProjectModal from './components/ProjectModal.tsx';

type ViewType = 'SCHEDULE' | 'SHOTS' | 'TODO';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('SCHEDULE');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Effect
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        setProjects([]);
        setShots([]);
        setActiveProjectId(null);
      }
    });
  }, []);

  // Projects Subscription
  useEffect(() => {
    if (user) {
      return subscribeProjects((newProjects) => {
        setProjects(newProjects);
        if (newProjects.length > 0 && !activeProjectId) {
          setActiveProjectId(newProjects[0].id);
        }
      });
    }
  }, [user]);

  // Shots Subscription
  useEffect(() => {
    if (user && activeProjectId) {
      return subscribeShots(activeProjectId, (newShots) => {
        setShots(newShots);
      });
    }
  }, [user, activeProjectId]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => auth.signOut();

  const handleAddProject = async (name: string, description: string) => {
    const id = await createProject(name, description);
    if (id) {
      setActiveProjectId(id);
      setIsProjectModalOpen(false);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (loading) {
    return (
      <div className="h-screen w-full bg-studio-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-studio-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full bg-studio-bg flex flex-col items-center justify-center p-6 text-center space-y-8 technical-grid">
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-studio-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-studio-accent/20">
            <Layers className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">STUDIO<span className="text-studio-accent">HUB</span></h1>
          <p className="text-studio-muted max-w-sm mx-auto uppercase text-xs font-bold tracking-[0.3em]">Professional VFX Pipeline Management</p>
        </div>
        
        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-2xl active:scale-95"
        >
          <LogIn className="w-5 h-5" />
          SIGN IN WITH GOOGLE
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-studio-bg overflow-hidden font-sans text-studio-text">
      {/* Sidebar */}
      <aside className="w-64 border-r border-studio-border bg-studio-surface flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Layers className="w-5 h-5 text-studio-accent" />
            <span className="font-bold tracking-tight text-lg">StudioHub</span>
          </div>

          <div className="space-y-6">
            {/* Navigation */}
            <div className="space-y-1">
              <NavItem 
                icon={<BarChart3 className="w-4 h-4" />} 
                label="Schedule" 
                active={activeView === 'SCHEDULE'} 
                onClick={() => setActiveView('SCHEDULE')} 
              />
              <NavItem 
                icon={<LayoutGrid className="w-4 h-4" />} 
                label="Shots" 
                active={activeView === 'SHOTS'} 
                onClick={() => setActiveView('SHOTS')} 
              />
              <NavItem 
                icon={<CheckSquare className="w-4 h-4" />} 
                label="Tasks" 
                active={activeView === 'TODO'} 
                onClick={() => setActiveView('TODO')} 
              />
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-studio-border space-y-6">
          {/* Project Selector Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Project</label>
            <div className="relative group">
              <select 
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="w-full bg-studio-bg border border-studio-border rounded-lg px-3 py-2 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-studio-accent transition-colors text-studio-text"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                {projects.length === 0 && <option value="">No projects</option>}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-studio-muted">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="w-full py-2 border border-dashed border-studio-border rounded-lg text-xs text-studio-muted hover:text-studio-accent hover:border-studio-accent transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-studio-border">
            <div className="flex items-center gap-3">
               {user.photoURL ? (
                 <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="User" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-studio-accent/10 flex items-center justify-center text-xs font-bold text-studio-accent">
                   {user.displayName?.charAt(0) || user.email?.charAt(0)}
                 </div>
               )}
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-studio-text truncate">{user.displayName || user.email}</p>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-studio-muted hover:text-red-500 transition-colors text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-studio-border flex items-center justify-between px-8 bg-studio-surface/20 backdrop-blur-sm">
          <div className="flex items-center gap-6">
             <h1 className="text-lg font-bold tracking-tight text-studio-text">
              {activeProject ? activeProject.name : 'Pipeline'}
            </h1>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto bg-studio-bg">
           {!activeProjectId ? (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-studio-border flex items-center justify-center text-studio-muted">
                 <Plus className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">No Active Project</h2>
                <p className="text-studio-muted max-w-xs mx-auto">Create or select a project from the sidebar to begin tracking shots.</p>
               </div>
               <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="bg-white text-black px-6 py-2 rounded font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-xl"
               >
                 Create Project
               </button>
             </div>
           ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView + (activeProjectId || '')}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="h-full"
              >
                {activeView === 'SCHEDULE' && (
                  <ScheduleView 
                    shots={shots} 
                    onUpdateShot={(s) => updateShotData(activeProjectId, s.id, s)} 
                    onDeleteShot={(shotId) => deleteShot(activeProjectId, shotId)}
                    activeProjectId={activeProjectId} 
                  />
                )}
                {activeView === 'SHOTS' && (
                  <ShotsView 
                    shots={shots} 
                    onUpdateShot={(s) => updateShotData(activeProjectId, s.id, s)}
                    onDeleteShot={(shotId) => deleteShot(activeProjectId, shotId)}
                  />
                )}
                {activeView === 'TODO' && (
                  <TodoView activeProjectId={activeProjectId} />
                )}
              </motion.div>
            </AnimatePresence>
           )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <ProjectModal 
            onClose={() => setIsProjectModalOpen(false)} 
            onSubmit={handleAddProject} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-[9px] font-bold transition-all uppercase font-mono ${
        active 
          ? 'bg-studio-accent text-white shadow-[0_0_10px_rgba(142,110,213,0.3)]' 
          : 'text-studio-muted hover:text-studio-text'
      }`}
    >
      {label}
    </button>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all text-left ${
        active 
          ? 'bg-studio-accent/5 text-studio-accent font-bold' 
          : 'text-studio-muted hover:bg-studio-bg hover:text-studio-text'
      }`}
    >
      <div className={active ? 'text-studio-accent' : 'text-studio-muted'}>{icon}</div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
