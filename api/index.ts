import { IncomingMessage, ServerResponse } from "http";
import app from "../server.ts";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Express app behaves as a standard request listener on Vercel
    return app(req, res);
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Vercel Serverless Function Execution Error",
      message: error.message || String(error),
      stack: error.stack || ""
    }));
  }
}
