
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
    // Escuta mudanças no nome da escola disparadas pelo Portal do Gestor
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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col no-print`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ET</div>
              <span className="font-bold text-lg text-blue-900">EduTracker</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold m-auto">ET</div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
              {activeTab === item.id && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {userEmail?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-tighter">
                  {userEmail || userRole}
                </p>
              </div>
            )}
            <button 
              onClick={onLogout}
              title="Sair" 
              className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between no-print">
          <h1 className="text-xl font-semibold text-slate-800">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-slate-500">Unidade Educacional</span>
                <span className="text-sm font-semibold text-slate-700">{schoolName}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          
          <footer className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col items-center gap-1 text-slate-400 no-print pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Conformidade Pedagógica BNCC v3.1</span>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500">Profº Marques</span>
          </footer>
        </div>
      </main>
    </div>
  );
};
