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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings,
  CpuIcon,
  Box,
  Database,
  Flame,
  AreaChart,
  BarChart4,
  Activity,
  Search,
  ArrowRight,
  AlertCircle,
  Play,
  Pause,
  RefreshCcw,
  Zap,
  HelpCircle,
  Loader2,
  Clock,
  CheckCircle2,
  PieChart,
  Lightbulb,
  Check,
  X,
  HardDrive,
  Bug
} from "lucide-react";

interface MinecraftSpecificDebuggingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
  history?: number[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
  stackTrace?: string;
}

interface DebugIssue {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'ignored';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'memory' | 'rendering' | 'networking' | 'logic';
  impact: string;
  recommendation: string;
  affectedCode?: string;
}

export default function MinecraftSpecificDebugging({
  open,
  onOpenChange,
  projectId,
}: MinecraftSpecificDebuggingProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [debugIssues, setDebugIssues] = useState<DebugIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<DebugIssue | null>(null);
  const [gameState, setGameState] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [logFilter, setLogFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [entityCount, setEntityCount] = useState(50);

  // Load data when component mounts
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      
      // In a real implementation, this would fetch data from an API
      setTimeout(() => {
        // Sample performance metrics
        const sampleMetrics: PerformanceMetric[] = [
          {
            name: "FPS",
            value: 42,
            unit: "fps",
            status: 'good',
            threshold: {
              warning: 30,
              critical: 15
            },
            history: [35, 40, 38, 42, 45, 41, 42, 44, 43, 42]
          },
          {
            name: "TPS",
            value: 18.5,
            unit: "tps",
            status: 'warning',
            threshold: {
              warning: 19,
              critical: 15
            },
            history: [20, 19.8, 19.5, 19, 18.7, 18.5, 18.6, 18.5, 18.4, 18.5]
          },
          {
            name: "RAM Usage",
            value: 2.8,
            unit: "GB",
            status: 'good',
            threshold: {
              warning: 3.5,
              critical: 4
            },
            history: [2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 2.8, 2.8, 2.8, 2.8]
          },
          {
            name: "Chunk Loading",
            value: 15,
            unit: "ms",
            status: 'excellent',
            threshold: {
              warning: 50,
              critical: 100
            },
            history: [18, 17, 16, 15, 14, 15, 15, 14, 15, 15]
          },
          {
            name: "Entity Tick Time",
            value: 12,
            unit: "ms",
            status: 'excellent',
            threshold: {
              warning: 20,
              critical: 40
            },
            history: [10, 11, 12, 12, 13, 12, 12, 11, 12, 12]
          },
          {
            name: "Block Entity Tick",
            value: 8,
            unit: "ms",
            status: 'excellent',
            threshold: {
              warning: 15,
              critical: 30
            },
            history: [7, 7, 8, 8, 8, 9, 8, 8, 8, 8]
          }
        ];
        
        // Sample log entries
        const sampleLogs: LogEntry[] = [
          {
            id: "log-1",
            timestamp: new Date(Date.now() - 60000).toISOString(),
            level: 'INFO',
            message: "Loaded 64 entity textures",
            source: "TextureManager"
          },
          {
            id: "log-2",
            timestamp: new Date(Date.now() - 55000).toISOString(),
            level: 'INFO',
            message: "Registered 12 custom blocks",
            source: "CustomMod"
          },
          {
            id: "log-3",
            timestamp: new Date(Date.now() - 50000).toISOString(),
            level: 'WARN',
            message: "CustomSword.properties may not be compatible with component system",
            source: "NeoForge"
          },
          {
            id: "log-4",
            timestamp: new Date(Date.now() - 45000).toISOString(),
            level: 'ERROR',
            message: "Failed to load custom model for 'custom:special_sword'",
            source: "ModelManager",
            stackTrace: "java.lang.NullPointerException: Cannot invoke \"net.minecraft.client.resources.model.ModelResourceLocation.toString()\" because the return value of \"net.minecraft.client.resources.model.ModelResourceLocation.getVariant()\" is null\n\tat net.minecraft.client.resources.model.ModelBakery.loadModel(ModelBakery.java:738)\n\tat com.example.custommod.client.ModelRegistry.registerSpecialModel(ModelRegistry.java:42)"
          },
          {
            id: "log-5",
            timestamp: new Date(Date.now() - 40000).toISOString(),
            level: 'INFO',
            message: "World loaded in 2.3 seconds",
            source: "WorldLoader"
          },
          {
            id: "log-6",
            timestamp: new Date(Date.now() - 35000).toISOString(),
            level: 'DEBUG',
            message: "Rendering 326 entities in view distance",
            source: "EntityRenderer"
          },
          {
            id: "log-7",
            timestamp: new Date(Date.now() - 30000).toISOString(),
            level: 'WARN',
            message: "TPS dropping below 19, 247 entities in loaded chunks",
            source: "ServerTickHandler"
          },
          {
            id: "log-8",
            timestamp: new Date(Date.now() - 25000).toISOString(),
            level: 'INFO',
            message: "Player 'testuser' joined the game",
            source: "ServerGamePacketListenerImpl"
          }
        ];
        
        // Sample debug issues
        const sampleIssues: DebugIssue[] = [
          {
            id: "issue-1",
            title: "TPS drop with increased entity count",
            description: "Server TPS drops below 19 when more than 200 entities are loaded in chunks.",
            status: 'active',
            severity: 'medium',
            category: 'performance',
            impact: "Server performance degradation affecting all players, potentially causing lag and gameplay disruption.",
            recommendation: "Optimize entity tick methods to reduce processing time. Consider implementing entity culling or sleeping mechanism for distant entities.",
            affectedCode: `@Override
public void tick() {
    super.tick();
    
    // Inefficient code that runs every tick regardless of entity distance
    for (BlockPos pos : surroundingBlocks) {
        level.getBlockState(pos); // Expensive operation done too frequently
    }
    
    // More processing...
}`
          },
          {
            id: "issue-2",
            title: "Memory leak in custom block entity renderer",
            description: "The custom block entity renderer is creating new instances of temporary objects on every frame without proper disposal.",
            status: 'active',
            severity: 'high',
            category: 'memory',
            impact: "Gradual increase in memory usage leading to potential out-of-memory errors during extended gameplay sessions.",
            recommendation: "Use object pooling or reuse existing instances instead of creating new objects every frame. Move object creation out of the render loop.",
            affectedCode: `@Override
public void render(CustomBlockEntity blockEntity, float partialTicks, PoseStack poseStack, 
                 MultiBufferSource bufferSource, int combinedLight, int combinedOverlay) {
    // New model created every frame - memory leak
    Model model = new Model(modelData);
    
    // New temporary transformation matrices created every frame
    Matrix4f transformation = new Matrix4f();
    transformation.setIdentity();
    
    // Render with new resources each frame
    renderModel(model, transformation, bufferSource);
}`
          },
          {
            id: "issue-3",
            title: "Incompatible SwordItem inheritance",
            description: "The mod uses inheritance from SwordItem which is incompatible with NeoForge 1.21.5's component-based system.",
            status: 'active',
            severity: 'high',
            category: 'logic',
            impact: "Mod will not function correctly on NeoForge 1.21.5, causing runtime errors or missing functionality.",
            recommendation: "Refactor to use the component-based approach. Replace SwordItem inheritance with Item and appropriate components.",
            affectedCode: `// Current implementation - incompatible with NeoForge 1.21.5
public class CustomSword extends SwordItem {
    public CustomSword() {
        super(Tiers.IRON, 3, -2.4F, new Item.Properties());
    }
    
    // Methods...
}`
          },
          {
            id: "issue-4",
            title: "Excessive render calls for custom particles",
            description: "Custom particle system is making redundant render calls for particles outside the view frustum.",
            status: 'resolved',
            severity: 'medium',
            category: 'rendering',
            impact: "Wasted GPU resources and reduced framerate, especially in scenes with many particles.",
            recommendation: "Implement frustum culling for particles and batch similar particles together to reduce draw calls.",
            affectedCode: `// Fixed code, previously was rendering all particles without culling
for (CustomParticle particle : particles) {
    // Only render particles that are visible
    if (frustum.isVisible(particle.getBoundingBox())) {
        renderer.render(particle);
    }
}`
          }
        ];
        
        setPerformanceMetrics(sampleMetrics);
        setLogEntries(sampleLogs);
        setDebugIssues(sampleIssues);
        setIsLoading(false);
      }, 1500);
    }
  }, [open]);

  // Filter logs based on level and search query
  const filteredLogs = logEntries.filter(log => {
    const matchesLevel = logFilter === "all" || log.level === logFilter;
    const matchesSearch = searchQuery === "" || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLevel && matchesSearch;
  });

  // Start the game simulation
  const startSimulation = () => {
    setGameState('running');
    setIsRunning(true);
    
    // In a real implementation, this would start the game or connect to a running instance
    toast({
      title: "Simulation Started",
      description: "Now monitoring performance and collecting debug data.",
    });
    
    // Simulate updating metrics over time
    const interval = setInterval(() => {
      if (gameState !== 'running') {
        clearInterval(interval);
        return;
      }
      
      // Update metrics with slight variations
      setPerformanceMetrics(prev => 
        prev.map(metric => {
          // Generate a small random variation
          const variation = (Math.random() * 0.2 - 0.1) * metric.value;
          let newValue = Math.max(0, metric.value + variation);
          
          // Special case for TPS that gradually decreases with more entities
          if (metric.name === "TPS" && entityCount > 200) {
            newValue = Math.max(10, 20 - (entityCount - 200) / 50);
          }
          
          // Update status based on thresholds
          let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
          if (metric.threshold) {
            if (metric.name === "FPS" || metric.name === "TPS") {
              // For metrics where higher is better
              if (newValue < metric.threshold.critical) {
                status = 'critical';
              } else if (newValue < metric.threshold.warning) {
                status = 'warning';
              } else if (newValue > metric.threshold.warning * 1.5) {
                status = 'excellent';
              } else {
                status = 'good';
              }
            } else {
              // For metrics where lower is better
              if (newValue > metric.threshold.critical) {
                status = 'critical';
              } else if (newValue > metric.threshold.warning) {
                status = 'warning';
              } else if (newValue < metric.threshold.warning * 0.5) {
                status = 'excellent';
              } else {
                status = 'good';
              }
            }
          }
          
          // Update history
          const history = [...(metric.history || []), newValue].slice(-10);
          
          return {
            ...metric,
            value: Number(newValue.toFixed(1)),
            status,
            history
          };
        })
      );
      
      // Add new log entries occasionally
      if (Math.random() > 0.7) {
        const newLog: LogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: ['INFO', 'WARN', 'DEBUG', 'ERROR'][Math.floor(Math.random() * 4)] as 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
          message: getRandomLogMessage(),
          source: getRandomLogSource()
        };
        
        setLogEntries(prev => [newLog, ...prev]);
      }
    }, 2000 / simulationSpeed); // Update frequency depends on simulation speed
    
    return () => clearInterval(interval);
  };

  // Pause the game simulation
  const pauseSimulation = () => {
    setGameState('paused');
    setIsRunning(false);
    
    toast({
      title: "Simulation Paused",
      description: "Performance monitoring paused. Data collection stopped.",
    });
  };

  // Stop the game simulation
  const stopSimulation = () => {
    setGameState('stopped');
    setIsRunning(false);
    
    toast({
      title: "Simulation Stopped",
      description: "Debug session ended. All collected data preserved.",
    });
  };

  // Analyze the current performance data for issues
  const analyzePerformance = () => {
    setIsAnalyzing(true);
    
    // In a real implementation, this would call Claude API to analyze the data
    setTimeout(() => {
      // Add new issues based on current metrics
      const tpsMetric = performanceMetrics.find(m => m.name === "TPS");
      const ramMetric = performanceMetrics.find(m => m.name === "RAM Usage");
      
      const newIssues: DebugIssue[] = [];
      
      if (tpsMetric && tpsMetric.status === 'warning' || tpsMetric?.status === 'critical') {
        newIssues.push({
          id: `issue-${Date.now()}-1`,
          title: "Critical TPS drop detected",
          description: `Server TPS has dropped to ${tpsMetric.value} TPS, which is below the acceptable threshold of 19 TPS.`,
          status: 'active',
          severity: 'high',
          category: 'performance',
          impact: "Server lag affecting all players, potentially causing gameplay disruption and desynchronization issues.",
          recommendation: "Reduce the number of entities or optimize entity processing. Consider implementing lazy chunk loading or using more efficient data structures for world storage."
        });
      }
      
      if (ramMetric && ramMetric.value > 3.5) {
        newIssues.push({
          id: `issue-${Date.now()}-2`,
          title: "High memory usage",
          description: `RAM usage has reached ${ramMetric.value} GB, which is approaching the warning threshold.`,
          status: 'active',
          severity: 'medium',
          category: 'memory',
          impact: "Potential memory pressure that could lead to garbage collection pauses or out-of-memory errors during extended gameplay.",
          recommendation: "Profile memory usage to identify leaks or inefficient object allocation. Consider implementing object pooling for frequently created and destroyed objects."
        });
      }
      
      if (newIssues.length > 0) {
        setDebugIssues(prev => [...newIssues, ...prev]);
        
        toast({
          title: "New Issues Detected",
          description: `Found ${newIssues.length} new potential issues in your mod.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "No new issues detected in the current performance data.",
        });
      }
      
      setIsAnalyzing(false);
    }, 3000);
  };

  // Handle resolving an issue
  const resolveIssue = (issue: DebugIssue) => {
    const updatedIssues = debugIssues.map(i => 
      i.id === issue.id ? { ...i, status: 'resolved' as const } : i
    );
    
    setDebugIssues(updatedIssues);
    setSelectedIssue(issue.id === selectedIssue?.id ? { ...issue, status: 'resolved' as const } : selectedIssue);
    
    toast({
      title: "Issue Resolved",
      description: `"${issue.title}" has been marked as resolved.`,
    });
  };

  // Handle ignoring an issue
  const ignoreIssue = (issue: DebugIssue) => {
    const updatedIssues = debugIssues.map(i => 
      i.id === issue.id ? { ...i, status: 'ignored' as const } : i
    );
    
    setDebugIssues(updatedIssues);
    setSelectedIssue(issue.id === selectedIssue?.id ? { ...issue, status: 'ignored' as const } : selectedIssue);
    
    toast({
      title: "Issue Ignored",
      description: `"${issue.title}" has been marked as ignored.`,
    });
  };

  // Helper functions for random log generation
  const getRandomLogMessage = () => {
    const messages = [
      "Loaded 32 chunks in 150ms",
      "Player moved to dimension minecraft:the_nether",
      "Spawned 5 zombies in chunk [12, 8]",
      "Resource pack reload complete",
      "Saved world data",
      "Unloaded 16 distant chunks",
      "Processed 24 block updates",
      "Updated lighting for region [-2, 3]",
      "Entity count: " + entityCount,
      "Processing mod interactions",
      "CustomSword.use() called by player",
      "Checking recipe compatibility"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getRandomLogSource = () => {
    const sources = [
      "ChunkManager",
      "EntityProcessor",
      "WorldGen",
      "CustomMod",
      "PlayerController",
      "ServerTickHandler",
      "ResourceManager",
      "BlockUpdater"
    ];
    
    return sources[Math.floor(Math.random() * sources.length)];
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return "text-green-400";
      case 'good':
        return "text-blue-400";
      case 'warning':
        return "text-yellow-400";
      case 'critical':
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return "text-blue-400";
      case 'medium':
        return "text-yellow-400";
      case 'high':
        return "text-orange-400";
      case 'critical':
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-900/20 text-red-400 border border-red-900/50">Active</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-900/20 text-green-400 border border-green-900/50">Resolved</span>;
      case 'ignored':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-700">Ignored</span>;
      default:
        return null;
    }
  };

  // Get log level badge
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'INFO':
        return <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-900/20 text-blue-400 border border-blue-900/50">INFO</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 text-xs rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-900/50">WARN</span>;
      case 'ERROR':
        return <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-900/20 text-red-400 border border-red-900/50">ERROR</span>;
      case 'DEBUG':
        return <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-900/20 text-purple-400 border border-purple-900/50">DEBUG</span>;
      default:
        return null;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <AreaChart className="h-4 w-4 text-yellow-400" />;
      case 'memory':
        return <Database className="h-4 w-4 text-blue-400" />;
      case 'rendering':
        return <PieChart className="h-4 w-4 text-purple-400" />;
      case 'networking':
        return <Activity className="h-4 w-4 text-green-400" />;
      case 'logic':
        return <HardDrive className="h-4 w-4 text-red-400" />;
      default:
        return <Bug className="h-4 w-4 text-gray-400" />;
    }
  };

  // Render a chart for metric history
  const renderMetricChart = (history?: number[]) => {
    if (!history || history.length === 0) return null;
    
    const max = Math.max(...history) * 1.1; // Add 10% margin
    const height = 40;
    
    return (
      <div className="h-10 w-full mt-1">
        <svg width="100%" height={height} className="overflow-visible">
          {history.map((value, index) => {
            const x = (index / (history.length - 1)) * 100;
            const y = height - (value / max) * height;
            
            return (
              <React.Fragment key={index}>
                {index > 0 && history[index - 1] !== undefined && (
                  <line
                    x1={((index - 1) / (history.length - 1)) * 100 + "%"}
                    y1={height - (history[index - 1] / max) * height}
                    x2={x + "%"}
                    y2={y}
                    stroke="#4b5563"
                    strokeWidth="1.5"
                  />
                )}
                <circle
                  cx={x + "%"}
                  cy={y}
                  r="2"
                  fill="#9ca3af"
                />
              </React.Fragment>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-5xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <Settings className="h-6 w-6 mr-2 text-green-400" />
            Minecraft-Specific Debugging
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Analyze in-game behavior, performance, and compatibility
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden flex flex-col">
          {/* Game Controls */}
          <div className="bg-gray-800/30 p-3 rounded-md border border-gray-700 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  gameState === 'running' ? 'bg-green-500 animate-pulse' : 
                  gameState === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-white">
                  {gameState === 'running' ? 'Game Running' : 
                   gameState === 'paused' ? 'Game Paused' : 'Game Stopped'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {gameState === 'stopped' ? (
                  <Button 
                    size="sm"
                    onClick={startSimulation}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Game
                  </Button>
                ) : (
                  <>
                    {gameState === 'running' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={pauseSimulation}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={startSimulation}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={stopSimulation}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </>
                )}
                
                <Button 
                  variant={isAnalyzing ? "default" : "outline"}
                  size="sm"
                  onClick={analyzePerformance}
                  disabled={isAnalyzing}
                  className={isAnalyzing ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  Analyze
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <Label htmlFor="sim-speed" className="text-xs text-gray-400 mb-1 block">Simulation Speed</Label>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">1x</span>
                  <Slider 
                    id="sim-speed"
                    value={[simulationSpeed]} 
                    onValueChange={(value) => setSimulationSpeed(value[0])}
                    min={0.5}
                    max={3}
                    step={0.5}
                    className="flex-grow"
                  />
                  <span className="text-xs text-gray-400 ml-2">3x</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="entity-count" className="text-xs text-gray-400 mb-1 block">Entity Count</Label>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">50</span>
                  <Slider 
                    id="entity-count"
                    value={[entityCount]} 
                    onValueChange={(value) => setEntityCount(value[0])}
                    min={50}
                    max={500}
                    step={50}
                    className="flex-grow"
                  />
                  <span className="text-xs text-gray-400 ml-2">500</span>
                </div>
              </div>
              
              <div className="flex items-end justify-end">
                <span className={`text-sm font-medium ${
                  entityCount > 300 ? "text-red-400" :
                  entityCount > 200 ? "text-yellow-400" :
                  "text-green-400"
                }`}>
                  {entityCount} entities
                </span>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-2" />
                <p className="text-gray-400">Loading debug data...</p>
              </div>
            </div>
          ) : (
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="bg-gray-800/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="issues">
                  Issues
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                    debugIssues.filter(i => i.status === 'active').length > 0
                      ? "bg-red-900/60 text-red-300"
                      : "bg-gray-800 text-gray-300"
                  }`}>
                    {debugIssues.filter(i => i.status === 'active').length}
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-grow overflow-auto">
                <TabsContent value="overview" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Metrics */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Key Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {performanceMetrics.slice(0, 4).map(metric => (
                          <Card key={metric.name} className="p-3 bg-gray-800/30 border-gray-700">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-400">{metric.name}</span>
                              <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                                {metric.value} {metric.unit}
                              </span>
                            </div>
                            {renderMetricChart(metric.history)}
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Active Issues */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Active Issues</h3>
                      <div className="space-y-3">
                        {debugIssues.filter(issue => issue.status === 'active').length > 0 ? (
                          debugIssues
                            .filter(issue => issue.status === 'active')
                            .slice(0, 3)
                            .map(issue => (
                              <Card 
                                key={issue.id}
                                className="p-3 bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  setCurrentTab("issues");
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start">
                                    <AlertCircle className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 ${getSeverityColor(issue.severity)}`} />
                                    <div>
                                      <h4 className="font-medium text-white">{issue.title}</h4>
                                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{issue.description}</p>
                                    </div>
                                  </div>
                                  <div>
                                    {getCategoryIcon(issue.category)}
                                  </div>
                                </div>
                              </Card>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-32 bg-gray-800/20 rounded-md border border-gray-700 text-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                            <p className="text-white font-medium">No active issues</p>
                            <p className="text-sm text-gray-400">All detected issues have been resolved</p>
                          </div>
                        )}
                        
                        {debugIssues.filter(issue => issue.status === 'active').length > 3 && (
                          <Button 
                            variant="ghost" 
                            className="w-full"
                            onClick={() => setCurrentTab("issues")}
                          >
                            View All Issues ({debugIssues.filter(issue => issue.status === 'active').length})
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Recent Logs */}
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Logs</h3>
                      <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
                        <div className="max-h-[200px] overflow-y-auto">
                          <div className="divide-y divide-gray-700">
                            {logEntries.slice(0, 8).map(log => (
                              <div key={log.id} className="p-2.5 flex items-start">
                                <div className="mr-3 mt-0.5">
                                  {getLogLevelBadge(log.level)}
                                </div>
                                <div className="flex-grow">
                                  <p className="text-sm text-gray-300">{log.message}</p>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span className="mr-2">{log.source}</span>
                                    <span>{formatTimestamp(log.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-2 border-t border-gray-700 bg-gray-800/50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setCurrentTab("logs")}
                          >
                            View All Logs
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="performance" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {performanceMetrics.map(metric => (
                      <Card key={metric.name} className="p-4 bg-gray-800/30 border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-white">{metric.name}</h4>
                          <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                            {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-2xl font-bold text-white">{metric.value}</span>
                            <span className="text-gray-400 ml-1">{metric.unit}</span>
                          </div>
                          
                          {metric.threshold && (
                            <div className="text-xs text-gray-400">
                              <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                                <span>Warning: {metric.threshold.warning} {metric.unit}</span>
                              </div>
                              <div className="flex items-center mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                                <span>Critical: {metric.threshold.critical} {metric.unit}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="h-[100px]">
                          {/* Simple line chart */}
                          {metric.history && metric.history.length > 0 && (
                            <svg width="100%" height="100%" className="overflow-visible">
                              {/* Draw horizontal grid lines */}
                              {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
                                const y = 100 - percent * 100;
                                return (
                                  <line
                                    key={i}
                                    x1="0"
                                    y1={`${y}%`}
                                    x2="100%"
                                    y2={`${y}%`}
                                    stroke="#374151"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                  />
                                );
                              })}
                              
                              {/* Draw the actual chart */}
                              {metric.history && metric.history.length > 0 && (
                                <polyline
                                  points={metric.history.map((value, index) => {
                                    const max = Math.max(...metric.history) * 1.1; // Add 10% margin
                                    const x = (index / (metric.history.length - 1)) * 100;
                                    const y = 100 - (value / max) * 100;
                                    return `${x},${y}`;
                                  }).join(' ')}
                                  fill="none"
                                  stroke={
                                    metric.status === 'excellent' ? "#10b981" :
                                    metric.status === 'good' ? "#3b82f6" :
                                    metric.status === 'warning' ? "#f59e0b" :
                                    "#ef4444"
                                  }
                                  strokeWidth="2"
                                />
                              )}
                              
                              {/* Draw points on the line */}
                              {metric.history && metric.history.length > 0 && metric.history.map((value, index) => {
                                const max = Math.max(...metric.history) * 1.1;
                                const x = (index / (metric.history.length - 1)) * 100;
                                const y = 100 - (value / max) * 100;
                                return (
                                  <circle
                                    key={index}
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="3"
                                    fill={
                                      metric.status === 'excellent' ? "#10b981" :
                                      metric.status === 'good' ? "#3b82f6" :
                                      metric.status === 'warning' ? "#f59e0b" :
                                      "#ef4444"
                                    }
                                  />
                                );
                              })}
                            </svg>
                          )}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-400 flex justify-between">
                          <span>10 seconds ago</span>
                          <span>Now</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="bg-blue-900/10 border border-blue-900/30 rounded-md p-4">
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-400 mb-1">Performance Insights</h4>
                        <p className="text-sm text-gray-300">
                          {entityCount > 300 ? 
                            "Server is experiencing significant performance issues due to high entity count. Consider implementing entity culling or reducing the number of entities." :
                            entityCount > 200 ?
                            "TPS is dropping below optimal levels. This may be related to the number of entities currently loaded." :
                            "Overall performance is good. The game is running efficiently with the current configuration."
                          }
                        </p>
                        {entityCount > 200 && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-blue-400 mb-1">Recommendations:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                              <li>Implement entity sleeping for distant entities</li>
                              <li>Optimize entity AI routines to reduce processing time</li>
                              <li>Consider batching similar operations to improve performance</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="logs" className="pt-4">
                  <div className="px-4 pb-2 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Select value={logFilter} onValueChange={setLogFilter}>
                        <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="INFO">Info</SelectItem>
                          <SelectItem value="WARN">Warning</SelectItem>
                          <SelectItem value="ERROR">Error</SelectItem>
                          <SelectItem value="DEBUG">Debug</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="relative w-56">
                        <Input
                          placeholder="Search logs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 bg-gray-800 border-gray-700"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setLogFilter("all");
                        setSearchQuery("");
                      }}
                      disabled={logFilter === "all" && searchQuery === ""}
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="px-4 mt-2">
                    <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto">
                        <div className="divide-y divide-gray-700">
                          {filteredLogs.length > 0 ? (
                            filteredLogs.map(log => (
                              <div key={log.id} className="p-3 hover:bg-gray-800/50">
                                <div className="flex items-start">
                                  <div className="mr-3 mt-0.5">
                                    {getLogLevelBadge(log.level)}
                                  </div>
                                  <div className="flex-grow">
                                    <p className="text-sm text-gray-300">{log.message}</p>
                                    {log.stackTrace && (
                                      <div className="mt-2 bg-gray-900 rounded-md p-2 overflow-x-auto">
                                        <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                                          {log.stackTrace}
                                        </pre>
                                      </div>
                                    )}
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <span className="mr-2">{log.source}</span>
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{formatTimestamp(log.timestamp)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <HelpCircle className="h-8 w-8 text-gray-500 mb-2" />
                              <p className="text-gray-400">No logs match your filters</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="issues" className="flex md:flex-row flex-col h-full overflow-hidden">
                  <div className="w-full md:w-2/5 md:border-r border-gray-700 overflow-auto p-4">
                    <div className="mb-3 flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-300">Detected Issues</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={analyzePerformance}
                        disabled={isAnalyzing}
                        className="h-7 px-2"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                        )}
                        <span className="text-xs">Analyze</span>
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {debugIssues.map(issue => (
                        <Card 
                          key={issue.id}
                          className={`p-3 cursor-pointer transition-colors border-gray-700 hover:bg-gray-800/50 ${
                            selectedIssue?.id === issue.id ? "bg-blue-900/20 border-blue-900/50" : "bg-gray-800/30"
                          }`}
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <AlertCircle className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 ${getSeverityColor(issue.severity)}`} />
                              <div>
                                <h4 className="font-medium text-white">{issue.title}</h4>
                                <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{issue.description}</p>
                              </div>
                            </div>
                            <div>
                              {getStatusBadge(issue.status)}
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-2 pl-6">
                            <div className="flex items-center text-xs text-gray-500 mr-3">
                              <span className={`mr-1 font-medium ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                              </span>
                              severity
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              {getCategoryIcon(issue.category)}
                              <span className="ml-1">
                                {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {debugIssues.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 bg-gray-800/20 rounded-md border border-gray-700 text-center p-4">
                          <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                          <p className="text-white font-medium">No issues detected</p>
                          <p className="text-sm text-gray-400">Your mod seems to be running smoothly</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-3/5 p-4 overflow-auto">
                    {selectedIssue ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-medium text-white">{selectedIssue.title}</h3>
                            {getStatusBadge(selectedIssue.status)}
                          </div>
                          <p className="text-gray-300">{selectedIssue.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-3 bg-gray-800/30 border-gray-700">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Severity</h4>
                            <div className="flex items-center">
                              <AlertCircle className={`h-5 w-5 mr-2 ${getSeverityColor(selectedIssue.severity)}`} />
                              <span className={`font-medium ${getSeverityColor(selectedIssue.severity)}`}>
                                {selectedIssue.severity.charAt(0).toUpperCase() + selectedIssue.severity.slice(1)}
                              </span>
                            </div>
                          </Card>
                          
                          <Card className="p-3 bg-gray-800/30 border-gray-700">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Category</h4>
                            <div className="flex items-center">
                              {getCategoryIcon(selectedIssue.category)}
                              <span className="ml-2 capitalize">{selectedIssue.category}</span>
                            </div>
                          </Card>
                        </div>
                        
                        <Card className="p-3 bg-gray-800/30 border-gray-700">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Impact</h4>
                          <p className="text-sm text-gray-300">{selectedIssue.impact}</p>
                        </Card>
                        
                        <Card className="p-3 bg-green-900/10 border-green-900/30">
                          <h4 className="text-sm font-medium text-green-400 mb-2">Recommendation</h4>
                          <p className="text-sm text-gray-300">{selectedIssue.recommendation}</p>
                        </Card>
                        
                        {selectedIssue.affectedCode && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Affected Code</h4>
                            <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                              <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                                {selectedIssue.affectedCode}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        {selectedIssue.status === 'active' && (
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button 
                              variant="outline" 
                              onClick={() => ignoreIssue(selectedIssue)}
                            >
                              Ignore Issue
                            </Button>
                            <Button 
                              onClick={() => resolveIssue(selectedIssue)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark as Resolved
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <AlertCircle className="h-12 w-12 text-gray-500 mb-3" />
                        <h3 className="text-lg font-medium text-white mb-1">No Issue Selected</h3>
                        <p className="text-gray-400 max-w-md">
                          Select an issue from the list to view details and recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}