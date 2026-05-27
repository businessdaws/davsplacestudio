import { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Import the pre-compiled production bundle instead of live compiling server.ts on Vercel
    const appModule = await import("../dist/server.cjs");
    const app = appModule.default || appModule;
    
    // Express app behaves as a standard request listener on Vercel
    return app(req, res);
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Vercel Serverless Function Init Error",
      message: error.message || String(error),
      stack: error.stack || ""
    }));
  }
}
