import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { SkillLevel, StudentStatus, Bimester, StudentEvaluation, AssessmentType } from '../types';
import { 
  Save, 
  CheckCircle, 
  MessageSquare, 
  Users, 
  Info, 
  ChevronDown, 
  Trophy,
  Filter
} from 'lucide-react';

export interface AssessmentResult {
  level: SkillLevel;
  feedback: string;
  score: string;
}

export const AssessmentForm: React.FC = () => {
  const [allSkills, setAllSkills] = useState(db.getSkills());
  const [disciplines] = useState(db.getDisciplines());
  const [activeDiscipline, setActiveDiscipline] = useState<string>(disciplines[0] || 'Português');
  const [classes, setClasses] = useState(db.getClasses());
  const [selectedClassId, setSelectedClassId] = useState('c-1');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedBimester, setSelectedBimester] = useState<Bimester>(Bimester.B1);
  const [results, setResults] = useState<Record<string, AssessmentResult>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    const loadedSkills = db.getSkills();
    setAllSkills(loadedSkills);
    setClasses(db.getClasses());
  }, []);

  const filteredSkills = useMemo(() => {
    return allSkills.filter(s => s.discipline === activeDiscipline);
  }, [allSkills, activeDiscipline]);

  useEffect(() => {
    if (filteredSkills.length > 0) {
      setSelectedSkillId(filteredSkills[0].id);
    } else {
      setSelectedSkillId('');
    }
  }, [filteredSkills]);

  const students = useMemo(() => {
    return db.getStudents().filter(s => s.classId === selectedClassId);
  }, [selectedClassId]);

  const handleLevelSelect = (studentId: string, level: SkillLevel) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId],
        level, 
        feedback: prev[studentId]?.feedback || '',
        score: prev[studentId]?.score || ''
      }
    }));
  };

  const handleSave = () => {
    // Fix: Explicitly type the entries to ensure properties are accessible
    Object.entries(results).forEach(([studentId, data]: [string, AssessmentResult]) => {
      const evaluation: StudentEvaluation = {
        id: `ev-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        skillId: selectedSkillId,
        level: data.level,
        date: new Date().toISOString(),
        bimester: selectedBimester,
        feedback: data.feedback,
        type: AssessmentType.TEST,
        maxScore: 10,
        score: data.score ? parseFloat(data.score) : undefined
      };
      db.saveEvaluation(evaluation);
    });
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setResults({});
    setExpandedStudent(null);
  };

  const getLevelStyles = (level: SkillLevel, isSelected: boolean) => {
    if (!isSelected) return "bg-white border-slate-200 text-slate-400 hover:border-blue-400";
    switch (level) {
      case SkillLevel.EXCEEDED: return "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200";
      case SkillLevel.ACHIEVED: return "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200";
      case SkillLevel.DEVELOPING: return "bg-amber-50 border-amber-50 text-white shadow-lg shadow-amber-200";
      case SkillLevel.NOT_ACHIEVED: return "bg-rose-50 border-rose-50 text-white shadow-lg shadow-rose-200";
      default: return "bg-blue-600 border-blue-600 text-white";
    }
  };

  const currentSkill = allSkills.find(s => s.id === selectedSkillId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      {showSuccess && (
        <div className="fixed top-8 right-8 z-[300] bg-green-600 text-white px-10 py-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-right-10 shadow-2xl">
          <CheckCircle size={32} className="animate-bounce" />
          <span className="font-black text-xl">Lançamento Concluído!</span>
        </div>
      )}

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-10">
        <div className="flex flex-col xl:flex-row justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg"><Trophy size={28} /></div>
              Diário Pedagógico 2026
            </h3>
            <p className="text-slate-500 font-bold text-lg">Lance o desempenho dos alunos nos critérios da BNCC.</p>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            {Object.values(Bimester).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBimester(b)}
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${selectedBimester === b ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Turma Ativa</label>
            <div className="relative">
              <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full appearance-none p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-slate-700 focus:border-blue-300 transition-all text-lg cursor-pointer">
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} • {c.grade} Ano</option>)}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar Disciplina</label>
            <div className="relative">
              <select value={activeDiscipline} onChange={(e) => setActiveDiscipline(e.target.value)} className="w-full appearance-none p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-slate-700 focus:border-blue-300 transition-all text-lg cursor-pointer">
                {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Critério BNCC</label>
            <div className="relative">
              <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)} className="w-full appearance-none p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-black text-slate-700 focus:border-blue-300 transition-all text-lg cursor-pointer">
                {filteredSkills.length > 0 ? filteredSkills.map(skill => <option key={skill.id} value={skill.id}>{skill.code} • {skill.name}</option>) : <option disabled>Sem habilidades para esta matéria</option>}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={24} />
            </div>
          </div>
        </div>

        {currentSkill && (
          <div className="p-8 bg-blue-50/50 border-2 border-blue-100 rounded-3xl flex items-start gap-6 animate-in zoom-in-95">
            <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-xl border border-blue-100"><Info size={32} /></div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Descrição do Critério Selecionado:</p>
              <p className="text-xl font-black text-blue-900 mb-1">{currentSkill.code} • {currentSkill.name}</p>
              <p className="text-lg text-blue-700 font-medium italic">"{currentSkill.description}"</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {students.map((student) => (
            <div key={student.id} className="p-8 hover:bg-slate-50 transition-all group">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex items-center gap-6 min-w-[340px]">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl transition-all ${results[student.id] ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                    {student.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-2xl block mb-1 group-hover:text-blue-600 transition-colors">{student.name}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{student.grade} Ano • Turno: {student.classId === 'c-1' ? 'Matutino' : 'Vespertino'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
                  {Object.values(SkillLevel).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleLevelSelect(student.id, level)}
                      className={`px-6 py-4 rounded-2xl text-[10px] font-black transition-all border-2 uppercase tracking-widest flex-1 min-w-[120px] shadow-sm hover:shadow-md ${
                        getLevelStyles(level, results[student.id]?.level === level)
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                  <button 
                    className={`p-4 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${results[student.id]?.feedback ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-300 hover:text-blue-600'}`}
                    onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                  >
                    <MessageSquare size={24} />
                  </button>
                </div>
              </div>
              
              {expandedStudent === student.id && (
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 animate-in slide-in-from-top-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Parecer Pedagógico Individual</label>
                  <textarea 
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="Descreva as observações sobre o desenvolvimento deste aluno neste critério..."
                    value={results[student.id]?.feedback || ''}
                    onChange={(e) => setResults(prev => ({
                      ...prev,
                      [student.id]: { ...prev[student.id], level: prev[student.id]?.level || SkillLevel.NOT_ACHIEVED, feedback: e.target.value, score: prev[student.id]?.score || '' }
                    }))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-12 bg-slate-900 flex items-center justify-between gap-10">
          <div className="flex items-center gap-6 text-white">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center font-black text-2xl border border-white/20 shadow-inner">{Object.keys(results).length}</div>
            <p className="font-black text-xl">Lançamentos prontos para {selectedBimester} 2026</p>
          </div>
          <button onClick={handleSave} className="px-16 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-4 active:scale-95">
            <Save size={28} /> Confirmar Notas no Diário
          </button>
        </div>
      </div>
    </div>
  );
};