import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  Send,
  FileText,
  Copy,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChatResponse } from "@/lib/anthropic";
import { useToast } from "@/hooks/use-toast";

// Define message types
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Define code suggestion type
interface CodeSuggestion {
  code: string;
  language: string;
  description?: string;
  fileId?: number;
  filePath?: string;
  startLine?: number;
  endLine?: number;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to extract code blocks from message content
  const extractCodeBlocks = (content: string): CodeSuggestion[] => {
    const codeBlockRegex = /```([a-zA-Z0-9_]+)?\n([\s\S]*?)```/g;
    const suggestions: CodeSuggestion[] = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'java';
      const code = match[2].trim();
      
      // Don't consider code blocks that are too short
      if (code.length < 10) continue;
      
      suggestions.push({
        code,
        language,
        description: `Generated ${language} code`
      });
    }
    
    return suggestions;
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      role: "user",
      content: message
    };
    
    // Add file context if available
    if (currentFile) {
      userMessage.content += `\n\nContext: I'm currently working on the file ${currentFile.path} with content:\n\`\`\`${getLanguageFromFilename(currentFile.name)}\n${currentFile.content}\n\`\`\``;
    }
    
    // Update UI
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsProcessing(true);
    
    try {
      // Call Claude API via our backend
      const assistantMessage = await getChatResponse([...messages, userMessage]);
      
      // Update messages state with response
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error communicating with Claude:", error);
      
      // Show error toast
      toast({
        title: "Claude Error",
        description: "There was a problem connecting to Claude. Please try again.",
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }
  };

  // Apply a code suggestion
  const handleApplySuggestion = (suggestion: CodeSuggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
      
      toast({
        title: "Code Applied",
        description: "The code suggestion has been applied to the editor.",
      });
    }
  };

  // Toggle the expansion state of the chat
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Helper function to determine language from filename
  const getLanguageFromFilename = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    if (!extension) return "text";

    switch (extension) {
      case "java":
        return "java";
      case "json":
        return "json";
      case "xml":
        return "xml";
      case "properties":
        return "properties";
      case "txt":
        return "text";
      case "md":
        return "markdown";
      case "gradle":
        return "groovy";
      case "toml":
        return "toml";
      default:
        return "text";
    }
  };

  // Render messages with code blocks
  const renderMessage = (msg: Message, index: number) => {
    // Extract code suggestions from message
    const codeSuggestions = msg.role === 'assistant' ? extractCodeBlocks(msg.content) : [];
    
    // Process message content to handle code blocks for display
    const processedContent = msg.content.replace(/```([a-zA-Z0-9_]+)?\n([\s\S]*?)```/g, 
      (match, language, code) => `<div class="code-block-placeholder"></div>`);
    
    return (
      <div 
        key={index} 
        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div 
          className={`rounded-lg p-3 max-w-[85%] ${
            msg.role === 'user' 
              ? 'bg-blue-600/30 text-blue-50' 
              : 'bg-gray-800/70 text-gray-200'
          }`}
        >
          {/* Regular text content */}
          <div 
            className="text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: processedContent
                .split('<div class="code-block-placeholder"></div>')
                .map(part => part.replace(/\n/g, '<br/>'))
                .join('<div class="code-block-placeholder"></div>')
            }} 
          />
          
          {/* Code blocks render separately */}
          {codeSuggestions.map((suggestion, i) => (
            <Card key={i} className="mt-3 bg-gray-900/70 border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800/90 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs text-gray-300">
                    {suggestion.language || 'code'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleApplySuggestion(suggestion)}
                  >
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="xs" 
                    className="h-6 w-6 p-0"
                    onClick={() => navigator.clipboard.writeText(suggestion.code)}
                  >
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </div>
              </div>
              <pre className="p-3 text-xs overflow-x-auto text-gray-300">
                <code>{suggestion.code}</code>
              </pre>
            </Card>
          ))}
        </div>
      </div>
    );
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
              {messages.length > 0 ? `${messages.length} messages` : 'AI Assistant'}
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
          <ScrollArea className="flex-grow h-[240px]">
            <div className="p-4">
              {messages.length === 0 ? (
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
              ) : (
                // Render message history
                messages.map((msg, index) => renderMessage(msg, index))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
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
                disabled={isProcessing}
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
            <div className="mt-2 text-xs text-gray-500 text-right">
              {currentFile && <span>Working with: <span className="text-blue-400">{currentFile.name}</span></span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}