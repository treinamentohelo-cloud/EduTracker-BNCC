
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
  ShieldAlert,
  Building2,
  Bell
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-inter text-[13px]">
      {/* Sidebar Compacta e Funcional */}
      <aside 
        className={`${isSidebarOpen ? 'w-52' : 'w-16'} bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col no-print h-full z-40 shadow-sm`}
      >
        <div className="p-3 h-14 border-b border-slate-100 flex items-center justify-between shrink-0">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 overflow-hidden animate-in fade-in duration-300">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">ET</div>
              <div className="flex flex-col">
                <span className="font-black text-sm text-slate-900 truncate leading-none">EduTracker</span>
                <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">BNCC PRO</span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs m-auto">ET</div>
          )}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setIsSidebarOpen(!isSidebarOpen); }} 
            className="p-1 hover:bg-slate-100 rounded-md transition-colors shrink-0 text-slate-400"
          >
             {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => { e.preventDefault(); setActiveTab(item.id); }}
              className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 group relative ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white font-bold shadow-md' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={16} className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
              {!isSidebarOpen && activeTab === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-l-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-900 truncate leading-none">
                  {userEmail?.split('@')[0] || 'Docente'}
                </p>
                <p className="text-[8px] text-blue-600 truncate font-black uppercase tracking-widest mt-0.5">
                  {userRole}
                </p>
              </div>
            )}
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); onLogout(); }}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-md bg-white border border-slate-100"
              title="Sair do Sistema"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 no-print z-30 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-black text-slate-900 tracking-widest uppercase">
              {menuItems.find(i => i.id === activeTab)?.label || 'Sistema'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Unidade Educacional</span>
                <span className="text-[11px] font-black text-indigo-600 leading-none">{schoolName}</span>
             </div>
             <div className="flex items-center gap-2">
                <button type="button" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative border border-slate-100">
                   <Bell size={16} />
                   <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                   <Users size={14} className="text-blue-600" />
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 custom-scrollbar bg-slate-50/50">
          <div className="min-h-full w-full max-w-6xl mx-auto pb-6">
            <div className="w-full">
              {children}
            </div>
          </div>
          
          <footer className="mt-6 py-4 border-t border-slate-200/60 flex flex-col items-center gap-1 text-slate-300 no-print shrink-0">
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">EduTracker BNCC Framework v3.2.1</span>
          </footer>
        </main>
      </div>
    </div>
  );
};
