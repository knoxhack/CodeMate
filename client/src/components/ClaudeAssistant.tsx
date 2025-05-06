import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { 
  SendHorizonal, 
  RotateCcw, 
  Wrench, 
  ArrowRightCircle, 
  X, 
  FilePlus, 
  Upload, 
  Loader2, 
  FilePlus2,
  ArrowLeft, 
  Maximize, 
  Minimize
} from "lucide-react";
import { ChatMessage } from "@/types/project";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ClaudeAssistant() {
  const [message, setMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  const { 
    chatMessages, 
    addUserMessage, 
    isClaudeThinking,
    continueDevelopment,
    fixError,
    resetChat,
    selectedFile
  } = useAppContext();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isClaudeThinking) {
      addUserMessage(message);
      setMessage("");
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setUploadedFiles(prev => [...prev, { name: file.name, content }]);
      };
      reader.readAsText(file);
    });
  };
  
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSendFiles = () => {
    if (uploadedFiles.length === 0) return;
    
    const filesContent = uploadedFiles.map(file => 
      `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``
    ).join('\n\n');
    
    const message = `I'm sharing these files with you to help with my mod development:\n\n${filesContent}`;
    addUserMessage(message);
    setUploadedFiles([]);
    setShowFileUpload(false);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  // Animation frames for the thinking animation
  const thinkingFrames = [
    "Analyzing code structure...",
    "Reviewing Minecraft patterns...",
    "Checking 1.21.5 compatibility...",
    "Considering NeoForge guidelines...",
    "Planning implementation details...",
    "Optimizing approach..."
  ];
  
  const [thinkingFrame, setThinkingFrame] = useState(0);
  
  useEffect(() => {
    if (isClaudeThinking) {
      const interval = setInterval(() => {
        setThinkingFrame(prev => (prev + 1) % thinkingFrames.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isClaudeThinking]);
  
  return (
    <div 
      className={cn(
        "bg-background-panel flex flex-col relative transition-all duration-300 ease-in-out",
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-full"
      )}
    >
      <div className="p-2 text-text-secondary flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          {isFullscreen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 h-8 w-8" 
              onClick={toggleFullscreen}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <span className={isMobile ? "text-base font-medium" : "text-sm font-medium"}>
            Claude 3.7 Assistant
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isClaudeThinking && (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-400" />
              <span className="text-amber-400 text-xs sm:text-sm max-w-[150px] sm:max-w-[250px] truncate">
                {thinkingFrames[thinkingFrame]}
              </span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="mb-4 text-center">
              <p className="text-lg mb-2">Welcome to CodeMate!</p>
              <p className="text-sm">Ask Claude for help with your Minecraft mod development</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-600 h-auto py-2"
                onClick={() => addUserMessage("Help me create a custom Minecraft sword")}
              >
                Create custom sword
              </Button>
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-600 h-auto py-2"
                onClick={() => addUserMessage("What should I do next in my mod development?")}
              >
                Continue development
              </Button>
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-600 h-auto py-2"
                onClick={() => setShowFileUpload(true)}
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Share files with Claude
              </Button>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((msg, index) => (
              <div key={index} className="flex flex-col">
                <div className={cn(
                  "font-medium mb-1",
                  msg.role === 'user' ? "text-blue-400" : "text-amber-400"
                )}>
                  {msg.role === 'user' ? 'You' : 'Claude'}
                </div>
                <div className={cn(
                  "p-3 rounded",
                  msg.role === 'user' ? "bg-gray-800/50" : "bg-background-dark"
                )}>
                  {msg.content.split('\n').map((line, i) => (
                    <div key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {isClaudeThinking && (
              <div className="flex items-center space-x-2 p-3 bg-background-dark rounded animate-pulse">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}} />
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* File Upload Panel */}
      {showFileUpload && (
        <div className="border-t border-gray-800 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Share Files with Claude</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setShowFileUpload(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center border border-dashed border-gray-600 rounded p-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                <h4 className="text-xs font-medium">Selected Files:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-background-dark p-2 rounded text-xs">
                      <span className="truncate">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="default"
                  className="w-full mt-2"
                  onClick={handleSendFiles}
                >
                  Share Files with Claude
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Input and Controls */}
      <div className="border-t border-gray-800 p-3 space-y-3">
        <form onSubmit={handleSubmit} className="flex">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full bg-background-dark border border-gray-700 rounded-l px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ask Claude for help..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    <FilePlus2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share files with Claude</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <button 
            type="submit" 
            className={cn(
              "bg-primary px-3 py-2 rounded-r text-sm text-white flex items-center",
              isClaudeThinking ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
            )}
            disabled={isClaudeThinking || !message.trim()}
          >
            {isMobile ? <SendHorizonal className="h-4 w-4" /> : "Send"}
          </button>
        </form>
        
        <div className={`flex ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
          <Button
            variant="default"
            className={`bg-primary text-white flex items-center justify-center ${isMobile ? 'p-2' : 'px-3 py-1.5'} rounded text-sm flex-1`}
            onClick={continueDevelopment}
            disabled={isClaudeThinking}
          >
            {isMobile ? <ArrowRightCircle className="h-4 w-4" /> : "Continue Dev"}
          </Button>
          <Button
            variant="default"
            className={`bg-primary text-white flex items-center justify-center ${isMobile ? 'p-2' : 'px-3 py-1.5'} rounded text-sm flex-1`}
            onClick={fixError}
            disabled={isClaudeThinking}
          >
            {isMobile ? <Wrench className="h-4 w-4" /> : "Fix Error"}
          </Button>
          <Button
            variant="secondary"
            className={`bg-background-dark text-white flex items-center justify-center ${isMobile ? 'p-2' : 'px-3 py-1.5'} rounded text-sm`}
            onClick={resetChat}
          >
            {isMobile ? <RotateCcw className="h-4 w-4" /> : "Reset"}
          </Button>
        </div>
      </div>
    </div>
  );
}
