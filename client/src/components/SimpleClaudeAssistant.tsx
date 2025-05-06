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
  Check,
  Mic,
  Volume2,
  VolumeX,
  Repeat as RepeatIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getChatResponse } from "@/lib/anthropic";
import { useToast } from "@/hooks/use-toast";

// Define message and code suggestion types for internal use
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CodeSuggestion {
  code: string;
  language: string;
  description?: string;
  fileId?: string;
  originalCode?: string;
  suggestedCode?: string;
  startLine?: number;
  endLine?: number;
}

// For compatibility with both file types
interface FileCompatible {
  name: string;
  path: string;
  content: string;
  [key: string]: any;
}

interface SimpleClaudeAssistantProps {
  projectId: number;
  projectName: string;
  files: FileCompatible[];
  currentFile?: FileCompatible;
  onApplySuggestion?: (suggestion: CodeSuggestion) => void;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = window.speechSynthesis;
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Function to stop speaking
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Function to speak text aloud
  const speakText = (text: string) => {
    // Don't speak code blocks
    const cleanText = text.replace(/```[\s\S]*?```/g, "Code block omitted for speech.");
    
    if (speechSynthesis) {
      // Stop any current speech
      stopSpeaking();
      
      // Create a toast notification
      toast({
        title: "Speaking...",
        description: "Text-to-speech activated",
        duration: 3000,
      });
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set up event handlers
      utterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
      };
      
      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setIsSpeaking(false);
      };
      
