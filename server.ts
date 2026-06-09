import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
import dns from "dns";
import https from "https";

// Prefer IPv4 first to avoid native fetch failed failures in dual-stack networks (common in container runtimes)
if (dns && typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
    const { prompt, context, provider = "gemini" } = req.body;

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

// AI Visual Engine API
app.post("/api/ai/visual-engine", async (req, res) => {
  try {
    const { topic, provider = "gemini" } = req.body;
    
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Silakan masukkan konsep atau visual intent Anda." });
    }

    const systemPrompt = `You are the AI engine behind a premium web application feature called "Visual Engine".

Visual Engine is an advanced AI-powered cinematic prompt generation system for creators, filmmakers, AI artists, animators, storytellers, and content creators.

Your role is NOT just generating random prompts.

Your role is to:
- analyze user visual intent
- understand cinematic storytelling
- generate highly detailed image prompts
- generate separate cinematic motion prompts
- think like a film director, cinematographer, visual artist, and AI prompt engineer

========================================
FEATURE CONTEXT
========================================

Feature Name:
Visual Engine

Platform Context:
Visual Engine is part of a creative AI platform used by users to generate cinematic visuals and AI video concepts.

The feature helps users:
- create image prompts
- create motion prompts
- create cinematic scenes
- create AI filmmaking concepts
- create visual storytelling sequences

========================================
MAIN OBJECTIVE
========================================

For every user request, generate:

1. image_prompt
2. motion_prompt
3. negative_prompt
4. metadata

All outputs must feel:
- cinematic
- premium
- immersive
- visually intelligent
- professionally directed

========================================
OUTPUT FORMAT
========================================

Always return ONLY valid JSON.

Never explain.
Never add markdown.
Never add notes.
Never add introductions.

Use this exact structure:

{
  "title": "",
  "image_prompt": "",
  "motion_prompt": "",
  "negative_prompt": "",
  "metadata": {
    "genre": "",
    "style": "",
    "camera_shot": "",
    "camera_angle": "",
    "lens": "",
    "lighting": "",
    "mood": "",
    "environment": "",
    "motion_style": ""
  }
}

========================================
IMAGE PROMPT RULES
========================================

The image_prompt focuses ONLY on:
- character appearance
- clothing
- face details
- pose
- environment
- composition
- lighting
- cinematic framing
- lens detail
- visual atmosphere
- art direction

The image prompt must:
- feel cinematic
- be visually coherent
- include realistic filmmaking terminology
- include lighting detail
- include environmental storytelling
- include composition depth
- include camera language

DO NOT include:
- motion descriptions
- walking
- animation
- camera movement
- temporal behavior

========================================
MOTION PROMPT RULES
========================================

The motion_prompt focuses ONLY on:
- camera movement
- subject movement
- environmental movement
- motion physics
- cinematic pacing
- temporal continuity
- atmosphere movement

Motion prompts should include:
- camera motion
- breathing movement
- cloth simulation
- hair movement
- environmental particles
- cinematic pacing
- realistic motion physics

Motion prompt must:
- feel smooth
- feel cinematic
- avoid static visual descriptions
- avoid repetitive wording

========================================
NEGATIVE PROMPT RULES
========================================

Automatically generate intelligent negative prompts.

Always include:
- bad anatomy
- blurry
- distorted face
- extra limbs
- low quality
- deformed hands
- warped body
- oversaturated
- duplicate body parts

For motion prompts include:
- jitter motion
- unnatural movement
- broken physics
- unstable animation

========================================
CINEMATIC INTELLIGENCE
========================================

You understand:
- cinematography
- visual storytelling
- framing
- composition
- lens psychology
- emotional camera language
- atmospheric lighting
- cinematic pacing

Use professional filmmaking terminology:
- anamorphic lens
- volumetric fog
- rim lighting
- cinematic contrast
- shallow depth of field
- handheld micro-shake
- tracking shot
- dolly shot
- orbit camera

========================================
CAMERA SYSTEM
========================================

You understand:
- close up
- medium shot
- wide shot
- aerial shot
- over shoulder shot
- POV shot

You understand lenses:
- 24mm
- 35mm
- 50mm
- 85mm
- anamorphic
- telephoto
- fisheye

You understand movement:
- dolly in
- dolly out
- tracking shot
- orbit shot
- handheld
- crane shot
- cinematic push in

========================================
STYLE SYSTEM
========================================

You can intelligently generate:
- cyberpunk
- anime cinematic
- noir
- fantasy
- horror
- sci-fi
- dystopian
- surreal
- realistic
- documentary
- cinematic realism

You understand:
- color palette psychology
- mood design
- atmosphere design
- visual emotion

========================================
MOTION INTELLIGENCE
========================================

You understand:
- blinking
- subtle breathing
- cloth physics
- realistic inertia
- rain interaction
- smoke drifting
- particle movement
- cinematic pacing
- smooth motion continuity

========================================
PROMPT OPTIMIZATION
========================================

Prompts must:
- maximize cinematic quality
- remain AI-model friendly
- avoid conflicting instructions
- avoid redundancy
- prioritize visual clarity
- prioritize cinematic atmosphere

========================================
USER INPUT
========================================

"${topic}"`;

    let text = "";

    if (provider === "nvidia" || provider === "nvidia-nemotron") {
      const apiKey = (process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        console.warn("Visual Engine: NVIDIA_API_KEY is missing. Falling back to Gemini...");
      } else {
        try {
          const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://integrate.api.nvidia.com/v1",
          });

          const completion = await openai.chat.completions.create({
            model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
            messages: [
              {
                role: "system",
                content: `${systemPrompt}\nOutput strictly valid, minified raw JSON format without any markdown wrapper or explanation, matching specified JSON schema.`
              },
              {
                role: "user",
                content: topic
              }
            ],
            temperature: 0.6,
            max_tokens: 2048,
          });

          text = completion.choices[0].message.content || "";
          text = text.replace(/<thought>[\s\S]*?<\/thought>/g, "").trim();
        } catch (nvidiaError: any) {
          console.error("NVIDIA Visual Engine prompt failed, fallback to Gemini:", nvidiaError);
        }
      }
    }

    if (!text) {
      // Default / Fallback to Gemini
      const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
      if (!apiKey || apiKey === "" || apiKey.toLowerCase().includes("your_")) {
        return res.status(500).json({ error: "Gemini API Key is required. Please set GEMINI_API_KEY." });
      }

      const response = await generateContentWithFallback({ 
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      text = response.text || "";
    }

    text = text.replace(/```json\n?|\n?```/g, "").trim();

    let result;
    try {
      result = JSON.parse(text || "{}");
    } catch (parseError) {
      console.error("Failed to parse Visual Engine JSON:", text);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Sistem AI menghasilkan format JSON yang tidak valid.");
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error("Visual Engine AI Error:", error);
    res.status(500).json({ error: error.message || "Gagal memproses visual prompt." });
  }
});

// AI Generate Image API via NVIDIA Cloud NIM
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt gambar tidak boleh kosong." });
    }

    const nvidiaApiKey = (process.env.NVIDIA_API_KEY || "").trim();
    if (!nvidiaApiKey || nvidiaApiKey === "" || nvidiaApiKey.toLowerCase().includes("your_")) {
      return res.status(500).json({ 
        error: "Nvidia API Key belum dikonfigurasi. Silakan tambahkan variabel NVIDIA_API_KEY pada file .env atau panel Environment Settings." 
      });
    }

    // Determine dimensions based on Aspect Ratio
    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1344;
      height = 768;
    } else if (aspectRatio === "9:16") {
      width = 768;
      height = 1344;
    } else if (aspectRatio === "4:3") {
      width = 1152;
      height = 864;
    } else if (aspectRatio === "3:4") {
      width = 864;
      height = 1152;
    }

    console.log(`Sending image generation request to NVIDIA NIM with dimensions ${width}x${height}...`);

    const response = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${nvidiaApiKey}`
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        sampler: "K_DPM_2_ANCESTRAL",
        seed: 0,
        steps: 30,
        height: height,
        width: width
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {}
      const errMsg = parsedErr?.detail || parsedErr?.message || errText || "NVIDIA API Server returned an error.";
      throw new Error(`NVIDIA API Error: ${errMsg}`);
    }

    const data: any = await response.json();
    const base64Data = data.artifacts?.[0]?.base64 || data.images?.[0]?.base64;

    if (!base64Data) {
      console.error("Payload returned from NVIDIA NIM is missing base64 element:", JSON.stringify(data));
      throw new Error("Format respons NVIDIA NIM tidak sesuai (tidak mengembalikan base64 image).");
    }

    const imageUrl = `data:image/png;base64,${base64Data}`;
    res.json({ imageUrl });
  } catch (error: any) {
    console.error("NVIDIA Image Generation API Error:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan gambar melalui AI NVIDIA." });
  }
});

// AI Content Analyzer API
app.post("/api/ai/analyze-content", async (req, res) => {
  try {
    const { mode, fileData, mimeType, fileName, fileUrl } = req.body;

    if (mode === "file" && (!fileData || !mimeType)) {
      return res.status(400).json({ error: "Data file atau tipe MIME tidak valid untuk analisis." });
    }
    if (mode === "link" && (!fileUrl || !fileUrl.trim())) {
      return res.status(400).json({ error: "URL link tidak valid atau kosong." });
    }

    const systemPrompt = `You are "Content Analyzer PRO", a highly specialized multi-modal AI analyzer.
