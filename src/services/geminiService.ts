import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GeminiError';
  }
}

async function handleGeminiCall<T>(call: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await call();
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    // Normalize error object for detection
    const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
    const errorMsg = (error.message || (error.error && error.error.message) || "").toLowerCase();
    const errorStatus = error.status || 
                        error.code || 
                        (error.error && error.error.code) || 
                        (error.error && error.error.status);

    const isQuotaError = errorStatus === 429 || 
                         errorStatus === "RESOURCE_EXHAUSTED" ||
                         errorStr.toLowerCase().includes("429") || 
                         errorStr.toLowerCase().includes("quota") ||
                         errorStr.toLowerCase().includes("resource_exhausted") ||
                         errorStr.toLowerCase().includes("rate_limit") ||
                         errorStr.toLowerCase().includes("exhausted") ||
                         errorMsg.includes("429") || 
                         errorMsg.includes("quota") ||
                         errorMsg.includes("limit") ||
                         errorMsg.includes("exhausted") ||
                         errorMsg.includes("resource_exhausted");

    if (isQuotaError && retries > 0) {
      const jitter = Math.random() * 1000;
      const nextDelay = delay + jitter;
      console.log(`Davsplace AI: Quota hit, retrying in ${Math.round(nextDelay)}ms... Attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, nextDelay));
      return handleGeminiCall(call, retries - 1, delay * 2);
    }
    
    if (isQuotaError) {
      throw new GeminiError("Maaf, Kuota AI Davsplace (Google Gemini) saat ini sedang penuh. Hal ini umum terjadi pada jam sibuk di akun gratis (Spark Plan). Silakan tunggu 1-2 menit lalu coba lagi, atau gunakan akun Pro untuk prioritas akses tanpa batas.", 429);
    }
    
    const finalMsg = error.message || (error.error && error.error.message) || "Terjadi gangguan teknis pada server AI. Silakan coba lagi dalam beberapa saat.";
    throw new GeminiError(finalMsg);
  }
}

export const generateSocialMediaContent = async (topic: string, platform: string, tone: string = 'Santai', goal: string = 'Engagement') => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bertindaklah sebagai Ahli Strategi Media Sosial dan Copywriter Profesional kelas atas. Tugas utamamu adalah merancang paket konten yang persuasif, viral, dan memiliki tingkat interaksi (engagement) tinggi.
      
      PERINGATAN PENTING: Kamu WAJIB memberikan respons HANYA dalam bentuk format JSON murni yang valid. Jangan pernah menambahkan teks pembuka, penutup, atau blok markdown (seperti \`\`\`json). Langsung mulai dengan tanda { dan akhiri dengan }.

      Tugas Anda adalah membuat paket konten media sosial lengkap untuk platform ${platform} berdasarkan topik: "${topic}".
      
      Gunakan Tone Bahasa: ${tone}
      Tujuan Utama: ${goal}
      
      ANDA HARUS MEMBERIKAN SEMUA ELEMEN BERIKUT DALAM SATU RESPONS JSON MURNI:
      1. headline: Kalimat pertama (hook) yang langsung memancing rasa penasaran audiens.
      2. caption: Isi detail konten yang mengalir, persuasif, dan menggunakan formula copywriting (seperti AIDA/PAS) yang disesuaikan dengan ${platform}.
      3. hashtags: Daftar hashtag relevan dan trending (minimal 5).
      4. imagePrompt: Instruksi detail untuk generator gambar AI (seperti Midjourney). Fokuskan pada nuansa visual bergaya dark minimalist, moody, atau street aesthetic yang elegan dan mendukung topik tersebut.
      5. sources: Sebutkan 1 atau 2 referensi data atau sumber inspirasi jika ada.

      Format JSON yang DIWAJIBKAN:
      {
        "headline": "...",
        "caption": "...",
        "hashtags": ["#tag1", "#tag2", "..."],
        "imagePrompt": "...",
        "sources": ["..."]
      }

      Gunakan Bahasa Indonesia yang natural, menarik, dan tidak kaku.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["headline", "caption", "hashtags", "imagePrompt", "sources"]
        }
      }
    });

    return JSON.parse(response.text);
  });
};

export const generateHook = async (topic: string) => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buat 5 hook viral untuk media sosial tentang: ${topic}. 
      Sertakan pemicu psikologis (keingintahuan, FOMO, otoritas, dll.).
      Kembalikan sebagai array JSON berisi string. Gunakan Bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const analyzeContent = async (content: string, type: 'text' | 'link' | 'image' | 'doc') => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analisis konten ${type} ini dan berikan ringkasan yang dapat diubah menjadi konten media sosial.
      Konten untuk dianalisis: ${content}
      Output JSON dengan:
      - summary: ringkasan komprehensif (Bahasa Indonesia).
      - keyPoints: array berisi 5 poin utama.
      - socialAngles: array berisi 3 ide sudut pandang untuk postingan.
      Gunakan Bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            socialAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "keyPoints", "socialAngles"]
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const generateNicheContent = async (vision: string, mission: string) => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berdasarkan visi: "${vision}" dan misi: "${mission}", tentukan niche konten viral dan 3 pilar konten.
      Kembalikan JSON dengan:
      - nicheName: nama niche yang menarik.
      - targetAudience: siapa target audiensnya.
      - pillars: array berisi 3 objek { title, description }.
      - viralStrategy: satu kalimat tentang cara menjadi viral.
      Gunakan Bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nicheName: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            pillars: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              } 
            },
            viralStrategy: { type: Type.STRING },
          }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const generateEcommerceContent = async (topic: string, category: 'script' | 'copy' | 'hook') => {
  return handleGeminiCall(async () => {
    const formulas: Record<string, string> = {
      script: "Formula: Hook yang memicu rasa ingin tahu + Edukasi/Masalah + CTA Keranjang Kuning",
      copy: "Formula AIDA (Attention, Interest, Desire, Action) atau PAS (Problem, Agitation, Solution)",
      hook: "Formula Psycho-Hook: Curiosiity, FOMO, atau Scarcity"
    };

    const typeDesc: Record<string, string> = {
      script: "Skrip Video Pendek (TikTok/Reels) fokus pada produk",
      copy: "Copywriting Produk untuk Etalase/Marketplace",
      hook: "Ide Hook Khusus Keranjang Kuning"
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Bertindaklah sebagai Ahli Copywriting E-commerce & Retail. 
      Buat konten ${typeDesc[category]} untuk produk: "${topic}".
      ${formulas[category]}.
      
      Output harus dalam format JSON murni.
      Struktur JSON yang DIWAJIBKAN:
      {
        "hook": "Hook video atau Headline produk yang sangat persuasif",
        "body": "Isi skrip atau deskripsi produk menggunakan teknik psikologi penjualan",
        "cta": "Call to Action yang mendesak (fokus konversi)"
      }

      Gunakan Bahasa Indonesia yang natural, kekinian, dan 'jualan banget' tanpa terlihat murahan.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["hook", "body", "cta"]
        }
      }
    });

    return JSON.parse(response.text);
  });
};

export const generateThreads = async (topic: string) => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Buat rangkaian thread Twitter/Threads berkualitas tinggi tentang: ${topic}. 
      Setiap tweet harus unik, menarik, dan mengalir secara logis.
      Kembalikan array JSON berisi string (maks 10 tweet). Gunakan Bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const getWeeklyTrends = async () => {
  return handleGeminiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Daftar 5 topik tren untuk konten media sosial minggu ini. 
      Kembalikan array JSON berisi objek { topic, reason, category }. Gunakan Bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              reason: { type: Type.STRING },
              category: { type: Type.STRING },
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

