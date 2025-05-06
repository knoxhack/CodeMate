import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  GitCompare,
  Check,
  AlertTriangle,
  Info,
  ThumbsUp,
  MessageSquare,
  User,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Sparkles,
  XCircle,
  FileCode,
  RefreshCcw
} from "lucide-react";

interface CollaborativeCodeReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    id: number;
    name: string;
    path: string;
    content: string;
    projectId: number;
  } | null;
  projectId: number;
}

interface CodeReview {
  id: string;
  fileName: string;
  filePath: string;
  author: string;
  created: string;
  status: 'open' | 'resolved' | 'rejected';
  comments: CodeComment[];
  score?: number;
  metrics?: {
    quality: number;
    bestPractices: number;
    performance: number;
    security: number;
  };
  aiSuggestions?: CodeSuggestion[];
}

interface CodeComment {
  id: string;
  author: string;
  content: string;
  lineNumber?: number;
  created: string;
  type: 'feedback' | 'suggestion' | 'issue' | 'question';
  isAi?: boolean;
}

interface CodeSuggestion {
  id: string;
  title: string;
  description: string;
  originalCode: string;
  suggestedCode: string;
  reason: string;
  category: 'performance' | 'style' | 'bestPractice' | 'security' | 'neoforgeUpdate';
  lineStart?: number;
  lineEnd?: number;
}

