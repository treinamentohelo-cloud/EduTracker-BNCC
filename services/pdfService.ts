
import { jsPDF } from "jspdf";

export const exportToPDF = (title: string, data: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text("EduTracker BNCC - Relatório Pedagógico", 10, 20);
  
  doc.setFontSize(16);
  doc.text(title, 10, 35);
  
  doc.setFontSize(12);
  let y = 50;
  
  data.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const line = `${index + 1}. ${item.name || item.title} | ${item.status || item.desc || ''}`;
    doc.text(line, 10, y);
    y += 10;
  });
  
  doc.save(`${title.toLowerCase().replace(/\s/g, '_')}.pdf`);
};
