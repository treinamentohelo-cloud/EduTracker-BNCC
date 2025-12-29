
import { Student, ClassRoom, BNCCSkill, StudentEvaluation, ReinforcementGroup, TeacherInvite, UserRole, StudentStatus, SkillLevel } from '../types';
import { BNCC_SKILLS, MOCK_CLASSES, MOCK_STUDENTS } from '../constants';
import { supabase } from './supabase';

const DB_KEYS = {
  STUDENTS: 'edutracker_students',
  CLASSES: 'edutracker_classes',
  INVITES: 'edutracker_invites',
  REINFORCEMENTS: 'edutracker_reinforcements',
  EVALUATIONS: 'edutracker_evaluations',
  SKILLS: 'edutracker_skills',
  SCHOOL_NAME: 'edutracker_school_name',
  TEACHERS: 'edutracker_teachers'
};

export const db = {
  getSchoolName: (): string => {
    return localStorage.getItem(DB_KEYS.SCHOOL_NAME) || 'Escola Municipal Primavera';
  },
  saveSchoolName: async (name: string) => {
    localStorage.setItem(DB_KEYS.SCHOOL_NAME, name);
    await supabase.from('school_config').upsert({ id: 1, name }).select();
  },
  getStudents: (): Student[] => {
    const data = localStorage.getItem(DB_KEYS.STUDENTS);
    return data ? JSON.parse(data) : MOCK_STUDENTS;
  },
  saveStudent: async (student: Student) => {
    const students = db.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index > -1) students[index] = student;
    else students.push(student);
    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(students));
    
    await supabase.from('students').upsert({
      id: student.id,
      name: student.name,
      age: student.age,
      grade: student.grade,
      class_id: student.classId,
      status: student.status,
      evaluations: JSON.stringify(student.evaluations)
    });
  },
  deleteStudent: async (id: string) => {
    const students = db.getStudents().filter(s => s.id !== id);
    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(students));
    await supabase.from('students').delete().eq('id', id);
  },
  getClasses: (): ClassRoom[] => {
    const data = localStorage.getItem(DB_KEYS.CLASSES);
    return data ? JSON.parse(data) : MOCK_CLASSES;
  },
  saveClass: async (cls: ClassRoom) => {
    const classes = db.getClasses();
    const index = classes.findIndex(c => c.id === cls.id);
    if (index > -1) classes[index] = cls;
    else classes.push(cls);
    localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(classes));
    
    await supabase.from('classes').upsert({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift,
      teacher_id: cls.teacherId
    });
  },
  deleteClass: async (id: string) => {
    const classes = db.getClasses().filter(c => c.id !== id);
    localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(classes));
    await supabase.from('classes').delete().eq('id', id);
  },
  getSkills: (): BNCCSkill[] => {
    const data = localStorage.getItem(DB_KEYS.SKILLS);
    return data ? JSON.parse(data) : BNCC_SKILLS;
  },
  saveSkill: async (skill: BNCCSkill) => {
    const skills = db.getSkills();
    const index = skills.findIndex(s => s.id === skill.id);
    if (index > -1) skills[index] = skill;
    else skills.push(skill);
    localStorage.setItem(DB_KEYS.SKILLS, JSON.stringify(skills));
    
    await supabase.from('skills_bncc').upsert({
      id: skill.id,
      code: skill.code,
      name: skill.name,
      discipline: skill.discipline,
      description: skill.description,
      grade: skill.grade
    });
  },
  deleteSkill: async (id: string) => {
    const skills = db.getSkills().filter(s => s.id !== id);
    localStorage.setItem(DB_KEYS.SKILLS, JSON.stringify(skills));
    await supabase.from('skills_bncc').delete().eq('id', id);
  },
  getInvites: (): TeacherInvite[] => {
    const data = localStorage.getItem(DB_KEYS.INVITES);
    return data ? JSON.parse(data) : [
      { id: '1', email: 'contato@escola.com', role: UserRole.TEACHER, status: 'Aceito', inviteLink: '#' },
    ];
  },
  saveInvite: async (invite: TeacherInvite) => {
    const invites = db.getInvites();
    invites.unshift(invite);
    localStorage.setItem(DB_KEYS.INVITES, JSON.stringify(invites));
    try {
      await supabase.from('invites').insert({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        invite_link: invite.inviteLink
      });
    } catch (e) {
      console.error("Erro Supabase Invite:", e);
    }
  },
  deleteInvite: async (id: string) => {
    const invites = db.getInvites().filter(i => i.id !== id);
    localStorage.setItem(DB_KEYS.INVITES, JSON.stringify(invites));
    await supabase.from('invites').delete().eq('id', id);
  },
  getTeachers: (): any[] => {
    const data = localStorage.getItem(DB_KEYS.TEACHERS);
    return data ? JSON.parse(data) : [
      { id: 'prof-1', name: 'Marcos Oliveira', email: 'marcos.prof@escola.com', status: 'Ativo', classes: ['1º Ano A', '1º Ano B'] },
      { id: 'prof-2', name: 'Helena Souza', email: 'helena.prof@escola.com', status: 'Ativo', classes: ['2º Ano C'] }
    ];
  },
  getReinforcements: (): ReinforcementGroup[] => {
    const data = localStorage.getItem(DB_KEYS.REINFORCEMENTS);
    return data ? JSON.parse(data) : [];
  },
  saveReinforcement: async (group: ReinforcementGroup) => {
    const groups = db.getReinforcements();
    const index = groups.findIndex(g => g.id === group.id);
    if (index > -1) groups[index] = group;
    else groups.push(group);
    localStorage.setItem(DB_KEYS.REINFORCEMENTS, JSON.stringify(groups));
    await supabase.from('reinforcement_groups').upsert(group);
  },
  deleteReinforcement: async (id: string) => {
    const groups = db.getReinforcements().filter(g => g.id !== id);
    localStorage.setItem(DB_KEYS.REINFORCEMENTS, JSON.stringify(groups));
    await supabase.from('reinforcement_groups').delete().eq('id', id);
  },
  saveEvaluation: async (evalData: StudentEvaluation) => {
    const students = db.getStudents();
    const student = students.find(s => s.id === evalData.studentId);
    if (student) {
      if (!student.evaluations) student.evaluations = [];
      
      const existingIdx = student.evaluations.findIndex(e => e.skillId === evalData.skillId && e.bimester === evalData.bimester);
      if (existingIdx > -1) {
        student.evaluations[existingIdx] = evalData;
      } else {
        student.evaluations.push(evalData);
      }

      if (evalData.level === SkillLevel.NOT_ACHIEVED) {
        student.status = StudentStatus.NEEDS_REINFORCEMENT;
      } else if (evalData.level === SkillLevel.DEVELOPING) {
        student.status = StudentStatus.DEVELOPING;
      } else {
        student.status = StudentStatus.ADEQUATE;
      }
      
      db.saveStudent(student);
      
      await supabase.from('evaluations').upsert({
        id: evalData.id,
        student_id: evalData.studentId,
        skill_id: evalData.skillId,
        level: evalData.level,
        date: evalData.date,
        bimester: evalData.bimester,
        feedback: evalData.feedback,
        type: evalData.type,
        score: evalData.score,
        max_score: evalData.maxScore
      });
    }
  },
  updateStudentStatus: async (studentId: string, status: StudentStatus) => {
    const students = db.getStudents();
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.status = status;
      db.saveStudent(student);
    }
  },
  syncFromSupabase: async () => {
    try {
      const { data: students } = await supabase.from('students').select('*');
      if (students) localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(students));
      
      const { data: classes } = await supabase.from('classes').select('*');
      if (classes) localStorage.setItem(DB_KEYS.CLASSES, JSON.stringify(classes));
      
      const { data: skills } = await supabase.from('skills_bncc').select('*');
      if (skills) localStorage.setItem(DB_KEYS.SKILLS, JSON.stringify(skills));

      const { data: invites } = await supabase.from('invites').select('*');
      if (invites) {
         const mapped = invites.map(i => ({
            id: i.id,
            email: i.email,
            role: i.role,
            status: i.status,
            inviteLink: i.invite_link
         }));
         localStorage.setItem(DB_KEYS.INVITES, JSON.stringify(mapped));
      }
    } catch (e) {
      console.error("Erro ao sincronizar com Supabase:", e);
    }
  }
};
