
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, X, Edit, Trash2 } from 'lucide-react';
import { StudentStatus, Student } from '../types';
import { db } from '../services/db';
import { ConfirmModal } from './ConfirmModal';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState(db.getStudents());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', age: '', grade: '1º', classId: 'c-1' });
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    setStudents(db.getStudents());
  }, []);

  const handleAddOrEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData: Student = editingStudent ? {
      ...editingStudent,
      name: newStudent.name,
      age: parseInt(newStudent.age),
      grade: newStudent.grade,
      classId: newStudent.classId,
    } : {
      id: 's-' + Math.random().toString(36).substr(2, 5),
      name: newStudent.name,
      age: parseInt(newStudent.age),
      grade: newStudent.grade,
      classId: newStudent.classId,
      status: StudentStatus.ADEQUATE,
      evaluations: []
    };

    db.saveStudent(studentData);
    setStudents(db.getStudents());
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setNewStudent({ name: '', age: '', grade: '1º', classId: 'c-1' });
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      name: student.name,
      age: student.age.toString(),
      grade: student.grade,
      classId: student.classId
    });
    setIsModalOpen(true);
  };

  const confirmDeleteStudent = () => {
    db.deleteStudent(deleteConfirm.id);
    setStudents(db.getStudents());
  };

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ADEQUATE: return 'bg-blue-50 text-blue-600 border-blue-100';
      case StudentStatus.DEVELOPING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case StudentStatus.NEEDS_REINFORCEMENT: return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDeleteStudent}
        title="Excluir Aluno?"
        message={`Deseja realmente excluir ${deleteConfirm.name}? Esta ação removerá permanentemente todo o histórico de avaliações BNCC do aluno.`}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleAddOrEditStudent} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="Ex: Maria Oliveira Santos" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Idade</label>
                  <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newStudent.age} onChange={e => setNewStudent({...newStudent, age: e.target.value})} placeholder="7" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Série</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold cursor-pointer" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                    {['1º', '2º', '3º', '4º', '5º'].map(g => <option key={g} value={g}>{g} Ano</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button className="w-full py-5 bg-[#1d63ed] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
              {editingStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Buscar aluno por nome..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors font-bold text-sm shadow-sm">
            <Filter size={18} />
            Filtros
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-8 py-4 bg-[#1d63ed] text-white rounded-2xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-100 active:scale-95">
            <Plus size={20} />
            Novo Aluno
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Perfil do Aluno</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Turma / Série</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status BNCC</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg leading-tight">{student.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{student.age} anos</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700">Turma {student.classId.replace('c-', '')}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{student.grade} Ano</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(student)}
                      className="p-3 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-xl transition-all shadow-sm"
                      title="Editar Aluno"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm({ isOpen: true, id: student.id, name: student.name })}
                      className="p-3 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all shadow-sm"
                      title="Excluir Aluno"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <User size={40} />
             </div>
             <p className="text-slate-400 font-bold">Nenhum aluno encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
