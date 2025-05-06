import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { MoreVertical, SendHorizonal, RotateCcw, Wrench, ArrowRightCircle } from "lucide-react";
import { ChatMessage } from "@/types/project";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export default function ClaudeAssistant() {
  const [message, setMessage] = useState("");
  const [autoExplain, setAutoExplain] = useState(false);
  const [askBeforeEdit, setAskBeforeEdit] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { 
    chatMessages, 
    addUserMessage, 
    isClaudeThinking,
    continueDevelopment,
    fixError,
    resetChat
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
        <span className="text-sm font-medium">Claude 3.7 Assistant</span>
        <button className="text-gray-400 hover:text-white">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
        {chatMessages.map((msg, index) => (
          <ChatMessageItem key={index} message={msg} />
        ))}
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
        
        {!isMobile && (
          <div className="flex items-center space-x-4 text-sm">
            <label className="flex items-center space-x-2 text-text-secondary">
              <input 
                type="checkbox" 
                className="rounded text-primary focus:ring-primary"
                checked={autoExplain}
                onChange={() => setAutoExplain(!autoExplain)}
              />
              <span>Auto-Explain</span>
            </label>
            <label className="flex items-center space-x-2 text-text-secondary">
              <input 
                type="checkbox" 
                className="rounded text-primary focus:ring-primary"
                checked={askBeforeEdit}
                onChange={() => setAskBeforeEdit(!askBeforeEdit)}
              />
              <span>Ask Before Edit</span>
            </label>
          </div>
        )}
        
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

interface ChatMessageItemProps {
  message: ChatMessage;
}

function ChatMessageItem({ message }: ChatMessageItemProps) {
  return (
    <div className="flex flex-col">
      <div className="font-medium text-text-primary mb-1">
        [{message.role === 'user' ? 'User' : 'Claude'}]
      </div>
      <div className="bg-background-dark p-2 rounded">
        {message.content.split('\n').map((line, i) => (
          <div key={i}>
            {line}
            {i < message.content.split('\n').length - 1 && <br />}
          </div>
        ))}
        
        {message.codeBlock && (
          <div className="mt-2 p-2 border border-gray-700 rounded bg-gray-900">
            <code>
              {message.codeBlock}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
