import { Hono } from "hono";
import type { Env } from "hono";

declare class Ai {
  run(model: string, options: any): Promise<any>;
}

interface CustomEnv extends Env {
  AI: Ai;
}

const app = new Hono<CustomEnv>();

// CORS middleware
app.use("*", async (c, next) => {
  await next();
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
});

app.get("/", (c) => {
  return c.text("Hello hono!");
});

app.post("/aichat", async (c) => {
  try {
    const { prompt } = await c.req.json<{ prompt: string }>();
    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const env = c.env as CustomEnv;
    if (!env || !env.AI) {
      return c.json({ error: "AI environment is not available" }, 500);
    }

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      prompt,
    });

    // Hono's c.json() automatically sets the Content-Type to application/json
    return c.json(response);
  } catch (error) {
    console.error("Error running AI model:", error);
    return c.json({ error: "Failed to get AI response" }, 500);
  }
});

app.options("/aichat", (c) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.text("");
});

export default app;
