// src/routes/chat.ts
import { Hono } from "hono";
import type { CustomEnv } from "../types";

const chat = new Hono<{ Bindings: CustomEnv }>();

chat.post("/", async (c) => {
  try {
    console.log("Received chat request."); // Log start of request

    const { prompt, context = "" } = await c.req.json<{
      prompt: string;
      context?: string;
    }>();
    console.log("Parsed request body:", { prompt, context }); // Log parsed data

    if (!prompt) {
      console.error("Prompt is missing.");
      return c.json({ error: "Prompt is required" }, 400);
    }

    const ai = c.env.AI;
    if (!ai) {
      console.error("AI environment binding is missing.");
      return c.json({ error: "AI environment is not available for chat" }, 500);
    }

    const messages = context.trim()
      ? [
          { role: "system", content: context },
          { role: "user", content: prompt },
        ]
      : [{ role: "user", content: prompt }];

    console.log("Messages prepared for AI:", messages); // Log messages before AI run

    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
      stream: true,
    });

    console.log("AI run successful, returning stream."); // Log success before streaming

    return new Response(response as ReadableStream, {
      headers: { "content-type": "text/event-stream" },
    });
  } catch (error: any) {
    // Use 'any' for error type in catch to safely access properties
    console.error("Error in AI model route:", error); // Log the actual error object
    if (error.stack) {
      console.error("Error stack:", error.stack); // Log stack trace for more details
    }
    return c.json(
      { error: "Failed to get AI response", details: error.message },
      500
    );
  }
});

export default chat;
