import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bug, CheckCircle, AlertTriangle, AlertCircle, CheckSquare, ArrowRight, Copy, Clipboard, Zap, FileText } from "lucide-react";

interface InteractiveErrorDebuggingProps {
  projectId: number;
}

interface ProjectError {
  id: string;
  timestamp: string;
  type: 'compile' | 'runtime' | 'gradle' | 'warning';
  message: string;
  stackTrace?: string;
  source?: string;
  lineNumber?: number;
  fileName?: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  status: 'active' | 'fixed' | 'ignored';
  recommendation?: string;
  fixedCode?: string;
}

export default function InteractiveErrorDebugging({ projectId }: InteractiveErrorDebuggingProps) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<ProjectError[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ProjectError[]>([]);
  const [selectedError, setSelectedError] = useState<ProjectError | null>(null);
  const [errorFilter, setErrorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [isFixDialogOpen, setIsFixDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch errors on component mount
  useEffect(() => {
    // In a real implementation, this would fetch actual errors from an API
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample error data
      const sampleErrors: ProjectError[] = [
        {
          id: "err-1",
          timestamp: new Date().toISOString(),
          type: 'compile',
          message: "Cannot resolve symbol 'DeferredRegister'",
          stackTrace: "com.example.mod.init.ModItems.java:15: error: cannot find symbol\npublic static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MODID);\n                                                   ^\n  symbol:   variable DeferredRegister\n  location: class ModItems",
          source: "ModItems.java",
          lineNumber: 15,
          fileName: "ModItems.java",
          severity: 'error',
          status: 'active',
          recommendation: "In NeoForge 1.21.5, the DeferredRegister system has been replaced with ComponentRegistry. Update your registration code to use the new component-based system.",
          fixedCode: "// Before: \npublic static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MODID);\n\n// After:\nprivate static final ResourceKey<Registry<Item>> ITEMS = ResourceKey.createRegistryKey(new ResourceLocation(\"minecraft\", \"item\"));\n\npublic static void registerItems(ComponentRegistry registry) {\n    registry.register(registration -> {\n        // Register items here\n    });\n}"
        },
        {
          id: "err-2",
          timestamp: new Date().toISOString(),
          type: 'runtime',
          message: "Exception in thread \"main\" java.lang.NoSuchMethodError: 'void net.minecraft.world.item.Item.<init>(net.minecraft.world.item.Item$Properties)'",
          stackTrace: "Exception in thread \"main\" java.lang.NoSuchMethodError: 'void net.minecraft.world.item.Item.<init>(net.minecraft.world.item.Item$Properties)'\n\tat com.example.mod.items.CustomSword.<init>(CustomSword.java:12)\n\tat com.example.mod.init.ModItems.lambda$static$0(ModItems.java:20)\n\tat net.minecraftforge.registries.DeferredRegister.lambda$register$2(DeferredRegister.java:140)",
          source: "CustomSword.java",
          lineNumber: 12,
          fileName: "CustomSword.java",
          severity: 'critical',
          status: 'active',
          recommendation: "The Item constructor has changed in NeoForge 1.21.5. Items now use the component system rather than inheritance. Update your CustomSword class to use DataComponents instead of extending SwordItem.",
          fixedCode: "// Before:\npublic class CustomSword extends SwordItem {\n    public CustomSword() {\n        super(Tiers.IRON, 3, -2.4F, new Item.Properties());\n    }\n}\n\n// After:\npublic class CustomSword extends Item {\n    public CustomSword() {\n        super(new Item.Properties());\n    }\n    \n    // During registration:\n    registry.register(reg -> {\n        reg.register(ITEMS, new ResourceLocation(MODID, \"custom_sword\"), \n            () -> new CustomSword().setData(ItemComponentsKeys.DURABILITY, new Item.DurabilityComponent(Tiers.IRON.getUses()))\n                .setData(ItemComponentsKeys.MELEE_WEAPON, new Item.MeleeWeaponComponent(3.0f, Tiers.IRON.getAttackDamageBonus() + 3, -2.4f))\n        );\n    });\n}"
        },
        {
          id: "err-3",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          type: 'gradle',
          message: "Could not find net.neoforged:neoforge:1.21.5-0.1.0-beta.2.",
          stackTrace: "* What went wrong:\nExecution failed for task ':compileJava'.\n> Could not resolve all files for configuration ':compileClasspath'.\n   > Could not find net.neoforged:neoforge:1.21.5-0.1.0-beta.2.\n     Searched in the following locations:\n       - https://repo.maven.apache.org/maven2/net/neoforged/neoforge/1.21.5-0.1.0-beta.2/neoforge-1.21.5-0.1.0-beta.2.pom",
          fileName: "build.gradle",
          severity: 'error',
          status: 'fixed',
          recommendation: "Update your build.gradle to use the correct NeoForge maven repository and version. The latest version of NeoForge for Minecraft 1.21.5 is 1.21.5-0.1.0-beta.6.",
          fixedCode: "// Add this to your build.gradle:\nrepositories {\n    maven {\n        name = \"NeoForged\"\n        url = \"https://maven.neoforged.net/releases\"\n    }\n}\n\ndependencies {\n    minecraft \"net.neoforged:forge:1.21.5-0.1.0-beta.6\"\n}"
        },
        {
          id: "err-4",
          timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          type: 'warning',
          message: "Deprecated method usage: EntityType.Builder.of()",
          source: "ModEntities.java",
          lineNumber: 25,
          fileName: "ModEntities.java",
          severity: 'warning',
          status: 'active',
          recommendation: "The EntityType.Builder.of() method is deprecated in NeoForge 1.21.5. Use EntityType.Builder.create() with EntityFactory instead.",
          fixedCode: "// Before:\npublic static final RegistryObject<EntityType<CustomEntity>> CUSTOM_ENTITY = ENTITIES.register(\"custom_entity\",\n    () -> EntityType.Builder.of(CustomEntity::new, MobCategory.CREATURE)\n        .sized(0.9F, 1.3F)\n        .build(new ResourceLocation(MODID, \"custom_entity\").toString()));\n\n// After:\n// In NeoForge 1.21.5, entity registration uses components\nregistry.register(reg -> {\n    reg.register(ENTITY_TYPES, new ResourceLocation(MODID, \"custom_entity\"),\n        () -> EntityType.Builder.create(CustomEntity::new, MobCategory.CREATURE)\n            .sized(0.9F, 1.3F)\n            .build(new ResourceLocation(MODID, \"custom_entity\").toString())\n    );\n});"
        },
        {
          id: "err-5",
          timestamp: new Date(Date.now() - 129600000).toISOString(), // 36 hours ago
          type: 'runtime',
          message: "java.lang.ClassCastException: class com.example.mod.items.CustomItem cannot be cast to class net.minecraft.world.item.SwordItem",
          stackTrace: "java.lang.ClassCastException: class com.example.mod.items.CustomItem cannot be cast to class net.minecraft.world.item.SwordItem\n\tat com.example.mod.events.ModEvents.onPlayerAttack(ModEvents.java:48)\n\tat net.minecraftforge.eventbus.ASMEventHandler.invoke(ASMEventHandler.java:85)\n\tat net.minecraftforge.eventbus.EventBus.post(EventBus.java:302)",
          source: "ModEvents.java",
          lineNumber: 48,
          fileName: "ModEvents.java",
          severity: 'critical',
          status: 'ignored',
          recommendation: "In NeoForge 1.21.5, you should check for item capabilities using components rather than class instanceof checks. Update your event handler to use the new component system.",
          fixedCode: "// Before:\n@SubscribeEvent\npublic static void onPlayerAttack(PlayerAttackEvent event) {\n    ItemStack stack = event.getPlayer().getMainHandItem();\n    if (stack.getItem() instanceof SwordItem) {\n        // Do something with sword\n    }\n}\n\n// After:\n@SubscribeEvent\npublic static void onPlayerAttack(PlayerAttackEvent event) {\n    ItemStack stack = event.getPlayer().getMainHandItem();\n    // Check for the melee weapon component instead of instanceof\n    if (stack.getData(ItemComponentsKeys.MELEE_WEAPON) != null) {\n        // Do something with melee weapon\n        MeleeWeaponComponent weaponComponent = stack.getData(ItemComponentsKeys.MELEE_WEAPON);\n        float attackDamage = weaponComponent.getAttackDamageBonus();\n        // Use component data\n    }\n}"
        }
      ];
      
      setErrors(sampleErrors);
      setFilteredErrors(filterErrors(sampleErrors, errorFilter, statusFilter));
      setIsLoading(false);
    }, 1500);
  }, [projectId]);

  const filterErrors = (errors: ProjectError[], typeFilter: string, statusFilter: string) => {
    return errors.filter(error => {
      const matchesType = typeFilter === "all" || error.type === typeFilter;
      const matchesStatus = statusFilter === "all" || error.status === statusFilter;
      return matchesType && matchesStatus;
    });
  };

  const handleErrorTypeFilterChange = (value: string) => {
    setErrorFilter(value);
    setFilteredErrors(filterErrors(errors, value, statusFilter));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setFilteredErrors(filterErrors(errors, errorFilter, value));
  };

  const handleSelectError = (error: ProjectError) => {
    setSelectedError(error);
  };

  const handleFixError = () => {
    if (!selectedError) return;
    
    setIsFixDialogOpen(true);
  };

  const applyFix = () => {
    if (!selectedError) return;
    
    // In a real implementation, this would apply the fix to the actual code
    // and update the error status via an API call
    
    // Update local state to reflect the fix
    const updatedErrors = errors.map(err => 
      err.id === selectedError.id ? { ...err, status: 'fixed' } : err
    );
    setErrors(updatedErrors);
    setFilteredErrors(filterErrors(updatedErrors, errorFilter, statusFilter));
    setSelectedError({ ...selectedError, status: 'fixed' });
    
    setIsFixDialogOpen(false);
    
    toast({
      title: "Fix Applied",
      description: "The suggested fix has been applied to your code.",
    });
  };

  const ignoreError = () => {
    if (!selectedError) return;
    
    // Update local state to mark the error as ignored
    const updatedErrors = errors.map(err => 
      err.id === selectedError.id ? { ...err, status: 'ignored' } : err
    );
    setErrors(updatedErrors);
    setFilteredErrors(filterErrors(updatedErrors, errorFilter, statusFilter));
    setSelectedError({ ...selectedError, status: 'ignored' });
    
    toast({
      title: "Error Ignored",
      description: "The error has been marked as ignored.",
    });
  };

  const copyErrorDetails = () => {
    if (!selectedError) return;
    
    const errorText = `Error: ${selectedError.message}\nFile: ${selectedError.fileName}\nLine: ${selectedError.lineNumber}\n\nStack Trace:\n${selectedError.stackTrace}`;
    
    navigator.clipboard.writeText(errorText).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Error details have been copied to your clipboard.",
      });
    });
  };

  const copyFixedCode = () => {
    if (!selectedError?.fixedCode) return;
    
    navigator.clipboard.writeText(selectedError.fixedCode).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Fixed code has been copied to your clipboard.",
      });
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500';
      case 'error':
        return 'text-orange-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <Bug className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fixed':
        return <span className="px-2 py-0.5 text-xs rounded bg-green-900/20 text-green-400 border border-green-900/50">Fixed</span>;
      case 'ignored':
        return <span className="px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-400 border border-gray-700">Ignored</span>;
      case 'active':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-900/20 text-red-400 border border-red-900/50">Active</span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case 'compile':
        return 'Compilation Error';
      case 'runtime':
        return 'Runtime Error';
      case 'gradle':
        return 'Gradle Error';
      case 'warning':
        return 'Warning';
      default:
        return type;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Error list */}
      <div className="bg-gray-800/30 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Errors & Warnings</h2>
        
        <div className="flex space-x-2">
          <Select value={errorFilter} onValueChange={handleErrorTypeFilterChange}>
            <SelectTrigger className="w-[120px] h-8 bg-gray-800 border-gray-700 text-sm">
              <SelectValue placeholder="Error Type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="compile">Compile</SelectItem>
              <SelectItem value="runtime">Runtime</SelectItem>
              <SelectItem value="gradle">Gradle</SelectItem>
              <SelectItem value="warning">Warnings</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[120px] h-8 bg-gray-800 border-gray-700 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <Bug className="h-6 w-6 animate-pulse text-blue-500 mx-auto mb-2" />
              <p className="text-gray-400">Scanning for errors...</p>
            </div>
          </div>
        ) : filteredErrors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-medium text-white">No errors found!</h3>
            <p className="text-gray-400 mt-1">
              {errors.length > 0 
                ? "Try changing your filters to see other errors."
                : "Your code looks great! No issues detected."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredErrors.map((error) => (
              <div 
                key={error.id} 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedError?.id === error.id 
                    ? "bg-blue-900/20" 
                    : "hover:bg-gray-800/50"
                }`}
                onClick={() => handleSelectError(error)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">
                      {getSeverityIcon(error.severity)}
                    </div>
                    <div>
                      <h3 className={`font-medium ${getSeverityColor(error.severity)}`}>
                        {error.message}
                      </h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <span className="mr-2">{error.fileName}</span>
                        {error.lineNumber && (
                          <>
                            <span className="mx-2">Line {error.lineNumber}</span>
                          </>
                        )}
                        <span className="mx-2">•</span>
                        <span>{getErrorTypeLabel(error.type)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(error.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(error.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error details */}
      {selectedError && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/30">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-medium text-white flex items-center">
                {getSeverityIcon(selectedError.severity)}
                <span className="ml-2">{selectedError.message}</span>
              </h3>
              <div className="text-sm text-gray-400 mt-1">
                {selectedError.fileName} • {getErrorTypeLabel(selectedError.type)}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyErrorDetails}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              
              {selectedError.status === 'active' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={ignoreError}
                  >
                    Ignore
                  </Button>
                  
                  {selectedError.recommendation && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleFixError}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Fix Error
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="details">
            <TabsList className="bg-gray-800/70">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="recommendation">Solution</TabsTrigger>
              {selectedError.status === 'fixed' && (
                <TabsTrigger value="fixed">Applied Fix</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details" className="pt-4">
              {selectedError.stackTrace && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Stack Trace</h4>
                  <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Error Type</h4>
                  <p className="text-sm text-gray-400">{getErrorTypeLabel(selectedError.type)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Status</h4>
                  <p className="text-sm">{getStatusBadge(selectedError.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">File</h4>
                  <p className="text-sm text-gray-400">{selectedError.fileName}</p>
                </div>
                {selectedError.lineNumber && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Line Number</h4>
                    <p className="text-sm text-gray-400">{selectedError.lineNumber}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Detected</h4>
                  <p className="text-sm text-gray-400">{formatTimestamp(selectedError.timestamp)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Severity</h4>
                  <p className={`text-sm ${getSeverityColor(selectedError.severity)}`}>
                    {selectedError.severity.charAt(0).toUpperCase() + selectedError.severity.slice(1)}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendation" className="pt-4">
              {selectedError.recommendation ? (
                <>
                  <Alert className="mb-4 bg-blue-900/20 border-blue-900/50 text-blue-300">
                    <AlertTitle className="text-blue-300">Recommendation</AlertTitle>
                    <AlertDescription className="text-gray-300">
                      {selectedError.recommendation}
                    </AlertDescription>
                  </Alert>
                  
                  {selectedError.fixedCode && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-300">Suggested Code Fix</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={copyFixedCode}
                          className="h-6"
                        >
                          <Clipboard className="h-3 w-3 mr-1" />
                          <span className="text-xs">Copy</span>
                        </Button>
                      </div>
                      <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                        <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                          {selectedError.fixedCode}
                        </pre>
                      </div>
                      
                      {selectedError.status === 'active' && (
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={handleFixError}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Apply This Fix
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="text-lg font-medium text-white mb-1">No Recommendation Available</h4>
                  <p className="text-gray-400">
                    We don't have a specific recommendation for this error yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {selectedError.status === 'fixed' && (
              <TabsContent value="fixed" className="pt-4">
                <Alert className="mb-4 bg-green-900/20 border-green-900/50 text-green-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <AlertTitle className="text-green-300">Fix Applied</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    This error has been fixed in your code.
                  </AlertDescription>
                </Alert>
                
                {selectedError.fixedCode && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Applied Code Fix</h4>
                    <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                      <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                        {selectedError.fixedCode}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
      
      {/* Fix dialog */}
      <Dialog open={isFixDialogOpen} onOpenChange={setIsFixDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Apply Fix</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review and apply the suggested fix for this error.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-3">
              <p className="font-medium text-white mb-2">Problem:</p>
              <p>{selectedError?.recommendation}</p>
            </div>
            
            <h4 className="text-sm font-medium text-white">Changes to be applied:</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="border border-gray-700 rounded-md overflow-hidden">
                <div className="bg-red-950/20 p-3">
                  <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                    {selectedError?.fixedCode?.split('// After:')[0].trim()}
                  </pre>
                </div>
                <div className="flex items-center justify-center p-1 bg-gray-800">
                  <ArrowRight className="h-5 w-5 text-amber-500" />
                </div>
                <div className="bg-green-950/20 p-3">
                  <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                    {selectedError?.fixedCode?.split('// After:')[1]?.trim() || selectedError?.fixedCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsFixDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={applyFix}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Apply Fix
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}