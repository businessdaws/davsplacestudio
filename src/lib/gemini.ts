import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-3-flash-preview";

export async function getChatResponse(prompt: string) {
  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt
    });
    return result.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw error;
  }
}

export async function smartSearch(query: string, context: string) {
  const prompt = `Kamu adalah asisten pencarian cerdas untuk Davsplace Studio, sebuah platform jasa digital kreatif.
  Berdasarkan konteks data berikut:
  ${context}
  
  Jawablah pertanyaan/pencarian berikut: "${query}"
  Berikan hasil pencarian yang relevan, informatif, dan ramah dalam Bahasa Indonesia. 
  Jika tidak ditemukan, berikan saran layanan yang mungkin mereka butuhkan.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt
    });
    return result.text;
  } catch (error) {
    console.error("Gemini search error:", error);
    return "Maaf, sistem pencarian AI kami sedang sibuk. Silakan coba lagi nanti.";
  }
}

export async function analyzeBrief(brief: string) {
  const prompt = `Analisis brief proyek berikut untuk Davsplace Studio:
  "${brief}"
  
  Berikan output dalam JSON format.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scope: { type: Type.STRING },
            clarifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedComplexity: { type: Type.STRING, enum: ["low", "medium", "high"] }
          },
          required: ["scope", "clarifications", "suggestions", "estimatedComplexity"]
        }
      }
    });
    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Gemini brief analysis error:", error);
    return null;
  }
}

export async function generateSocialMediaContent(topic: string, provider: "gemini" | "nvidia-nemotron" = "gemini") {
  try {
    const response = await fetch("/api/ai/social-media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, provider }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal memproses AI.");
    }

    return await response.json();
  } catch (error) {
    console.error("AI social media generator error:", error);
    throw error;
  }
}
