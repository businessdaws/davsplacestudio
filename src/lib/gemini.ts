import { GoogleGenerativeAI } from "@google/generative-ai";

// @ts-ignore
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function smartSearch(query: string, context: string) {
  const prompt = `Kamu adalah asisten pencarian cerdas untuk Davsplace Studio, sebuah platform jasa digital kreatif.
  Berdasarkan konteks data berikut:
  ${context}
  
  Jawablah pertanyaan/pencarian berikut: "${query}"
  Berikan hasil pencarian yang relevan, informatif, dan ramah dalam Bahasa Indonesia. 
  Jika tidak ditemukan, berikan saran layanan yang mungkin mereka butuhkan.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini search error:", error);
    return "Maaf, sistem pencarian AI kami sedang sibuk. Silakan coba lagi nanti.";
  }
}

export async function analyzeBrief(brief: string) {
  const prompt = `Analisis brief proyek berikut untuk Davsplace Studio:
  "${brief}"
  
  Berikan output dalam JSON format:
  {
    "scope": "ringkasan pekerjaan",
    "clarifications": ["pertanyaan tambahan untuk klien"],
    "suggestions": ["saran kreatif awal"],
    "estimatedComplexity": "low|medium|high"
  }`;

  try {
    const result = await geminiModel.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini brief analysis error:", error);
    return null;
  }
}
