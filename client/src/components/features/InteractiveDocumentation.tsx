import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  BookOpen, 
  Search, 
  Code, 
  ExternalLink, 
  ChevronRight, 
  FileText, 
  Package, 
  Layers, 
  Zap, 
  BookMarked, 
  Command, 
  MessageSquare, 
  Copy, 
  HelpCircle,
  Loader2,
  RefreshCcw
} from "lucide-react";

interface InteractiveDocumentationProps {
  fileId?: number;
}

interface DocEntry {
  id: string;
  title: string;
  category: string;
  type: 'class' | 'method' | 'field' | 'enum' | 'interface' | 'annotation' | 'concept';
  content: string;
  code?: string;
  related?: string[];
  url?: string;
  isNew?: boolean;
}

interface ApiClass {
  name: string;
  package: string;
  description: string;
  methods: string[];
  fields: string[];
  isExpanded?: boolean;
}

export default function InteractiveDocumentation({ fileId }: InteractiveDocumentationProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState<DocEntry[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocEntry | null>(null);
  const [docTab, setDocTab] = useState("neoforge");
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isFetchingDocs, setIsFetchingDocs] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState("1.21.5");
  const [searchCategory, setSearchCategory] = useState("all");
  const [docHistory, setDocHistory] = useState<DocEntry[]>([]);

  // NeoForge documentation
  const neoForgeDocs: DocEntry[] = [
    {
      id: "itemcomponents",
      title: "Item Components System",
      category: "items",
      type: "concept",
      content: `# Item Components in NeoForge 1.21.5

NeoForge 1.21.5 introduces a new component-based system for items that replaces the inheritance-based approach used in previous versions. This change allows for more flexible item behaviors and better compatibility with Minecraft's internal systems.

## Key Concepts

- **Components over Inheritance**: Instead of extending specialized item classes like SwordItem or PickaxeItem, you now use a base Item class and attach components to it.
- **DataComponent System**: Components are added using the setData method with appropriate ComponentKeys.
- **Registration Changes**: Item registration now uses the ComponentRegistry system instead of DeferredRegister.

## Common Components

- **DurabilityComponent**: Controls item durability and damage handling
- **MeleeWeaponComponent**: Defines attack damage, attack speed, and other melee properties
- **FoodComponent**: Configures food properties like nutrition and saturation
- **DiggingComponent**: Defines mining speed and proper tool materials

## Migration Guide

When migrating from older versions, you'll need to:
1. Update your items to extend Item instead of specialized classes
2. Add appropriate components to replicate the behavior
3. Update your registration code to use the component registry

See the code examples for practical implementations.`,
      code: `// Example: Converting a SwordItem to use components
// Old approach (pre-1.21):
public class CustomSword extends SwordItem {
    public CustomSword() {
        super(Tiers.IRON, 3, -2.4F, new Item.Properties());
    }
}

// New approach (1.21.5):
public class CustomSword extends Item {
    public CustomSword() {
        super(new Item.Properties());
    }
    
    // Used during registration
    public static CustomSword create() {
        return new CustomSword()
            .setData(ItemComponentsKeys.DURABILITY, 
                new Item.DurabilityComponent(Tiers.IRON.getUses()))
            .setData(ItemComponentsKeys.MELEE_WEAPON, 
                new Item.MeleeWeaponComponent(3.0f, Tiers.IRON.getAttackDamageBonus() + 3, -2.4f));
    }
}

// Registration with component registry
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "item")),
            new ResourceLocation(MOD_ID, "custom_sword"),
            CustomSword::create);
    });
}`,
      related: ["componentregistry", "resourcekey", "itemcomponentskeys"],
      url: "https://neoforged.net/docs/1.21.5/itemcomponents"
    },
    {
      id: "componentregistry",
      title: "Component Registry",
      category: "registry",
      type: "class",
      content: `# ComponentRegistry

The ComponentRegistry is a new registration system introduced in NeoForge 1.21.5 that replaces the DeferredRegister system used in previous versions. It provides a streamlined way to register game objects with their associated components.

## Purpose

- Register objects (blocks, items, entities, etc.) with the game
- Attach components to registered objects
- Provide a consistent API for all registrable objects
- Support for ResourceKeys and Resource Locations

## Key Methods

- **register(Consumer<RegistrationContext> context)**: Accepts a consumer that handles registration
- **RegistrationContext.register(ResourceKey, ResourceLocation, Supplier)**: Registers an object with the specified key and ID

## Benefits

- Combines registration and component configuration in one step
- More direct relationship with Minecraft's internal systems
- Better support for Minecraft's data-driven approach
- Simplifies dependency management between registries

## Common Use Cases

- Registering items with components
- Registering blocks with block entities
- Registering entities with attributes
- Registering capabilities and data attachments

See the code example for practical usage.`,
      code: `// Example: Using ComponentRegistry for various game objects

// Items registration
public static void registerItems(ComponentRegistry registry) {
    registry.register(registration -> {
        // Register a simple item
        registration.register(ITEMS, 
            new ResourceLocation(MOD_ID, "simple_item"),
            () -> new Item(new Item.Properties()));
            
        // Register an item with components
        registration.register(ITEMS, 
            new ResourceLocation(MOD_ID, "special_item"),
            () -> new Item(new Item.Properties())
                .setData(ItemComponentsKeys.DURABILITY, 
                    new Item.DurabilityComponent(250))
                .setData(ItemComponentsKeys.FOOD, 
                    new Item.FoodComponent.Builder().nutrition(6).saturationMod(0.8f).build()));
    });
}

// Blocks registration
public static void registerBlocks(ComponentRegistry registry) {
    registry.register(registration -> {
        // Register a simple block
        registration.register(BLOCKS, 
            new ResourceLocation(MOD_ID, "custom_block"),
            () -> new Block(BlockBehaviour.Properties.of()
                .mapColor(MapColor.STONE)
                .strength(3.0F)));
                
        // Register a block with entity
        registration.register(BLOCKS, 
            new ResourceLocation(MOD_ID, "special_block"),
            () -> new SpecialBlock(BlockBehaviour.Properties.of()
                .mapColor(MapColor.WOOD)
                .strength(2.0F)));
    });
}

// Entity registration
public static void registerEntities(ComponentRegistry registry) {
    registry.register(registration -> {
        // Register entity type
        registration.register(ENTITY_TYPES, 
            new ResourceLocation(MOD_ID, "custom_entity"),
            () -> EntityType.Builder
                .of(CustomEntity::new, MobCategory.CREATURE)
                .sized(0.9F, 1.3F)
                .build(new ResourceLocation(MOD_ID, "custom_entity").toString()));
                
        // Register entity attributes
        registration.register(ATTRIBUTES, 
            new ResourceLocation(MOD_ID, "custom_entity_attributes"),
            () -> CustomEntity.createAttributes().build());
    });
}`,
      related: ["resourcekey", "itemcomponents", "resourcelocation"],
      url: "https://neoforged.net/docs/1.21.5/componentregistry"
    },
    {
      id: "resourcekey",
      title: "ResourceKey",
      category: "core",
      type: "class",
      content: `# ResourceKey

ResourceKey is a class used in Minecraft and NeoForge to uniquely identify registries and the objects within them. In NeoForge 1.21.5, ResourceKeys play a central role in the registration system.

## Purpose

- Create type-safe references to registries and registry entries
- Provide a consistent way to identify game objects
- Support the component-based registration system
- Enable cross-registry references

## Creating ResourceKeys

There are two main types of ResourceKeys:
1. **Registry Keys**: Identify a registry itself (e.g., the Items registry)
2. **Registry Entry Keys**: Identify a specific object within a registry (e.g., a specific item)

ResourceKeys are created using the static methods:
- **ResourceKey.createRegistryKey(ResourceLocation)**: Creates a key for a registry
- **ResourceKey.create(ResourceKey<Registry<T>>, ResourceLocation)**: Creates a key for an entry within a registry

## Integration with DeferredHolder

In NeoForge 1.21.5, ResourceKeys are often used with DeferredHolder, which replaces the older RegistryObject system:

\`\`\`java
// Define registry key for Items
public static final ResourceKey<Registry<Item>> ITEMS = ResourceKey.createRegistryKey(
    new ResourceLocation("minecraft", "item"));
    
// Create a deferred holder for a specific item
public static final DeferredHolder<Item, Item> EXAMPLE_ITEM = DeferredHolder.create(ITEMS, 
    new ResourceLocation(MOD_ID, "example_item"));
\`\`\`

## Best Practices

- Use ResourceKey for all registry references
- Create constants for commonly used registry keys
- Prefer ResourceKeys over hardcoded strings
- Use ResourceKey with DeferredHolder for registry entries

See the code example for practical usage.`,
      code: `// Example: Working with ResourceKeys in NeoForge 1.21.5

// Define registry keys for common registries
public class ModRegistries {
    // Registry keys for built-in registries
    public static final ResourceKey<Registry<Item>> ITEMS = ResourceKey.createRegistryKey(
        new ResourceLocation("minecraft", "item"));
        
    public static final ResourceKey<Registry<Block>> BLOCKS = ResourceKey.createRegistryKey(
        new ResourceLocation("minecraft", "block"));
        
    public static final ResourceKey<Registry<EntityType<?>>> ENTITY_TYPES = ResourceKey.createRegistryKey(
        new ResourceLocation("minecraft", "entity_type"));
        
    // Custom registry example
    public static final ResourceKey<Registry<CustomDataType>> CUSTOM_DATA = ResourceKey.createRegistryKey(
        new ResourceLocation(MOD_ID, "custom_data"));
}

// Using ResourceKeys with DeferredHolder
public class ModItems {
    // Item references using DeferredHolder with ResourceKey
    public static final DeferredHolder<Item, Item> EXAMPLE_ITEM = DeferredHolder.create(
        ModRegistries.ITEMS, new ResourceLocation(MOD_ID, "example_item"));
        
    public static final DeferredHolder<Item, SwordItem> EXAMPLE_SWORD = DeferredHolder.create(
        ModRegistries.ITEMS, new ResourceLocation(MOD_ID, "example_sword"));
}

// Registration with ResourceKeys
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        // Register using the registry key
        registration.register(ModRegistries.ITEMS, 
            new ResourceLocation(MOD_ID, "example_item"),
            () -> new Item(new Item.Properties()));
            
        // Register with components
        registration.register(ModRegistries.ITEMS, 
            new ResourceLocation(MOD_ID, "example_sword"),
            () -> new Item(new Item.Properties())
                .setData(ItemComponentsKeys.DURABILITY, new Item.DurabilityComponent(250))
                .setData(ItemComponentsKeys.MELEE_WEAPON, new Item.MeleeWeaponComponent(3.0f, 2.0f, -2.4f)));
    });
}`,
      related: ["resourcelocation", "componentregistry", "deferredholder"],
      url: "https://neoforged.net/docs/1.21.5/resourcekey"
    },
    {
      id: "resourcelocation",
      title: "ResourceLocation",
      category: "core",
      type: "class",
      content: `# ResourceLocation

ResourceLocation is a fundamental class in Minecraft and NeoForge that represents a namespaced identifier for game resources. It's used to uniquely identify almost everything in the game, from blocks and items to textures and sounds.

## Structure

A ResourceLocation consists of two parts:
- **Namespace**: Typically the mod ID (defaults to "minecraft" if not specified)
- **Path**: The specific resource identifier

Example: \`mymod:custom_block\` has namespace "mymod" and path "custom_block"

## Creating ResourceLocations

ResourceLocations can be created in several ways:
- **new ResourceLocation(String namespace, String path)**: Create with explicit namespace and path
- **new ResourceLocation(String combined)**: Parse from a string like "namespace:path"
- **ResourceLocation.of(String input, char separator)**: Create with a custom separator

## Common Uses

- Identifying registry entries (blocks, items, entities, etc.)
- Referencing assets (textures, models, sounds)
- Specifying loot tables and recipes
- Creating ResourceKeys for registry operations

## Best Practices

- Always use your mod ID as the namespace for your resources
- Use lowercase snake_case for the path component
- Be consistent with naming conventions
- Avoid special characters except underscores

## Integration with Component Registry

In NeoForge 1.21.5, ResourceLocations are used extensively with the ComponentRegistry system to register and identify game objects.`,
      code: `// Example: Working with ResourceLocations in NeoForge 1.21.5

// Creating ResourceLocations
public static final String MOD_ID = "examplemod";

// Explicit namespace and path
ResourceLocation blockId = new ResourceLocation(MOD_ID, "custom_block");

// From combined string
ResourceLocation itemId = new ResourceLocation("examplemod:special_item");

// Default namespace (minecraft)
ResourceLocation vanillaResource = new ResourceLocation("diamond");
// Equivalent to: new ResourceLocation("minecraft", "diamond")

// Using ResourceLocations in registration
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        // Register a block using ResourceLocation
        registration.register(
            ResourceKey.createRegistryKey(new ResourceLocation("minecraft", "block")),
            new ResourceLocation(MOD_ID, "custom_block"),
            () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE))
        );
    });
}

// Using ResourceLocations for assets
public static final ResourceLocation TEXTURE_LOCATION = 
    new ResourceLocation(MOD_ID, "textures/block/custom_block.png");
    
public static final ResourceLocation SOUND_LOCATION = 
    new ResourceLocation(MOD_ID, "sounds/custom_sound.ogg");
    
// Using ResourceLocations for data
public static final ResourceLocation RECIPE_LOCATION = 
    new ResourceLocation(MOD_ID, "recipes/custom_recipe.json");
    
public static final ResourceLocation LOOT_TABLE_LOCATION = 
    new ResourceLocation(MOD_ID, "loot_tables/blocks/custom_block.json");

// Working with ResourceLocation components
String namespace = blockId.getNamespace(); // "examplemod"
String path = blockId.getPath();           // "custom_block"
String string = blockId.toString();        // "examplemod:custom_block"`,
      related: ["resourcekey", "componentregistry"],
      url: "https://neoforged.net/docs/1.21.5/resourcelocation"
    },
    {
      id: "itemcomponentskeys",
      title: "ItemComponentsKeys",
      category: "items",
      type: "class",
      content: `# ItemComponentsKeys

ItemComponentsKeys is a class in NeoForge 1.21.5 that provides access to the predefined component keys used by the item component system. These keys are used to attach and retrieve components from items.

## Purpose

- Provides access to standard item component keys
- Ensures type safety when working with components
- Enables consistent component usage across the codebase
- Interfaces with Minecraft's internal component system

## Standard Component Keys

NeoForge 1.21.5 includes several built-in component keys:

- **DURABILITY**: Controls item durability and damage
- **MELEE_WEAPON**: Defines melee attack properties
- **RANGED_WEAPON**: Defines ranged attack properties
- **FOOD**: Configures food properties
- **DIGGING**: Sets mining capabilities
- **WEARABLE**: Defines armor properties
- **ENCHANTMENT_HELPER**: Controls enchantability

## Usage Pattern

Components are attached to items using the \`setData\` method:

\`\`\`java
item.setData(ItemComponentsKeys.DURABILITY, new Item.DurabilityComponent(100));
\`\`\`

And retrieved using the \`getData\` method:

\`\`\`java
DurabilityComponent durability = itemStack.getData(ItemComponentsKeys.DURABILITY);
\`\`\`

## Custom Components

You can also define custom component keys for mod-specific functionality:

\`\`\`java
public static final ComponentKey<DataComponentType<CustomComponent, ItemStack>> CUSTOM_COMPONENT = 
    ComponentKey.get(new ResourceLocation(MOD_ID, "custom"), DataComponentType.class);
\`\`\`

## Best Practices

- Use the predefined keys when possible
- Create constants for custom component keys
- Check for null when retrieving optional components
- Keep components focused on specific behaviors

See the code example for practical usage.`,
      code: `// Example: Working with ItemComponentsKeys in NeoForge 1.21.5

// Creating an item with multiple components
public class MultiComponentItem extends Item {
    public MultiComponentItem() {
        super(new Item.Properties());
    }
    
    public static MultiComponentItem create() {
        return new MultiComponentItem()
            // Add durability component (like tools/weapons)
            .setData(ItemComponentsKeys.DURABILITY, 
                new Item.DurabilityComponent(500))
                
            // Add melee weapon component (like swords)
            .setData(ItemComponentsKeys.MELEE_WEAPON, 
                new Item.MeleeWeaponComponent(4.0f, 2.0f, -2.4f))
                
            // Add food component (like food items)
            .setData(ItemComponentsKeys.FOOD, 
                new Item.FoodComponent.Builder()
                    .nutrition(6)
                    .saturationMod(0.8f)
                    .alwaysEdible()
                    .build());
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        ItemStack stack = player.getItemInHand(hand);
        
        // Check for food component and use it if present
        Item.FoodComponent foodComponent = stack.getData(ItemComponentsKeys.FOOD);
        if (foodComponent != null && player.canEat(foodComponent.isAlwaysEdible())) {
            return ItemUtils.startUsingInstantly(level, player, hand);
        }
        
        return InteractionResultHolder.pass(stack);
    }
    
    @Override
    public boolean hurtEnemy(ItemStack stack, LivingEntity target, LivingEntity attacker) {
        // Use melee weapon component
        Item.MeleeWeaponComponent meleeComponent = stack.getData(ItemComponentsKeys.MELEE_WEAPON);
        if (meleeComponent != null) {
            // Apply custom effect based on weapon properties
            if (meleeComponent.getAttackDamageBonus() > 3.0f) {
                target.addEffect(new MobEffectInstance(MobEffects.MOVEMENT_SLOWDOWN, 60, 0));
            }
        }
        
        // Use durability component to damage the item
        Item.DurabilityComponent durabilityComponent = stack.getData(ItemComponentsKeys.DURABILITY);
        if (durabilityComponent != null) {
            stack.hurtAndBreak(1, attacker, (entity) -> entity.broadcastBreakEvent(EquipmentSlot.MAINHAND));
        }
        
        return true;
    }
}

// Registration with component registry
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "item")),
            new ResourceLocation(MOD_ID, "multi_component_item"),
            MultiComponentItem::create);
    });
}`,
      related: ["itemcomponents", "componentregistry"],
      url: "https://neoforged.net/docs/1.21.5/itemcomponentskeys"
    }
  ];

  // Minecraft API class documentation
  const minecraftApiClasses: ApiClass[] = [
    {
      name: "Block",
      package: "net.minecraft.world.level.block",
      description: "Base class for all blocks in the game",
      methods: [
        "getStateForPlacement(BlockPlaceContext): BlockState",
        "use(BlockState, Level, BlockPos, Player, InteractionHand, BlockHitResult): InteractionResult",
        "onRemove(BlockState, Level, BlockPos, BlockState, boolean): void",
        "animateTick(BlockState, Level, BlockPos, RandomSource): void",
        "getRenderShape(BlockState): RenderShape"
      ],
      fields: [
        "FACING: DirectionProperty",
        "WATERLOGGED: BooleanProperty",
        "POWERED: BooleanProperty"
      ]
    },
    {
      name: "Item",
      package: "net.minecraft.world.item",
      description: "Base class for all items in the game",
      methods: [
        "use(Level, Player, InteractionHand): InteractionResultHolder<ItemStack>",
        "useOn(UseOnContext): InteractionResult",
        "hurtEnemy(ItemStack, LivingEntity, LivingEntity): boolean",
        "mineBlock(ItemStack, Level, BlockState, BlockPos, LivingEntity): boolean",
        "getEnchantmentValue(): int",
        "setData(ComponentKey, Component): Item"
      ],
      fields: [
        "BASE_ATTACK_DAMAGE_UUID: UUID",
        "BASE_ATTACK_SPEED_UUID: UUID"
      ]
    },
    {
      name: "Entity",
      package: "net.minecraft.world.entity",
      description: "Base class for all entities in the game",
      methods: [
        "tick(): void",
        "move(MoverType, Vec3): void",
        "hurt(DamageSource, float): boolean",
        "kill(): void",
        "teleportTo(double, double, double): void",
        "save(CompoundTag): boolean",
        "load(CompoundTag): void"
      ],
      fields: [
        "level: Level",
        "random: RandomSource",
        "xRot: float",
        "yRot: float"
      ]
    },
    {
      name: "Level",
      package: "net.minecraft.world.level",
      description: "Represents a dimension in the game world",
      methods: [
        "getBlockState(BlockPos): BlockState",
        "setBlock(BlockPos, BlockState, int): boolean",
        "addEntity(Entity): boolean",
        "removeBlock(BlockPos, boolean): boolean",
        "isDay(): boolean",
        "playSound(Player, BlockPos, SoundEvent, SoundSource, float, float): void"
      ],
      fields: [
        "isClientSide: boolean",
        "random: RandomSource",
        "MAX_LEVEL_SIZE: int",
        "MIN_HEIGHT: int"
      ]
    }
  ];

  // Recent NeoForge docs
  const recentDocs: DocEntry[] = [
    {
      id: "datacomponent",
      title: "DataComponent System",
      category: "core",
      type: "concept",
      content: "The DataComponent system is a new feature in NeoForge 1.21.5...",
      isNew: true
    },
    {
      id: "blockentitycomponents",
      title: "Block Entity Components",
      category: "blocks",
      type: "class",
      content: "Block Entity Components allow for modular functionality...",
      isNew: true
    }
  ];

  // Filter docs based on search query and category
  useEffect(() => {
    setIsFetchingDocs(true);
    
    setTimeout(() => {
      let docs: DocEntry[] = [];
      
      if (docTab === "neoforge") {
        docs = neoForgeDocs;
      } else if (docTab === "minecraft") {
        // Convert API classes to doc entries
        docs = minecraftApiClasses.map(apiClass => ({
          id: apiClass.name.toLowerCase(),
          title: apiClass.name,
          category: "api",
          type: "class",
          content: `# ${apiClass.name}\n\nPackage: ${apiClass.package}\n\n${apiClass.description}`,
          code: `// Example usage of ${apiClass.name}\n\n// See methods and fields in the sidebar`
        }));
      } else if (docTab === "recent") {
        docs = recentDocs;
      }
      
      // Apply category filter
      if (searchCategory !== "all") {
        docs = docs.filter(doc => doc.category === searchCategory);
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        docs = docs.filter(doc => 
          doc.title.toLowerCase().includes(query) || 
          doc.content.toLowerCase().includes(query) ||
          (doc.code && doc.code.toLowerCase().includes(query))
        );
      }
      
      setFilteredDocs(docs);
      setIsFetchingDocs(false);
    }, 300);
  }, [searchQuery, docTab, searchCategory]);

  // Handle doc selection
  const handleSelectDoc = (doc: DocEntry) => {
    setSelectedDoc(doc);
    
    // Add to history if not already there
    if (!docHistory.some(historyDoc => historyDoc.id === doc.id)) {
      setDocHistory(prev => [doc, ...prev].slice(0, 5));
    }
  };

  // Handle chat question
  const handleAskQuestion = () => {
    if (!chatQuestion.trim()) return;
    
    setIsLoadingChat(true);
    
    // In a real implementation, this would call Claude API
    setTimeout(() => {
      // Generate a sample response based on the question
      let response = "";
      
      if (chatQuestion.toLowerCase().includes("component")) {
        response = `# Using Components in NeoForge 1.21.5

The component system in NeoForge 1.21.5 replaces inheritance-based approaches with a more flexible composition pattern. Here's how to use it effectively:

## Basic Component Usage

1. **Attaching Components**: Use the \`setData\` method on items during registration

\`\`\`java
item.setData(ItemComponentsKeys.DURABILITY, new Item.DurabilityComponent(250));
\`\`\`

2. **Retrieving Components**: Use the \`getData\` method on ItemStack

\`\`\`java
DurabilityComponent durability = stack.getData(ItemComponentsKeys.DURABILITY);
if (durability != null) {
    int maxDurability = durability.getMaxDurability();
}
\`\`\`

3. **Common Component Keys**:
   - \`ItemComponentsKeys.DURABILITY\`: For item durability
   - \`ItemComponentsKeys.MELEE_WEAPON\`: For attack damage and speed
   - \`ItemComponentsKeys.FOOD\`: For edible items
   - \`ItemComponentsKeys.WEARABLE\`: For armor items

## Registration Example

\`\`\`java
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ITEMS, 
            new ResourceLocation(MOD_ID, "custom_sword"),
            () -> new Item(new Item.Properties())
                .setData(ItemComponentsKeys.DURABILITY, new Item.DurabilityComponent(250))
                .setData(ItemComponentsKeys.MELEE_WEAPON, new Item.MeleeWeaponComponent(3.0f, 2.0f, -2.4f)));
    });
}
\`\`\`

Would you like me to explain any specific component in more detail?`;
      } else if (chatQuestion.toLowerCase().includes("registry") || chatQuestion.toLowerCase().includes("register")) {
        response = `# Understanding the New Registry System in NeoForge 1.21.5

NeoForge 1.21.5 introduces a major change to how game objects are registered. The old DeferredRegister system has been replaced with a ComponentRegistry approach.

## Key Differences

1. **ComponentRegistry vs DeferredRegister**
   - ComponentRegistry is used for all registrable objects
   - No event bus registration is required
   - Components can be attached during registration

2. **ResourceKey Usage**
   - Registry keys are created using ResourceKey.createRegistryKey()
   - Registry entries use DeferredHolder instead of RegistryObject

3. **Registration Process**

\`\`\`java
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(BLOCKS, 
            new ResourceLocation(MOD_ID, "custom_block"),
            () -> new Block(BlockBehaviour.Properties.of()));
    });
}
\`\`\`

4. **Migration Steps**
   - Replace DeferredRegister with direct ComponentRegistry usage
   - Update registry references to use DeferredHolder
   - Remove event bus registration calls
   - Define ResourceKeys for all registries you use

Does this help explain the new registry system? Let me know if you need more specific examples.`;
      } else {
        response = `Thank you for your question about "${chatQuestion}".

Based on NeoForge 1.21.5 documentation, I can provide the following information:

${chatQuestion.toLowerCase().includes("block") ? `
## Blocks in NeoForge 1.21.5

Blocks in NeoForge 1.21.5 follow the same basic structure as vanilla Minecraft, but with some important differences:

1. **Registration**: Use ComponentRegistry instead of DeferredRegister

\`\`\`java
registry.register(registration -> {
    registration.register(BLOCKS, 
        new ResourceLocation(MOD_ID, "custom_block"),
        () -> new Block(BlockBehaviour.Properties.of()));
});
\`\`\`

2. **Block Properties**: Define using BlockBehaviour.Properties

\`\`\`java
BlockBehaviour.Properties.of()
    .mapColor(MapColor.STONE)
    .strength(3.0F)
    .requiresCorrectToolForDrops()
\`\`\`

3. **Block Entities**: Can now use components similar to items

Would you like more specific information about block implementation?
` : `

I recommend checking the official NeoForge documentation for more details about this topic. You can also look at specific examples in the docs section of this tool.

Is there anything specific about "${chatQuestion}" that you'd like me to clarify?`}`;
      }
      
      setChatResponse(response);
      setIsLoadingChat(false);
    }, 2000);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "items":
        return "Items";
      case "blocks":
        return "Blocks";
      case "entities":
        return "Entities";
      case "registry":
        return "Registry";
      case "core":
        return "Core API";
      case "api":
        return "API Reference";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Code className="h-4 w-4 text-blue-400" />;
      case "method":
        return <Command className="h-4 w-4 text-purple-400" />;
      case "field":
        return <FileText className="h-4 w-4 text-emerald-400" />;
      case "enum":
        return <Layers className="h-4 w-4 text-amber-400" />;
      case "interface":
        return <Package className="h-4 w-4 text-indigo-400" />;
      case "concept":
        return <BookMarked className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  // Format content with markdown-like syntax
  const formatContent = (content: string) => {
    // Split into lines
    const lines = content.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('# ')) {
        formattedLines.push(<h1 key={i} className="text-xl font-bold text-white mb-3">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        formattedLines.push(<h2 key={i} className="text-lg font-semibold text-white mt-4 mb-2">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        formattedLines.push(<h3 key={i} className="text-md font-semibold text-white mt-3 mb-2">{line.substring(4)}</h3>);
      }
      // Code blocks (simple version - would use syntax highlighting in real implementation)
      else if (line.trim() === '```java' || line.trim() === '```') {
        // Collect all lines until closing ```
        const codeLines = [];
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('```')) {
          codeLines.push(lines[j]);
          j++;
        }
        formattedLines.push(
          <div key={i} className="bg-gray-950 rounded-md p-3 my-2 overflow-x-auto">
            <pre className="text-xs text-green-300 font-mono">
              {codeLines.join('\n')}
            </pre>
          </div>
        );
        i = j; // Skip to after closing ```
      }
      // Lists
      else if (line.trim().startsWith('- ')) {
        formattedLines.push(
          <li key={i} className="text-gray-300 ml-4 my-1 flex items-start">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
            <span>{line.substring(2)}</span>
          </li>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const num = line.trim().match(/^\d+/)[0];
        const text = line.trim().replace(/^\d+\.\s/, '');
        formattedLines.push(
          <li key={i} className="text-gray-300 ml-4 my-1 flex items-start">
            <span className="text-blue-500 mr-2 flex-shrink-0">{num}.</span>
            <span>{text}</span>
          </li>
        );
      }
      // Regular text (paragraphs)
      else if (line.trim() !== '') {
        formattedLines.push(<p key={i} className="text-gray-300 my-2">{line}</p>);
      }
      // Empty line
      else {
        formattedLines.push(<div key={i} className="h-2"></div>);
      }
    }
    
    return <div>{formattedLines}</div>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with search */}
      <div className="bg-gray-800/30 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
          NeoForge Documentation
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-56">
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-gray-800 border-gray-700"
            />
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setChatModalOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask Claude
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-grow flex overflow-hidden">
        <Tabs value={docTab} onValueChange={setDocTab} className="flex flex-col w-full h-full">
          <div className="bg-gray-800/30 px-4 pt-2 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <TabsList className="bg-gray-800/50">
                <TabsTrigger value="neoforge">NeoForge 1.21.5</TabsTrigger>
                <TabsTrigger value="minecraft">Minecraft API</TabsTrigger>
                <TabsTrigger value="recent">
                  Recently Added
                  <span className="ml-1.5 bg-blue-900/60 text-blue-300 rounded-full px-1.5 py-0.5 text-[10px]">
                    New
                  </span>
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              {docTab === "neoforge" && (
                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger className="w-[100px] h-8 bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="1.21.5">1.21.5</SelectItem>
                    <SelectItem value="1.21.1">1.21.1</SelectItem>
                    <SelectItem value="1.20.4">1.20.4</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          {/* Tab content */}
          <div className="flex-grow flex overflow-hidden">
            {/* Left sidebar - Doc list */}
            <div className="w-1/3 border-r border-gray-700 overflow-auto p-4">
              <div className="flex justify-between items-center mb-3">
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger className="w-[130px] h-8 bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="core">Core API</SelectItem>
                    <SelectItem value="items">Items</SelectItem>
                    <SelectItem value="blocks">Blocks</SelectItem>
                    <SelectItem value="entities">Entities</SelectItem>
                    <SelectItem value="registry">Registry</SelectItem>
                    {docTab === "minecraft" && (
                      <SelectItem value="api">API Reference</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery("");
                    setSearchCategory("all");
                  }}
                  className="h-7 px-2"
                  disabled={searchQuery === "" && searchCategory === "all"}
                >
                  <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Reset</span>
                </Button>
              </div>
              
              {isFetchingDocs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : filteredDocs.length > 0 ? (
                <div className="space-y-1">
                  {filteredDocs.map(doc => (
                    <div
                      key={doc.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedDoc?.id === doc.id 
                          ? "bg-blue-900/30 text-blue-300" 
                          : "hover:bg-gray-800/50 text-gray-300"
                      }`}
                      onClick={() => handleSelectDoc(doc)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getDocIcon(doc.type)}
                          <span className="ml-2 font-medium">{doc.title}</span>
                        </div>
                        
                        {doc.isNew && (
                          <span className="text-xs bg-blue-900/60 text-blue-300 rounded-full px-1.5 py-0.5">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 ml-6 mt-0.5">
                        {getCategoryLabel(doc.category)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <HelpCircle className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-400">No documentation found</p>
                  <p className="text-xs text-gray-500 mt-1">Try different search terms</p>
                </div>
              )}
              
              {/* API Class Methods/Fields (for Minecraft API tab) */}
              {docTab === "minecraft" && selectedDoc && (
                <div className="mt-6">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Methods</h3>
                    <div className="space-y-1 ml-2">
                      {minecraftApiClasses
                        .find(cls => cls.name.toLowerCase() === selectedDoc.id)
                        ?.methods.map((method, idx) => (
                          <div key={idx} className="text-xs text-gray-300 py-1 px-2 hover:bg-gray-800/50 rounded">
                            {method}
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Fields</h3>
                    <div className="space-y-1 ml-2">
                      {minecraftApiClasses
                        .find(cls => cls.name.toLowerCase() === selectedDoc.id)
                        ?.fields.map((field, idx) => (
                          <div key={idx} className="text-xs text-gray-300 py-1 px-2 hover:bg-gray-800/50 rounded">
                            {field}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Main content - Selected doc */}
            <div className="w-2/3 p-4 overflow-auto">
              {selectedDoc ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        {getDocIcon(selectedDoc.type)}
                        <h2 className="text-xl font-bold text-white ml-2">{selectedDoc.title}</h2>
                        {selectedDoc.isNew && (
                          <span className="ml-2 text-xs bg-blue-900/60 text-blue-300 rounded-full px-2 py-0.5">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 ml-6">
                        {getCategoryLabel(selectedDoc.category)}
                        {docTab === "neoforge" && (
                          <span className="ml-2 text-xs bg-gray-800 rounded-full px-2 py-0.5">
                            {selectedVersion}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {selectedDoc.url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Official Docs
                        </a>
                      </Button>
                    )}
                  </div>
                  
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="bg-gray-800/50">
                      <TabsTrigger value="content">Documentation</TabsTrigger>
                      {selectedDoc.code && (
                        <TabsTrigger value="code">Example Code</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="content" className="pt-4">
                      <div className="prose prose-invert max-w-none">
                        {formatContent(selectedDoc.content)}
                      </div>
                      
                      {selectedDoc.related && selectedDoc.related.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Related Topics</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedDoc.related.map(relatedId => {
                              const relatedDoc = neoForgeDocs.find(d => d.id === relatedId);
                              return relatedDoc ? (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSelectDoc(relatedDoc)}
                                  className="h-7"
                                >
                                  {getDocIcon(relatedDoc.type)}
                                  <span className="ml-1 text-xs">{relatedDoc.title}</span>
                                </Button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    {selectedDoc.code && (
                      <TabsContent value="code" className="pt-4">
                        <div className="bg-gray-950 rounded-md p-3 overflow-x-auto">
                          <div className="flex justify-end mb-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                navigator.clipboard.writeText(selectedDoc.code || "");
                                toast({
                                  title: "Copied to Clipboard",
                                  description: "Code example has been copied to your clipboard.",
                                });
                              }}
                              className="h-7 px-2"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Copy</span>
                            </Button>
                          </div>
                          <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap">
                            {selectedDoc.code}
                          </pre>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              ) : docTab === "history" && docHistory.length > 0 ? (
                <div>
                  <h2 className="text-lg font-medium text-white mb-4">Recently Viewed Topics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {docHistory.map(doc => (
                      <Card 
                        key={doc.id}
                        className="p-4 bg-gray-800/30 border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
                        onClick={() => handleSelectDoc(doc)}
                      >
                        <div className="flex items-center mb-2">
                          {getDocIcon(doc.type)}
                          <h3 className="font-medium text-white ml-2">{doc.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {doc.content.substring(0, 100).replace(/#/g, '')}...
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {getCategoryLabel(doc.category)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BookOpen className="h-12 w-12 text-gray-500 mb-3" />
                  <h3 className="text-lg font-medium text-white mb-1">Select a Topic</h3>
                  <p className="text-gray-400 max-w-md mb-4">
                    Choose a documentation topic from the left panel or search for specific information.
                  </p>
                  <Button 
                    onClick={() => setChatModalOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ask a Question
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
      
      {/* Chat dialog */}
      <Dialog open={chatModalOpen} onOpenChange={setChatModalOpen}>
        <DialogContent className="max-w-3xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-indigo-400" />
              Ask Claude About NeoForge 1.21.5
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Get answers to your NeoForge development questions from Claude AI
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <Input
                  placeholder="Ask a question about NeoForge 1.21.5..."
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleAskQuestion}
                disabled={!chatQuestion.trim() || isLoadingChat}
              >
                {isLoadingChat ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ask"
                )}
              </Button>
            </div>
            
            {isLoadingChat ? (
              <div className="h-64 bg-gray-800/20 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-2" />
                  <p className="text-gray-400">Claude is thinking...</p>
                </div>
              </div>
            ) : chatResponse ? (
              <div className="bg-gray-800/20 rounded-md p-4 overflow-auto max-h-[400px]">
                <div className="prose prose-invert max-w-none">
                  {formatContent(chatResponse)}
                </div>
              </div>
            ) : (
              <div className="h-64 bg-gray-800/20 rounded-md p-6 flex flex-col items-center justify-center text-center">
                <MessageSquare className="h-10 w-10 text-gray-500 mb-3" />
                <h3 className="text-white font-medium mb-2">Ask anything about NeoForge 1.21.5</h3>
                <p className="text-gray-400 max-w-md">
                  Get help with component systems, registration, blocks, items, entities, and more.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChatQuestion("How do I use the component system?")}
                    className="text-xs h-8"
                  >
                    How do I use the component system?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChatQuestion("Explain the new registry system")}
                    className="text-xs h-8"
                  >
                    Explain the new registry system
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}