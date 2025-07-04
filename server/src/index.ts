import { Hono } from "hono";
import { cors } from "hono/cors";
import type { CustomEnv } from "./types";

import filesRoutes from "./routes/files";
import chatRoutes from "./routes/chat";

const app = new Hono<CustomEnv>();

// This is the ONLY place CORS is handled.
// It automatically handles OPTIONS preflights and sets headers for all other methods.
app.use(
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include all methods you use
    allowHeaders: ["Content-Type"],
    maxAge: 600,
  })
);

app.get("/", (c) => {
  return c.text("Hello hono!");
});

// Your other routes are mounted here
app.route("/files", filesRoutes);
app.route("/aichat", chatRoutes);

export default app;
