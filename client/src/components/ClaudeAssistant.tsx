import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { processContentWithCodeBlocks } from "@/lib/syntax-highlighter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CodeSuggestion {
  fileId: string;
  originalCode: string;
  suggestedCode: string;
  description: string;
  startLine?: number;
  endLine?: number;
}

interface ClaudeAssistantProps {
  projectId: number;
  onCodeSuggestion?: (suggestion: CodeSuggestion) => void;
}

export default function ClaudeAssistant({ projectId, onCodeSuggestion }: ClaudeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi there! I'm your Minecraft modding assistant. I'm specialized in NeoForge 1.21.5 and can help you build your mod step-by-step. What would you like to create today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to chat with the assistant",
        variant: "destructive"
      });
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: input
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save message to database first
      await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: userMessage.content
        })
      });
      
      // Send to Claude API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response from assistant");
      }
      
      const data = await response.json();
      const assistantMessage: Message = data.message;
      
      // Add assistant message to state
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: assistantMessage.content
        })
      });
      
      // Parse for code suggestions
      extractCodeSuggestions(assistantMessage.content);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractCodeSuggestions = (content: string) => {
    if (!onCodeSuggestion) return;
    
    // Very basic code suggestion extraction - in a real app this would be more robust
    const codeBlockRegex = /```(?:java)?\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const code = match[1].trim();
      if (code && code.length > 10) { // Simple validation
        // This is a simplified version - a real implementation would be more sophisticated
        const suggestion: CodeSuggestion = {
          fileId: "unknown", // Would need proper file identification
          originalCode: "",  // Would need to determine what code is being replaced
          suggestedCode: code,
          description: "Code suggestion from Claude"
        };
        
        onCodeSuggestion(suggestion);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Claude Assistant</h2>
        <p className="text-sm text-gray-400">Specialized in NeoForge 1.21.5 modding</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card
              key={index}
              className={`p-4 ${
                message.role === "user"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-900 border-gray-800"
              }`}
            >
              <div className="font-semibold mb-1 text-sm text-gray-400">
                {message.role === "user" ? "You" : "Claude"}
              </div>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: processContentWithCodeBlocks(message.content) 
                }}
              />
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Minecraft modding..."
            className="flex-1 min-h-[80px] bg-gray-900 border-gray-800"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="self-end h-10 bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}