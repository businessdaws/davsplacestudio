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

export async function generateSocialMediaContent(topic: string) {
  const prompt = `Generate content for social media about: "${topic}"
  
  Please provide:
  1. A catchy Headline
  2. An engaging Caption (Indonesian)
  3. 5-10 trending Hashtags
  4. 2-3 Credible Sources/links relevant to the topic
  
  Return in JSON format.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["headline", "caption", "hashtags", "sources"]
        }
      }
    });
    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Gemini social media generator error:", error);
    throw error;
  }
}
