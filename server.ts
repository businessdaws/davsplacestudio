import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;
let cachedApiKey: string = "";

function getGeminiClient() {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Gemini API Key is required. Please set GEMINI_API_KEY or VITE_GEMINI_API_KEY in Vercel settings.");
  }
  
  if (!aiInstance || cachedApiKey !== apiKey) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    cachedApiKey = apiKey;
  }
  return aiInstance;
}

// Helper function to call Gemini API with model fallback of stable models to prevent 503 high demand errors
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-3-flash-preview"
  ];

  const ai = getGeminiClient();

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini SDK] Trying model: ${modelName}`);
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      return response;
    } catch (err: any) {
      console.warn(`[Gemini SDK] Model ${modelName} failed or returned error:`, err.message || err);
      lastError = err;

      const errMsg = (err.message || "").toLowerCase();
      const status = err.status || (err.error && err.error.code);
      
      // If it's a transient server issue, try the next model
      if (
        status === 503 || 
        status === 429 || 
        errMsg.includes("503") || 
        errMsg.includes("demand") || 
        errMsg.includes("temporary") || 
        errMsg.includes("unavailable") || 
        errMsg.includes("rate limit") ||
        errMsg.includes("resource exhausted")
      ) {
        console.log(`[Gemini SDK] Transient error encountered on ${modelName}. Attempting fallback...`);
        continue;
      }

      // If it's a key authorization issue, throw immediately
      if (status === 401 || status === 403 || errMsg.includes("api key") || errMsg.includes("key not valid")) {
        throw err;
      }
    }
  }
  throw lastError;
}

// Robust JSON parse helper with sanitization & bracket matching support
function robustJSONParse(text: string): any {
  if (!text) return {};
  
  let cleaned = text.trim();
  
  // 1. Remove thought blocks if any
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/g, "").trim();
  
  // 2. Strip markdown wrappers
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/```$/, "");
  cleaned = cleaned.trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("[JSON Parse] Direct parse failed, attempting robust cleaning and bracket matching...");
  }

  // 3. Bracket-matching parsing to extract single valid JSON object
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let lastMatchingBraceIndex = -1;

    for (let i = firstBrace; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastMatchingBraceIndex = i;
            break;
          }
        }
      }
    }

    if (lastMatchingBraceIndex !== -1) {
      const candidate = cleaned.slice(firstBrace, lastMatchingBraceIndex + 1);
      try {
        return JSON.parse(candidate);
      } catch (parseErr: any) {
        console.warn("[JSON Parse] Bracket matched slice failed, cleaning whitespace/unescaped characters in strings...", parseErr.message);
        
        // Escape control characters inside string fields specifically (like actual newlines in blocks)
        try {
          const sanitized = candidate.replace(/[\u0000-\u001F]+/g, (match) => {
            if (match.includes('\n')) return '\\n';
            if (match.includes('\r')) return '\\r';
            if (match.includes('\t')) return '\\t';
            return '';
          });
          return JSON.parse(sanitized);
        } catch (sanitizeErr) {
          console.warn("[JSON Parse] Sanitization extraction failed, falling back to basic checks.");
        }
      }
    }
  }

  // 4. Greedy match fallback
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const candidate = cleaned.slice(startIdx, endIdx + 1);
    try {
      return JSON.parse(candidate);
    } catch (greedyErr: any) {
      try {
        const sanitized = candidate.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match.includes('\n')) return '\\n';
          if (match.includes('\r')) return '\\r';
          if (match.includes('\t')) return '\\t';
          return '';
        });
        return JSON.parse(sanitized);
      } catch (finalErr) {
        // Continue to throw below
      }
    }
  }

  throw new Error("Invalid JSON format from AI response.");
}

