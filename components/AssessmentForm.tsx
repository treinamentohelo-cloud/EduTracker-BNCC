
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
  Filter,
  Star,
  UserCheck
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
  const [maxScore, setMaxScore] = useState<string>('10.0');
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

  const handleScoreChange = (studentId: string, score: string) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId],
        level: prev[studentId]?.level || SkillLevel.NOT_ACHIEVED,
        feedback: prev[studentId]?.feedback || '',
        score
      }
    }));
  };

  const handleSave = () => {
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
        maxScore: parseFloat(maxScore) || 10,
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
      case SkillLevel.EXCEEDED: return "bg-purple-600 border-purple-600 text-white shadow-sm";
      case SkillLevel.ACHIEVED: return "bg-emerald-600 border-emerald-600 text-white shadow-sm";
      case SkillLevel.DEVELOPING: return "bg-amber-500 border-amber-500 text-white shadow-sm";
      case SkillLevel.NOT_ACHIEVED: return "bg-rose-500 border-rose-500 text-white shadow-sm";
      default: return "bg-blue-600 border-blue-600 text-white";
    }
  };

  const currentSkill = allSkills.find(s => s.id === selectedSkillId);

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[300] bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 animate-in slide-in-from-right-10 shadow-lg">
          <CheckCircle size={16} />
          <span className="font-bold text-xs">Avaliações Gravadas!</span>
        </div>
      )}

      {/* Painel de Configuração Compacto */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Trophy size={18} className="text-amber-500" /> Lançamento de Notas
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Base Nacional Comum Curricular</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200">
            {Object.values(Bimester).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBimester(b)}
                className={`px-2 py-1 rounded text-[9px] font-black transition-all ${selectedBimester === b ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
              >
                {b.split('º')[0]}ºB
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Turma</label>
            <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-[11px] h-9">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Matéria</label>
            <select value={activeDiscipline} onChange={(e) => setActiveDiscipline(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-[11px] h-9">
              {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Habilidade</label>
            <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-[11px] h-9">
              {filteredSkills.length > 0 ? filteredSkills.map(skill => <option key={skill.id} value={skill.id}>{skill.code}</option>) : <option disabled>Nenhuma</option>}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5 flex items-center gap-1">
              <Star size={9} className="text-amber-500" /> Nota Máxima
            </label>
            <input 
              type="number" 
              step="0.5"
              className="w-full p-2 bg-amber-50/50 border border-amber-200 rounded-lg outline-none font-black text-amber-700 text-[11px] h-9"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="10.0"
            />
          </div>
        </div>

        {currentSkill && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <div className="p-1.5 bg-white rounded-md text-blue-600 shadow-sm"><Info size={14} /></div>
            <div>
              <p className="text-[9px] font-black text-blue-900 uppercase tracking-tight">{currentSkill.code} • {currentSkill.name}</p>
              <p className="text-[10px] text-blue-700 italic leading-tight mt-0.5">{currentSkill.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Alunos Densificada */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {students.map((student) => (
            <div key={student.id} className="p-3 hover:bg-slate-50/50 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-[180px]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${results[student.id]?.level ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-300'}`}>
                    {student.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block leading-tight">{student.name}</span>
                    <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Base: {student.status}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
                  {/* Campo de Nota Individual */}
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 mr-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Nota:</span>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-10 p-1 bg-white border border-slate-200 rounded-md outline-none font-black text-center text-[10px]"
                      value={results[student.id]?.score || ''}
                      onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      placeholder="0"
                    />
                    <span className="text-[8px] font-bold text-slate-300">/ {maxScore}</span>
                  </div>

                  {/* Seletores de Nível BNCC Compactos */}
                  <div className="flex gap-1">
                    {Object.values(SkillLevel).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleLevelSelect(student.id, level)}
                        className={`px-2 py-1.5 rounded-lg text-[8px] font-black transition-all border uppercase tracking-tight flex-1 min-w-[70px] ${
                          getLevelStyles(level, results[student.id]?.level === level)
                        }`}
                      >
                        {level.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <button 
                    className={`p-1.5 rounded-lg border transition-all ${results[student.id]?.feedback ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-300'}`}
                    onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
              
              {expandedStudent === student.id && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Parecer Pedagógico</label>
                  <textarea 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none text-xs h-16 resize-none"
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

        <div className="p-4 bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <p className="text-white font-black text-[10px] uppercase tracking-widest">{Object.keys(results).length} alunos avaliados</p>
          </div>
          <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-black text-[11px] shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest">
            <Save size={14} /> Finalizar Lançamento
          </button>
        </div>
      </div>
    </div>
  );
};