export default function CollaborativeCodeReview({
  open,
  onOpenChange,
  file,
  projectId,
}: CollaborativeCodeReviewProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<CodeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CodeSuggestion | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<string>("feedback");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load reviews when component mounts
  useEffect(() => {
    if (open && file && !reviewsLoaded) {
      setIsLoading(true);
      
      // In a real implementation, this would fetch reviews from an API
      setTimeout(() => {
        const mockReviews: CodeReview[] = [
          {
            id: "review-1",
            fileName: file.name,
            filePath: file.path,
            author: "devteam",
            created: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'open',
            comments: [
              {
                id: "comment-1",
                author: "devteam",
                content: "Started review of this file. Examining NeoForge compatibility.",
                created: new Date(Date.now() - 172800000).toISOString(),
                type: 'feedback'
              },
              {
                id: "comment-2",
                author: "claude",
                content: "I've identified several areas where this code needs to be updated to be compatible with NeoForge 1.21.5's component system.",
                created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                type: 'feedback',
                isAi: true
              }
            ],
            score: 68,
            metrics: {
              quality: 72,
              bestPractices: 65,
              performance: 80,
              security: 55
            },
            aiSuggestions: [
              {
                id: "suggestion-1",
                title: "Update SwordItem to use Component System",
                description: "Replace SwordItem inheritance with NeoForge 1.21.5's component system",
                originalCode: `public class CustomSword extends SwordItem {
    public CustomSword() {
        super(Tiers.IRON, 3, -2.4F, new Item.Properties());
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        player.getCooldowns().addCooldown(this, 20);
        return InteractionResultHolder.success(player.getItemInHand(hand));
    }
}`,
                suggestedCode: `public class CustomSword extends Item {
    public CustomSword() {
        super(new Item.Properties());
    }
    
    public static CustomSword create() {
        return new CustomSword()
            .setData(ItemComponentsKeys.DURABILITY, 
                new Item.DurabilityComponent(Tiers.IRON.getUses()))
            .setData(ItemComponentsKeys.MELEE_WEAPON, 
                new Item.MeleeWeaponComponent(3.0f, Tiers.IRON.getAttackDamageBonus() + 3, -2.4f));
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        player.getCooldowns().addCooldown(this, 20);
        return InteractionResultHolder.success(player.getItemInHand(hand));
    }
}`,
                reason: "NeoForge 1.21.5 has moved away from inheritance-based item types to a component-based system. The SwordItem class should not be extended directly. Instead, base Item class should be used with appropriate components attached.",
                category: 'neoforgeUpdate',
                lineStart: 1,
                lineEnd: 9
              },
              {
                id: "suggestion-2",
                title: "Update Registration Code",
                description: "Update registration to use ComponentRegistry",
                originalCode: `public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MODID);

public static final RegistryObject<Item> CUSTOM_SWORD = ITEMS.register("custom_sword", 
    () -> new CustomSword());

public static void initialize(IEventBus eventBus) {
    ITEMS.register(eventBus);
}`,
                suggestedCode: `// Define resource key for Items registry
private static final ResourceKey<Registry<Item>> ITEMS = ResourceKey.createRegistryKey(
    new ResourceLocation("minecraft", "item"));

// Reference holder for the item
public static final DeferredHolder<Item, Item> CUSTOM_SWORD = DeferredHolder.create(ITEMS, 
    new ResourceLocation(MODID, "custom_sword"));

// Registration method
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ITEMS, 
            new ResourceLocation(MODID, "custom_sword"),
            CustomSword::create);
    });
}`,
                reason: "NeoForge 1.21.5 replaces the DeferredRegister system with ComponentRegistry. This change also involves using ResourceKey and DeferredHolder instead of RegistryObject.",
                category: 'neoforgeUpdate',
                lineStart: 1,
                lineEnd: 7
              }
            ]
          }
        ];
        
        setReviews(mockReviews);
        if (mockReviews.length > 0) {
          setSelectedReview(mockReviews[0]);
        }
        
        setIsLoading(false);
        setReviewsLoaded(true);
      }, 1000);
    }
  }, [open, file, reviewsLoaded]);

  // Start a new code review
  const startCodeReview = () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // In a real implementation, this would call Claude API to analyze the code
    setTimeout(() => {
      // Create a new review with initial analysis
      const newReview: CodeReview = {
        id: `review-${Date.now()}`,
        fileName: file.name,
        filePath: file.path,
        author: "admin",
        created: new Date().toISOString(),
        status: 'open',
        comments: [
          {
            id: `comment-${Date.now()}`,
            author: "admin",
            content: "Started new code review.",
            created: new Date().toISOString(),
            type: 'feedback'
          }
        ],
        score: 0, // Will be set after analysis
        metrics: {
          quality: 0,
          bestPractices: 0,
          performance: 0,
          security: 0
        },
        aiSuggestions: []
      };
      
      setReviews(prev => [newReview, ...prev]);
      setSelectedReview(newReview);
      
      // Next, simulate the AI analysis
      setTimeout(() => {
        const updatedReview: CodeReview = {
          ...newReview,
          comments: [
            ...newReview.comments,
            {
              id: `comment-${Date.now()}`,
              author: "claude",
              content: "I've analyzed the code and found some areas for improvement related to NeoForge 1.21.5 compatibility.",
              created: new Date().toISOString(),
              type: 'feedback',
              isAi: true
            }
          ],
          score: 75,
          metrics: {
            quality: 70,
            bestPractices: 75,
            performance: 85,
            security: 70
          },
          aiSuggestions: [
            {
              id: `suggestion-${Date.now()}-1`,
              title: "Use Component Registry for Registration",
              description: "Update registration code to use the new ComponentRegistry system",
              originalCode: `// Assuming this is in your registration class
public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MODID);

public static final RegistryObject<Block> EXAMPLE_BLOCK = BLOCKS.register("example_block",
    () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE)));`,
              suggestedCode: `// Updated registration for NeoForge 1.21.5
private static final ResourceKey<Registry<Block>> BLOCKS = ResourceKey.createRegistryKey(
    new ResourceLocation("minecraft", "block"));

// Reference holder for the block
public static final DeferredHolder<Block, Block> EXAMPLE_BLOCK = DeferredHolder.create(BLOCKS, 
    new ResourceLocation(MODID, "example_block"));

// Registration method
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(BLOCKS, 
            new ResourceLocation(MODID, "example_block"),
            () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE)));
    });
}`,
              reason: "NeoForge 1.21.5 has replaced the DeferredRegister system with ComponentRegistry for more flexibility and better integration with Minecraft's component system.",
              category: 'neoforgeUpdate'
            },
            {
              id: `suggestion-${Date.now()}-2`,
              title: "Add Proper Exception Handling",
              description: "Improve error handling in file operations",
              originalCode: `public void loadConfig() {
    File configFile = new File(CONFIG_PATH);
    JsonObject config = JsonParser.parseReader(new FileReader(configFile)).getAsJsonObject();
    // Process config...
}`,
              suggestedCode: `public void loadConfig() {
    File configFile = new File(CONFIG_PATH);
    try (FileReader reader = new FileReader(configFile)) {
        JsonObject config = JsonParser.parseReader(reader).getAsJsonObject();
        // Process config...
    } catch (FileNotFoundException e) {
        LOGGER.error("Config file not found: {}", CONFIG_PATH, e);
        // Create default config or handle gracefully
    } catch (JsonParseException e) {
        LOGGER.error("Invalid config format: {}", CONFIG_PATH, e);
        // Handle invalid config
    } catch (IOException e) {
        LOGGER.error("Error reading config: {}", CONFIG_PATH, e);
    }
}`,
              reason: "The original code lacks proper exception handling for file operations, which could lead to crashes if the file is missing or improperly formatted.",
              category: 'bestPractice'
            }
          ]
        };
        
        setReviews(prev => 
          prev.map(review => review.id === newReview.id ? updatedReview : review)
        );
        setSelectedReview(updatedReview);
        setIsAnalyzing(false);
      }, 3000);
    }, 1000);
  };

  // Add a new comment to the selected review
  const addComment = () => {
    if (!selectedReview || !newComment.trim()) return;
    
    const comment: CodeComment = {
      id: `comment-${Date.now()}`,
      author: "admin", // Would be the current user in a real app
      content: newComment,
      created: new Date().toISOString(),
      type: commentType as 'feedback' | 'suggestion' | 'issue' | 'question'
    };
    
    const updatedReview = {
      ...selectedReview,
      comments: [...selectedReview.comments, comment]
    };
    
    setReviews(prev => 
      prev.map(review => review.id === selectedReview.id ? updatedReview : review)
    );
    setSelectedReview(updatedReview);
    setNewComment("");
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the review.",
    });
  };

  // Apply a code suggestion
  const applySuggestion = (suggestion: CodeSuggestion) => {
    if (!file) return;
    
    // In a real implementation, this would update the actual file content
    // through an API call and update the editor
    
    toast({
      title: "Suggestion Applied",
      description: `The suggestion "${suggestion.title}" has been applied to your code.`,
    });
    
    // Update the review to mark this suggestion as applied
    if (selectedReview) {
      const updatedSuggestions = selectedReview.aiSuggestions?.map(s => 
        s.id === suggestion.id 
          ? { ...s, applied: true } 
          : s
      );
      
      const updatedReview = {
        ...selectedReview,
        aiSuggestions: updatedSuggestions,
        comments: [
          ...selectedReview.comments,
          {
            id: `comment-${Date.now()}`,
            author: "admin",
            content: `Applied suggestion: ${suggestion.title}`,
            created: new Date().toISOString(),
            type: 'feedback'
          }
        ]
      };
      
      setReviews(prev => 
        prev.map(review => review.id === selectedReview.id ? updatedReview : review)
      );
      setSelectedReview(updatedReview);
    }
    
    // Close the dialog
    onOpenChange(false);
  };

  // Copy a code suggestion to clipboard
  const copySuggestion = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "The code suggestion has been copied to your clipboard.",
      });
    });
  };

  // Resolve a review
  const resolveReview = () => {
    if (!selectedReview) return;
    
    const updatedReview = {
      ...selectedReview,
      status: 'resolved' as const,
      comments: [
        ...selectedReview.comments,
        {
          id: `comment-${Date.now()}`,
          author: "admin",
          content: "Review completed and marked as resolved.",
          created: new Date().toISOString(),
          type: 'feedback'
        }
      ]
    };
    
    setReviews(prev => 
      prev.map(review => review.id === selectedReview.id ? updatedReview : review)
    );
    setSelectedReview(updatedReview);
    
    toast({
      title: "Review Resolved",
      description: "The code review has been marked as resolved.",
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get comment type icon
  const getCommentTypeIcon = (type: string, isAi: boolean = false) => {
    if (isAi) {
      return <Sparkles className="h-4 w-4 text-purple-400" />;
    }
    
    switch (type) {
      case 'feedback':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'suggestion':
        return <ThumbsUp className="h-4 w-4 text-green-400" />;
      case 'issue':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'question':
        return <Info className="h-4 w-4 text-amber-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get suggestion category badge
  const getSuggestionCategoryBadge = (category: string) => {
    switch (category) {
      case 'performance':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-900/50">Performance</span>;
      case 'style':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-900/20 text-purple-400 border border-purple-900/50">Style</span>;
      case 'bestPractice':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-900/20 text-blue-400 border border-blue-900/50">Best Practice</span>;
      case 'security':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-900/20 text-red-400 border border-red-900/50">Security</span>;
      case 'neoforgeUpdate':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-900/20 text-green-400 border border-green-900/50">NeoForge 1.21.5</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400">Other</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-gray-900 border-gray-700 text-white max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <GitCompare className="h-6 w-6 mr-2 text-red-400" />
            Collaborative Code Review
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Review and improve your code with Claude AI-powered suggestions and team feedback
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-400">Loading reviews...</p>
              </div>
            </div>
          ) : file ? (
            <div className="flex-grow flex">
              {/* Left sidebar - Reviews list */}
              <div className="w-1/3 border-r border-gray-700 overflow-auto pr-2">
                <div className="mb-3 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-400">Code Reviews</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={startCodeReview}
                    disabled={isAnalyzing}
                    className="h-7 px-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">New Review</span>
                  </Button>
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-2">
                    {reviews.map(review => (
                      <Card 
                        key={review.id}
                        className={`p-3 cursor-pointer transition-colors border-gray-700 ${
                          selectedReview?.id === review.id 
                            ? "bg-red-900/20 border-red-900/50" 
                            : "bg-gray-800/30 hover:bg-gray-800/50"
                        }`}
                        onClick={() => setSelectedReview(review)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <FileCode className="h-4 w-4 text-blue-400 mr-1.5" />
                            <h4 className="font-medium text-white truncate">{review.fileName}</h4>
                          </div>
                          {review.status === 'open' ? (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-900/20 text-blue-400">Open</span>
                          ) : review.status === 'resolved' ? (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-900/20 text-green-400">Resolved</span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-900/20 text-red-400">Rejected</span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-400 mb-2">
                          <User className="h-3 w-3 mr-1" />
                          <span>{review.author}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{new Date(review.created).toLocaleDateString()}</span>
                        </div>
                        
                        {review.score !== undefined && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Quality Score:</span>
                              <span className={`text-xs font-medium ${
                                review.score >= 80 ? "text-green-400" :
                                review.score >= 60 ? "text-yellow-400" :
                                "text-red-400"
                              }`}>
                                {review.score}/100
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  review.score >= 80 ? "bg-green-500" :
                                  review.score >= 60 ? "bg-yellow-500" :
                                  "bg-red-500"
                                }`}
                                style={{ width: `${review.score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 bg-gray-800/30 rounded-md border border-gray-700 text-center p-4">
                    <GitCompare className="h-6 w-6 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">No reviews yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={startCodeReview}
                      disabled={isAnalyzing}
                      className="mt-2"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      Start Review
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Main content - Selected review details */}
              <div className="w-2/3 overflow-auto pl-4">
                {selectedReview ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-white">{selectedReview.fileName}</h3>
                        <p className="text-sm text-gray-400">{selectedReview.filePath}</p>
                      </div>
                      
                      {selectedReview.status === 'open' && (
                        <Button 
                          onClick={resolveReview}
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve Review
                        </Button>
                      )}
                    </div>
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-gray-800/50 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="suggestions">
                          AI Suggestions
                          {selectedReview.aiSuggestions && selectedReview.aiSuggestions.length > 0 && (
                            <span className="ml-1.5 bg-blue-900/60 text-blue-300 rounded-full px-1.5 py-0.5 text-[10px]">
                              {selectedReview.aiSuggestions.length}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="comments">
                          Comments
                          <span className="ml-1.5 bg-gray-800 text-gray-300 rounded-full px-1.5 py-0.5 text-[10px]">
                            {selectedReview.comments.length}
                          </span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="pt-4">
                        {/* Review metrics */}
                        {selectedReview.metrics && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Code Quality Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="p-3 bg-gray-800/30 border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-400">Overall Quality</span>
                                  <span className={`text-sm font-medium ${
                                    selectedReview.score >= 80 ? "text-green-400" :
                                    selectedReview.score >= 60 ? "text-yellow-400" :
                                    "text-red-400"
                                  }`}>
                                    {selectedReview.score}/100
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      selectedReview.score >= 80 ? "bg-green-500" :
                                      selectedReview.score >= 60 ? "bg-yellow-500" :
                                      "bg-red-500"
                                    }`}
                                    style={{ width: `${selectedReview.score}%` }}
                                  ></div>
                                </div>
                              </Card>
                              
                              <Card className="p-3 bg-gray-800/30 border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-400">NeoForge Best Practices</span>
                                  <span className={`text-sm font-medium ${
                                    selectedReview.metrics.bestPractices >= 80 ? "text-green-400" :
                                    selectedReview.metrics.bestPractices >= 60 ? "text-yellow-400" :
                                    "text-red-400"
                                  }`}>
                                    {selectedReview.metrics.bestPractices}/100
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      selectedReview.metrics.bestPractices >= 80 ? "bg-green-500" :
                                      selectedReview.metrics.bestPractices >= 60 ? "bg-yellow-500" :
                                      "bg-red-500"
                                    }`}
                                    style={{ width: `${selectedReview.metrics.bestPractices}%` }}
                                  ></div>
                                </div>
                              </Card>
                              
                              <Card className="p-3 bg-gray-800/30 border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-400">Performance</span>
                                  <span className={`text-sm font-medium ${
                                    selectedReview.metrics.performance >= 80 ? "text-green-400" :
                                    selectedReview.metrics.performance >= 60 ? "text-yellow-400" :
                                    "text-red-400"
                                  }`}>
                                    {selectedReview.metrics.performance}/100
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      selectedReview.metrics.performance >= 80 ? "bg-green-500" :
                                      selectedReview.metrics.performance >= 60 ? "bg-yellow-500" :
                                      "bg-red-500"
                                    }`}
                                    style={{ width: `${selectedReview.metrics.performance}%` }}
                                  ></div>
                                </div>
                              </Card>
                              
                              <Card className="p-3 bg-gray-800/30 border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-400">Security</span>
                                  <span className={`text-sm font-medium ${
                                    selectedReview.metrics.security >= 80 ? "text-green-400" :
                                    selectedReview.metrics.security >= 60 ? "text-yellow-400" :
                                    "text-red-400"
                                  }`}>
                                    {selectedReview.metrics.security}/100
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      selectedReview.metrics.security >= 80 ? "bg-green-500" :
                                      selectedReview.metrics.security >= 60 ? "bg-yellow-500" :
                                      "bg-red-500"
                                    }`}
                                    style={{ width: `${selectedReview.metrics.security}%` }}
                                  ></div>
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}
                        
                        {/* Recent activity */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Activity</h4>
                          <div className="space-y-3">
                            {[...selectedReview.comments].reverse().slice(0, 3).map(comment => (
                              <div key={comment.id} className="bg-gray-800/30 rounded-md p-3 border border-gray-700">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center">
                                    {getCommentTypeIcon(comment.type, comment.isAi)}
                                    <span className={`text-sm font-medium ml-1.5 ${comment.isAi ? "text-purple-400" : "text-white"}`}>
                                      {comment.isAi ? "Claude AI" : comment.author}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(comment.created)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                            
                            {selectedReview.comments.length > 3 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full"
                                onClick={() => setActiveTab("comments")}
                              >
                                View All Comments ({selectedReview.comments.length})
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Suggestions preview */}
                        {selectedReview.aiSuggestions && selectedReview.aiSuggestions.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">AI Suggestions</h4>
                            <div className="space-y-3">
                              {selectedReview.aiSuggestions.slice(0, 2).map(suggestion => (
                                <Card 
                                  key={suggestion.id}
                                  className="p-3 bg-gray-800/30 border-gray-700 cursor-pointer hover:bg-gray-800/50"
                                  onClick={() => {
                                    setSelectedSuggestion(suggestion);
                                    setActiveTab("suggestions");
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                      <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                                      <div>
                                        <h5 className="font-medium text-white">{suggestion.title}</h5>
                                        <p className="text-sm text-gray-400 mt-0.5">{suggestion.description}</p>
                                      </div>
                                    </div>
                                    <div>
                                      {getSuggestionCategoryBadge(suggestion.category)}
                                    </div>
                                  </div>
                                </Card>
                              ))}
                              
                              {selectedReview.aiSuggestions.length > 2 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => setActiveTab("suggestions")}
                                >
                                  View All Suggestions ({selectedReview.aiSuggestions.length})
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="suggestions" className="pt-4">
                        {selectedReview.aiSuggestions && selectedReview.aiSuggestions.length > 0 ? (
                          <div className="space-y-4">
                            {/* Selected suggestion details */}
                            {selectedSuggestion ? (
                              <div className="bg-gray-800/30 rounded-md p-4 border border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="flex items-center">
                                      <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                                      <h4 className="font-medium text-white">{selectedSuggestion.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1 ml-6">{selectedSuggestion.description}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedSuggestion(null)}
                                      className="h-7 px-2"
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      <span className="text-xs">Close</span>
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => applySuggestion(selectedSuggestion)}
                                      className="h-7 px-2"
                                    >
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      <span className="text-xs">Apply</span>
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-sm font-medium text-gray-300">Original Code</h5>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copySuggestion(selectedSuggestion.originalCode)}
                                    className="h-6 px-2"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    <span className="text-[10px]">Copy</span>
                                  </Button>
                                </div>
                                <div className="bg-gray-900 rounded-md p-3 overflow-x-auto mb-4">
                                  <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                                    {selectedSuggestion.originalCode}
                                  </pre>
                                </div>
                                
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-sm font-medium text-gray-300">Suggested Code</h5>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copySuggestion(selectedSuggestion.suggestedCode)}
                                    className="h-6 px-2"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    <span className="text-[10px]">Copy</span>
                                  </Button>
                                </div>
                                <div className="bg-gray-900 rounded-md p-3 overflow-x-auto mb-4">
                                  <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                                    {selectedSuggestion.suggestedCode}
                                  </pre>
                                </div>
                                
                                <div className="bg-purple-900/10 rounded-md p-3 border border-purple-900/30">
                                  <h5 className="text-sm font-medium text-purple-400 mb-1">Explanation</h5>
                                  <p className="text-sm text-gray-300">{selectedSuggestion.reason}</p>
                                </div>
                                
                                <div className="flex justify-end mt-4">
                                  <Button 
                                    onClick={() => applySuggestion(selectedSuggestion)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Apply This Suggestion
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {selectedReview.aiSuggestions.map(suggestion => (
                                  <Card 
                                    key={suggestion.id}
                                    className="p-3 bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-start">
                                        <Sparkles className="h-4 w-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                          <h5 className="font-medium text-white">{suggestion.title}</h5>
                                          <p className="text-sm text-gray-400 mt-0.5">{suggestion.description}</p>
                                          <div className="mt-2">
                                            {getSuggestionCategoryBadge(suggestion.category)}
                                          </div>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          applySuggestion(suggestion);
                                        }}
                                        className="h-7"
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Apply
                                      </Button>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 text-center">
                            <Sparkles className="h-8 w-8 text-gray-500 mb-2" />
                            <h4 className="text-white font-medium mb-1">No AI Suggestions</h4>
                            <p className="text-gray-400 max-w-md">
                              Claude hasn't generated any code suggestions for this file yet.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => {
                                // Simulate generating suggestions
                                setIsAnalyzing(true);
                                setTimeout(() => {
                                  if (selectedReview) {
                                    // Add a sample suggestion
                                    const newSuggestion: CodeSuggestion = {
                                      id: `suggestion-${Date.now()}`,
                                      title: "Optimize Resource Loading",
                                      description: "Improve performance by using lazy initialization for resources",
                                      originalCode: `private void loadResources() {
    this.textures = loadAllTextures();
    this.models = loadAllModels();
    this.sounds = loadAllSounds();
}`,
                                      suggestedCode: `private Map<String, Texture> textures;
private Map<String, Model> models;
private Map<String, Sound> sounds;

private Map<String, Texture> getTextures() {
    if (textures == null) {
        textures = loadAllTextures();
    }
    return textures;
}

private Map<String, Model> getModels() {
    if (models == null) {
        models = loadAllModels();
    }
    return models;
}

private Map<String, Sound> getSounds() {
    if (sounds == null) {
        sounds = loadAllSounds();
    }
    return sounds;
}`,
                                      reason: "The original code eagerly loads all resources, which can cause unnecessary memory usage and startup delay. This optimization uses lazy initialization to load resources only when they're actually needed.",
                                      category: 'performance'
                                    };
                                    
                                    const updatedReview = {
                                      ...selectedReview,
                                      aiSuggestions: [
                                        ...(selectedReview.aiSuggestions || []),
                                        newSuggestion
                                      ],
                                      comments: [
                                        ...selectedReview.comments,
                                        {
                                          id: `comment-${Date.now()}`,
                                          author: "claude",
                                          content: "I've analyzed the code and generated a new optimization suggestion for resource loading.",
                                          created: new Date().toISOString(),
                                          type: 'feedback',
                                          isAi: true
                                        }
                                      ]
                                    };
                                    
                                    setReviews(prev => 
                                      prev.map(review => review.id === selectedReview.id ? updatedReview : review)
                                    );
                                    setSelectedReview(updatedReview);
                                    setSelectedSuggestion(newSuggestion);
                                  }
                                  setIsAnalyzing(false);
                                }, 2000);
                              }}
                            >
                              {isAnalyzing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <RefreshCcw className="h-4 w-4 mr-1" />
                              )}
                              Generate Suggestions
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="comments" className="pt-4">
                        <div className="space-y-4">
                          {/* Comment list */}
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {selectedReview.comments.length > 0 ? (
                              selectedReview.comments.map(comment => (
                                <div 
                                  key={comment.id} 
                                  className={`p-3 rounded-md border ${
                                    comment.isAi
                                      ? "bg-purple-900/10 border-purple-900/30"
                                      : "bg-gray-800/30 border-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      {getCommentTypeIcon(comment.type, comment.isAi)}
                                      <span className={`text-sm font-medium ml-1.5 ${comment.isAi ? "text-purple-400" : "text-white"}`}>
                                        {comment.isAi ? "Claude AI" : comment.author}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatTimestamp(comment.created)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 mt-1">
                                    {comment.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-400 py-4">
                                No comments yet
                              </div>
                            )}
                          </div>
                          
                          {/* Add comment form */}
                          {selectedReview.status === 'open' && (
                            <div className="border-t border-gray-700 pt-4">
                              <Label htmlFor="comment-type" className="text-sm text-gray-400 mb-1.5 block">Comment Type</Label>
                              <Select value={commentType} onValueChange={setCommentType} className="mb-3">
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                  <SelectValue placeholder="Select comment type" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="feedback">General Feedback</SelectItem>
                                  <SelectItem value="suggestion">Improvement Suggestion</SelectItem>
                                  <SelectItem value="issue">Issue Report</SelectItem>
                                  <SelectItem value="question">Question</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Add your comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="min-h-[100px] bg-gray-800 border-gray-700"
                                />
                                <div className="flex justify-end">
                                  <Button 
                                    onClick={addComment}
                                    disabled={!newComment.trim()}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Add Comment
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <GitCompare className="h-10 w-10 text-gray-500 mb-3" />
                    <h3 className="text-lg font-medium text-white mb-1">No Review Selected</h3>
                    <p className="text-gray-400 max-w-md mb-4">
                      Select a review from the list or create a new code review to get started.
                    </p>
                    <Button 
                      onClick={startCodeReview}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      Start New Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
              <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No File Selected</h3>
              <p className="text-gray-400 max-w-md">
                Please open a file to review. Code reviews are associated with specific files in your project.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}