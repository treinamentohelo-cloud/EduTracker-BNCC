
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardCheck, 
  UserPlus, 
  FileBarChart, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Building2
} from 'lucide-react';
import { UserRole } from '../types';
import { db } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  userEmail?: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  userRole, 
  userEmail, 
  onLogout 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [schoolName, setSchoolName] = useState(db.getSchoolName());

  useEffect(() => {
    const handleSchoolChange = (e: any) => {
      setSchoolName(e.detail);
    };

    window.addEventListener('schoolNameChanged', handleSchoolChange);
    return () => window.removeEventListener('schoolNameChanged', handleSchoolChange);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Turmas', icon: Users },
    { id: 'students', label: 'Alunos', icon: GraduationCap },
    { id: 'skills', label: 'Habilidades BNCC', icon: BookOpen },
    { id: 'assessments', label: 'Avaliações', icon: ClipboardCheck },
    { id: 'reinforcement', label: 'Reforço Escolar', icon: UserPlus },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart },
  ];

  if (userRole === UserRole.COORDINATOR) {
    menuItems.splice(6, 0, { id: 'coordinator', label: 'Portal Coordenador', icon: ShieldAlert });
  }

  if (userRole === UserRole.MANAGER) {
    menuItems.splice(0, 0, { id: 'manager', label: 'Portal Gestor', icon: Building2 });
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col no-print h-full`}
      >
        <div className="p-4 h-16 border-b border-slate-100 flex items-center justify-between shrink-0">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">ET</div>
              <span className="font-black text-lg text-blue-900 truncate tracking-tight">EduTracker</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold m-auto">ET</div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 rounded shrink-0">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {isSidebarOpen && <span className="truncate text-sm">{item.label}</span>}
              {activeTab === item.id && isSidebarOpen && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">
                  {userEmail?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-black uppercase tracking-widest">
                  {userRole}
                </p>
              </div>
            )}
            <button 
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-xl"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 no-print z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade Educacional</span>
                <span className="text-sm font-black text-blue-600 leading-none">{schoolName}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <Users size={20} className="text-slate-500" />
             </div>
          </div>
        </header>

        {/* Content Scrolling Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10 custom-scrollbar scroll-smooth">
          <div className="min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            {/* Footer interno ao scroll */}
            <footer className="mt-20 py-8 border-t border-slate-200/60 flex flex-col items-center gap-2 text-slate-400 no-print shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">EduTracker BNCC Framework v3.1</span>
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Desenvolvido para Gestão Pedagógica Estratégica</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
