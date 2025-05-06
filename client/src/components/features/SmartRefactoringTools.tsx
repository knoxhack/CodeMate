import React, { useState } from "react";
import * as monaco from "monaco-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RotateCcw, 
  Check, 
  Copy, 
  AlertTriangle, 
  Loader2, 
  ThumbsUp, 
  Zap, 
  CheckCheck, 
  Sparkles,
  Eye,
  AlertCircle
} from "lucide-react";

interface SmartRefactoringToolsProps {
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
  projectId: number;
}

interface RefactoringOption {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'moderate' | 'complex';
  codeSmell?: string;
  applicablePatterns?: string[];
}

interface RefactoringPreview {
  originalCode: string;
  refactoredCode: string;
  explanation: string;
  improvements: string[];
  warnings?: string[];
}

export default function SmartRefactoringTools({
  open,
  onOpenChange,
  editor,
  file,
  projectId,
}: SmartRefactoringToolsProps) {
  const { toast } = useToast();
  const [refactoringType, setRefactoringType] = useState<string>("auto");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRefactoring, setSelectedRefactoring] = useState<RefactoringOption | null>(null);
  const [refactoringPreview, setRefactoringPreview] = useState<RefactoringPreview | null>(null);
  const [applyingRefactoring, setApplyingRefactoring] = useState(false);
  const [refactoringOptions, setRefactoringOptions] = useState<RefactoringOption[]>([]);
  const [previewView, setPreviewView] = useState<'split' | 'unified'>('split');

  // Options for different refactorings
  const availableRefactorings: Record<string, RefactoringOption[]> = {
    auto: [
      {
        id: "inheritance-to-components",
        name: "SwordItem Inheritance to Components",
        description: "Replace SwordItem inheritance with NeoForge 1.21.5 component system",
        category: "modernization",
        difficulty: "moderate",
        codeSmell: "Inheritance incompatible with NeoForge 1.21.5",
        applicablePatterns: ["Component Pattern", "Composition over Inheritance"]
      },
      {
        id: "optimize-entity-registration",
        name: "Optimize Entity Registration",
        description: "Update entity registration to use NeoForge's component registry",
        category: "modernization",
        difficulty: "moderate",
        codeSmell: "Outdated entity registration pattern",
        applicablePatterns: ["Registry Pattern", "Builder Pattern"]
      },
      {
        id: "extract-item-properties",
        name: "Extract Item Properties",
        description: "Extract repeated item properties to a utility method",
        category: "clean-code",
        difficulty: "easy",
        codeSmell: "Duplicated code",
        applicablePatterns: ["Extract Method", "DRY Principle"]
      }
    ],
    performance: [
      {
        id: "lazy-initialization",
        name: "Lazy Initialization",
        description: "Defer object creation until it's needed",
        category: "performance",
        difficulty: "easy",
        codeSmell: "Eager initialization",
        applicablePatterns: ["Lazy Loading", "Initialization on Demand"]
      },
      {
        id: "object-pooling",
        name: "Object Pooling",
        description: "Reuse frequently created objects instead of continuously creating new ones",
        category: "performance",
        difficulty: "complex",
        codeSmell: "Frequent object creation and disposal",
        applicablePatterns: ["Object Pool", "Resource Acquisition Is Initialization"]
      }
    ],
    clean_code: [
      {
        id: "extract-method",
        name: "Extract Method",
        description: "Extract long methods into smaller, focused ones",
        category: "clean-code",
        difficulty: "easy",
        codeSmell: "Long method",
        applicablePatterns: ["Extract Method", "Single Responsibility Principle"]
      },
      {
        id: "replace-conditionals",
        name: "Replace Conditionals with Polymorphism",
        description: "Replace complex conditional logic with polymorphic objects",
        category: "clean-code",
        difficulty: "complex",
        codeSmell: "Complex conditional logic",
        applicablePatterns: ["Strategy Pattern", "State Pattern"]
      }
    ],
    modernization: [
      {
        id: "deferred-to-component-registry",
        name: "DeferredRegister to ComponentRegistry",
        description: "Update from DeferredRegister to NeoForge 1.21.5 ComponentRegistry",
        category: "modernization",
        difficulty: "moderate",
        codeSmell: "Outdated registry pattern",
        applicablePatterns: ["Registry Pattern", "Factory Method"]
      },
      {
        id: "data-component-integration",
        name: "Integrate DataComponents",
        description: "Add DataComponent support to existing classes",
        category: "modernization",
        difficulty: "complex",
        codeSmell: "Lack of component-based architecture",
        applicablePatterns: ["Component Pattern", "Composition over Inheritance"]
      }
    ]
  };

  // Analyze code to find refactoring opportunities
  const analyzeCode = () => {
    if (!editor || !file) {
      toast({
        title: "No File Selected",
        description: "Please open a file to analyze for refactoring.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Get the current code from the editor
    const code = editor.getValue();

    // In a real implementation, this would call Claude API to analyze the code
    // For this demo, we'll simulate the analysis based on the file name
    
    setTimeout(() => {
      let options: RefactoringOption[] = [];
      
      // Select applicable refactorings based on file content
      if (code.includes("extends SwordItem") || file.name.toLowerCase().includes("sword")) {
        options.push(availableRefactorings.auto[0]); // SwordItem inheritance refactoring
      }
      
      if (code.includes("EntityType") || file.name.toLowerCase().includes("entity")) {
        options.push(availableRefactorings.auto[1]); // Entity registration refactoring
      }
      
      if ((code.match(/new Item\.Properties\(\)/g) || []).length > 1) {
        options.push(availableRefactorings.auto[2]); // Extract item properties
      }
      
      if (code.includes("DeferredRegister") || file.name.toLowerCase().includes("registry")) {
        options.push(availableRefactorings.modernization[0]); // DeferredRegister refactoring
      }
      
      // If no specific refactorings were detected, offer general options
      if (options.length === 0) {
        if (code.length > 500) {
          // For larger files, suggest extract method as a generic improvement
          options.push(availableRefactorings.clean_code[0]);
        }
        
        // Add lazy initialization as a generic performance improvement
        options.push(availableRefactorings.performance[0]);
      }
      
      // Set available refactoring options based on current selection
      setRefactoringOptions(refactoringType === "auto" 
        ? options 
        : availableRefactorings[refactoringType] || []);
      
      setIsAnalyzing(false);
      
      if (options.length === 0 && refactoringType === "auto") {
        toast({
          title: "No Refactoring Opportunities",
          description: "No clear refactoring opportunities were detected in this file.",
        });
      }
    }, 1500);
  };

  // Handle refactoring type change
  const handleRefactoringTypeChange = (value: string) => {
    setRefactoringType(value);
    setSelectedRefactoring(null);
    setRefactoringPreview(null);
    
    // Set options based on the selected type
    setRefactoringOptions(availableRefactorings[value] || []);
  };

  // Select a refactoring option
  const handleSelectRefactoring = (option: RefactoringOption) => {
    setSelectedRefactoring(option);
    generateRefactoringPreview(option);
  };

  // Generate a preview of the refactoring
  const generateRefactoringPreview = (option: RefactoringOption) => {
    if (!editor) return;
    
    const code = editor.getValue();
    
    // In a real implementation, this would call Claude API to generate the refactored code
    // For this demo, we'll provide sample refactorings based on the selected option
    
    let preview: RefactoringPreview = {
      originalCode: "",
      refactoredCode: "",
      explanation: "",
      improvements: []
    };
    
    if (option.id === "inheritance-to-components") {
      preview = {
        originalCode: `public class CustomSword extends SwordItem {
    public CustomSword() {
        super(Tiers.IRON, 3, -2.4F, new Item.Properties());
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        // Custom use behavior
        player.getCooldowns().addCooldown(this, 20);
        return InteractionResultHolder.success(player.getItemInHand(hand));
    }
}`,
        refactoredCode: `public class CustomSword extends Item {
    public CustomSword() {
        super(new Item.Properties());
    }
    
    // Factory method for registration with components
    public static CustomSword create() {
        return new CustomSword()
            // Add durability component
            .setData(ItemComponentsKeys.DURABILITY, 
                new Item.DurabilityComponent(Tiers.IRON.getUses()))
            // Add melee weapon component
            .setData(ItemComponentsKeys.MELEE_WEAPON, 
                new Item.MeleeWeaponComponent(3.0f, Tiers.IRON.getAttackDamageBonus() + 3, -2.4f));
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        // Custom use behavior
        player.getCooldowns().addCooldown(this, 20);
        return InteractionResultHolder.success(player.getItemInHand(hand));
    }
}

// Registration in registry class
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "item")),
            new ResourceLocation(MOD_ID, "custom_sword"),
            CustomSword::create);
    });
}`,
        explanation: "This refactoring converts a SwordItem subclass to use NeoForge 1.21.5's component system. Instead of inheriting from SwordItem, the class now extends the base Item class and uses two components: a DurabilityComponent for the item's durability and a MeleeWeaponComponent for attack damage and speed. A static factory method is added to create and configure the item during registration.",
        improvements: [
          "Compatible with NeoForge 1.21.5's component system",
          "More flexible - can add more components without changing inheritance",
          "Decouples sword behavior from the item class",
          "Makes registration cleaner and more explicit"
        ],
        warnings: [
          "Requires updating all registration code to use the component registry",
          "May need to update code that checks for SwordItem instances"
        ]
      };
    } else if (option.id === "deferred-to-component-registry") {
      preview = {
        originalCode: `public class ModItems {
    public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MOD_ID);
    
    public static final RegistryObject<Item> CUSTOM_ITEM = ITEMS.register("custom_item", 
        () -> new Item(new Item.Properties()));
        
    public static final RegistryObject<Item> CUSTOM_SWORD = ITEMS.register("custom_sword", 
        () -> new SwordItem(Tiers.IRON, 3, -2.4F, new Item.Properties()));
    
    public static void initialize(IEventBus eventBus) {
        ITEMS.register(eventBus);
    }
}`,
        refactoredCode: `public class ModItems {
    // Define resource key for items registry
    private static final ResourceKey<Registry<Item>> ITEMS = ResourceKey.createRegistryKey(
        new ResourceLocation("minecraft", "item"));
    
    // Registry references
    public static final DeferredHolder<Item, Item> CUSTOM_ITEM = DeferredHolder.create(ITEMS, 
        new ResourceLocation(MOD_ID, "custom_item"));
    public static final DeferredHolder<Item, SwordItem> CUSTOM_SWORD = DeferredHolder.create(ITEMS, 
        new ResourceLocation(MOD_ID, "custom_sword"));
    
    // Register items using component registry
    public static void register(ComponentRegistry registry) {
        registry.register(registration -> {
            // Register custom item
            registration.register(ITEMS, 
                new ResourceLocation(MOD_ID, "custom_item"),
                () -> new Item(new Item.Properties()));
                
            // Register custom sword with components
            registration.register(ITEMS, 
                new ResourceLocation(MOD_ID, "custom_sword"),
                () -> new Item(new Item.Properties())
                    .setData(ItemComponentsKeys.DURABILITY, 
                        new Item.DurabilityComponent(Tiers.IRON.getUses()))
                    .setData(ItemComponentsKeys.MELEE_WEAPON, 
                        new Item.MeleeWeaponComponent(3.0f, Tiers.IRON.getAttackDamageBonus() + 3, -2.4f)));
        });
    }
    
    // Initialize method for mod class
    public static void initialize() {
        // No event bus registration needed
    }
}`,
        explanation: "This refactoring updates item registration from the DeferredRegister system to NeoForge 1.21.5's ComponentRegistry. It replaces RegistryObject with DeferredHolder and restructures the registration process to use the component-based approach. The SwordItem has been converted to use components instead of inheritance.",
        improvements: [
          "Updates to NeoForge 1.21.5's registry system",
          "Implements component-based item configuration",
          "Removes dependency on event bus registration",
          "Makes references more type-safe with DeferredHolder"
        ],
        warnings: [
          "Requires changes to mod initialization code",
          "References to items need to use get() method in the same way",
          "SwordItem is no longer a separate class, just components on a basic Item"
        ]
      };
    } else if (option.id === "extract-method") {
      preview = {
        originalCode: `public BlockState getStateForPlacement(BlockPlaceContext context) {
    Level level = context.getLevel();
    BlockPos pos = context.getClickedPos();
    Direction facingDirection = context.getHorizontalDirection().getOpposite();
    
    // Check if the block can receive power
    boolean powered = level.hasNeighborSignal(pos);
    
    // Check if the block should be waterlogged
    boolean waterlogged = level.getFluidState(pos).getType() == Fluids.WATER;
    
    // Get the appropriate output direction based on facing
    Direction outputDirection;
    if (facingDirection == Direction.NORTH) {
        outputDirection = Direction.SOUTH;
    } else if (facingDirection == Direction.SOUTH) {
        outputDirection = Direction.NORTH;
    } else if (facingDirection == Direction.EAST) {
        outputDirection = Direction.WEST;
    } else {
        outputDirection = Direction.EAST;
    }
    
    // Apply block state properties
    return this.defaultBlockState()
        .setValue(FACING, facingDirection)
        .setValue(OUTPUT_DIRECTION, outputDirection)
        .setValue(POWERED, powered)
        .setValue(WATERLOGGED, waterlogged);
}`,
        refactoredCode: `public BlockState getStateForPlacement(BlockPlaceContext context) {
    Level level = context.getLevel();
    BlockPos pos = context.getClickedPos();
    Direction facingDirection = context.getHorizontalDirection().getOpposite();
    
    boolean powered = isPowered(level, pos);
    boolean waterlogged = isWaterlogged(level, pos);
    Direction outputDirection = getOutputDirection(facingDirection);
    
    // Apply block state properties
    return this.defaultBlockState()
        .setValue(FACING, facingDirection)
        .setValue(OUTPUT_DIRECTION, outputDirection)
        .setValue(POWERED, powered)
        .setValue(WATERLOGGED, waterlogged);
}

/**
 * Determines if the block position is receiving a redstone signal
 */
private boolean isPowered(Level level, BlockPos pos) {
    return level.hasNeighborSignal(pos);
}

/**
 * Determines if the block position should be waterlogged
 */
private boolean isWaterlogged(Level level, BlockPos pos) {
    return level.getFluidState(pos).getType() == Fluids.WATER;
}

/**
 * Calculates the output direction based on the facing direction
 */
private Direction getOutputDirection(Direction facingDirection) {
    return switch(facingDirection) {
        case NORTH -> Direction.SOUTH;
        case SOUTH -> Direction.NORTH;
        case EAST -> Direction.WEST;
        case WEST -> Direction.EAST;
        default -> Direction.NORTH; // Fallback for up/down
    };
}`,
        explanation: "This refactoring extracts three distinct pieces of logic into separate methods: checking for power, checking for waterlogging, and calculating the output direction. Each method has a single responsibility, making the code more modular and easier to understand. The main method now focuses on coordinating these operations rather than implementing all the details.",
        improvements: [
          "Improves readability by giving meaningful names to operations",
          "Follows the Single Responsibility Principle",
          "Makes the code more maintainable and testable",
          "Uses Java's switch expressions for cleaner direction mapping",
          "Adds documentation to clarify the purpose of each method"
        ]
      };
    } else if (option.id === "lazy-initialization") {
      preview = {
        originalCode: `public class ResourceManager {
    private final Map<String, Texture> textureCache;
    private final Map<String, Model> modelCache;
    private final Map<String, Sound> soundCache;
    
    public ResourceManager() {
        // Initialize all caches even if they might not be used
        this.textureCache = loadAllTextures();
        this.modelCache = loadAllModels();
        this.soundCache = loadAllSounds();
        System.out.println("Initialized all resource caches");
    }
    
    private Map<String, Texture> loadAllTextures() {
        System.out.println("Loading textures...");
        // Expensive operation to load all textures
        Map<String, Texture> textures = new HashMap<>();
        // ... load many textures
        return textures;
    }
    
    private Map<String, Model> loadAllModels() {
        System.out.println("Loading models...");
        // Expensive operation to load all models
        Map<String, Model> models = new HashMap<>();
        // ... load many models
        return models;
    }
    
    private Map<String, Sound> loadAllSounds() {
        System.out.println("Loading sounds...");
        // Expensive operation to load all sounds
        Map<String, Sound> sounds = new HashMap<>();
        // ... load many sounds
        return sounds;
    }
    
    public Texture getTexture(String name) {
        return textureCache.get(name);
    }
    
    public Model getModel(String name) {
        return modelCache.get(name);
    }
    
    public Sound getSound(String name) {
        return soundCache.get(name);
    }
}`,
        refactoredCode: `public class ResourceManager {
    // Use atomics for thread-safe lazy initialization
    private final AtomicReference<Map<String, Texture>> textureCache = new AtomicReference<>();
    private final AtomicReference<Map<String, Model>> modelCache = new AtomicReference<>();
    private final AtomicReference<Map<String, Sound>> soundCache = new AtomicReference<>();
    
    // No expensive initialization in constructor
    public ResourceManager() {
        System.out.println("Resource manager created (caches not initialized)");
    }
    
    private Map<String, Texture> loadAllTextures() {
        System.out.println("Loading textures...");
        // Expensive operation to load all textures
        Map<String, Texture> textures = new HashMap<>();
        // ... load many textures
        return textures;
    }
    
    private Map<String, Model> loadAllModels() {
        System.out.println("Loading models...");
        // Expensive operation to load all models
        Map<String, Model> models = new HashMap<>();
        // ... load many models
        return models;
    }
    
    private Map<String, Sound> loadAllSounds() {
        System.out.println("Loading sounds...");
        // Expensive operation to load all sounds
        Map<String, Sound> sounds = new HashMap<>();
        // ... load many sounds
        return sounds;
    }
    
    public Texture getTexture(String name) {
        // Initialize texture cache if not already initialized
        if (textureCache.get() == null) {
            textureCache.compareAndSet(null, loadAllTextures());
        }
        return textureCache.get().get(name);
    }
    
    public Model getModel(String name) {
        // Initialize model cache if not already initialized
        if (modelCache.get() == null) {
            modelCache.compareAndSet(null, loadAllModels());
        }
        return modelCache.get().get(name);
    }
    
    public Sound getSound(String name) {
        // Initialize sound cache if not already initialized
        if (soundCache.get() == null) {
            soundCache.compareAndSet(null, loadAllSounds());
        }
        return soundCache.get().get(name);
    }
    
    // Optional: Method to pre-load all resources if needed
    public void preloadAllResources() {
        getTexture(""); // Trigger texture loading
        getModel("");   // Trigger model loading
        getSound("");   // Trigger sound loading
        System.out.println("All resource caches initialized");
    }
}`,
        explanation: "This refactoring implements lazy initialization for resource caches. Instead of loading all resources during construction, each cache is loaded only when it's first needed. This pattern is implemented using AtomicReference for thread safety, ensuring that each cache is initialized exactly once even in a multi-threaded environment.",
        improvements: [
          "Reduces startup time by deferring expensive operations",
          "Only loads resources that are actually used",
          "Improves memory usage if some caches are never accessed",
          "Maintains thread safety with atomic operations",
          "Adds optional preloading method for cases where eagerness is desired"
        ]
      };
    } else {
      // Default preview for any other refactoring
      preview = {
        originalCode: code.substring(0, Math.min(1000, code.length)),
        refactoredCode: "// Refactored code would be generated here based on the selected option",
        explanation: "The selected refactoring would transform the code according to the principles of " + option.name + ".",
        improvements: [
          "Improved code organization and readability",
          "Better compliance with modern NeoForge practices",
          "Enhanced maintainability and extensibility",
          "Potentially improved performance"
        ]
      };
    }
    
    setRefactoringPreview(preview);
  };

  // Apply the refactoring to the editor
  const applyRefactoring = () => {
    if (!editor || !refactoringPreview) return;
    
    setApplyingRefactoring(true);
    
    // In a real implementation, this might involve more complex code transformations
    // For this demo, we'll just replace the current editor content with the refactored code
    
    setTimeout(() => {
      editor.setValue(refactoringPreview.refactoredCode);
      
      setApplyingRefactoring(false);
      onOpenChange(false);
      
      toast({
        title: "Refactoring Applied",
        description: "The code has been successfully refactored.",
      });
    }, 1000);
  };

  // Copy refactored code to clipboard
  const copyRefactoredCode = () => {
    if (!refactoringPreview) return;
    
    navigator.clipboard.writeText(refactoringPreview.refactoredCode).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "The refactored code has been copied to your clipboard.",
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <RotateCcw className="h-6 w-6 mr-2 text-purple-400" />
            Smart Refactoring Tools
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Optimize your code with NeoForge 1.21.5 best practices using Claude-powered refactoring
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left sidebar - Refactoring options */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Refactoring Type</label>
              <Select value={refactoringType} onValueChange={handleRefactoringTypeChange}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="auto">Auto-detect Issues</SelectItem>
                  <SelectItem value="performance">Performance Optimization</SelectItem>
                  <SelectItem value="clean_code">Clean Code Refactoring</SelectItem>
                  <SelectItem value="modernization">NeoForge Modernization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Available Refactorings</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={analyzeCode} 
                  disabled={isAnalyzing}
                  className="h-7 px-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 mr-1" />
                  )}
                  <span className="text-xs">Analyze</span>
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center h-32 bg-gray-800/50 rounded-md border border-gray-700">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Analyzing code...</p>
                    </div>
                  </div>
                ) : refactoringOptions.length > 0 ? (
                  refactoringOptions.map((option) => (
                    <Card 
                      key={option.id}
                      className={`p-3 cursor-pointer transition-colors border-gray-700 hover:bg-gray-800/50 ${
                        selectedRefactoring?.id === option.id ? "bg-purple-900/20 border-purple-900/50" : "bg-gray-800/30"
                      }`}
                      onClick={() => handleSelectRefactoring(option)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-white">{option.name}</h3>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          option.difficulty === 'easy' 
                            ? 'bg-green-900/20 text-green-400' 
                            : option.difficulty === 'moderate'
                            ? 'bg-yellow-900/20 text-yellow-400'
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {option.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </Card>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-800/50 rounded-md border border-gray-700">
                    <div className="text-center px-4">
                      <AlertTriangle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        No refactoring options available. Click "Analyze" to detect opportunities.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right content - Refactoring preview */}
          <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-gray-700 lg:pl-4 pt-4 lg:pt-0">
            {selectedRefactoring && refactoringPreview ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{selectedRefactoring.name}</h3>
                  <p className="text-sm text-gray-400">{selectedRefactoring.description}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-300">Code Changes</h4>
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPreviewView('split')}
                        className={`h-7 px-2 ${previewView === 'split' ? 'bg-gray-800' : ''}`}
                      >
                        <span className="text-xs">Split</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPreviewView('unified')}
                        className={`h-7 px-2 ${previewView === 'unified' ? 'bg-gray-800' : ''}`}
                      >
                        <span className="text-xs">Unified</span>
                      </Button>
                    </div>
                  </div>
                  
                  {previewView === 'split' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="bg-gray-800 px-3 py-1.5 rounded-t-md text-xs text-gray-400 border-t border-l border-r border-gray-700">
                          Original Code
                        </div>
                        <div className="bg-gray-950 border border-gray-800 rounded-b-md p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                          <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                            {refactoringPreview.originalCode}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <div className="bg-gray-800 px-3 py-1.5 rounded-t-md text-xs text-gray-400 border-t border-l border-r border-gray-700 flex items-center">
                          <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                          Refactored Code
                        </div>
                        <div className="bg-gray-950 border border-gray-800 rounded-b-md p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                          <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                            {refactoringPreview.refactoredCode}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue="before" className="w-full">
                      <TabsList className="bg-gray-800/50 grid w-full grid-cols-2">
                        <TabsTrigger value="before">Original Code</TabsTrigger>
                        <TabsTrigger value="after">Refactored Code</TabsTrigger>
                      </TabsList>
                      <TabsContent value="before">
                        <div className="bg-gray-950 border border-gray-800 rounded-md p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                          <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                            {refactoringPreview.originalCode}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="after">
                        <div className="bg-gray-950 border border-gray-800 rounded-md p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                          <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                            {refactoringPreview.refactoredCode}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Explanation</h4>
                  <div className="bg-gray-800/30 rounded-md p-3 text-sm text-gray-300">
                    {refactoringPreview.explanation}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Improvements</h4>
                    <ul className="space-y-1">
                      {refactoringPreview.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <ThumbsUp className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {refactoringPreview.warnings && refactoringPreview.warnings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Considerations</h4>
                      <ul className="space-y-1">
                        {refactoringPreview.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline"
                    onClick={copyRefactoredCode}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Code
                  </Button>
                  <Button 
                    onClick={applyRefactoring}
                    disabled={applyingRefactoring}
                  >
                    {applyingRefactoring ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Apply Refactoring
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <Eye className="h-12 w-12 text-gray-500 mb-3" />
                <h3 className="text-lg font-medium text-white mb-1">Select a Refactoring</h3>
                <p className="text-gray-400 max-w-md mb-4">
                  Choose a refactoring option from the left panel to preview the changes. 
                  Use the "Analyze" button to detect potential improvements automatically.
                </p>
                <Button 
                  onClick={analyzeCode}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-1" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}