Your task is to analyze user-provided files (images, PDFs, videos) or link contents and generate a deep context analysis that can be fed into cinematic and general content generators.

Based on the contents provided, you MUST accurately determine the context and output a JSON response in the EXACT following structure:
{
  "summary": "Detailed executive summary of the content in beautiful Indonesian (maximum 2-3 sentences), summarizing the core story, value, and thematic focus.",
  "insights": [
    "Core takeaway/point 1 from the content (in Indonesian)",
    "Core takeaway/point 2 from the content (in Indonesian)",
    "Core takeaway/point 3 from the content (in Indonesian)",
    "Core takeaway/point 4 from the content (in Indonesian)"
  ],
  "cinematicSuggestions": [
    {
      "title": "Scene Idea Title 1 (in Indonesian)",
      "concept": "Detailed scenario concept inspired by the themes (in Indonesian, describing the action, character, and backdrop setup)"
    },
    {
      "title": "Scene Idea Title 2 (in Indonesian)",
      "concept": "Another alternate scenario concept inspired by the themes (in Indonesian)"
    }
  ],
  "creativePrompts": [
    {
      "format": "E.g., Cinematic tracking close-up shot",
      "prompt": "An exquisitely detailed cinematic image prompt written in English, full of camera direction, camera model, lens specifications, atmospheric lighting, and vivid descriptions matching this content"
    },
    {
      "format": "E.g., Moody vintage film style",
      "prompt": "Another alternate detailed image prompt written in English with distinct mood, style, color grading, and texture details"
    }
  ]
}

