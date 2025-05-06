import { useAppContext } from "@/context/AppContext";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsoleLogProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ConsoleLog({ isCollapsed, onToggleCollapse }: ConsoleLogProps) {
  const { consoleOutput } = useAppContext();
  
  return (
    <div className="h-full border-t border-gray-800 flex flex-col">
      <div className="p-2 text-text-secondary flex justify-between items-center border-b border-gray-800 bg-background-panel">
        <span className="text-sm font-medium">Console Log</span>
        <div className="flex space-x-2">
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onToggleCollapse}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 bg-background-dark p-2 overflow-y-auto font-mono text-sm">
          {consoleOutput.map((log, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center mt-1", 
                log.type === 'success' ? "text-success" : 
                log.type === 'error' ? "text-error" : 
                log.type === 'warning' ? "text-warning" : "text-text-primary"
              )}
            >
              <Check className="h-4 w-4 mr-2" />
              <span 
                className={cn(
                  log.type === 'error' && "cursor-pointer hover:underline"
                )}
                onClick={() => log.clickable && log.onClick && log.onClick()}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
