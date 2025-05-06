import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { StrictMode } from "react";
import { AppProvider } from "./hooks/useAppContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

// We need to wrap everything in StrictMode to help with debugging
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);
