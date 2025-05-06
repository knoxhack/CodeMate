import { useAppContext } from "@/hooks/useAppContext";
import { Check, ChevronDown, X, AlertTriangle, Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConsoleLogProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ConsoleLog({ isCollapsed, onToggleCollapse }: ConsoleLogProps) {
  const { consoleOutput, clearConsole } = useAppContext();
  const isMobile = useIsMobile();
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Filter logs based on selected type
  const filteredLogs = filterType 
    ? consoleOutput.filter(log => log.type === filterType)
    : consoleOutput;
  
  // Calculate counts for different log types
  const errorCount = consoleOutput.filter(log => log.type === 'error').length;
  const warningCount = consoleOutput.filter(log => log.type === 'warning').length;
  const infoCount = consoleOutput.filter(log => log.type === 'info').length;
  const successCount = consoleOutput.filter(log => log.type === 'success').length;
  
  return (
    <div className="h-full border-t border-gray-800 flex flex-col">
      <div className="p-2 text-text-secondary flex justify-between items-center border-b border-gray-800 bg-background-panel">
        <div className="flex items-center">
          <span className={cn("font-medium", isMobile ? "text-base" : "text-sm")}>Console Log</span>
          {!isCollapsed && (
            <div className="flex ml-4 space-x-1">
              <Button
                variant={filterType === 'error' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-6 px-2", 
                  filterType === 'error' ? "bg-red-900/30" : ""
                )}
                onClick={() => setFilterType(filterType === 'error' ? null : 'error')}
              >
                <span className="text-error mr-1">{errorCount}</span>
                <span className="text-xs">Errors</span>
              </Button>
              <Button
                variant={filterType === 'warning' ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-6 px-2", 
                  filterType === 'warning' ? "bg-yellow-900/30" : ""
                )}
                onClick={() => setFilterType(filterType === 'warning' ? null : 'warning')}
              >
                <span className="text-warning mr-1">{warningCount}</span>
                <span className="text-xs">Warnings</span>
              </Button>
              {!isMobile && (
                <Button
                  variant={filterType === 'success' ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-6 px-2", 
                    filterType === 'success' ? "bg-green-900/30" : ""
                  )}
                  onClick={() => setFilterType(filterType === 'success' ? null : 'success')}
                >
                  <span className="text-success mr-1">{successCount}</span>
                  <span className="text-xs">Success</span>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearConsole}
              title="Clear console"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            <ChevronDown className={cn("h-4 w-4", isCollapsed ? "rotate-180" : "")} />
          </Button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className={cn(
          "flex-1 bg-background-dark p-2 overflow-y-auto font-mono",
          isMobile ? "text-base" : "text-sm"
        )}>
          {filteredLogs.length === 0 ? (
            <div className="text-gray-400 italic flex items-center justify-center h-full">
              {filterType ? `No ${filterType} logs to display` : 'No logs to display'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-start mt-1 rounded p-1", 
                  log.type === 'success' ? "text-success hover:bg-green-900/10" : 
                  log.type === 'error' ? "text-error hover:bg-red-900/10" : 
                  log.type === 'warning' ? "text-warning hover:bg-yellow-900/10" : "text-text-primary hover:bg-gray-800/20"
                )}
              >
                <div className="flex-shrink-0 mt-1 mr-2">
                  {log.type === 'success' && <Check className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
                  {log.type === 'error' && <X className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
                  {log.type === 'warning' && <AlertTriangle className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
                  {log.type === 'info' && <Info className={isMobile ? "h-5 w-5" : "h-4 w-4"} />}
                </div>
                <div 
                  className={cn(
                    "flex-1",
                    log.clickable && "cursor-pointer hover:underline"
                  )}
                  onClick={() => log.clickable && log.onClick && log.onClick()}
                >
                  {log.message}
                  {log.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
