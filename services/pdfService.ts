
import { jsPDF } from "jspdf";
import { Student, StudentEvaluation, BNCCSkill } from "../types";
import { db } from "./db";

export const exportToPDF = (title: string, data: any[]) => {
  const doc = new jsPDF();
  const schoolName = db.getSchoolName();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(schoolName, 10, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Acompanhamento Pedagógico BNCC", 10, 28);
  doc.line(10, 32, 200, 32);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 10, 45);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let y = 60;
  
  data.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const line = `${index + 1}. ${item.name || item.title || 'Registro'} | ${item.status || item.desc || item.level || ''}`;
    doc.text(line, 10, y);
    y += 10;
  });
  
  doc.save(`${title.toLowerCase().replace(/\s/g, '_')}.pdf`);
};

export const exportStudentDossier = (student: Student, evaluations: StudentEvaluation[], skills: BNCCSkill[]) => {
  const doc = new jsPDF();
  const schoolName = db.getSchoolName();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho Oficial
  doc.setFillColor(29, 99, 237);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(schoolName.toUpperCase(), 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("RELATÓRIO INDIVIDUAL DE DESEMPENHO PEDAGÓGICO - BNCC", 15, 30);

  // Informações do Aluno
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO ESTUDANTE", 15, 55);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 58, 70, 58);

  doc.setFontSize(11);
  doc.text(`Nome: ${student.name}`, 15, 68);
  doc.text(`Série: ${student.grade} Ano`, 15, 75);
  doc.text(`Idade: ${student.age} anos`, 110, 68);
  doc.text(`Status Atual: ${student.status}`, 110, 75);

  // Tabela de Habilidades
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("AVALIAÇÕES POR HABILIDADE", 15, 95);
  doc.line(15, 98, 90, 98);

  let y = 110;
  doc.setFontSize(10);
  
  // Header da Tabela
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
  doc.text("CÓDIGO", 17, y);
  doc.text("HABILIDADE", 45, y);
  doc.text("BIMESTRE", 120, y);
  doc.text("DESEMPENHO", 155, y);
  doc.text("NOTA", 185, y);

  y += 10;
  doc.setFont("helvetica", "normal");

  evaluations.forEach((ev) => {
    const skill = skills.find(s => s.id === ev.skillId);
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(skill?.code || "---", 17, y);
    doc.setFont("helvetica", "normal");
    
    // Nome da habilidade com truncamento se for muito longo
    const skillName = skill?.name || "Habilidade não encontrada";
    doc.text(skillName.substring(0, 35), 45, y);
    
    doc.text(ev.bimester, 120, y);
    doc.text(ev.level, 155, y);
    doc.text(ev.score !== undefined ? ev.score.toString() : "N/A", 185, y);
    
    doc.setDrawColor(240, 240, 240);
    doc.line(15, y + 2, pageWidth - 15, y + 2);
    y += 10;

    if (ev.feedback) {
       doc.setFontSize(8);
       doc.setTextColor(100, 100, 100);
       doc.text(`Parecer: ${ev.feedback.substring(0, 100)}${ev.feedback.length > 100 ? '...' : ''}`, 45, y - 4);
       doc.setFontSize(10);
       doc.setTextColor(40, 40, 40);
       y += 5;
    }
  });

  // Rodapé com data e assinatura
  const bottomY = 275;
  doc.setFontSize(9);
  doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, 15, bottomY);
  doc.line(pageWidth - 85, bottomY - 5, pageWidth - 15, bottomY - 5);
  doc.text("Assinatura da Coordenação Pedagógica", pageWidth - 80, bottomY);

  doc.save(`Relatorio_${student.name.replace(/\s/g, '_')}.pdf`);
};
