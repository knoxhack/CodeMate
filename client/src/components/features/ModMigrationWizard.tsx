import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GitCompare, ArrowRight, Loader2, Check, Info, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ModMigrationWizardProps {
  projectId: number;
}

interface MigrationTask {
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'complete' | 'error';
  details?: string;
  before?: string;
  after?: string;
}

export default function ModMigrationWizard({ projectId }: ModMigrationWizardProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sourceVersion, setSourceVersion] = useState("1.20.4");
  const [sourceCodeUrl, setSourceCodeUrl] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [migrationStep, setMigrationStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [migrationTasks, setMigrationTasks] = useState<MigrationTask[]>([]);
  const [currentView, setCurrentView] = useState<string>("overview");

  const handleOpenWizard = () => {
    setIsOpen(true);
  };

  const resetWizard = () => {
    setSourceVersion("1.20.4");
    setSourceCodeUrl("");
    setSourceCode("");
    setMigrationStep(1);
    setIsAnalyzing(false);
    setMigrationTasks([]);
    setCurrentView("overview");
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    
    // In a real implementation, this would call the Claude API to analyze the code
    setTimeout(() => {
      // Sample migration tasks based on common 1.20.4 to 1.21.5 migration issues
      const sampleTasks: MigrationTask[] = [
        {
          name: "Update Item Registration",
          description: "Replace DeferredRegister with new ComponentRegistry",
          status: "complete",
          before: `public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MODID);
public static final RegistryObject<Item> EXAMPLE_ITEM = ITEMS.register("example_item", () -> new Item(new Item.Properties()));`,
          after: `// NeoForge 1.21 uses components instead of inheritance
private static final ComponentKey<DataComponentType<FoodComponent, ItemStack>> FOOD_COMPONENT = ComponentKey.get(ResourceLocation.fromNamespaceAndPath("forge", "food"), DataComponentType.class);

// In your registration method
public static void registerItems(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ITEMS, new ResourceLocation(MODID, "example_item"), () -> new Item());
    });
}`
        },
        {
          name: "Update SwordItem Implementation",
          description: "Replace SwordItem inheritance with DataComponents",
          status: "complete",
          before: `public class CustomSword extends SwordItem {
    public CustomSword() {
        super(Tiers.IRON, 3, -2.4F, new Item.Properties());
    }
}`,
          after: `public class CustomSword extends Item {
    public CustomSword() {
        super(new Item.Properties());
    }
    
    // During registration:
    registry.register(reg -> {
        reg.register(ITEMS, new ResourceLocation(MODID, "custom_sword"), 
            () -> new CustomSword().setData(ItemComponentsKeys.DURABILITY, new Item.DurabilityComponent(Tiers.IRON.getUses()))
                .setData(ItemComponentsKeys.MELEE_WEAPON, new Item.MeleeWeaponComponent(3.0f, Tiers.IRON.getAttackDamageBonus() + 3, -2.4f))
        );
    });
}`
        },
        {
          name: "Update BlockItem Registration",
          description: "Update BlockItem to use component-based registry",
          status: "pending",
          before: `public static final RegistryObject<Block> EXAMPLE_BLOCK = BLOCKS.register("example_block", 
    () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE)));

public static final RegistryObject<Item> EXAMPLE_BLOCK_ITEM = ITEMS.register("example_block",
    () -> new BlockItem(EXAMPLE_BLOCK.get(), new Item.Properties()));`,
          after: ``
        },
        {
          name: "Update Entity Registration",
          description: "Migrate to EntityRegistry with component-based entities",
          status: "in_progress",
          before: `public static final DeferredRegister<EntityType<?>> ENTITIES = DeferredRegister.create(ForgeRegistries.ENTITY_TYPES, MODID);
          
public static final RegistryObject<EntityType<CustomEntity>> CUSTOM_ENTITY = ENTITIES.register("custom_entity",
    () -> EntityType.Builder.of(CustomEntity::new, MobCategory.CREATURE)
        .sized(0.9F, 1.3F)
        .build(new ResourceLocation(MODID, "custom_entity").toString()));`,
          after: `// Work in progress - NeoForge 1.21 uses a component-based entity system`
        },
        {
          name: "Update Creative Tab",
          description: "Migrate to new CreativeTabRegistry format",
          status: "error",
          details: "Unable to automatically convert custom CreativeModeTab implementation",
          before: `public static final RegistryObject<CreativeModeTab> EXAMPLE_TAB = CREATIVE_MODE_TABS.register("example_tab", 
    () -> CreativeModeTab.builder()
        .title(Component.translatable("itemGroup." + MODID + ".example_tab"))
        .icon(() -> new ItemStack(EXAMPLE_ITEM.get()))
        .displayItems((parameters, output) -> {
            output.accept(EXAMPLE_ITEM.get());
            // Add more items here
        })
        .build());`,
          after: ``
        }
      ];
      
      setMigrationTasks(sampleTasks);
      setIsAnalyzing(false);
      setMigrationStep(2);
    }, 3000);
  };

  const handleApplyMigrations = () => {
    toast({
      title: "Migration Applied",
      description: "The migration changes have been applied to your project.",
    });
    
    setMigrationStep(3);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="source-version">Source Minecraft Version</Label>
        <div className="grid grid-cols-4 gap-2">
          {["1.20.1", "1.20.2", "1.20.4", "1.21.1"].map((version) => (
            <Button
              key={version}
              variant={sourceVersion === version ? "default" : "outline"}
              onClick={() => setSourceVersion(version)}
              className={`${sourceVersion === version ? "border-blue-500" : "border-gray-700"}`}
            >
              {version}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="source-code">Source Code</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-url" className="text-sm text-gray-400">GitHub Repository URL (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="source-url"
                placeholder="https://github.com/username/repo"
                value={sourceCodeUrl}
                onChange={(e) => setSourceCodeUrl(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <Button variant="outline" disabled>Import</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source-code-paste" className="text-sm text-gray-400">Or paste code samples to migrate</Label>
            <Textarea
              id="source-code-paste"
              placeholder="Paste your mod's code here..."
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="min-h-[200px] bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleStartAnalysis} disabled={isAnalyzing}>
          {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isAnalyzing ? "Analyzing..." : "Start Migration Analysis"}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="overview">Migration Overview</TabsTrigger>
          <TabsTrigger value="details">Code Changes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                <h3 className="font-medium text-white">Migration Tasks</h3>
              </div>
              <div className="divide-y divide-gray-700">
                {migrationTasks.map((task, index) => (
                  <div key={index} className="p-4 flex items-center">
                    <div className="mr-3">
                      {task.status === 'complete' && <Check className="h-5 w-5 text-green-500" />}
                      {task.status === 'in_progress' && <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />}
                      {task.status === 'pending' && <Info className="h-5 w-5 text-blue-500" />}
                      {task.status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-white">{task.name}</h4>
                      <p className="text-sm text-gray-400">{task.description}</p>
                      {task.details && (
                        <p className="text-sm text-red-400 mt-1">{task.details}</p>
                      )}
                    </div>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setCurrentView("details");
                        }}
                      >
                        View Changes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-amber-950/20 border border-amber-900/50 rounded-lg p-4">
              <div className="flex">
                <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-400">Migration Summary</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    This migration will update your mod from NeoForge {sourceVersion} to 1.21.5, making the following key changes:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-300 mt-2 space-y-1">
                    <li>Replace inheritance-based items with component-based system</li>
                    <li>Update registration from DeferredRegister to ComponentRegistry</li>
                    <li>Migrate SwordItem implementation to use DataComponents</li>
                    <li>Update entity registration system</li>
                    <li>Update creative tab registration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setMigrationStep(1)} className="mr-2">
              Back
            </Button>
            <Button onClick={handleApplyMigrations}>
              Apply Migrations
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="pt-4">
          <div className="space-y-4">
            {migrationTasks.map((task, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    {task.status === 'complete' && <Check className="h-5 w-5 text-green-500 mr-2" />}
                    {task.status === 'in_progress' && <Loader2 className="h-5 w-5 text-amber-500 animate-spin mr-2" />}
                    {task.status === 'pending' && <Info className="h-5 w-5 text-blue-500 mr-2" />}
                    {task.status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
                    <h3 className="font-medium text-white">{task.name}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                  
                  {task.before && task.after && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="bg-gray-900 p-2 rounded-t-md text-sm text-gray-400 border-t border-l border-r border-gray-700">
                          Before ({sourceVersion})
                        </div>
                        <div className="bg-red-950/20 border border-red-900/40 rounded-b-md p-3">
                          <pre className="text-xs text-red-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {task.before}
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <div className="bg-gray-900 p-2 rounded-t-md text-sm text-gray-400 border-t border-l border-r border-gray-700 flex items-center">
                          <ArrowRight className="h-4 w-4 mr-1 text-green-500" />
                          After (1.21.5)
                        </div>
                        <div className="bg-green-950/20 border border-green-900/40 rounded-b-md p-3">
                          <pre className="text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {task.after || "No changes required"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {task.status === 'error' && (
                    <div className="mt-4 bg-red-950/20 border border-red-900/40 rounded-md p-3">
                      <p className="text-sm text-red-400">{task.details}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setCurrentView("overview")} className="mr-2">
              Back to Overview
            </Button>
            <Button onClick={handleApplyMigrations}>
              Apply Migrations
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="rounded-lg bg-green-900/20 border border-green-800 p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-green-900/50 flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-400" />
        </div>
        <h3 className="text-xl font-medium text-green-400 mb-2">Migration Complete!</h3>
        <p className="text-gray-300">
          Your mod has been successfully migrated to NeoForge 1.21.5.
        </p>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Next Steps</h4>
        <ul className="space-y-2">
          <li className="flex">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-300">Test your mod to ensure all functionality works as expected</span>
          </li>
          <li className="flex">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-300">Review the manual migration tasks that need attention</span>
          </li>
          <li className="flex">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-300">Check for any warnings or errors in the console during runtime</span>
          </li>
        </ul>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={() => {
          setIsOpen(false);
          resetWizard();
        }}>
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="bg-gray-800/30 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Mod Migration Wizard</h2>
          <Button onClick={handleOpenWizard}>
            <GitCompare className="h-4 w-4 mr-2" />
            Start Migration
          </Button>
        </div>
        
        <div className="flex-grow p-4 overflow-auto">
          <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-6 text-center">
            <div className="rounded-full bg-blue-900/20 p-3 inline-flex mb-4">
              <GitCompare className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Migrate Your Minecraft Mod</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Automatically update your mod from previous versions to NeoForge 1.21.5 using Claude-powered code transformation.
            </p>
            <Button onClick={handleOpenWizard}>
              <GitCompare className="h-4 w-4 mr-2" />
              Start Migration Wizard
            </Button>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/30 border-gray-700 p-4">
              <h4 className="font-medium text-white mb-2">Key Migration Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Automatic code transformation for NeoForge 1.21.5</span>
                </li>
                <li className="flex">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Migration from inheritance to component-based systems</span>
                </li>
                <li className="flex">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Updates to registry and registration methods</span>
                </li>
                <li className="flex">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Step-by-step wizard with detailed explanations</span>
                </li>
              </ul>
            </Card>
            
            <Card className="bg-gray-800/30 border-gray-700 p-4">
              <h4 className="font-medium text-white mb-2">Supported Versions</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Source Versions:</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-700 rounded text-blue-300">1.20.1</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-blue-300">1.20.2</span>
                    <span className="px-2 py-1 bg-green-900/30 rounded text-green-400 border border-green-900/50">1.20.4</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-blue-300">1.21.1</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-400 mb-1">Target Version:</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-900/30 rounded text-green-400 border border-green-900/50">NeoForge 1.21.5</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center">
              <GitCompare className="h-6 w-6 mr-2 text-blue-400" />
              Mod Migration Wizard
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your mod from {sourceVersion} to NeoForge 1.21.5
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Steps */}
          <div className="w-full flex items-center mb-6">
            <div className="flex-1">
              <div className="relative flex items-center justify-center">
                <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  migrationStep >= 1 ? "bg-blue-600" : "bg-gray-700"
                }`}>
                  {migrationStep > 1 ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-white text-sm">1</span>
                  )}
                </div>
                <div className="absolute top-4 -left-1/2 right-1/2 h-0.5 bg-gray-700 z-0">
                  <div 
                    className="h-full bg-blue-600 transition-all" 
                    style={{ width: migrationStep > 1 ? "100%" : "0%" }}
                  ></div>
                </div>
                <div className="absolute top-4 -right-1/2 left-1/2 h-0.5 bg-gray-700 z-0">
                  <div 
                    className="h-full bg-blue-600 transition-all" 
                    style={{ width: migrationStep > 1 ? "100%" : "0%" }}
                  ></div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className={`text-sm ${
                  migrationStep === 1 ? "text-white font-medium" : "text-gray-400"
                }`}>Source Code</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="relative flex items-center justify-center">
                <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  migrationStep >= 2 ? "bg-blue-600" : "bg-gray-700"
                }`}>
                  {migrationStep > 2 ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-white text-sm">2</span>
                  )}
                </div>
                <div className="absolute top-4 -left-1/2 right-1/2 h-0.5 bg-gray-700 z-0">
                  <div 
                    className="h-full bg-blue-600 transition-all" 
                    style={{ width: migrationStep > 2 ? "100%" : "0%" }}
                  ></div>
                </div>
                <div className="absolute top-4 -right-1/2 left-1/2 h-0.5 bg-gray-700 z-0">
                  <div 
                    className="h-full bg-blue-600 transition-all" 
                    style={{ width: migrationStep > 2 ? "100%" : "0%" }}
                  ></div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className={`text-sm ${
                  migrationStep === 2 ? "text-white font-medium" : "text-gray-400"
                }`}>Migration Plan</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="relative flex items-center justify-center">
                <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                  migrationStep >= 3 ? "bg-blue-600" : "bg-gray-700"
                }`}>
                  <span className="text-white text-sm">3</span>
                </div>
                <div className="absolute top-4 -left-1/2 right-1/2 h-0.5 bg-gray-700 z-0">
                  <div 
                    className="h-full bg-blue-600 transition-all" 
                    style={{ width: migrationStep > 3 ? "100%" : "0%" }}
                  ></div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className={`text-sm ${
                  migrationStep === 3 ? "text-white font-medium" : "text-gray-400"
                }`}>Complete</span>
              </div>
            </div>
          </div>
          
          <Separator className="bg-gray-700" />
          
          {/* Step Content */}
          <div className="mt-4">
            {migrationStep === 1 && renderStep1()}
            {migrationStep === 2 && renderStep2()}
            {migrationStep === 3 && renderStep3()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}