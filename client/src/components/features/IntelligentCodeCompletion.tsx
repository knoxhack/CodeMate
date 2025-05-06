import React, { useState, useEffect } from "react";
import * as monaco from "monaco-editor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, LightbulbIcon, CheckIcon, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  text: string;
  displayText: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  kind: monaco.languages.CompletionItemKind;
  insertTextRules?: monaco.languages.CompletionItemInsertTextRule;
  detail?: string;
  documentation?: string;
}

interface IntelligentCodeCompletionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  file: {
    id: number;
    name: string;
    path: string;
    content: string;
    projectId: number;
  } | null;
}

export default function IntelligentCodeCompletion({
  open,
  onOpenChange,
  editor,
  file,
}: IntelligentCodeCompletionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);

  // Register completion provider when component mounts
  useEffect(() => {
    if (!monaco || !editor) return;

    // Determine language mode from file extension
    const getLanguageFromFile = () => {
      if (!file) return "java";
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension) return "java";

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
          return "java";
      }
    };

    const language = getLanguageFromFile();

    // Register the completion provider
    const disposable = monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', '@', '#', '(', '{', '[', '<', ' ', '\n'],
      provideCompletionItems: async (model, position) => {
        if (!enabled) return { suggestions: [] };

        try {
          // Get current file context
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          };

          // Get line content and preceding lines for context
          const lineContent = model.getLineContent(position.lineNumber);
          const precedingLines = [];
          for (let i = Math.max(1, position.lineNumber - 10); i < position.lineNumber; i++) {
            precedingLines.push(model.getLineContent(i));
          }

          // Wait a bit to avoid too many requests
          await new Promise(resolve => setTimeout(resolve, 300));

          // Only fetch from API if we have the Authentication API key
          if (process.env.ANTHROPIC_API_KEY) {
            setLoading(true);
            // Here we would make a call to our Claude API endpoint
            // For now, we'll generate a set of smart suggestions based on context
            const smartSuggestions = generateSmartSuggestions(
              lineContent,
              precedingLines.join('\n'),
              file,
              language,
              range
            );
            
            setSuggestions(smartSuggestions);
            setLoading(false);
            
            return {
              suggestions: smartSuggestions.map(s => ({
                label: s.displayText,
                kind: s.kind,
                insertText: s.text,
                range: s.range,
                detail: s.detail,
                documentation: s.documentation,
                insertTextRules: s.insertTextRules,
              })),
            };
          }
        } catch (error) {
          console.error("Error in completion provider:", error);
          setLoading(false);
        }

        return { suggestions: [] };
      },
    });

    return () => {
      disposable.dispose();
    };
  }, [editor, file, enabled]);

  // Generates intelligent code suggestions based on context
  const generateSmartSuggestions = (
    currentLine: string,
    precedingCode: string,
    file: any,
    language: string,
    range: any
  ): Suggestion[] => {
    // For demonstration purposes, we're providing pre-defined suggestions
    // In a real implementation, this would call the Claude API
    
    // MINECRAFT SPECIFIC SUGGESTIONS
    if (language === "java") {
      // Suggestions when working with Block classes
      if (currentLine.includes("Block") || precedingCode.includes("Block")) {
        return [
          {
            text: "registerDefaultState(this.stateDefinition.any().setValue(BlockStateProperties.FACING, Direction.NORTH));",
            displayText: "Register default block state with FACING property",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Initialize block with default state (NeoForge 1.21)",
            documentation: "Sets up a block with a default state using the FACING property. Common for directional blocks like furnaces, hoppers, etc."
          },
          {
            text: [
              "@Override",
              "public void animateTick(BlockState state, Level level, BlockPos pos, RandomSource random) {",
              "    // Add particle effects here",
              "    if (random.nextInt(5) == 0) {",
              "        level.addParticle(",
              "            ParticleTypes.FLAME,",
              "            pos.getX() + 0.5D + random.nextDouble() * 0.4D - 0.2D,",
              "            pos.getY() + 0.5D + random.nextDouble() * 0.4D - 0.2D,", 
              "            pos.getZ() + 0.5D + random.nextDouble() * 0.4D - 0.2D,",
              "            0.0D, 0.0D, 0.0D);",
              "    }",
              "}"
            ].join('\n'),
            displayText: "Override animateTick() method for particle effects",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Add particle effects to your block",
            documentation: "Implements the animateTick method which is called randomly to create particle effects for a block."
          },
        ];
      }
      
      // Suggestions for items
      if (currentLine.includes("Item") || precedingCode.includes("Item")) {
        return [
          {
            text: [
              "public class ${1:CustomItem} extends Item {",
              "    public ${1:CustomItem}() {",
              "        super(new Item.Properties().stacksTo(1));",
              "    }",
              "    ",
              "    @Override",
              "    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {",
              "        ItemStack stack = player.getItemInHand(hand);",
              "        // Add custom behavior here",
              "        return InteractionResultHolder.success(stack);",
              "    }",
              "}"
            ].join('\n'),
            displayText: "Create a custom item with use() override",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Template for a custom item with use action",
            documentation: "Creates a new item class with an overridden use method for handling right-click actions. This is a modern NeoForge 1.21 implementation.",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            text: "registry.register(registration -> registration.register(ITEMS, new ResourceLocation(MOD_ID, \"${1:item_name}\"), () -> new Item(new Item.Properties())));",
            displayText: "Register a new item with the Item Registry",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "NeoForge 1.21 item registration",
            documentation: "Registers a new item using the modern NeoForge 1.21 registry system.",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          }
        ];
      }
      
      // Suggestions for Entity
      if (currentLine.includes("Entity") || precedingCode.includes("Entity")) {
        return [
          {
            text: [
              "@Override",
              "public void tick() {",
              "    super.tick();",
              "    // Add custom entity behavior here",
              "    if (!this.level.isClientSide) {",
              "        // Server-side logic",
              "    } else {",
              "        // Client-side effects",
              "    }",
              "}"
            ].join('\n'),
            displayText: "Override entity tick() method with client/server logic",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Entity update logic for both client and server",
            documentation: "Implements the tick method with separated client and server-side logic. The tick method is called every game tick (20 times per second)."
          }
        ];
      }
      
      // Default Java suggestions
      return [
        {
          text: [
            "/**",
            " * ${1:Description}",
            " * ",
            " * @param ${2:param} ${3:description}",
            " * @return ${4:description}",
            " */",
            "public ${5:ReturnType} ${6:methodName}(${7:Parameters}) {",
            "    ${0}",
            "}"
          ].join('\n'),
          displayText: "Create a new method with Javadoc",
          range,
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: "Method with documentation",
          documentation: "Creates a new method with properly formatted Javadoc comments.",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
      ];
    }
    
    // JSON suggestions (likely minecraft json files)
    if (language === "json") {
      // Model files
      if (file.name.includes("model") || file.path.includes("models")) {
        return [
          {
            text: [
              "{",
              "  \"parent\": \"minecraft:block/cube\",",
              "  \"textures\": {",
              "    \"particle\": \"${1:modid}:block/${2:block_name}\",",
              "    \"north\": \"${1:modid}:block/${2:block_name}\",",
              "    \"south\": \"${1:modid}:block/${2:block_name}\",",
              "    \"east\": \"${1:modid}:block/${2:block_name}\",",
              "    \"west\": \"${1:modid}:block/${2:block_name}\",",
              "    \"up\": \"${1:modid}:block/${2:block_name}_top\",",
              "    \"down\": \"${1:modid}:block/${2:block_name}_bottom\"",
              "  }",
              "}"
            ].join('\n'),
            displayText: "Block model with different top/bottom textures",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Minecraft block model JSON",
            documentation: "Creates a block model that uses the cube parent with different textures for top and bottom faces.",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          }
        ];
      }
      
      // Blockstate files
      if (file.name.includes("blockstate") || file.path.includes("blockstates")) {
        return [
          {
            text: [
              "{",
              "  \"variants\": {",
              "    \"facing=north\": { \"model\": \"${1:modid}:block/${2:block_name}\" },",
              "    \"facing=east\": { \"model\": \"${1:modid}:block/${2:block_name}\", \"y\": 90 },",
              "    \"facing=south\": { \"model\": \"${1:modid}:block/${2:block_name}\", \"y\": 180 },",
              "    \"facing=west\": { \"model\": \"${1:modid}:block/${2:block_name}\", \"y\": 270 }",
              "  }",
              "}"
            ].join('\n'),
            displayText: "Blockstate with facing variants",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Minecraft blockstate definition with facing",
            documentation: "Creates blockstate definitions for a block with a 'facing' property, rotating the model appropriately.",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          }
        ];
      }
      
      // Recipe files
      if (file.name.includes("recipe") || file.path.includes("recipes")) {
        return [
          {
            text: [
              "{",
              "  \"type\": \"minecraft:crafting_shaped\",",
              "  \"pattern\": [",
              "    \"XXX\",",
              "    \"XYX\",",
              "    \"XXX\"",
              "  ],",
              "  \"key\": {",
              "    \"X\": {",
              "      \"item\": \"minecraft:iron_ingot\"",
              "    },",
              "    \"Y\": {",
              "      \"tag\": \"forge:gems/diamond\"",
              "    }",
              "  },",
              "  \"result\": {",
              "    \"item\": \"${1:modid}:${2:item_name}\",",
              "    \"count\": 1",
              "  }",
              "}"
            ].join('\n'),
            displayText: "Shaped crafting recipe template",
            range,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: "Minecraft crafting recipe",
            documentation: "Creates a shaped crafting recipe with a 3x3 pattern using iron ingots and a diamond.",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          }
        ];
      }
    }
    
    // Default suggestions if none of the above match
    return [
      {
        text: "// TODO: Implement this method",
        displayText: "TODO: Implement this method",
        range,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Add a TODO comment",
        documentation: "Adds a TODO reminder to implement a method."
      }
    ];
  };

  const showSuggestionDetails = (suggestion: Suggestion) => {
    setCurrentSuggestion(suggestion);
  };

  const applySuggestion = () => {
    if (!editor || !currentSuggestion) return;
    
    const text = currentSuggestion.text;
    const range = currentSuggestion.range;
    
    editor.executeEdits("suggestion", [
      {
        range: {
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn,
        },
        text,
      },
    ]);
    
    toast({
      title: "Suggestion Applied",
      description: "The code suggestion has been applied to your file.",
    });
    
    onOpenChange(false);
  };

  const toggleAutocomplete = () => {
    setEnabled(!enabled);
    toast({
      title: enabled ? "Autocomplete Disabled" : "Autocomplete Enabled",
      description: enabled 
        ? "NeoForge intelligent code completion has been turned off." 
        : "NeoForge intelligent code completion is now active.",
    });
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center">
              <LightbulbIcon className="h-6 w-6 mr-2 text-amber-400" />
              Intelligent Code Completion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Claude-powered NeoForge 1.21.5 context-aware code suggestions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left Sidebar - List of suggestions */}
            <div className="col-span-2 border border-gray-700 rounded-md overflow-hidden">
              <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-medium text-sm text-gray-300">Available Suggestions</h3>
                <Button 
                  variant={enabled ? "default" : "outline"} 
                  size="sm"
                  onClick={toggleAutocomplete}
                  className="h-7 text-xs"
                >
                  {enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        currentSuggestion === suggestion
                          ? "bg-blue-900/30 text-blue-300"
                          : "hover:bg-gray-800 text-gray-300"
                      }`}
                      onClick={() => showSuggestionDetails(suggestion)}
                    >
                      <div className="font-medium text-sm truncate">{suggestion.displayText}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{suggestion.detail}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No suggestions available for this context
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Content - Suggestion details */}
            <div className="col-span-3 border border-gray-700 rounded-md overflow-hidden">
              <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                <h3 className="font-medium text-sm text-gray-300">Suggestion Preview</h3>
              </div>
              
              <div className="p-4">
                {currentSuggestion ? (
                  <>
                    <h4 className="text-white font-medium mb-2">{currentSuggestion.displayText}</h4>
                    <div className="text-gray-400 text-sm mb-4">{currentSuggestion.documentation}</div>
                    
                    <div className="bg-gray-950 rounded-md p-3 mb-4 overflow-x-auto">
                      <pre className="text-sm text-green-400 font-mono">
                        {currentSuggestion.text}
                      </pre>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="mr-2">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button onClick={applySuggestion}>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Apply Suggestion
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    Select a suggestion to see details and preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}