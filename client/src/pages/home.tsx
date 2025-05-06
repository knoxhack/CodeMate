import { useState } from "react";
import TopNavigation from "@/components/TopNavigation";
import FileTree from "@/components/FileTree";
import CodeEditor from "@/components/CodeEditor";
import ClaudeAssistant from "@/components/ClaudeAssistant";
import ConsoleLog from "@/components/ConsoleLog";
import ResizablePanel from "@/components/ResizablePanel";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [claudePanelWidth, setClaudePanelWidth] = useState(300);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  
  const { selectedFile } = useAppContext();
  
  const handleFileTreeResize = (newWidth: number) => {
    setFileTreeWidth(Math.max(200, newWidth));
  };
  
  const handleClaudePanelResize = (newWidth: number) => {
    setClaudePanelWidth(Math.max(250, newWidth));
  };
  
  const handleConsoleResize = (newHeight: number) => {
    setConsoleHeight(Math.max(100, newHeight));
  };
  
  const toggleConsole = () => {
    setConsoleCollapsed(!consoleCollapsed);
  };
  
  return (
    <div className="flex flex-col h-screen bg-background-dark text-text-primary">
      <TopNavigation />
      
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanel 
          width={fileTreeWidth}
          onResize={handleFileTreeResize}
          direction="right"
        >
          <FileTree />
        </ResizablePanel>
        
        <div className="flex-1 relative overflow-hidden">
          <CodeEditor />
        </div>
        
        <ResizablePanel 
          width={claudePanelWidth}
          onResize={handleClaudePanelResize}
          direction="left"
        >
          <ClaudeAssistant />
        </ResizablePanel>
      </div>
      
      <ResizablePanel 
        height={consoleCollapsed ? 36 : consoleHeight}
        onResize={handleConsoleResize}
        direction="up"
        isVertical
      >
        <ConsoleLog 
          isCollapsed={consoleCollapsed}
          onToggleCollapse={toggleConsole}
        />
      </ResizablePanel>
    </div>
  );
}
