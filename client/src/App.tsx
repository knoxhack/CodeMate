import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useTheme } from "./hooks/use-theme";
import { AppProvider } from "./context/AppContext";
import Home from "./pages/home";

function App() {
  const { theme } = useTheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={theme}>
          <Toaster />
          <AppProvider>
            <Home />
          </AppProvider>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
