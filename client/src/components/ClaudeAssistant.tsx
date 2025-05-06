import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { SendHorizonal, RotateCcw, Wrench, ArrowRightCircle } from "lucide-react";
import { ChatMessage } from "@/types/project";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export default function ClaudeAssistant() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  return (
    <div className="w-full h-full bg-background-panel flex flex-col relative">
      <div className="p-2 text-text-secondary flex justify-between items-center border-b border-gray-800">
        <span className={isMobile ? "text-base font-medium" : "text-sm font-medium"}>
          Claude 3.7 Assistant
          {isClaudeThinking && <span className="ml-2 text-amber-400 animate-pulse">Thinking...</span>}
        </span>
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
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input and Controls */}
      <div className="border-t border-gray-800 p-3 space-y-3">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            className="flex-1 bg-background-dark border border-gray-700 rounded-l px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Ask Claude for help..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
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
