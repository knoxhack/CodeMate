import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Mic, 
  MessageSquare, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Clock, 
  FileText,
  Send,
  PanelRightClose,
  Play,
  Volume2,
  VolumeX,
  X,
  Check,
  Lightbulb,
  CornerDownRight,
  Copy,
  MoreHorizontal
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define message types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeSnippets?: CodeSnippet[];
  relatedFiles?: string[];
}

interface CodeSnippet {
  code: string;
  language: string;
  fileId?: number;
  filePath?: string;
  startLine?: number;
  endLine?: number;
  description?: string;
}

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messages: Message[];
}

interface EnhancedClaudeAssistantProps {
  projectId: number;
  projectName: string;
  files: any[];
  currentFile?: any;
  onApplySuggestion?: (suggestion: any) => void;
  onMinimize?: () => void;
}

export default function EnhancedClaudeAssistant({
  projectId,
  projectName,
  files,
  currentFile,
  onApplySuggestion,
  onMinimize
}: EnhancedClaudeAssistantProps) {
  // State for the assistant
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sample recent NeoForge release notes (this would come from an API)
  const releaseNotes = {
    version: "1.21.5",
    releaseDate: "March 15, 2025",
    highlights: [
      "Updated to support Minecraft 1.21.5",
      "Fixed block rendering issues",
      "Added new biome hooks",
      "Performance improvements for entity rendering"
    ],
    compatibilityIssues: [
      "Block entity renderers need to be migrated to new API",
      "Fluid registration process has changed",
      "World generation hooks have been refactored"
    ]
  };

  // Sample development progress tracking (would be persisted in database)
  const developmentProgress = {
    completedSteps: ["Project setup", "Mod initialization", "Basic blocks"],
    currentSteps: ["Item registration", "Entity setup"],
    nextSteps: ["Recipes", "World generation", "Creative tab"],
    percentageComplete: 35
  };

  // Scroll to bottom of message list when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create a new chat history
  const createNewChat = () => {
    const newChatId = Math.random().toString(36).substring(2, 15);
    const newChat: ChatHistory = {
      id: newChatId,
      title: `${projectName} Chat`,
      preview: "New conversation",
      date: new Date(),
      messages: []
    };
    
    setChatHistories([newChat, ...chatHistories]);
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  // Load chat history
  const loadChatHistory = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Generate a random ID for the message
    const messageId = Math.random().toString(36).substring(2, 15);
    
    // Create the user message
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: message,
      timestamp: new Date(),
      relatedFiles: currentFile ? [currentFile.path] : []
    };
    
    // Add message to state
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsProcessing(true);
    
    try {
      // Call Claude API - this would be an actual API call in production
      // Using setTimeout to simulate API response time
      setTimeout(() => {
        // Generate a sample response with code suggestions
        const assistantMessage: Message = {
          id: Math.random().toString(36).substring(2, 15),
          role: "assistant",
          content: generateSampleResponse(message),
          timestamp: new Date(),
          codeSnippets: generateSampleCodeSnippets(message),
          relatedFiles: suggestRelatedFiles(message, files)
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update chat history
        if (currentChatId) {
          setChatHistories(prev => 
            prev.map(chat => 
              chat.id === currentChatId 
                ? { 
                    ...chat, 
                    messages: [...chat.messages, userMessage, assistantMessage],
                    preview: userMessage.content.substring(0, 40) + "..."
                  } 
                : chat
            )
          );
        } else {
          createNewChat();
        }
        
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending message to Claude", error);
      setIsProcessing(false);
    }
  };

  // Handle voice input (this would use the Web Speech API in a real implementation)
  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setMessage(prev => prev + " I need help creating a custom block with special properties.");
        setIsRecording(false);
      }, 3000);
    }
  };

  // Apply a code suggestion to the editor
  const handleApplySuggestion = (snippet: CodeSnippet) => {
    if (onApplySuggestion) {
      onApplySuggestion({
        code: snippet.code,
        fileId: snippet.fileId,
        filePath: snippet.filePath,
        startLine: snippet.startLine,
        endLine: snippet.endLine
      });
    }
  };

  // Toggle the expansion state of the chat
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    if (onMinimize && isExpanded) {
      onMinimize();
    }
  };

  // Helper function to generate a sample response based on user input
  // This would be replaced by actual Claude API calls
  const generateSampleResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes("block")) {
      return "To create a custom block in NeoForge 1.21.5, you'll need to follow these steps:\n\n1. Create a Block class\n2. Register it in your mod initialization\n3. Add textures and models\n4. Set up block properties\n\nI've generated some code to help you get started. Would you like me to explain any part in more detail?";
    } else if (userMessage.toLowerCase().includes("item")) {
      return "Creating items in NeoForge 1.21.5 involves registering them properly and setting up their properties. Based on your project files, I've created a sample item implementation that should work with your existing code structure.";
    } else if (userMessage.toLowerCase().includes("entity")) {
      return "Entity implementation in NeoForge 1.21.5 requires several components: the entity class, renderer, model, and registration. I've analyzed your current project structure and prepared code samples for each of these components.";
    } else {
      return "I see you're working on a NeoForge 1.21.5 mod. Based on your project files and our previous conversations, I think I can help with that. What specific aspect of Minecraft modding are you working on right now?";
    }
  };

  // Helper function to generate sample code snippets
  // This would be replaced by actual Claude API code generation
  const generateSampleCodeSnippets = (userMessage: string): CodeSnippet[] => {
    if (userMessage.toLowerCase().includes("block")) {
      return [{
        code: \`public class CustomBlock extends Block {
    public CustomBlock() {
        super(Properties.create(Material.ROCK)
            .hardnessAndResistance(3.0F, 3.0F)
            .sound(SoundType.STONE)
            .setLightLevel(state -> 10));
    }
    
    @Override
    public ActionResultType onBlockActivated(BlockState state, World world, BlockPos pos, 
                                             PlayerEntity player, Hand hand, BlockRayTraceResult hit) {
        if (!world.isRemote) {
            // Add custom behavior here
            player.sendMessage(new StringTextComponent("You activated the custom block!"), UUID.randomUUID());
        }
        return ActionResultType.SUCCESS;
    }
}\`,
        language: "java",
        description: "Custom block implementation with activation behavior",
        fileId: 1,
        filePath: "src/main/java/com/example/examplemod/block/CustomBlock.java",
        startLine: 1,
        endLine: 19
      },
      {
        code: \`// Register in your mod class initialization
public static final RegistryObject<Block> CUSTOM_BLOCK = BLOCKS.register(
    "custom_block", CustomBlock::new);\`,
        language: "java",
        description: "Block registration code",
        fileId: 2,
        filePath: "src/main/java/com/example/examplemod/ExampleMod.java",
        startLine: 45,
        endLine: 47
      }];
    } else if (userMessage.toLowerCase().includes("item")) {
      return [{
        code: \`public class CustomItem extends Item {
    public CustomItem() {
        super(new Item.Properties()
            .group(ItemGroup.MISC)
            .maxStackSize(16)
            .rarity(Rarity.UNCOMMON));
    }
    
    @Override
    public ActionResult<ItemStack> onItemRightClick(World world, PlayerEntity player, 
                                                   Hand hand) {
        ItemStack itemstack = player.getHeldItem(hand);
        
        // Add custom behavior here
        if (!world.isRemote) {
            player.addPotionEffect(new EffectInstance(Effects.SPEED, 200, 1));
        }
        
        return ActionResult.resultSuccess(itemstack);
    }
}\`,
        language: "java",
        description: "Custom item with right-click effect",
        fileId: 3,
        filePath: "src/main/java/com/example/examplemod/item/CustomItem.java"
      }];
    } else {
      return []; // No code snippets for general queries
    }
  };

  // Helper to suggest related files based on the query
  const suggestRelatedFiles = (query: string, files: any[]): string[] => {
    // This would use more sophisticated matching in a real implementation
    const terms = query.toLowerCase().split(' ');
    return files
      .filter(file => 
        terms.some(term => 
          file.name.toLowerCase().includes(term) || 
          file.path.toLowerCase().includes(term)
        )
      )
      .map(file => file.path)
      .slice(0, 3); // Limit to 3 suggestions
  };

  // Render code snippets in a message
  const renderCodeSnippets = (snippets: CodeSnippet[] | undefined) => {
    if (!snippets || snippets.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-3">
        {snippets.map((snippet, index) => (
          <Card key={index} className="bg-gray-900/70 border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800/90 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <FileText className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs text-gray-300 truncate max-w-[200px]">
                  {snippet.filePath || `Code Snippet ${index + 1}`}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="xs" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleApplySuggestion(snippet)}
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="xs" 
                  className="h-6 w-6 p-0"
                  onClick={() => navigator.clipboard.writeText(snippet.code)}
                >
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </div>
            </div>
            <pre className="p-3 text-xs overflow-x-auto">
              <code className={`language-${snippet.language || 'javascript'}`}>
                {snippet.code}
              </code>
            </pre>
            {snippet.description && (
              <div className="px-3 py-2 text-xs text-gray-400 bg-gray-800/40 border-t border-gray-700">
                {snippet.description}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // Render related files in a message
  const renderRelatedFiles = (files: string[] | undefined) => {
    if (!files || files.length === 0) return null;
    
    return (
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-1">Related Files:</div>
        <div className="flex flex-wrap gap-1">
          {files.map((file, index) => (
            <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1 bg-gray-800/50">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{file.split('/').pop()}</span>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`border-b border-gray-700 bg-gray-800/30 flex flex-col transition-all duration-300 ${
      isExpanded ? 'h-[320px] md:h-[350px]' : 'h-14'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 bg-blue-600/20 rounded-full p-1.5">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-200">Claude Code Assistant</h3>
          
          {!isExpanded && messages.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {messages.length} messages
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {isExpanded && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => setVoiceMode(!voiceMode)}
                    >
                      {voiceMode ? (
                        <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Voice Mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => setActiveTab(activeTab === "chat" ? "history" : "chat")}
                    >
                      {activeTab === "chat" ? (
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{activeTab === "chat" ? "View Chat History" : "Return to Chat"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => setIsSearching(!isSearching)}
                    >
                      <Search className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search Messages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
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
      </div>
      
      {isExpanded && (
        <>
          {/* Search Bar (conditionally rendered) */}
          {isSearching && (
            <div className="p-2 bg-gray-800/20 border-b border-gray-700 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Input 
                placeholder="Search messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-sm bg-gray-800/50"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setIsSearching(false)}
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          )}
          
          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-grow flex flex-col p-0 m-0 overflow-hidden">
              <ScrollArea className="flex-grow">
                <div className="p-3 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center pt-6">
                      <MessageSquare className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-gray-400 mb-1">No messages yet</h3>
                      <p className="text-xs text-gray-500 max-w-[250px] mx-auto">
                        Start a conversation with Claude to get help with your NeoForge 1.21.5 mod.
                      </p>
                      
                      {/* Development progress preview */}
                      <div className="mt-6 bg-gray-800/40 border border-gray-700 rounded-md p-3 text-left">
                        <h4 className="text-xs font-medium text-gray-300 flex items-center gap-1.5 mb-2">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                          Project Progress ({developmentProgress.percentageComplete}% Complete)
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="text-green-400 mr-1.5">✓</span>
                            <span className="text-gray-400">{developmentProgress.completedSteps.join(", ")}</span>
                          </div>
                          <div>
                            <span className="text-blue-400 mr-1.5">→</span>
                            <span className="text-gray-300">{developmentProgress.currentSteps.join(", ")}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1.5">○</span>
                            <span className="text-gray-500">{developmentProgress.nextSteps.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Release notes preview */}
                      <div className="mt-3 bg-gray-800/40 border border-gray-700 rounded-md p-3 text-left">
                        <h4 className="text-xs font-medium text-gray-300 flex items-center gap-1.5 mb-2">
                          <Zap className="h-3.5 w-3.5 text-blue-400" />
                          NeoForge {releaseNotes.version} Updates
                        </h4>
                        <div className="text-xs text-gray-400">
                          <p className="text-gray-500 text-xs mb-1.5">Released {releaseNotes.releaseDate}</p>
                          <ul className="list-disc list-inside space-y-0.5 text-xs">
                            {releaseNotes.highlights.slice(0, 2).map((highlight, i) => (
                              <li key={i} className="text-gray-400">{highlight}</li>
                            ))}
                          </ul>
                          {releaseNotes.highlights.length > 2 && (
                            <p className="text-xs text-gray-500 mt-1">
                              +{releaseNotes.highlights.length - 2} more updates
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Message list
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`rounded-lg p-3 max-w-[85%] ${
                            msg.role === 'user' 
                              ? 'bg-blue-600/20 text-blue-50' 
                              : 'bg-gray-800/70 text-gray-200 border border-gray-700'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          
                          {/* Render code snippets if assistant message */}
                          {msg.role === 'assistant' && renderCodeSnippets(msg.codeSnippets)}
                          
                          {/* Render related files */}
                          {renderRelatedFiles(msg.relatedFiles)}
                          
                          <div className="mt-1.5 flex justify-between items-center">
                            <span className="text-xs opacity-60">
                              {new Date(msg.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-0.5">
                                <Button 
                                  variant="ghost" 
                                  size="xs" 
                                  className="h-5 w-5 p-0 opacity-60 hover:opacity-100"
                                  onClick={() => navigator.clipboard.writeText(msg.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
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
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                      onClick={handleVoiceInput}
                      className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500' : ''}`}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
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
                
                {/* Voice mode controls */}
                {voiceMode && (
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Volume2 className="h-3.5 w-3.5 mr-1.5" />
                    Voice responses enabled
                    <span className="flex-grow"></span>
                    <Switch
                      checked={voiceMode}
                      onCheckedChange={setVoiceMode}
                      size="sm"
                      className="ml-2"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="flex-grow p-0 m-0 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-300">Chat History</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 py-1 text-xs"
                    onClick={createNewChat}
                  >
                    New Chat
                  </Button>
                </div>
                
                <ScrollArea className="flex-grow">
                  <div className="px-2 py-1">
                    {chatHistories.length === 0 ? (
                      <div className="text-center p-6">
                        <Clock className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No chat history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {chatHistories.map((chat) => (
                          <div 
                            key={chat.id}
                            onClick={() => loadChatHistory(chat.id)}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              currentChatId === chat.id 
                                ? 'bg-blue-900/30 text-blue-100' 
                                : 'hover:bg-gray-800 text-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-xs font-medium truncate max-w-[180px]">
                                {chat.title}
                              </h4>
                              <span className="text-xs opacity-70">
                                {new Date(chat.date).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-xs opacity-70 truncate">{chat.preview}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}