
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getPedagogicalInsights(
  discipline: string,
  grade: string,
  stats: any
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Como assistente pedagógico especialista em BNCC para o Ensino Fundamental I, analise os seguintes dados da disciplina de ${discipline} para o ${grade} ano:
      
      Total de Alunos: ${stats.total}
      Atingiram Habilidades: ${stats.achieved}
      Em Desenvolvimento: ${stats.developing}
      Não Atingiram: ${stats.failed}
      
      Forneça 3 sugestões práticas de atividades pedagógicas de intervenção para os alunos com dificuldade, focando nas competências da BNCC. Responda em Português do Brasil com um tom profissional e encorajador.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Não foi possível gerar insights pedagógicos no momento.";
  }
}
