import { useState, useRef, useEffect } from "react";
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
  Minimize,
  CheckCircle,
  Code
} from "lucide-react";
import { ChatMessage, CodeSuggestion } from "@/types/project";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function ClaudeAssistant() {
  const [message, setMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = window.innerWidth < 768;
  
  // Self-contained state for Claude Assistant
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isClaudeThinking, setIsClaudeThinking] = useState(false);
  
  // Self-contained functions without external dependencies
  const addUserMessage = async (content: string) => {
    console.log("addUserMessage called with:", content);
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsClaudeThinking(true);
    
    try {
      // Simulate API response delay
      console.log("Simulating Claude thinking...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a mock response based on the user message content
      let responseText = "";
      
      if (content.toLowerCase().includes("sword") || content.toLowerCase().includes("weapon")) {
        responseText = `Here's how to create a custom sword with the new DataComponent system in NeoForge 1.21.5:

\`\`\`java
import net.minecraft.core.component.DataComponents;
import net.minecraft.core.component.DataComponentType;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.component.Weapon;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;

public class CustomSword {
    // Create a DeferredRegister for items
    public static final DeferredRegister<Item> ITEMS = 
        DeferredRegister.create(BuiltInRegistries.ITEM, "yourmodid");
    
    // Register your custom sword
    public static final RegistryObject<Item> RUBY_SWORD = ITEMS.register("ruby_sword", 
        () -> new Item(new Item.Properties()
            .sword() // Use the sword() method instead of extending SwordItem
            .durability(1250) // Set durability
            .add(DataComponents.WEAPON, new Weapon(3, 5f)) // Add WEAPON component
            // The first parameter (3) is the durability damage
            // The second parameter (5f) is the seconds to disable blocking
        ));
}
\`\`\`

Notice how in 1.21.5 we no longer extend SwordItem. Instead:
1. We use a standard Item with the .sword() property
2. We add the WEAPON DataComponent
3. We configure durability and other properties directly

This follows the new component-based approach that replaces the hardcoded classes from earlier versions.`;
      } else if (content.toLowerCase().includes("datacomponent") || content.toLowerCase().includes("component")) {
        responseText = `The DataComponent system in NeoForge 1.21.5 replaces the old inheritance-based approach for items. Instead of extending classes like SwordItem, PickaxeItem, or ArmorItem, you now use regular Items with components.

Here are the key components and how to use them:

**WEAPON Component**
- Replaces SwordItem
- Controls attack damage and shield disabling

\`\`\`java
.add(DataComponents.WEAPON, new Weapon(3, 5f))
\`\`\`

**TOOL Component**
- Replaces DiggerItem, PickaxeItem, etc.
- Controls mining speed, appropriate blocks

\`\`\`java
.add(DataComponents.TOOL, new Tool(
    2.5f, // Mining speed
    true, // Can destroy blocks in creative
    TagKey.create(Registries.BLOCK, new ResourceLocation("mineable/pickaxe"))
))
\`\`\`

**ARMOR Component**
- Replaces ArmorItem
- Controls protection values

\`\`\`java
.add(DataComponents.ARMOR, armor)
\`\`\`

**BLOCKS_ATTACKS Component**
- Used for shields and blocking items

\`\`\`java
.add(DataComponents.BLOCKS_ATTACKS, new BlocksAttacks(...))
\`\`\`

The advantage of this approach is flexibility - you can mix and match components as needed without complex inheritance chains.`;
      } else if (content.toLowerCase().includes("error") || content.toLowerCase().includes("fix")) {
        responseText = `Based on your error description, I'd look at a few common issues in NeoForge 1.21.5:

1. Are you still using old item classes? The error might be because you're extending SwordItem, ArmorItem, or DiggerItem, which have been removed. Use regular Item with components instead.

2. Check your registry setup - make sure you're using DeferredRegister and RegistryObject correctly:

\`\`\`java
public static final DeferredRegister<Item> ITEMS = 
    DeferredRegister.create(BuiltInRegistries.ITEM, "yourmodid");
    
public static final RegistryObject<Item> YOUR_ITEM = ITEMS.register("item_name", 
    () -> new Item(properties));
\`\`\`

3. Verify that you're handling block entity removal correctly with the new split between BlockEntity#preRemoveSideEffects and BlockBehaviour#affectNeighborsAfterRemoval.

4. If you're seeing missing textures or models, check your JSON files to ensure they match the registered names exactly.

To fix the error properly, could you share the specific error message and the code that's causing it?`;
      } else {
        responseText = `Thank you for your message about Minecraft modding with NeoForge 1.21.5.

Some key things to remember when developing for 1.21.5:

1. Always use DeferredRegister + RegistryObject for registrations
2. Use the DataComponent system instead of extending specialized item classes:
   - Regular Item with WEAPON component instead of SwordItem
   - Regular Item with TOOL component instead of DiggerItem/PickaxeItem
   - Regular Item with ARMOR component instead of ArmorItem

3. Handle block entity removal correctly using the new split methods:
   - BlockEntity#preRemoveSideEffects - For preparing the block entity for removal
   - BlockBehaviour#affectNeighborsAfterRemoval - For updating neighbors

4. Use the new VoxelShape helpers for shape transformations

5. Utilize Item Properties builders like .sword(), .axe(), .pickaxe() for appropriate item setup

What specific aspect of Minecraft modding are you working on right now? I'd be happy to help with more detailed information.`;
      }
      
      // Create assistant message with code suggestions
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseText
      };
      
      // Add code suggestions for "sword" or "weapon" related queries
      if (content.toLowerCase().includes("sword") || content.toLowerCase().includes("weapon")) {
        assistantMessage.codeSuggestions = [
          {
            fileId: "src/main/java/com/example/MySword.java", // This path should match an existing file in the project
            originalCode: "// Old code example\npublic class MySword extends SwordItem {\n    public MySword() {\n        super(Tiers.DIAMOND, 3, -2.4F, new Item.Properties());\n    }\n}",
            suggestedCode: "// New code with DataComponent system\nimport net.minecraft.world.item.Item;\nimport net.minecraft.world.item.component.Weapon;\nimport net.minecraft.core.component.DataComponents;\n\npublic class MySword {\n    public static final Item INSTANCE = new Item(new Item.Properties()\n        .sword()\n        .durability(1250)\n        .add(DataComponents.WEAPON, new Weapon(3, 5f)));\n}",
            description: "Convert SwordItem to use the new DataComponent system in NeoForge 1.21.5"
          }
        ];
      }
      
      // Add code suggestions for error fixing
      if (content.toLowerCase().includes("error") || content.toLowerCase().includes("fix")) {
        assistantMessage.codeSuggestions = [
          {
            fileId: "src/main/java/com/example/MyMod.java",
            originalCode: "// Incorrect registration\npublic static final RegistryObject<Item> RUBY_SWORD = ITEMS.register(\"ruby_sword\", \n    () -> new SwordItem(Tiers.DIAMOND, 3, -2.4F, new Item.Properties()));\n",
            suggestedCode: "// Correct registration with DataComponent\npublic static final RegistryObject<Item> RUBY_SWORD = ITEMS.register(\"ruby_sword\", \n    () -> new Item(new Item.Properties()\n        .sword()\n        .durability(1250)\n        .add(DataComponents.WEAPON, new Weapon(3, 5f))));\n",
            description: "Fix registration to use DataComponent instead of SwordItem"
          }
        ];
      }
      
      setChatMessages(prev => [...prev, assistantMessage]);
      console.log("Added Claude response to chat");
    } catch (error) {
      console.error('Error generating response:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsClaudeThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isClaudeThinking) {
      console.log("Submit triggered with message:", message);
      try {
        addUserMessage(message);
        console.log("addUserMessage called successfully");
        setMessage("");
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        alert("There was an error sending your message. Please try again.");
      }
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
  
  // Helper functions for action buttons
  const continueDevelopment = async () => {
    await addUserMessage("Continue with the mod development. What's the next step?");
  };

  const fixError = async () => {
    await addUserMessage("I'm getting errors in my code. Can you help fix them?");
  };

  const resetChat = () => {
    setChatMessages([]);
  };

  // Handle applying code suggestions
  const handleApplySuggestion = (suggestion: CodeSuggestion) => {
    // First, find the file in the project structure
    try {
      console.log("Applying suggestion to:", suggestion.fileId);
      console.log("Suggested code:", suggestion.suggestedCode);
      
      // Find the project file
      if (!suggestion.fileId) {
        console.error("No file ID provided in the suggestion");
        return;
      }
      
      // Dispatch a custom event that the CodeEditor component will listen for
      const event = new CustomEvent('claude-code-suggestion', { 
        detail: suggestion 
      });
      window.dispatchEvent(event);
      
      // Show a success message
      alert("Code suggestion applied! Check the editor.");
    } catch (error) {
      console.error("Error applying suggestion:", error);
      alert("Failed to apply the code suggestion. Please try again.");
    }
  };
  
  // Window resize listener for mobile detection
  useEffect(() => {
    const handleResize = () => {
      // Update isMobile state if needed
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">C</span>
            </div>
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold mb-1 text-amber-400">CodeMate Assistant</h2>
              <p className="text-sm max-w-md">Your AI partner for NeoForge 1.21.5 Minecraft mod development. Ask anything about mod creation, error fixing, or best practices.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full max-w-md bg-background-dark/50 p-4 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-1">Try asking about:</h3>
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-700 h-auto py-3 hover:bg-background-dark hover:border-amber-700/50"
                onClick={() => addUserMessage("Help me create a custom sword with the new DataComponent system")}
              >
                "Create a custom sword with DataComponent"
              </Button>
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-700 h-auto py-3 hover:bg-background-dark hover:border-amber-700/50"
                onClick={() => addUserMessage("How do I convert my old SwordItem code to use the new 1.21.5 DataComponent system?")}
              >
                "Convert SwordItem to use DataComponent"
              </Button>
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-700 h-auto py-3 hover:bg-background-dark hover:border-amber-700/50"
                onClick={() => addUserMessage("What should I do next in my mod development?")}
              >
                "Continue my mod development"
              </Button>
              <Button
                variant="outline"
                className="text-left text-xs justify-start border-gray-700 h-auto py-3 hover:bg-background-dark hover:border-amber-700/50 flex items-center"
                onClick={() => setShowFileUpload(true)}
              >
                <FilePlus className="h-4 w-4 mr-2 text-amber-500" />
                "Share files with Claude for analysis"
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
                  
                  {/* Code Suggestions Section */}
                  {msg.role === 'assistant' && msg.codeSuggestions && msg.codeSuggestions.length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-3">
                      <div className="flex items-center mb-2">
                        <Code className="h-4 w-4 mr-2 text-amber-400" />
                        <span className="text-amber-400 font-medium">Code Suggestions</span>
                      </div>
                      <div className="space-y-3">
                        {msg.codeSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-gray-800 rounded p-2">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Badge variant="outline" className="bg-amber-900/20 text-amber-400 border-amber-800 mb-1">
                                  {suggestion.fileId.split('/').pop()}
                                </Badge>
                                <p className="text-xs text-gray-300">{suggestion.description}</p>
                              </div>
                              <Button 
                                size="sm" 
                                className="h-7 bg-amber-700 hover:bg-amber-800 text-white"
                                onClick={() => handleApplySuggestion(suggestion)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Apply
                              </Button>
                            </div>
                            <div className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                              <pre className="text-gray-300">{suggestion.suggestedCode}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isClaudeThinking && (
              <div className="flex items-center p-4 mb-2 bg-background-dark rounded-lg border border-amber-900/30">
                <div className="mr-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '400ms'}} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-amber-400 text-sm font-medium mb-1">Claude is thinking...</div>
                  <div className="text-gray-400 text-xs">{thinkingFrames[thinkingFrame]}</div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* File Upload Panel */}
      {showFileUpload && (
        <div className="border-t border-gray-800 p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <FilePlus className="h-5 w-5 mr-2 text-amber-500" />
              <h3 className="text-sm font-medium text-amber-400">Share Files with Claude</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-gray-800" 
              onClick={() => setShowFileUpload(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <p className="text-xs text-gray-400">Share Java files or logs with Claude to get detailed help with your mod development.</p>
            
            <div className="flex items-center justify-center border border-dashed border-amber-800/50 bg-background-dark/50 rounded-lg p-5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept=".java,.txt,.json,.log,.gradle,.toml,.properties,.mcmeta"
              />
              <div className="flex flex-col items-center">
                <Upload className="h-6 w-6 mb-2 text-amber-500" />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center mb-2 border-amber-700/50 hover:border-amber-500"
                >
                  Browse Files
                </Button>
                <p className="text-xs text-gray-500">
                  .java, .json, .gradle, .toml, .log, etc.
                </p>
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-3 bg-background-dark rounded-lg p-3 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-amber-400">
                    Selected Files ({uploadedFiles.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => setUploadedFiles([])}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-gray-800/50 p-2 rounded text-xs hover:bg-gray-800"
                    >
                      <div className="flex items-center overflow-hidden">
                        <FilePlus2 className="h-3 w-3 mr-2 flex-shrink-0 text-amber-500" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 hover:bg-gray-700" 
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="default"
                  className="w-full mt-3 bg-amber-700 hover:bg-amber-800 transition-colors"
                  onClick={handleSendFiles}
                >
                  <Upload className="h-3 w-3 mr-2" />
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
