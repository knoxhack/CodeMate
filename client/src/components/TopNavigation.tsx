import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Menu, Play, HardDrive, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavigationProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function TopNavigation({ isMobile, onMenuClick }: TopNavigationProps) {
  const { projectName, buildMod, runMod, saveMod } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  
  // Mobile view
  if (isMobile) {
    return (
      <nav className="bg-background-panel border-b border-gray-800 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">CodeMate</h1>
        </div>
        
        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HardDrive className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={runMod}>
                <Play className="h-4 w-4 mr-2" />
                Run Mod
              </DropdownMenuItem>
              <DropdownMenuItem onClick={buildMod}>
                <HardDrive className="h-4 w-4 mr-2" />
                Build Mod
              </DropdownMenuItem>
              <DropdownMenuItem onClick={saveMod}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>
    );
  }
  
  // Desktop view
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
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm flex items-center"
          onClick={runMod}
        >
          <Play className="h-4 w-4 mr-1" />
          Run Mod
        </button>
        <button 
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm flex items-center"
          onClick={buildMod}
        >
          <HardDrive className="h-4 w-4 mr-1" />
          Build Mod
        </button>
        <button 
          className="bg-background-dark hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center"
          onClick={saveMod}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </button>
        <button 
          className="bg-background-dark hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center"
        >
          <Settings className="h-4 w-4 mr-1" />
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