Ensure the output is valid JSON. Use double quotes for property names and string values. Escape double quotes inside text fields appropriately. Do not output anything outside of the JSON wrapper.`;

    let contentParts: any[] = [];

    if (mode === "link") {
      let detectedType = "text"; // "text" | "image" | "pdf" | "video" | "audio"
      let mimeTypeResult = "";
      let base64DataResult = "";
      let linkContent = "";

      const lowerUrl = fileUrl.toLowerCase();
      const isDirectImage = lowerUrl.endsWith(".png") || lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".webp") || lowerUrl.endsWith(".gif") || lowerUrl.includes("unsplash.com") || lowerUrl.includes("images.wikimedia.org");
      const isDirectPdf = lowerUrl.endsWith(".pdf");
      const isDirectAudio = lowerUrl.endsWith(".mp3") || lowerUrl.endsWith(".wav") || lowerUrl.endsWith(".ogg") || lowerUrl.endsWith(".m4a") || lowerUrl.endsWith(".aac") || lowerUrl.endsWith(".mp4a") || lowerUrl.includes("clyp.it") || lowerUrl.includes("soundcloud.com");
      const isYouTube = lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be");
      const isTikTok = lowerUrl.includes("tiktok.com");
      const isInstagram = lowerUrl.includes("instagram.com");

      try {
        console.log(`[Content Analyzer] Scraper fetching URL in auto-detect mode: ${fileUrl}`);
        const response = await globalThis.fetch(fileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/437.36'
          }
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          
          if (contentType.startsWith("image/") || isDirectImage) {
            detectedType = "image";
            mimeTypeResult = contentType.startsWith("image/") ? contentType.split(";")[0] : "image/jpeg";
            const arrayBuffer = await response.arrayBuffer();
            base64DataResult = Buffer.from(arrayBuffer).toString("base64");
            console.log(`[Content Analyzer] Link auto-detected as image. base64 size: ${base64DataResult.length}`);
          } else if (contentType.includes("pdf") || isDirectPdf) {
            detectedType = "pdf";
            mimeTypeResult = "application/pdf";
            const arrayBuffer = await response.arrayBuffer();
            base64DataResult = Buffer.from(arrayBuffer).toString("base64");
            console.log(`[Content Analyzer] Link auto-detected as PDF. base64 size: ${base64DataResult.length}`);
          } else if (contentType.startsWith("audio/") || isDirectAudio) {
            detectedType = "audio";
            mimeTypeResult = contentType.startsWith("audio/") ? contentType.split(";")[0] : "audio/mpeg";
            const arrayBuffer = await response.arrayBuffer();
            base64DataResult = Buffer.from(arrayBuffer).toString("base64");
            console.log(`[Content Analyzer] Link auto-detected as audio. base64 size: ${base64DataResult.length}`);
          } else {
            // Treat as text/HTML or typical video metadata
            const htmlText = await response.text();
            
            // Extract some metadata (like title, description) especially for video platforms (YouTube oEmbed or basic Meta tags)
            const titleMatch = htmlText.match(/<title>([\s\S]*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : "";
            
            // Stripping HTML tags simply
            const cleanText = htmlText
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            linkContent = cleanText.substring(0, 15000);
            
            if (isYouTube) {
              detectedType = "video";
              linkContent = `[YouTube Video Link Info]\nTitle: ${title}\nContext: User pasted a YouTube video. Raw parsed subtitle/metadata text from the site: ${linkContent.substring(0, 4000)}`;
            } else if (isTikTok) {
              detectedType = "video";
              linkContent = `[TikTok Video Link Info]\nTitle: ${title}\nContext: User pasted a TikTok video. Page meta desc: ${linkContent.substring(0, 4000)}`;
            } else if (isInstagram) {
              detectedType = "video";
              linkContent = `[Instagram Media Link Info]\nTitle: ${title}\nContext: User pasted an Instagram post/reel link. Page meta desc: ${linkContent.substring(0, 4000)}`;
            }
          }
        } else {
          linkContent = `Failed to scrape web page. Server response status: ${response.status}`;
          if (isDirectImage) detectedType = "image";
          if (isDirectPdf) detectedType = "pdf";
          if (isDirectAudio) detectedType = "audio";
          if (isYouTube || isTikTok || isInstagram) detectedType = "video";
        }
      } catch (err: any) {
        console.warn(`[Content Analyzer] Scraper warning for URL fetch:`, err.message || err);
        linkContent = `Scraping was blocked or failed. Please process based on the input URL context: ${fileUrl}`;
        
        if (isYouTube || isTikTok || isInstagram) {
          detectedType = "video";
        } else if (isDirectImage) {
          detectedType = "image";
        } else if (isDirectPdf) {
          detectedType = "pdf";
        } else if (isDirectAudio) {
          detectedType = "audio";
        }
      }

      // Format parts correctly to feed Gemini
      if (detectedType === "image" && base64DataResult) {
        contentParts.push({
          inlineData: {
            data: base64DataResult,
            mimeType: mimeTypeResult
          }
        });
        contentParts.push({
          text: `Analyze this image loaded from the URL link: ${fileUrl}.\nDetermine its visual objects, context, themes, artistic elements, and generate the required structured visual vision analysis JSON.`
        });
      } else if (detectedType === "pdf" && base64DataResult) {
        contentParts.push({
          inlineData: {
            data: base64DataResult,
            mimeType: "application/pdf"
          }
        });
        contentParts.push({
          text: `Analyze this PDF document loaded from the URL link: ${fileUrl}.\nReview its pages, key takeaways, and core structure, and output the required structured visual vision analysis JSON.`
        });
      } else if (detectedType === "audio" && base64DataResult) {
        contentParts.push({
          inlineData: {
            data: base64DataResult,
            mimeType: mimeTypeResult
          }
        });
        contentParts.push({
          text: `Analyze this audio recording/voice clip loaded from the URL link: ${fileUrl}.\nDetermine its speech content, voice tone, core messages, themes, and output the required structured visual vision analysis JSON.`
        });
      } else if (detectedType === "video") {
        contentParts.push({
          text: `Analyze this Video Link: ${fileUrl}\n\nMeta Information & Page Description:\n${linkContent || "(Context empty)"}\n\nThis is a video link (YouTube, TikTok, or Instagram). Please use Google Search grounding or your external knowledge, search for information regarding this video using its title/URL if needed, interpret the cinematic elements based on typical viral tags or topics, and output the required structured visual vision analysis JSON based on this video.`
        });
      } else {
        contentParts.push({
          text: `Analyze this webpage/article URL: ${fileUrl}\n\nWebpage Text Context:\n${linkContent || "(Context empty)"}\n\nPlease analyze the content of this webpage/article and generate the required structured visual vision analysis JSON.`
        });
      }
    } else {
      // It is a file
      const base64Clean = fileData.includes(";base64,")
        ? fileData.split(";base64,")[1]
        : fileData;
      
      contentParts.push({
        inlineData: {
          data: base64Clean,
          mimeType: mimeType
        }
      });

      contentParts.push({
        text: `Analyze this uploaded file: ${fileName || "document"}. Determine its contents, themes, and characters. Generate the structured visual vision analysis JSON based on this file.`
      });
    }

    console.log(`[Content Analyzer] Invoking Gemini model... mode: ${mode}`);
    const response = await generateContentWithFallback({
      contents: contentParts,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    console.log(`[Content Analyzer] Received Gemini response length: ${responseText.length}`);
    
    // Parse response
    const parsedData = robustJSONParse(responseText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Content Analyzer API Error:", error);
    res.status(500).json({ error: error.message || "Gagal menganalisis konten." });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Health monitor Slack/Telegram/Webhook notification route
app.post("/api/health/notify", async (req, res) => {
  try {
    const { telegramToken, telegramChatId, webhookUrl, message, diagnostics } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Pesan notifikasi diperlukan (parameter message)." });
    }

    const results: any = { telegram: null, webhook: null };

    // 1. Send warning/error details to Telegram if credentials provided
    if (telegramToken && telegramChatId) {
      const sanitizedToken = telegramToken.trim();
      const sanitizedChatId = telegramChatId.trim();
      
      if (sanitizedToken && sanitizedChatId) {
        try {
          console.log(`[Health Monitor] Sending real-time Telegram notification...`);
          const telegramUrl = `https://api.telegram.org/bot${sanitizedToken}/sendMessage`;
          const payload = JSON.stringify({
            chat_id: sanitizedChatId,
            text: message,
            parse_mode: "HTML"
          });

          const parsedUrl = new URL(telegramUrl);
          const response = await new Promise<any>((resolve, reject) => {
            const req = https.request({
              hostname: parsedUrl.hostname,
              path: parsedUrl.pathname,
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload)
              },
              timeout: 10000
            }, (res) => {
              let body = "";
              res.on("data", (chunk) => { body += chunk; });
              res.on("end", () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  try {
                    resolve(JSON.parse(body));
                  } catch (e) {
                    resolve({ ok: true, note: "Raw body parsed failure", raw: body });
                  }
                } else {
                  reject(new Error(`Telegram API returned status ${res.statusCode}: ${body}`));
                }
              });
            });

            req.on("error", (e) => reject(e));
            req.on("timeout", () => {
              req.destroy();
              reject(new Error("Telegram Request timed out"));
            });
            req.write(payload);
            req.end();
          });

          results.telegram = { success: true, response };
        } catch (err: any) {
          console.error("[Health Monitor] Telegram integration failed:", err);
          results.telegram = { success: false, error: err.message || err };
        }
      }
    }

    // 2. Dispatch to custom webhook if set
    if (webhookUrl && webhookUrl.trim()) {
      const targetUrl = webhookUrl.trim();
      try {
        console.log(`[Health Monitor] Dispatching message to Webhook: ${targetUrl}`);
        const payload = JSON.stringify({
          message,
          timestamp: Date.now(),
          diagnostics: diagnostics || [],
          source: "Pusat Diagnostik & Keamanan Admin"
        });

        const parsedUrl = new URL(targetUrl);
        const response = await new Promise<any>((resolve, reject) => {
          const req = https.request({
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
              "User-Agent": "Davs-Health-Monitor"
            },
            timeout: 10000
          }, (res) => {
            let body = "";
            res.on("data", (chunk) => { body += chunk; });
            res.on("end", () => {
              resolve({ statusCode: res.statusCode, body: body.substring(0, 500) });
            });
          });

          req.on("error", (e) => reject(e));
          req.on("timeout", () => {
            req.destroy();
            reject(new Error("Webhook request timed out"));
          });
          req.write(payload);
          req.end();
        });

        results.webhook = { success: true, response };
      } catch (err: any) {
        console.error("[Health Monitor] Webhook dispatch failed:", err);
        results.webhook = { success: false, error: err.message || err };
      }
    }

    res.json(results);
  } catch (error: any) {
    console.error("Health notify route error:", error);
    res.status(500).json({ error: error.message || "Gagal mengirimkan notifikasi" });
  }
});