      // Try to set a good voice
      try {
        const voices = speechSynthesis.getVoices();
        console.log("Available voices:", voices.map(v => v.name).join(", "));
        
        if (voices.length > 0) {
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Female') || 
            voice.name.includes('English') ||
            voice.name.includes('US') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Samantha')
          );
          
          if (preferredVoice) {
            console.log("Using voice:", preferredVoice.name);
            utterance.voice = preferredVoice;
          } else {
            console.log("Using default voice:", voices[0].name);
            utterance.voice = voices[0];
          }
        }
      } catch (err) {
        console.error("Error setting voice:", err);
      }
      
      // Actually speak!
      try {
        console.log("Speaking text:", cleanText.substring(0, 50) + "...");
        speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Error speaking:", err);
        toast({
          title: "Speech Error",
          description: "There was a problem with text-to-speech",
          variant: "destructive",
        });
        setIsSpeaking(false);
      }
    }
  };
  
  // Text-to-speech for assistant messages
  useEffect(() => {
    // Automatically speak the assistant's response in both expanded and collapsed mode
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isSpeaking) {
        speakText(lastMessage.content);
      }
    }
    
    // Stop speaking when expanded and changing modes
    if (isExpanded && isSpeaking) {
      stopSpeaking();
    }
  }, [messages, isExpanded, isSpeaking]);
  
  // Function to start speech recognition
  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't have built-in types for the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Voice Recognition Active",
          description: "Speak now...",
        });
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setTimeout(() => {
          handleSendMessage();
        }, 500);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: event.error,
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support the Speech Recognition API.",
        variant: "destructive"
      });
    }
  };

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
        description: `Generated ${language} code`,
        suggestedCode: code,
        originalCode: currentFile?.content || "",
        fileId: currentFile?.path
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
      // Call Claude API via our backend using the helper function
      // Pass the isVoiceMode flag based on whether the UI is collapsed
      const assistantMessage = await getChatResponse([...messages, userMessage], !isExpanded);
      
      // Update messages state with response
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      // If in voice mode, automatically read the response
      if (!isExpanded && !isSpeaking) {
        speakText(assistantMessage.content);
      }
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
      (_match: string, _language: string, _code: string) => `<div class="code-block-placeholder"></div>`);
    
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
                .map((part: string) => part.replace(/\n/g, '<br/>'))
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
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleApplySuggestion(suggestion)}
                  >
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
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
      
      {isExpanded ? (
        <>
          <ScrollArea className="flex-grow overflow-y-auto">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-blue-600/20 p-3 mb-3">
                    <MessageSquare className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-200 mb-1">Claude Code Assistant</h3>
                  <p className="text-xs text-gray-400 max-w-[260px] mb-4">
                    Trained on NeoForge 1.21.5 modding API and best practices.
                  </p>
                  <div className="text-xs text-left text-gray-300 bg-gray-800/50 p-3 rounded-md mb-2 max-w-[300px]">
                    <p className="font-medium mb-2">Try asking:</p>
                    <ul className="space-y-2">
                      <li>• How do I register a custom item?</li>
                      <li>• Explain how entity pathfinding works</li>
                      <li>• Example of custom ore generation</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  {/* Voice controls for expanded view */}
                  {!isListening && (
                    <div className="flex items-center justify-end gap-2 mb-4">
                      {/* Play/Stop Button */}
                      <Button
                        variant={isSpeaking ? "secondary" : "outline"}
                        size="sm"
                        className={`h-7 w-7 p-0 ${isSpeaking ? "bg-blue-600/50 border-blue-500" : "border-gray-600"}`}
                        onClick={isSpeaking ? stopSpeaking : () => {
                          const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
                          if (lastAssistantMsg) {
                            speakText(lastAssistantMsg.content);
                          }
                        }}
                        title={isSpeaking ? "Stop speaking" : "Play last response"}
                      >
                        {isSpeaking ? <VolumeX className="h-3.5 w-3.5 text-white" /> : <Volume2 className="h-3.5 w-3.5 text-blue-400" />}
                      </Button>
                      
                      {/* VERY prominent Replay Button for expanded view */}
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 flex items-center gap-1 text-xs rounded-sm"
                        onClick={() => {
                          const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
                          if (lastAssistantMsg) {
                            speakText(lastAssistantMsg.content);
                          }
                        }}
                        title="Replay last response"
                        disabled={isSpeaking}
                      >
                        <RepeatIcon className="h-3 w-3" />
                        <span className="text-xs">Replay</span>
                      </Button>
                    </div>
                  )}
                  
                  {/* Render message history */}
                  {messages.map((msg, index) => renderMessage(msg, index))}
                </>
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
      ) : (
        /* Voice Assistant Mode */
        <div className="p-3 flex items-center justify-between bg-gray-800/60 border-t border-gray-700">
          <div className="flex items-center gap-3">
            {/* Voice Mode Indicator */}
            <div className="flex-shrink-0 bg-blue-600/30 rounded-full p-1.5">
              <Volume2 className="h-4 w-4 text-blue-400" />
            </div>
            
            {/* Message Indicator / Last Message */}
            <div className="flex-grow">
              {messages.length > 0 ? (
                <div className="text-sm text-gray-300 truncate max-w-[200px]">
                  <span className="text-xs font-medium text-blue-400">Voice mode:</span> {
                    messages[messages.length - 1].content
                      .replace(/```[\s\S]*?```/g, "[code]")
                      .substring(0, 50)
                  }
                  {messages[messages.length - 1].content.length > 50 && "..."}
                </div>
              ) : (
                <div className="text-sm text-gray-300">
                  <span className="text-xs font-medium text-blue-400">Voice mode active</span> - Ready for commands
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Controls with both Play and Replay in prominent places */}
            
            {/* Play/Stop Button */}
            <Button
              variant={isSpeaking ? "secondary" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 ${isSpeaking ? "bg-blue-600/50 border-blue-500" : "border-gray-600"}`}
              onClick={isSpeaking ? stopSpeaking : () => {
                if (messages.length > 0) {
                  speakText(messages[messages.length - 1].content);
                } else {
                  speakText("Hello, I'm Claude, your AI assistant for NeoForge modding. How can I help you today?");
                }
              }}
              title={isSpeaking ? "Stop speaking" : "Play last response"}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-blue-400" />}
            </Button>
            
            {/* VERY prominent Replay Button */}
            {messages.length > 0 && (
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 flex items-center gap-1 text-xs rounded-sm"
                onClick={() => {
                  if (messages.length > 0) {
                    speakText(messages[messages.length - 1].content);
                  }
                }}
                title="Replay last response"
                disabled={isSpeaking}
              >
                <RepeatIcon className="h-3 w-3" />
                <span className="text-xs">Replay</span>
              </Button>
            )}
            
            {/* Voice Input Button */}
            <Button
              variant={isListening ? "secondary" : "outline"}
              size="sm"
              className={`h-8 w-8 p-0 ${isListening ? "bg-green-600/50 border-green-500" : "border-gray-600"}`}
              onClick={startListening}
              disabled={isListening || isProcessing}
              title="Voice input"
            >
              <Mic className={`h-4 w-4 ${isListening ? "text-white" : "text-green-400"}`} />
            </Button>
            
            {/* Processing Indicator */}
            {isProcessing && (
              <div className="h-5 w-5 ml-1 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}