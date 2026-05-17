import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// AI Content Assistant API
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_")) {
      console.error("AI Generation Error: GEMINI_API_KEY is missing or invalid.");
      return res.status(500).json({ 
        error: "Gemini API Key is required. Please set it in the Settings menu (GEMINI_API_KEY)." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `You are an AI Content Assistant for Davsplace Studio. 
    Context: ${context}
    Task: ${prompt}
    Generate professional, creative, and engaging content in Indonesian.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

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
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_")) {
      console.error("AI Insight Error: GEMINI_API_KEY is missing or invalid.");
      return res.status(500).json({ 
        error: "Gemini API Key is required. Please set it in the Settings menu (GEMINI_API_KEY)." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on this dashboard data: ${JSON.stringify(data)}, 
    generate a 2-sentence professional insight or suggestion for the admin. 
    Focus on business growth or engagement. Keep it in Indonesian.
    Don't use markdown formatting, just plain text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_")) {
        console.error("Social Media AI Error: NVIDIA_API_KEY is missing or invalid.");
        return res.status(500).json({ 
          error: "NVIDIA API Key is required. Please set it in the Settings menu (NVIDIA_API_KEY)." 
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
            content: "You are a social media expert. Return ONLY a valid JSON object with: headline (string), caption (Indonesian string), hashtags (array of strings), sources (array of strings).",
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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_")) {
        console.error("Social Media AI Error: GEMINI_API_KEY is missing or invalid.");
        return res.status(500).json({ 
          error: "Gemini API Key is required. Please set it in the Settings menu (GEMINI_API_KEY)." 
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        "sources": string[] 
      }`;

      const genResult = await model.generateContent(prompt);
      const response = await genResult.response;
      let text = response.text();
      
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
    if (error.status === 401) {
      return res.status(401).json({ 
        error: "API Key tidak valid (401). Pastikan NVIDIA_API_KEY atau GEMINI_API_KEY sudah benar di menu Settings." 
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

