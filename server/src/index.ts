import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import type { CustomEnv } from "./types";

import filesRoutes from "./routes/files";
import chatRoutes from "./routes/chat";

const app = new Hono<CustomEnv>();

// This is the ONLY place CORS is handled.
// It automatically handles OPTIONS preflights and sets headers for all other methods.
app.use(
  cors({
    origin: (originString: string, c: Context<CustomEnv>) => {
      const envTyped = c.env as CustomEnv;
      return envTyped.FRONTEND;
      // there is some issue here with the ide not recognising the type of env as customenv. not sure why this works.
      //origin: (originString: string, c: Context<CustomEnv>) => c.env!.FRONTEND,
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
