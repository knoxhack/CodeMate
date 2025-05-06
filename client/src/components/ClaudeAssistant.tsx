import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { MoreVertical, SendHorizonal, RotateCcw, Wrench, ArrowRightCircle, Copy, Check, FileCode, Info } from "lucide-react";
import { ChatMessage } from "@/types/project";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

export default function ClaudeAssistant() {
  const [message, setMessage] = useState("");
  const [autoExplain, setAutoExplain] = useState(false);
  const [askBeforeEdit, setAskBeforeEdit] = useState(false);
  const [expandedInput, setExpandedInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
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
      setExpandedInput(false);
    }
  };
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  // Help command suggestions based on context
  const helpCommands = [
    { 
      title: "Explain code", 
      command: selectedFile ? `Explain this code from ${selectedFile.name}:\n\n${selectedFile.content}` : "Explain how to code a basic Minecraft item",
      icon: <Info className="h-4 w-4 mr-2" />
    },
    { 
      title: "Create new item", 
      command: "Help me create a new custom Minecraft item called 'Corrupt Shard' that glows and has special effects when held", 
      icon: <FileCode className="h-4 w-4 mr-2" />
    },
    { 
      title: "Fix code issues", 
      command: selectedFile ? `Fix any issues in this code from ${selectedFile.name}:\n\n${selectedFile.content}` : "Help me fix Minecraft mod registration issues",
      icon: <Wrench className="h-4 w-4 mr-2" /> 
    },
    { 
      title: "Continue development", 
      command: "What should I do next in my mod development?", 
      icon: <ArrowRightCircle className="h-4 w-4 mr-2" />
    }
  ];
  
  return (
    <div className="w-full h-full bg-background-panel flex flex-col relative">
      <div className="p-2 text-text-secondary flex justify-between items-center border-b border-gray-800">
        <span className={isMobile ? "text-base font-medium" : "text-sm font-medium"}>
          Claude 3.7 Assistant
          {isClaudeThinking && <span className="ml-2 text-amber-400 animate-pulse">Thinking...</span>}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-60">
                  <div className="space-y-2">
                    <h4 className="font-medium">Assistant Settings</h4>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-text-secondary">
                        <input 
                          type="checkbox" 
                          className="rounded text-primary focus:ring-primary"
                          checked={autoExplain}
                          onChange={() => setAutoExplain(!autoExplain)}
                        />
                        <span>Auto-Explain Code</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-text-secondary">
                        <input 
                          type="checkbox" 
                          className="rounded text-primary focus:ring-primary"
                          checked={askBeforeEdit}
                          onChange={() => setAskBeforeEdit(!askBeforeEdit)}
                        />
                        <span>Ask Before Code Edits</span>
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assistant Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="mb-4 text-center">
              <p className="text-lg mb-2">Welcome to CodeMate!</p>
              <p className="text-sm">Ask Claude for help with your Minecraft mod development</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
              {helpCommands.map((cmd, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-left text-xs justify-start border-gray-600 h-auto py-2"
                  onClick={() => addUserMessage(cmd.command)}
                >
                  {cmd.icon} {cmd.title}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <ChatMessageItem key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input and Controls */}
      <div className="border-t border-gray-800 p-3 space-y-3">
        {expandedInput ? (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <Textarea
              className="bg-background-dark border border-gray-700 rounded text-sm text-white min-h-20 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ask Claude for help with your Minecraft mod..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpandedInput(false)}
              >
                Collapse
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="bg-primary text-white"
                disabled={isClaudeThinking || !message.trim()}
              >
                {isClaudeThinking ? "Thinking..." : "Send Message"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              className="flex-1 bg-background-dark border border-gray-700 rounded-l px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ask Claude for help..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => isMobile && message.length > 50 && setExpandedInput(true)}
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
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Extract code blocks from message
  const codeBlocks: string[] = [];
  let content = message.content;
  
  // Extract code blocks with ```
  const codeBlockRegex = /```(?:java|json)?\n([\s\S]*?)```/g;
  content = content.replace(codeBlockRegex, (_, code) => {
    codeBlocks.push(code);
    return `[CODE_BLOCK_${codeBlocks.length - 1}]`;
  });
  
  // Process inline code with `
  const inlineCodeRegex = /`([^`]+)`/g;
  content = content.replace(inlineCodeRegex, '<inlinecode>$1</inlinecode>');
  
  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copied to clipboard",
      description: "You can now paste the code in your editor",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Convert content parts to JSX
  const renderContent = () => {
    // Split by code block markers
    const parts = content.split(/(\[CODE_BLOCK_\d+\])/);
    
    return parts.map((part, i) => {
      // Check if it's a code block marker
      const codeBlockMatch = part.match(/\[CODE_BLOCK_(\d+)\]/);
      if (codeBlockMatch) {
        const blockIndex = parseInt(codeBlockMatch[1]);
        const code = codeBlocks[blockIndex];
        
        return (
          <div key={i} className="mt-3 mb-3 relative">
            <div className="absolute right-2 top-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-gray-800 hover:bg-gray-700"
                onClick={() => copyCode(code)}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <pre className="bg-gray-900 p-3 rounded border border-gray-700 overflow-x-auto">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          </div>
        );
      }
      
      // Handle inline code
      const inlineCodeParts = part.split(/<inlinecode>|<\/inlinecode>/);
      if (inlineCodeParts.length > 1) {
        return (
          <span key={i}>
            {inlineCodeParts.map((text, j) => {
              // Every even index is regular text, odd index is inline code
              return j % 2 === 0 ? (
                <span key={j}>{text}</span>
              ) : (
                <code key={j} className="bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                  {text}
                </code>
              );
            })}
          </span>
        );
      }
      
      // Regular text - process line breaks
      return (
        <span key={i}>
          {part.split('\n').map((line, j) => (
            <div key={j}>
              {line}
              {j < part.split('\n').length - 1 && <br />}
            </div>
          ))}
        </span>
      );
    });
  };
  
  return (
    <div className="flex flex-col">
      <div className={cn(
        "font-medium mb-1",
        message.role === 'user' ? "text-blue-400" : "text-amber-400"
      )}>
        {message.role === 'user' ? 'You' : 'Claude'}
      </div>
      <div className={cn(
        "p-3 rounded",
        message.role === 'user' ? "bg-gray-800/50" : "bg-background-dark"
      )}>
        {renderContent()}
        
        {message.codeBlock && (
          <div className="mt-2 p-2 border border-gray-700 rounded bg-gray-900 relative">
            <div className="absolute right-2 top-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-gray-800 hover:bg-gray-700"
                onClick={() => copyCode(message.codeBlock!)}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <pre>
              <code className="text-xs font-mono">
                {message.codeBlock}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
