import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SimpleClaudeAssistantProps {
  projectId: number;
  projectName: string;
  files: any[];
  currentFile?: any;
  onApplySuggestion?: (suggestion: any) => void;
}

export default function SimpleClaudeAssistant({
  projectId,
  projectName,
  files,
  currentFile,
  onApplySuggestion
}: SimpleClaudeAssistantProps): JSX.Element {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setMessage("");
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  // Toggle the expansion state of the chat
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-700 bg-gray-800/30 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 bg-blue-600/20 rounded-full p-1.5">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-200">Claude Code Assistant</h3>
          
          {!isExpanded && (
            <Badge variant="secondary" className="ml-2 text-xs">
              AI Assistant
            </Badge>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0"
          onClick={toggleExpansion}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          {/* Chat content */}
          <div className="p-4 flex-grow overflow-auto">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-8 w-8 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-300">
                  I'm Claude, your AI assistant for NeoForge 1.21.5 modding. I can help you with:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-400 list-disc pl-5">
                  <li>Writing and debugging mod code</li>
                  <li>Explaining NeoForge concepts</li>
                  <li>Generating boilerplate code</li>
                  <li>Providing suggestions for features</li>
                </ul>
                <p className="mt-2 text-sm text-gray-300">
                  How can I help you with your Minecraft mod today?
                </p>
              </div>
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-3 bg-gray-800/30 border-t border-gray-700">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about NeoForge 1.21.5..."
                className="min-h-[60px] resize-none pr-[70px] bg-gray-900/60 border-gray-700 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing || !message.trim()}
                  onClick={handleSendMessage}
                  className="h-8 w-8 p-0"
                >
                  {isProcessing ? (
                    <div className="h-4 w-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}