import { useState, useEffect } from "react";
import TopNavigation from "@/components/TopNavigation";
import FileTree from "@/components/FileTree";
import CodeEditor from "@/components/CodeEditor";
import ClaudeAssistant from "@/components/ClaudeAssistant";
import ConsoleLog from "@/components/ConsoleLog";
import ResizablePanel from "@/components/ResizablePanel";
import { useAppContext } from "@/hooks/useAppContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sidebar, FileText, Terminal, MessagesSquare, Menu } from "lucide-react";

export default function Home() {
  const [fileTreeWidth, setFileTreeWidth] = useState(250);
  const [claudePanelWidth, setClaudePanelWidth] = useState(300);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("editor");
  
  const isMobile = useIsMobile();
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Reset mobile layout when switching from desktop to mobile view
  useEffect(() => {
    if (isMobile) {
      // Set default mobile view
      setActiveTab("editor");
    }
  }, [isMobile]);

  // Desktop layout
  if (!isMobile) {
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
  
  // Mobile layout
  return (
    <div className="flex flex-col h-screen bg-background-dark text-text-primary">
      <TopNavigation 
        isMobile={true} 
        onMenuClick={toggleSidebar} 
      />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Mobile sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-background-dark border-r border-gray-800 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-medium">CodeMate</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          <FileTree />
        </div>
      </div>
      
      {/* Mobile tab navigation */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 h-12 bg-background-panel">
            <TabsTrigger value="editor" className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center justify-center">
              <MessagesSquare className="h-4 w-4 mr-2" />
              Claude
            </TabsTrigger>
            <TabsTrigger value="console" className="flex items-center justify-center">
              <Terminal className="h-4 w-4 mr-2" />
              Console
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 overflow-hidden p-0 border-none">
            <CodeEditor />
          </TabsContent>
          
          <TabsContent value="assistant" className="flex-1 overflow-hidden p-0 border-none">
            <ClaudeAssistant />
          </TabsContent>
          
          <TabsContent value="console" className="flex-1 overflow-hidden p-0 border-none">
            <ConsoleLog 
              isCollapsed={false}
              onToggleCollapse={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
