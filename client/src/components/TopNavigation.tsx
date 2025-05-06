import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export default function TopNavigation() {
  const { projectName, buildMod, runMod, saveMod } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="bg-background-panel border-b border-gray-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">CodeMate - Minecraft Mod Workshop</h1>
        <div className="bg-background-dark rounded px-3 py-1 text-sm">
          {projectName || "Project Name"}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm"
          onClick={runMod}
        >
          Run Mod
        </button>
        <button 
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm"
          onClick={buildMod}
        >
          Build Mod
        </button>
        <button 
          className="bg-background-dark hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
          onClick={saveMod}
        >
          Save
        </button>
        <button 
          className="bg-background-dark hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Settings
        </button>
        <button 
          className="bg-background-dark hover:bg-gray-700 text-white p-1 rounded"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </nav>
  );
}
