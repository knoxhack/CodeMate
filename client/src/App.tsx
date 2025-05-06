import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "./hooks/use-theme";
import Home from "./pages/home";

function App() {
  const { theme } = useTheme();
  
  return (
    <div className={theme}>
      <Toaster />
      <Home />
    </div>
  );
}

export default App;
