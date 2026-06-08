import { Type } from "@google/genai";

export async function getChatResponse(prompt: string) {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context: "Chatbot interaction" }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Gagal menghubungi chatbot.");
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    throw error;
  }
}

export async function smartSearch(query: string, context: string) {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `Berdasarkan konteks data berikut:\n${context}\n\nJawablah pertanyaan/pencarian berikut: "${query}"\nBerikan hasil pencarian yang relevan, informatif, dan ramah dalam Bahasa Indonesia.`,
        context: "Smart Search Utility" 
      }),
    });

    if (!response.ok) return "Maaf, sistem pencarian AI kami sedang sibuk. Silakan coba lagi nanti.";
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini search error:", error);
    return "Maaf, sistem pencarian AI kami sedang sibuk. Silakan coba lagi nanti.";
  }
}

export async function analyzeBrief(brief: string) {
  // This would ideally have a dedicated endpoint if complex schema is needed
  // For now, let's keep it simple or use the generate endpoint
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `Analisis brief proyek berikut dan berikan scope, klarifikasi, saran, dan kompleksitas (low/medium/high) dalam format JSON:\n"${brief}"`,
        context: "Brief Analysis" 
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    try {
      // Try to parse if the server returned it as a string
      return JSON.parse(data.text);
    } catch {
      return { scope: data.text };
    }
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

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      let errorMessage = "Gagal memproses AI.";
      if (isJson) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        errorMessage = `Server Error (${response.status}): Silakan coba beberapa saat lagi.`;
      }
      throw new Error(errorMessage);
    }

    if (!isJson) {
      throw new Error("Format respon server tidak valid (Bukan JSON).");
    }

    return await response.json();
  } catch (error) {
    console.error("AI social media generator error:", error);
    throw error;
  }
}

export async function generateArticleContent(topic: string, style: string, provider: "gemini" | "nvidia-nemotron" = "gemini") {
  try {
    const response = await fetch("/api/ai/article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, style, provider }),
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      let errorMessage = "Gagal memproses AI.";
      if (isJson) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        errorMessage = `Server Error (${response.status}): Silakan coba beberapa saat lagi.`;
      }
      throw new Error(errorMessage);
    }

    if (!isJson) {
      throw new Error("Format respon server tidak valid (Bukan JSON).");
    }

    return await response.json();
  } catch (error) {
    console.error("AI article generator error:", error);
    throw error;
  }
}