// AI Content Assistant API
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, context, provider = "nvidia-nemotron" } = req.body;

    if (provider === "nvidia-nemotron") {
      const apiKey = (process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        console.warn("AI Generation: NVIDIA_API_KEY is missing or invalid. Falling back to Gemini...");
      } else {
        try {
          const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://integrate.api.nvidia.com/v1",
          });

          const modelName = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

          const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
              {
                role: "system",
                content: `You are an AI Content Assistant for Davsplace Studio. Context: ${context}`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.6,
            top_p: 0.95,
            max_tokens: 4096,
          });

          let text = completion.choices[0].message.content || "";
          
          // Clean thinking/markdown if any
          text = text.replace(/<thought>[\s\S]*?<\/thought>/g, "").trim();
          return res.json({ text });
        } catch (nvidiaError: any) {
          console.error("NVIDIA API failed inside generate, falling back to Gemini:", nvidiaError);
        }
      }
    }

    // Default to Gemini (or fallback if NVIDIA failed)
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
      console.error("AI Generation Error: GEMINI_API_KEY is missing or invalid.");
      return res.status(500).json({ 
        error: "Gemini API Key is required. Please set GEMINI_API_KEY in your environment variables." 
      });
    }

    const isEnglishTask = (context || "").toLowerCase().includes("english") || (prompt || "").toLowerCase().includes("english");
    const response = await generateContentWithFallback({
      contents: `You are an AI Content Assistant for Davsplace Studio. 
      Context: ${context}
      Task: ${prompt}
      ${isEnglishTask ? "Generate the content in professional English as requested." : "Generate professional, creative, and engaging content in Indonesian."}`,
    });
    
    const text = response.text || "";

    res.json({ text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Insight API
app.post("/api/ai/insight", async (req, res) => {
  try {
    const { data } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    
    if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
      console.error("AI Insight Error: GEMINI_API_KEY is missing or invalid.");
      return res.status(500).json({ 
        error: "Gemini API Key is required. Please set GEMINI_API_KEY in your environment variables." 
      });
    }

    const response = await generateContentWithFallback({
      contents: `Based on this dashboard data: ${JSON.stringify(data)}, 
      generate a 2-sentence professional insight or suggestion for the admin. 
      Focus on business growth or engagement. Keep it in Indonesian.
      Don't use markdown formatting, just plain text.`,
    });
    
    const text = response.text || "";

    res.json({ text });
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    res.status(500).json({ 
      error: error.message || "An unexpected error occurred with the AI service." 
    });
  }
});

// AI Social Media Generator API
app.post("/api/ai/social-media", async (req, res) => {
  try {
    const { topic, provider = "gemini" } = req.body;
    let result;

    if (provider === "nvidia-nemotron") {
      const apiKey = (process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        console.error("Social Media AI Error: NVIDIA_API_KEY is missing or invalid.");
        return res.status(500).json({ 
          error: "NVIDIA API Key is required. Please set NVIDIA_API_KEY in your environment variables." 
        });
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });

      const modelName = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

      const completionParams: any = {
        model: modelName,
        messages: [
          {
            role: "system",
            content: "You are a social media expert. Return ONLY a valid JSON object with: headline (string), caption (Indonesian string), hashtags (array of strings), sources (array of strings), image_prompt (detailed English string for AI image generation like Midjourney or DALL-E).",
          },
          {
            role: "user",
            content: `Generate social media content for topic: "${topic}"`,
          },
        ],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 4096,
        reasoning_budget: 16384,
      };

      const completion = await openai.chat.completions.create(completionParams);
      let content = completion.choices[0].message.content || "{}";
      
      console.log("NVIDIA raw output preview:", content.substring(0, 100));

      // Clean markdown or thinking blocks if present
      content = content.replace(/<thought>[\s\S]*?<\/thought>/g, ""); 
      content = content.replace(/```json\n?|\n?```/g, "").trim();
      
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse NVIDIA JSON:", content);
        // Try to find JSON in the string if it's wrapped in other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI returned invalid JSON format.");
        }
      }
    } else {
      const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        console.error("Social Media AI Error: GEMINI_API_KEY is missing or invalid.");
        return res.status(500).json({ 
          error: "Gemini API Key is required. Please set GEMINI_API_KEY in your environment variables." 
        });
      }

      const prompt = `Generate content for social media about: "${topic}"
      Please provide:
      1. A catchy Headline
      2. An engaging Caption (Indonesian)
      3. 5-10 trending Hashtags
      4. 2-3 Credible Sources/links relevant to the topic
      
      Return ONLY valid JSON format.
      JSON schema: { 
        "headline": string, 
        "caption": string, 
        "hashtags": string[], 
        "sources": string[],
        "image_prompt": string
      }`;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      let text = response.text || "";
      
      console.log("Gemini raw output preview:", text.substring(0, 100));

      // Clean markdown if present
      text = text.replace(/```json\n?|\n?```/g, "").trim();
      
      try {
        result = JSON.parse(text || "{}");
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON:", text);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI returned invalid JSON format.");
        }
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error("Social Media AI Error:", error);
    
    // Handle known API errors
    if (error.status === 401 || (error.message && error.message.includes("API key not valid"))) {
      return res.status(401).json({ 
        error: "API Key tidak valid. Jika Anda menggunakan Vercel, pastikan Anda telah menambahkan GEMINI_API_KEY di environment variables Vercel Project Settings." 
      });
    }
    
    res.status(500).json({ error: error.message || "Gagal memproses AI." });
  }
});

