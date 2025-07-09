import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <main className="flex flex-1 justify-evenly items-center flex-row px-4 xl:px-8 min-h-screen">
          <App />
        </main>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
