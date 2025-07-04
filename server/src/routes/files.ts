// src/routes/files.ts
import { Hono } from "hono";
import type { CustomEnv } from "../types"; // Import CustomEnv

// Create a new Hono instance specifically for file-related routes
const files = new Hono<{ Bindings: CustomEnv }>(); // Use Bindings for type safety with Hono app composition

// GET all files
files.get("/", async (c) => {
  const db = c.env.DB; // Access DB from env
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

// GET a single file by title
files.get("/:title", async (c) => {
  const db = c.env.DB; // Access DB from env
  const title = decodeURIComponent(c.req.param("title"));
  try {
    const result = await db
      .prepare(
        "SELECT id, title, content, created_at FROM files WHERE title = ?"
      )
      .bind(title)
      .first();
    if (!result) {
      return c.json({ error: "File not found" }, 404);
    }
    return c.json({ file: result });
  } catch (error) {
    console.error("D1 select error:", error);
    return c.json({ error: "Failed to fetch file by title" }, 500);
  }
});

// POST (Save/Update) a file
files.post("/", async (c) => {
  const { title, content } = await c.req.json<{
    title: string;
    content: string;
  }>();
  if (!title || !content) {
    return c.json({ error: "Title and content are required" }, 400);
  }

  const db = c.env.DB; // Access DB from env
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

// DELETE a file by title
files.delete("/:title", async (c) => {
  const db = c.env.DB; // Access DB from env
  const titleToDelete = decodeURIComponent(c.req.param("title"));

  try {
    const existingFile = await db
      .prepare("SELECT id FROM files WHERE title = ?")
      .bind(titleToDelete)
      .first();

    if (!existingFile) {
      return c.json({ error: "File not found" }, 404);
    }

    await db
      .prepare("DELETE FROM files WHERE title = ?")
      .bind(titleToDelete)
      .run();

    return c.json({
      success: true,
      message: `File '${titleToDelete}' deleted successfully.`,
    });
  } catch (error) {
    console.error("D1 delete error:", error);
    return c.json({ error: "Failed to delete file" }, 500);
  }
});

export default files;
