import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex flex-1 justify-evenly items-center flex-row px-4 pt-10 xl:px-8 min-h-0">
            <App />
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
