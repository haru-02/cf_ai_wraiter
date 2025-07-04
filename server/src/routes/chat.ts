// src/routes/chat.ts
import { Hono } from "hono";
import type { CustomEnv } from "../types"; // Import CustomEnv

// Create a new Hono instance specifically for chat-related routes
const chat = new Hono<{ Bindings: CustomEnv }>();

chat.post("/", async (c) => {
  try {
    const { prompt, context = "" } = await c.req.json<{
      prompt: string;
      context?: string;
    }>();
    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const ai = c.env.AI; // Access AI from env
    if (!ai) {
      // Optional: A more robust check for AI availability in the route
      return c.json({ error: "AI environment is not available for chat" }, 500);
    }

    const messages = context.trim()
      ? [
          { role: "system", content: context },
          { role: "user", content: prompt },
        ]
      : [{ role: "user", content: prompt }];

    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
    });

    return c.json(response);
  } catch (error) {
    console.error("Error running AI model:", error);
    return c.json({ error: "Failed to get AI response" }, 500);
  }
});

export default chat;
