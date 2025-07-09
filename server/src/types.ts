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

export interface CustomEnv extends Env {
  AI: Ai;
  DB: D1Database;
  FRONTEND: string; // The URL of the frontend application
}