// AI Article Generator API
app.post("/api/ai/article", async (req, res) => {
  try {
    const { topic, style = "professional", provider = "gemini" } = req.body;
    let result;

    if (provider === "nvidia-nemotron") {
      const apiKey = (process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        return res.status(500).json({ error: "NVIDIA API Key is required. Please set NVIDIA_API_KEY." });
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });

      const modelName = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

      const completionParams: any = {
        model: modelName,
        messages: [
          {
            role: "system",
            content: `You are a professional content writer. Write a detailed article based on the topic provided. 
            Output MUST be a valid JSON object. 
            JSON Schema: { 
              "title_options": string[] (exactly 3), 
              "content": string (detailed article), 
              "hashtags": string[], 
              "sources": string[],
              "image_prompt": string (detailed English string for AI image generation)
            }
            Use ${style} writing style in Indonesian.`,
          },
          {
            role: "user",
            content: `Write an article about: "${topic}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      };

      const completion = await openai.chat.completions.create(completionParams);
      let content = completion.choices[0].message.content || "{}";
      
      console.log("NVIDIA Article raw output preview:", content.substring(0, 100));

      content = content.replace(/<thought>[\s\S]*?<\/thought>/g, ""); 
      content = content.replace(/```json\n?|\n?```/g, "").trim();
      
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse NVIDIA Article JSON:", content);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI NVIDIA returned invalid JSON format.");
        }
      }
    } else {
      const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        return res.status(500).json({ error: "Gemini API Key is required. Please set GEMINI_API_KEY." });
      }

      const prompt = `Write a comprehensive article about: "${topic}" using ${style} writing style in Indonesian.
      Return the result in this JSON format:
      { 
        "title_options": ["Judul 1", "Judul 2", "Judul 3"], 
        "content": "Isi artikel lengkap minimal 400 kata...", 
        "hashtags": ["tag1", "tag2"], 
        "sources": ["link1", "link2"],
        "image_prompt": "A detailed English prompt for AI image generation..."
      }`;

      const response = await generateContentWithFallback({ 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let text = response.text || "";
      
      console.log("Gemini Article raw output preview:", text.substring(0, 100));

      text = text.replace(/```json\n?|\n?```/g, "").trim();
      
      try {
        result = JSON.parse(text || "{}");
      } catch (parseError) {
        console.error("Failed to parse Gemini Article JSON:", text);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI Gemini returned invalid JSON format.");
        }
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error("Article AI Error:", error);
    
    if (error.status === 401 || (error.message && error.message.includes("API key not valid"))) {
      return res.status(401).json({ 
        error: "API Key tidak valid. Pastikan API Key Anda sudah benar di environment variables." 
      });
    }
    
    res.status(500).json({ error: error.message || "Gagal memproses AI." });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start listening if NOT in a serverless environment like Vercel
  // Vercel handles the listening part
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

setupServer();

export default app;