// Helper to perform secure, high-compatibility Node.js HTTPS request bypassing undici/fetch constraints
function fetchHttpsJson(url: string, headers: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: headers,
        timeout: 10000
      };
      
      const req = https.get(options, (res) => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          res.resume(); // consume response data to free up memory
          return reject(new Error(`HTTP status ${res.statusCode}`));
        }
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error("Failed to parse response body as JSON."));
          }
        });
      });

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out."));
      });
    } catch (err) {
      reject(err);
    }
  });
}

// CoinGecko Market Multi-Asset Tracker API with secure proxy & fallback
app.get("/api/coingecko/markets", async (req, res) => {
  const customKey = (process.env.COINGECKO_API_KEY || "").trim();
  const apiKey = customKey || "CG-T8EEAujTTiZhENcZzFhExvt6";
  const ids = req.query.ids || "bitcoin,ethereum,binancecoin,solana,ripple,cardano";
  
  const headers = {
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "x-cg-demo-api-key": apiKey
  };

  try {
    const publicUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`;
    
    console.log(`[CoinGecko Proxy] Fetching market data via https-native module; key suffix: ...${apiKey.slice(-6)}`);
    let data;
    try {
      data = await fetchHttpsJson(publicUrl, headers);
    } catch (primaryErr: any) {
      console.warn(`[CoinGecko Proxy] Native primary request on api.coingecko.com failed (${primaryErr.message || primaryErr}), trying demo-api.coingecko.com fallback...`);
      const demoUrl = `https://demo-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`;
      data = await fetchHttpsJson(demoUrl, headers);
    }

    return res.json({ source: "coingecko-api", data });
  } catch (error: any) {
    console.warn("[CoinGecko Proxy] Failed to fetch live data, returning beautiful robust fallback offline values:", error.message || error);
    
    // We construct a high-quality fallback that mimics the real structure
    const fallbackCoins = [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 68420.50,
        market_cap: 1345672900210,
        market_cap_rank: 1,
        total_volume: 32410920102,
        high_24h: 69120.00,
        low_24h: 67200.00,
        price_change_percentage_24h: 1.82,
        sparkline_in_7d: {
          price: [67100, 67400, 67200, 67800, 68100, 68000, 68420]
        }
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 3512.20,
        market_cap: 421009872110,
        market_cap_rank: 2,
        total_volume: 18456120911,
        high_24h: 3580.00,
        low_24h: 3450.00,
        price_change_percentage_24h: -1.24,
        sparkline_in_7d: {
          price: [3560, 3540, 3580, 3550, 3510, 3530, 3512]
        }
      },
      {
        id: "binancecoin",
        symbol: "bnb",
        name: "BNB",
        image: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png",
        current_price: 598.40,
        market_cap: 89765210980,
        market_cap_rank: 4,
        total_volume: 1245091872,
        high_24h: 605.20,
        low_24h: 588.10,
        price_change_percentage_24h: 0.75,
        sparkline_in_7d: {
          price: [590, 592, 591, 595, 598, 594, 598.4]
        }
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        current_price: 172.85,
        market_cap: 78912345098,
        market_cap_rank: 5,
        total_volume: 3892019827,
        high_24h: 178.50,
        low_24h: 168.10,
        price_change_percentage_24h: 4.12,
        sparkline_in_7d: {
          price: [165, 168, 166, 171, 174, 170, 172.85]
        }
      },
      {
        id: "ripple",
        symbol: "xrp",
        name: "Ripple",
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-bg.png",
        current_price: 0.542,
        market_cap: 30123456789,
        market_cap_rank: 7,
        total_volume: 987654321,
        high_24h: 0.551,
        low_24h: 0.534,
        price_change_percentage_24h: -0.32,
        sparkline_in_7d: {
          price: [0.545, 0.541, 0.548, 0.543, 0.539, 0.540, 0.542]
        }
      },
      {
        id: "cardano",
        symbol: "ada",
        name: "Cardano",
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        current_price: 0.468,
        market_cap: 16876543210,
        market_cap_rank: 10,
        total_volume: 345678901,
        high_24h: 0.478,
        low_24h: 0.459,
        price_change_percentage_24h: 1.15,
        sparkline_in_7d: {
          price: [0.460, 0.462, 0.465, 0.459, 0.466, 0.467, 0.468]
        }
      }
    ];

    return res.json({ source: "fallback-cache", data: fallbackCoins });
  }
});

// Global Express Error Handler to prevent HTML error pages in JSON API routes
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Global Error Handler] Caught exception:", err);
  if (res.headersSent) {
    return next(err);
  }
  
  if (req.path.startsWith("/api/")) {
    return res.status(err.status || 500).json({
      error: err.message || "An unexpected server-side error occurred."
    });
  }
  
  next(err);
});

// Unmatched API Route Handler to prevent HTML fallbacks
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.path}`
  });
});

// Setup Vite or static serving
async function setupServer() {
  // If running in a Serverless environment like Vercel, skip static serving and dev setup.
  // Vercel routes static files natively at the Edge layer using vercel.json rewrites.
  if (process.env.VERCEL === "1") {
    return;
  }

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
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: `API route not found: ${req.path}` });
      }
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

