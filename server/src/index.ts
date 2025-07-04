import { Hono } from "hono";
import type { Env } from "hono";

declare class Ai {
  run(model: string, options: any): Promise<any>;
}

declare class D1Database {
  prepare(query: string): {
    bind(...values: any[]): {
      run(): Promise<any>;
      all(): Promise<any>;
      first(): Promise<any>;
      raw(): Promise<any>;
    };
  };
}

interface CustomEnv extends Env {
  AI: Ai;
  DB: D1Database;
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

app.get("/files", async (c) => {
  const env = c.env as CustomEnv;
  if (!env || !env.DB) {
    return c.json({ error: "DB environment is not available" }, 500);
  }
  const db = env.DB;
  try {
    const result = await db
      .prepare(
        "SELECT id, title, created_at FROM files ORDER BY created_at DESC"
      )
      .bind()
      .all();
    return c.json({ files: result.results });
  } catch (error) {
    console.error("D1 select error:", error);
    return c.json({ error: "Failed to fetch files" }, 500);
  }
});

app.get("/file/:title", async (c) => {
  const env = c.env as CustomEnv;
  if (!env || !env.DB) {
    return c.json({ error: "DB environment is not available" }, 500);
  }
  const db = env.DB;
  // Decode the title from the URL parameter
  const title = decodeURIComponent(c.req.param("title"));
  try {
    const result = await db
      .prepare(
        "SELECT id, title, content, created_at FROM files WHERE title = ?"
      )
      .bind(title)
      .first(); // Use .first() to get a single row
    if (!result) {
      return c.json({ error: "File not found" }, 404);
    }
    return c.json({ file: result });
  } catch (error) {
    console.error("D1 select error:", error);
    return c.json({ error: "Failed to fetch file by title" }, 500);
  }
});

app.post("/aichat", async (c) => {
  try {
    const { prompt, context = "" } = await c.req.json<{
      prompt: string;
      context?: string;
    }>();
    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const env = c.env as CustomEnv;
    if (!env || !env.AI) {
      return c.json({ error: "AI environment is not available" }, 500);
    }

    // Only include context if it's not empty
    const messages = context.trim()
      ? [
          { role: "system", content: context },
          { role: "user", content: prompt },
        ]
      : [{ role: "user", content: prompt }];

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
    });

    // Hono's c.json() automatically sets the Content-Type to application/json
    return c.json(response);
  } catch (error) {
    console.error("Error running AI model:", error);
    return c.json({ error: "Failed to get AI response" }, 500);
  }
});

app.post("/save", async (c) => {
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>();
  if (!title || !content) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  const env = c.env as CustomEnv;
  if (!env || !env.DB) {
    return c.json({ error: "DB environment is not available" }, 500);
  }

  const db = env.DB;
  try {
    await db
      .prepare(
        `INSERT INTO files (title, content) VALUES (?, ?)
       ON CONFLICT(title) DO UPDATE SET content=excluded.content`
      )
      .bind(title, content)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("D1 insert error:", error);
    return c.json({ error: "Failed to save file" }, 500);
  }
});

app.options("/files", (c) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.text("", 200);
});

app.options("/file/:title", (c) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.text("", 200);
});

app.options("/aichat", (c) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.text("");
});

app.options("/save", (c) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.text("", 200);
});

export default app;
