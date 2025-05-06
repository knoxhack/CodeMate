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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, Code, Play, ChevronRight, Sparkles, Check, Copy, Clipboard, Loader2, LightbulbIcon } from "lucide-react";

interface EducationalCodeGenerationProps {
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

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  code: string;
  explanation: string;
}

export default function EducationalCodeGeneration({
  open,
  onOpenChange,
  editor,
  file,
  projectId,
}: EducationalCodeGenerationProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generationExplanation, setGenerationExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample code templates for NeoForge 1.21.5
  const codeTemplates: CodeTemplate[] = [
    {
      id: "block-basic",
      name: "Basic Block",
      description: "Create a simple solid block with custom properties",
      category: "blocks",
      difficulty: "beginner",
      code: `public class MyCustomBlock extends Block {
    public MyCustomBlock() {
        super(Properties.of()
            .mapColor(MapColor.STONE)
            .requiresCorrectToolForDrops()
            .strength(3.0F, 3.0F));
    }
}

// Registration in your registry class:
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "block")),
            new ResourceLocation(MOD_ID, "my_custom_block"),
            () -> new MyCustomBlock());
    });
}`,
      explanation: `This template creates a basic solid block in NeoForge 1.21.5.

## Key Components:
1. **Block Properties**: The block uses \`Properties.of()\` to set its characteristics:
   - \`mapColor\`: Defines the color shown on maps
   - \`requiresCorrectToolForDrops\`: Makes the block only drop items when mined with the appropriate tool
   - \`strength\`: Sets mining difficulty (first parameter) and blast resistance (second parameter)

2. **Component-Based Registration**: NeoForge 1.21.5 uses a component-based registry system instead of the older DeferredRegister system.
   - \`ComponentRegistry\` allows registration of blocks
   - \`ResourceLocation\` is used to define the registry key and the block ID
   - The block instance is created using a lambda to allow lazy initialization

## How to Extend:
- Add custom behavior by overriding methods like \`use\`, \`onRemove\`, or \`animateTick\`
- Set additional properties like sound type, light level, or friction
- Add custom block states using the \`stateDefinition\` method`
    },
    {
      id: "item-tool",
      name: "Custom Tool Item",
      description: "Create a tool item with durability and attack components",
      category: "items",
      difficulty: "intermediate",
      code: `public class CustomSwordItem extends Item {
    public CustomSwordItem() {
        super(new Item.Properties());
    }
    
    // Called during registration
    public static CustomSwordItem create() {
        return new CustomSwordItem()
            // Set durability component
            .setData(ItemComponentsKeys.DURABILITY, 
                new Item.DurabilityComponent(500))
            // Set attack damage component
            .setData(ItemComponentsKeys.MELEE_WEAPON, 
                new Item.MeleeWeaponComponent(3.0f, 2.0f, -2.4f));
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        ItemStack stack = player.getItemInHand(hand);
        
        // Custom behavior when right-clicked
        if (!level.isClientSide()) {
            player.getCooldowns().addCooldown(this, 20); // 1 second cooldown
            
            // Example: Applying a status effect when used
            player.addEffect(new MobEffectInstance(MobEffects.MOVEMENT_SPEED, 60, 0));
        }
        
        return InteractionResultHolder.success(stack);
    }
}

// Registration in your registry class:
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "item")),
            new ResourceLocation(MOD_ID, "custom_sword"),
            CustomSwordItem::create);
    });
}`,
      explanation: `This template creates a custom sword item using NeoForge 1.21.5's component system.

## Key Components:
1. **Component-Based Item**: Instead of extending SwordItem (inheritance), we use components:
   - \`DurabilityComponent\`: Manages the item's durability (500 uses)
   - \`MeleeWeaponComponent\`: Handles attack damage (3.0 base damage, 2.0 attack damage bonus, -2.4 attack speed)
   
2. **Static Factory Method**: The \`create()\` method serves as a factory, setting up all components.

3. **Custom Use Behavior**: The \`use\` method is overridden to:
   - Add a cooldown when used
   - Apply a speed boost effect to the player
   - Return a success result with the original item stack

4. **Modern Registration**: Uses the new component registry system with ResourceKey and ResourceLocation.

## Component System Benefits:
- More flexible than inheritance - can combine multiple behaviors
- Easier to modify stats without creating new classes
- Better separation of data from behavior
- More aligned with Minecraft's own internal systems

## How to Extend:
- Add more components like \`FoodComponent\` or custom components
- Override more methods for custom behavior
- Add texture and model references in your resource packs`
    },
    {
      id: "entity-basic",
      name: "Basic Entity",
      description: "Create a custom entity with basic AI and attributes",
      category: "entities",
      difficulty: "advanced",
      code: `public class CustomEntity extends PathfinderMob {
    public static final EntityDataAccessor<Boolean> IS_AGGRESSIVE = 
        SynchedEntityData.defineId(CustomEntity.class, EntityDataSerializers.BOOLEAN);
    
    public CustomEntity(EntityType<? extends PathfinderMob> entityType, Level level) {
        super(entityType, level);
    }
    
    @Override
    protected void defineSynchedData() {
        super.defineSynchedData();
        this.entityData.define(IS_AGGRESSIVE, false);
    }
    
    public static AttributeSupplier.Builder createAttributes() {
        return Mob.createMobAttributes()
            .add(Attributes.MAX_HEALTH, 20.0)
            .add(Attributes.MOVEMENT_SPEED, 0.3)
            .add(Attributes.ATTACK_DAMAGE, 3.0);
    }
    
    @Override
    protected void registerGoals() {
        this.goalSelector.addGoal(1, new FloatGoal(this));
        this.goalSelector.addGoal(2, new MeleeAttackGoal(this, 1.0D, true));
        this.goalSelector.addGoal(3, new WaterAvoidingRandomStrollGoal(this, 1.0D));
        this.goalSelector.addGoal(4, new LookAtPlayerGoal(this, Player.class, 8.0F));
        this.goalSelector.addGoal(5, new RandomLookAroundGoal(this));
        
        this.targetSelector.addGoal(1, new HurtByTargetGoal(this));
        this.targetSelector.addGoal(2, new NearestAttackableTargetGoal<>(this, Player.class, 
            true, entity -> this.entityData.get(IS_AGGRESSIVE)));
    }
    
    @Override
    public void aiStep() {
        super.aiStep();
        
        // Example: Become aggressive when hit
        if (this.getLastHurtByMob() != null && !this.entityData.get(IS_AGGRESSIVE)) {
            this.entityData.set(IS_AGGRESSIVE, true);
        }
    }
}

// Registration in your registry class:
public static void register(ComponentRegistry registry) {
    EntityType<CustomEntity> entityType = EntityType.Builder
        .of(CustomEntity::new, MobCategory.CREATURE)
        .sized(0.9F, 1.3F)
        .build(new ResourceLocation(MOD_ID, "custom_entity").toString());
        
    registry.register(registration -> {
        // Register entity type
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "entity_type")),
            new ResourceLocation(MOD_ID, "custom_entity"),
            () -> entityType);
            
        // Register attributes
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "attribute")),
            new ResourceLocation(MOD_ID, "custom_entity_attributes"),
            () -> CustomEntity.createAttributes().build());
    });
}`,
      explanation: `This template creates a custom entity with basic AI behavior in NeoForge 1.21.5.

## Key Components:
1. **Entity Class Structure**:
   - Extends \`PathfinderMob\` for basic AI capabilities
   - Constructs with an \`EntityType\` and \`Level\`
   - Uses \`EntityDataAccessor\` for synchronized data between client/server

2. **AI and Attributes**:
   - \`createAttributes()\`: Defines base stats like health, speed, and attack damage
   - \`registerGoals()\`: Sets up AI goals in priority order (lower numbers = higher priority)
     - Goal Selector: behaviors the entity wants to do
     - Target Selector: determines who to attack

3. **AI Goals Included**:
   - \`FloatGoal\`: Swim when in water
   - \`MeleeAttackGoal\`: Attack targets
   - \`WaterAvoidingRandomStrollGoal\`: Wander around, avoiding water
   - \`LookAtPlayerGoal\`: Look at nearby players
   - \`RandomLookAroundGoal\`: Occasionally look around randomly
   - \`HurtByTargetGoal\`: Target entities that hurt it
   - \`NearestAttackableTargetGoal\`: Target nearby players when aggressive

4. **Custom Behavior**:
   - Tracks aggression state using synced data
   - \`aiStep()\`: Called each tick to update AI, used to change behavior when hurt

5. **Modern Registration**:
   - Registers both the entity type and its attributes
   - Uses the component registry system with proper resource keys

## How to Extend:
- Add custom animations or sounds
- Override \`getAmbientSound()\`, \`getHurtSound()\`, and \`getDeathSound()\`
- Add more complex AI goals
- Implement custom attacks or abilities
- Add loot tables for drops`
    },
    {
      id: "tile-entity",
      name: "Block Entity (Tile Entity)",
      description: "Create a block with associated block entity data",
      category: "blocks",
      difficulty: "advanced",
      code: `// 1. The Block Class
public class CustomBlockWithEntity extends BaseEntityBlock {
    public CustomBlockWithEntity() {
        super(Properties.of()
            .mapColor(MapColor.STONE)
            .strength(3.5F)
            .requiresCorrectToolForDrops()
            .sound(SoundType.STONE));
    }
    
    @Override
    public RenderShape getRenderShape(BlockState state) {
        return RenderShape.MODEL; // Use a standard block model
    }
    
    @Override
    public void onRemove(BlockState pState, Level pLevel, BlockPos pPos, BlockState pNewState, boolean pIsMoving) {
        if (!pState.is(pNewState.getBlock())) {
            BlockEntity blockEntity = pLevel.getBlockEntity(pPos);
            if (blockEntity instanceof CustomBlockEntity) {
                // Drop inventory contents if present
                // ((CustomBlockEntity)blockEntity).dropContents();
            }
            
            super.onRemove(pState, pLevel, pPos, pNewState, pIsMoving);
        }
    }
    
    @Override
    public InteractionResult use(BlockState pState, Level pLevel, BlockPos pPos, Player pPlayer, 
                                InteractionHand pHand, BlockHitResult pHit) {
        if (!pLevel.isClientSide()) {
            BlockEntity be = pLevel.getBlockEntity(pPos);
            if (be instanceof CustomBlockEntity) {
                // Example: Open menu or perform action
                pPlayer.sendSystemMessage(Component.literal("Interacted with custom block entity!"));
            }
        }
        return InteractionResult.sidedSuccess(pLevel.isClientSide());
    }
    
    @Override
    public BlockEntity newBlockEntity(BlockPos pPos, BlockState pState) {
        return new CustomBlockEntity(pPos, pState);
    }
    
    @Override
    public <T extends BlockEntity> BlockEntityTicker<T> getTicker(Level pLevel, BlockState pState, BlockEntityType<T> pBlockEntityType) {
        return pLevel.isClientSide() ? null : 
            createTickerHelper(pBlockEntityType, ModBlockEntities.CUSTOM_BLOCK_ENTITY.get(), 
                CustomBlockEntity::serverTick);
    }
}

// 2. The Block Entity Class
public class CustomBlockEntity extends BlockEntity {
    private int counter = 0;
    
    public CustomBlockEntity(BlockPos pos, BlockState state) {
        super(ModBlockEntities.CUSTOM_BLOCK_ENTITY.get(), pos, state);
    }
    
    @Override
    protected void saveAdditional(CompoundTag tag) {
        super.saveAdditional(tag);
        tag.putInt("Counter", counter);
    }
    
    @Override
    public void load(CompoundTag tag) {
        super.load(tag);
        counter = tag.getInt("Counter");
    }
    
    public static void serverTick(Level level, BlockPos pos, BlockState state, CustomBlockEntity blockEntity) {
        blockEntity.counter++;
        
        // Example: Every 20 ticks (1 second), do something
        if (blockEntity.counter % 20 == 0) {
            level.setBlock(pos, state, 3);
            blockEntity.setChanged();
        }
    }
}

// 3. Registration in ModBlocks and ModBlockEntities classes
public class ModBlocks {
    public static void register(ComponentRegistry registry) {
        registry.register(registration -> {
            registration.register(ResourceKey.createRegistryKey(
                new ResourceLocation("minecraft", "block")),
                new ResourceLocation(MOD_ID, "custom_block"),
                () -> new CustomBlockWithEntity());
        });
    }
}

public class ModBlockEntities {
    public static final DeferredHolder<BlockEntityType<?>, BlockEntityType<CustomBlockEntity>> CUSTOM_BLOCK_ENTITY =
        registerBlockEntity("custom_block_entity", CustomBlockEntity::new, () -> ModBlocks.CUSTOM_BLOCK.get());
    
    private static <T extends BlockEntity> DeferredHolder<BlockEntityType<?>, BlockEntityType<T>> registerBlockEntity(
            String name, BlockEntityType.BlockEntitySupplier<T> factory, Supplier<Block> block) {
        return RegistryManager.BLOCK_ENTITIES.register(name, 
            () -> BlockEntityType.Builder.of(factory, block.get()).build(null));
    }
    
    public static void register() {
        // Initialize the class to register block entities
    }
}`,
      explanation: `This template creates a block with an associated block entity (formerly known as a tile entity) in NeoForge 1.21.5.

## Key Components:
1. **Block with Entity**:
   - Extends \`BaseEntityBlock\` which provides integration with block entities
   - \`getRenderShape\`: Determines how the block is rendered (MODEL = standard rendering)
   - \`onRemove\`: Handles cleanup when the block is broken
   - \`use\`: Handles right-click interactions with the block
   - \`newBlockEntity\`: Creates a new block entity instance
   - \`getTicker\`: Sets up periodic updates for the block entity (if needed)

2. **Block Entity Class**:
   - Extends \`BlockEntity\` to store data associated with the block
   - \`saveAdditional\`: Saves custom data to NBT
   - \`load\`: Loads custom data from NBT
   - \`serverTick\`: Static method called each tick to update the block entity

3. **Registration**:
   - Block registration using ComponentRegistry
   - Block entity registration using DeferredHolder (which persists from older versions)
   - Note how the block entity is linked to its corresponding block(s)

## Technical Aspects:
- \`setChanged()\`: Marks the block entity as changed, triggering a data save
- \`level.setBlock(pos, state, 3)\`: Updates the block state and notifies neighboring blocks
- Block entity tickers run code periodically without needing scheduled ticks

## Common Use Cases:
- Inventory storage
- Energy/fluid storage and transfer
- Complex block mechanics with state
- Blocks that need to store NBT data

## How to Extend:
- Implement \`Container\` and menu systems for GUIs
- Add inventory capabilities using \`IItemHandler\`
- Add energy or fluid capabilities
- Implement more complex tick behaviors
- Create a custom renderer for special rendering`
    },
    {
      id: "recipe-type",
      name: "Custom Recipe Type",
      description: "Create a new recipe type with serializer",
      category: "crafting",
      difficulty: "advanced",
      code: `// 1. Recipe Class
public class CustomRecipe implements Recipe<Container> {
    private final ResourceLocation id;
    private final ItemStack result;
    private final Ingredient ingredient;
    private final int processingTime;
    
    public CustomRecipe(ResourceLocation id, ItemStack result, Ingredient ingredient, int processingTime) {
        this.id = id;
        this.result = result;
        this.ingredient = ingredient;
        this.processingTime = processingTime;
    }
    
    @Override
    public boolean matches(Container container, Level level) {
        return this.ingredient.test(container.getItem(0));
    }
    
    @Override
    public ItemStack assemble(Container container, RegistryAccess registryAccess) {
        return this.result.copy();
    }
    
    @Override
    public boolean canCraftInDimensions(int width, int height) {
        return true;
    }
    
    @Override
    public ItemStack getResultItem(RegistryAccess registryAccess) {
        return this.result;
    }
    
    @Override
    public ResourceLocation getId() {
        return this.id;
    }
    
    @Override
    public RecipeSerializer<?> getSerializer() {
        return ModRecipes.CUSTOM_RECIPE_SERIALIZER.get();
    }
    
    @Override
    public RecipeType<?> getType() {
        return ModRecipes.CUSTOM_RECIPE_TYPE.get();
    }
    
    public Ingredient getIngredient() {
        return this.ingredient;
    }
    
    public int getProcessingTime() {
        return this.processingTime;
    }
}

// 2. Recipe Serializer
public class CustomRecipeSerializer implements RecipeSerializer<CustomRecipe> {
    @Override
    public CustomRecipe fromJson(ResourceLocation recipeId, JsonObject json) {
        JsonElement resultElement = GsonHelper.isArrayNode(json, "result") ? 
            GsonHelper.getAsJsonArray(json, "result") : 
            GsonHelper.getAsJsonObject(json, "result");
            
        ItemStack result = ShapedRecipe.itemStackFromJson(resultElement);
        JsonElement ingredientElement = GsonHelper.getAsJsonObject(json, "ingredient");
        Ingredient ingredient = Ingredient.fromJson(ingredientElement);
        int processingTime = GsonHelper.getAsInt(json, "processingTime", 200);
        
        return new CustomRecipe(recipeId, result, ingredient, processingTime);
    }
    
    @Override
    public CustomRecipe fromNetwork(ResourceLocation recipeId, FriendlyByteBuf buffer) {
        Ingredient ingredient = Ingredient.fromNetwork(buffer);
        ItemStack result = buffer.readItem();
        int processingTime = buffer.readVarInt();
        
        return new CustomRecipe(recipeId, result, ingredient, processingTime);
    }
    
    @Override
    public void toNetwork(FriendlyByteBuf buffer, CustomRecipe recipe) {
        recipe.getIngredient().toNetwork(buffer);
        buffer.writeItem(recipe.getResultItem(null));
        buffer.writeVarInt(recipe.getProcessingTime());
    }
}

// 3. Recipe Type
public class ModRecipes {
    public static final DeferredHolder<RecipeType<?>, RecipeType<CustomRecipe>> CUSTOM_RECIPE_TYPE = 
        registerRecipeType("custom_recipe");
        
    public static final DeferredHolder<RecipeSerializer<?>, RecipeSerializer<CustomRecipe>> CUSTOM_RECIPE_SERIALIZER = 
        RegistryManager.RECIPE_SERIALIZERS.register("custom_recipe", CustomRecipeSerializer::new);
    
    private static <T extends Recipe<?>> DeferredHolder<RecipeType<?>, RecipeType<T>> registerRecipeType(String name) {
        return RegistryManager.RECIPE_TYPES.register(name, 
            () -> new RecipeType<T>() {
                @Override
                public String toString() {
                    return name;
                }
            });
    }
    
    public static void register() {
        // Initialize the class to register recipe types and serializers
    }
}

// 4. Example JSON recipe file to be placed in resources/data/modid/recipes/custom/example.json
/*
{
  "type": "modid:custom_recipe",
  "ingredient": {
    "item": "minecraft:iron_ingot"
  },
  "result": {
    "item": "modid:custom_item",
    "count": 1
  },
  "processingTime": 200
}
*/`,
      explanation: `This template creates a custom recipe type for NeoForge 1.21.5, allowing you to define new crafting mechanics beyond the vanilla crafting table, furnace, etc.

## Key Components:
1. **Custom Recipe Class**:
   - Implements the \`Recipe<Container>\` interface
   - Stores recipe data: input ingredient, output result, and custom properties
   - \`matches\`: Determines if a given container's contents match this recipe
   - \`assemble\`: Creates the result stack when crafting completes
   - \`getResultItem\`: Returns the result of the recipe
   - \`getSerializer\` and \`getType\`: Connect to registration system

2. **Recipe Serializer**:
   - Handles converting between JSON, network packets, and recipe objects
   - \`fromJson\`: Parses a recipe from a JSON file in a datapack
   - \`fromNetwork\`: Reads recipe data from the network
   - \`toNetwork\`: Writes recipe data to the network

3. **Recipe Type**:
   - Defines a category of recipes (like "crafting", "smelting", etc.)
   - Used for recipe lookup and management
   - Registered using DeferredHolder

4. **JSON Recipe Format**:
   - Example of how the recipe would be defined in a datapack
   - Contains ingredients, results, and custom properties

## Technical Aspects:
- \`Ingredient\`: Versatile input matcher that can accept items, tags, or groups
- Recipe system is data-driven, allowing pack makers to add recipes without code
- Uses JSON for human-readable recipe definitions

## Use Cases:
- Custom machines with specialized processing
- Multi-step crafting processes
- Recipes with additional parameters (time, energy, etc.)
- Special crafting mechanics (e.g., infusion, assembly)

## How to Extend:
- Add support for multiple ingredients
- Create a custom container type for complex recipes
- Add more properties like energy cost or catalyst items
- Implement a special crafting block that uses these recipes`
    },
    {
      id: "capability-provider",
      name: "Capability Provider",
      description: "Implement capability system for enhanced item functionality",
      category: "items",
      difficulty: "advanced",
      code: `// 1. Custom Capability Interface
public interface IEnergySink {
    int receiveEnergy(int maxReceive, boolean simulate);
    int getEnergyStored();
    int getMaxEnergyStored();
    boolean canReceive();
}

// 2. Capability Implementation
public class EnergySinkImpl implements IEnergySink {
    private int energy;
    private final int maxEnergy;
    
    public EnergySinkImpl(int maxEnergy) {
        this.maxEnergy = maxEnergy;
        this.energy = 0;
    }
    
    @Override
    public int receiveEnergy(int maxReceive, boolean simulate) {
        int energyReceived = Math.min(maxEnergy - energy, maxReceive);
        
        if (!simulate) {
            energy += energyReceived;
        }
        
        return energyReceived;
    }
    
    @Override
    public int getEnergyStored() {
        return energy;
    }
    
    @Override
    public int getMaxEnergyStored() {
        return maxEnergy;
    }
    
    @Override
    public boolean canReceive() {
        return true;
    }
}

// 3. Capability Registration
public class ModCapabilities {
    // Define capability token
    public static final Capability<IEnergySink> ENERGY_SINK = CapabilityManager.get(
        new CapabilityToken<IEnergySink>() {});
        
    public static void register(RegisterCapabilitiesEvent event) {
        event.register(IEnergySink.class);
    }
}

// 4. Item with Capability
public class EnergyStoneItem extends Item {
    public EnergyStoneItem() {
        super(new Item.Properties().stacksTo(1));
    }
    
    @Override
    public InteractionResult useOn(UseOnContext context) {
        Level level = context.getLevel();
        BlockPos pos = context.getClickedPos();
        BlockState state = level.getBlockState(pos);
        
        // Example using capability to drain energy from a block
        if (!level.isClientSide()) {
            BlockEntity blockEntity = level.getBlockEntity(pos);
            if (blockEntity != null) {
                // Look for energy capability in the block
                blockEntity.getCapability(Capabilities.ENERGY).ifPresent(targetEnergy -> {
                    // Get our item's capability
                    context.getItemInHand().getCapability(ModCapabilities.ENERGY_SINK).ifPresent(sink -> {
                        int drained = targetEnergy.extractEnergy(100, false);
                        sink.receiveEnergy(drained, false);
                        
                        // Notify player
                        context.getPlayer().sendSystemMessage(Component.literal(
                            "Drained " + drained + " energy. Stone contains " + sink.getEnergyStored()));
                    });
                });
            }
        }
        
        return InteractionResult.sidedSuccess(level.isClientSide());
    }
    
    @Override
    public <T> LazyOptional<T> getCapability(Capability<T> cap, ItemStack stack, @Nullable CompoundTag nbt) {
        if (cap == ModCapabilities.ENERGY_SINK) {
            // Create or retrieve the capability handler for this item
            EnergySinkImpl handler = new EnergySinkImpl(10000);
            
            // If we have stored energy data, load it
            if (nbt != null && nbt.contains("Energy")) {
                deserializeNBT(handler, nbt);
            }
            
            return LazyOptional.of(() -> handler).cast();
        }
        
        return LazyOptional.empty();
    }
    
    @Override
    public @Nullable CompoundTag getShareTag(ItemStack stack) {
        CompoundTag nbt = stack.getOrCreateTag();
        
        // Get capability and serialize its data
        stack.getCapability(ModCapabilities.ENERGY_SINK).ifPresent(handler -> {
            serializeNBT(handler, nbt);
        });
        
        return nbt;
    }
    
    private void serializeNBT(IEnergySink handler, CompoundTag nbt) {
        nbt.putInt("Energy", handler.getEnergyStored());
    }
    
    private void deserializeNBT(EnergySinkImpl handler, CompoundTag nbt) {
        int energy = nbt.getInt("Energy");
        handler.receiveEnergy(energy, false);
    }
}

// 5. Registration of capability-providing item
public class ModItems {
    public static void register(ComponentRegistry registry) {
        registry.register(registration -> {
            registration.register(ResourceKey.createRegistryKey(
                new ResourceLocation("minecraft", "item")),
                new ResourceLocation(MOD_ID, "energy_stone"),
                () -> new EnergyStoneItem());
        });
    }
}

// 6. Register capability in your main mod class's event handlers
// @SubscribeEvent
// public static void registerCapabilities(RegisterCapabilitiesEvent event) {
//     ModCapabilities.register(event);
// }`,
      explanation: `This template implements a custom capability for an item in NeoForge 1.21.5, allowing for modular functionality.

## Key Components:
1. **Capability Interface**:
   - \`IEnergySink\`: Defines the contract for objects that can receive energy
   - Methods for receiving energy, querying storage, and checking conditions

2. **Capability Implementation**:
   - \`EnergySinkImpl\`: Concrete implementation of the capability
   - Stores energy value and handles energy input with validation

3. **Capability Registration**:
   - \`ModCapabilities\`: Registers the capability type with the CapabilityManager
   - Uses CapabilityToken for type-safe capability reference

4. **Item With Capability**:
   - \`EnergyStoneItem\`: Item that provides the energy sink capability
   - \`useOn\`: Custom behavior when using the item on blocks (extracts energy)
   - \`getCapability\`: Provides capability instances when requested
   - NBT serialization methods to persist capability data

5. **Item Registration**:
   - Uses the component registry system to register the item

## Technical Aspects:
- \`LazyOptional<T>\`: A wrapper that safely handles capability access
- Capabilities are provided on request rather than always existing
- NBT serialization ensures data persists when saving/loading
- Event-based capability registration

## Benefits of Capability System:
- **Modularity**: Add functionality without inheritance
- **Compatibility**: Different mods can interact through capability interfaces
- **Performance**: Capabilities are only created when needed
- **Flexibility**: One object can provide multiple capabilities

## Common Capability Types:
- Energy storage/transfer
- Item handlers (inventories)
- Fluid tanks
- Custom data storage
- Tool functionality

## How to Extend:
- Create additional capability types
- Make blocks provide capabilities
- Add capability to entities or world chunks
- Create adapters between different capability systems`
    },
    {
      id: "datagen-provider",
      name: "Data Generation Provider",
      description: "Create data assets (recipes, loot tables) programmatically",
      category: "tools",
      difficulty: "intermediate",
      code: `// 1. Recipe Provider
public class ModRecipeProvider extends RecipeProvider {
    public ModRecipeProvider(PackOutput output, CompletableFuture<HolderLookup.Provider> lookupProvider) {
        super(output, lookupProvider);
    }
    
    @Override
    protected void buildRecipes(Consumer<FinishedRecipe> consumer) {
        // Example shaped recipe
        ShapedRecipeBuilder.shaped(RecipeCategory.MISC, ModItems.CUSTOM_ITEM.get())
            .pattern("XXX")
            .pattern("XYX")
            .pattern("XXX")
            .define('X', Items.IRON_INGOT)
            .define('Y', Items.DIAMOND)
            .unlockedBy("has_diamond", has(Items.DIAMOND))
            .save(consumer, new ResourceLocation(MOD_ID, "custom_item"));
            
        // Example smelting recipe
        SimpleCookingRecipeBuilder.smelting(
                Ingredient.of(Items.IRON_INGOT), 
                RecipeCategory.MISC,
                ModItems.PROCESSED_ITEM.get(), 
                1.0F, 
                200)
            .unlockedBy("has_iron", has(Items.IRON_INGOT))
            .save(consumer, new ResourceLocation(MOD_ID, "smelt_processed_item"));
            
        // Example custom recipe
        new CustomRecipeBuilder(ModItems.SPECIAL_ITEM.get(), 2)
            .addIngredient(ModItems.CUSTOM_ITEM.get())
            .addIngredient(Items.REDSTONE, 4)
            .setProcessingTime(400)
            .build(consumer, new ResourceLocation(MOD_ID, "special_processing"));
    }
}

// 2. Loot Table Provider
public class ModLootTableProvider extends LootTableProvider {
    public ModLootTableProvider(PackOutput output, Set<ResourceLocation> tables, 
                             List<SubProviderEntry> subProviders) {
        super(output, tables, subProviders);
    }
    
    public static ModLootTableProvider create(PackOutput output) {
        return new ModLootTableProvider(output,
            Set.of(), // Vanilla tables to include (usually empty)
            List.of(
                new SubProviderEntry(ModBlockLootTables::new, LootContextParamSets.BLOCK),
                new SubProviderEntry(ModEntityLootTables::new, LootContextParamSets.ENTITY)
            )
        );
    }
    
    // Block loot tables subprovider
    private static class ModBlockLootTables extends BlockLootSubProvider {
        protected ModBlockLootTables() {
            super(Set.of(), FeatureFlags.REGISTRY.allFlags());
        }
        
        @Override
        protected void generate() {
            // Simple drop (block drops itself)
            dropSelf(ModBlocks.SIMPLE_BLOCK.get());
            
            // Ore with fortune support
            add(ModBlocks.CUSTOM_ORE.get(), 
                block -> createOreDrop(block, ModItems.RAW_ORE.get()));
                
            // Block with item contents
            add(ModBlocks.BLOCK_WITH_ENTITY.get(), 
                block -> createWithContents(block, ModBlocks.BLOCK_WITH_ENTITY.get()));
                
            // Conditional drops (e.g., requiring silk touch)
            add(ModBlocks.SPECIAL_BLOCK.get(), 
                block -> createSilkTouchOnlyTable(block));
        }
        
        protected LootTable.Builder createWithContents(Block block, Block entity) {
            return LootTable.lootTable()
                .withPool(LootPool.lootPool()
                    .setRolls(ConstantValue.exactly(1))
                    .add(LootItem.lootTableItem(block)
                        .apply(CopyNameFunction.copyName(CopyNameFunction.NameSource.BLOCK_ENTITY))
                        .apply(CopyNbtFunction.copyData(ContextNbtProvider.BLOCK_ENTITY)
                            .copy("Inventory", "BlockEntityTag.Inventory")
                            .copy("Energy", "BlockEntityTag.Energy"))
                    )
                );
        }
    }
    
    // Entity loot tables subprovider
    private static class ModEntityLootTables extends EntityLootSubProvider {
        protected ModEntityLootTables() {
            super(FeatureFlags.REGISTRY.allFlags());
        }
        
        @Override
        public void generate() {
            // Basic entity drops
            add(ModEntities.CUSTOM_ENTITY.get(), 
                LootTable.lootTable()
                    .withPool(LootPool.lootPool()
                        .setRolls(ConstantValue.exactly(1))
                        .add(LootItem.lootTableItem(Items.LEATHER)
                            .apply(SetItemCountFunction.setCount(UniformGenerator.between(0.0F, 2.0F)))
                            .apply(LootingEnchantFunction.lootingMultiplier(UniformGenerator.between(0.0F, 1.0F))))
                    )
                    .withPool(LootPool.lootPool()
                        .setRolls(ConstantValue.exactly(1))
                        .add(LootItem.lootTableItem(ModItems.CUSTOM_ITEM.get())
                            .when(LootItemKilledByPlayerCondition.killedByPlayer())
                            .when(LootItemRandomChanceWithLootingCondition.randomChanceAndLootingBoost(0.1F, 0.05F))
                        )
                    )
            );
        }
    }
}

// 3. Language Provider
public class ModLanguageProvider extends LanguageProvider {
    public ModLanguageProvider(PackOutput output, String locale) {
        super(output, MOD_ID, locale);
    }
    
    @Override
    protected void addTranslations() {
        // Item translations
        add(ModItems.CUSTOM_ITEM.get(), "Custom Item");
        add(ModItems.PROCESSED_ITEM.get(), "Processed Item");
        add(ModItems.SPECIAL_ITEM.get(), "Special Item");
        add(ModItems.RAW_ORE.get(), "Raw Custom Ore");
        
        // Block translations
        add(ModBlocks.SIMPLE_BLOCK.get(), "Simple Block");
        add(ModBlocks.CUSTOM_ORE.get(), "Custom Ore");
        add(ModBlocks.BLOCK_WITH_ENTITY.get(), "Special Container");
        add(ModBlocks.SPECIAL_BLOCK.get(), "Magical Block");
        
        // Entity translations
        add(ModEntities.CUSTOM_ENTITY.get(), "Fancy Creature");
        
        // Creative tab
        add("itemGroup." + MOD_ID, "My Awesome Mod");
        
        // GUI text
        add("container." + MOD_ID + ".special_container", "Special Container");
        
        // Death messages
        add("death.attack." + MOD_ID + ".special", "%1$s was destroyed by special magic");
    }
}

// 4. Registration in your mod's data generation setup
public class DataGenerators {
    public static void gatherData(GatherDataEvent event) {
        DataGenerator generator = event.getGenerator();
        PackOutput packOutput = generator.getPackOutput();
        CompletableFuture<HolderLookup.Provider> lookupProvider = event.getLookupProvider();
        
        // Add providers
        generator.addProvider(event.includeClient(), new ModLanguageProvider(packOutput, "en_us"));
        generator.addProvider(event.includeServer(), new ModRecipeProvider(packOutput, lookupProvider));
        generator.addProvider(event.includeServer(), ModLootTableProvider.create(packOutput));
        
        // Add more providers as needed (block states, models, tags, etc.)
    }
}`,
      explanation: `This template demonstrates data generation in NeoForge 1.21.5, which allows you to programmatically create data assets like recipes, loot tables, and translations.

## Key Components:
1. **Recipe Provider**:
   - Extends \`RecipeProvider\` to generate recipe JSON files
   - \`buildRecipes\`: Creates various recipe types including:
     - Shaped crafting recipes with patterns
     - Cooking recipes (smelting, blasting, etc.)
     - Custom mod-specific recipes

2. **Loot Table Provider**:
   - Main provider class that organizes sub-providers
   - \`ModBlockLootTables\`: Generates loot tables for blocks
     - Simple block drops
     - Ore drops with fortune support
     - Blocks with NBT data (inventories, energy)
     - Conditional drops (silk touch, etc.)
   - \`ModEntityLootTables\`: Generates loot tables for entities
     - Basic drops with random counts
     - Rare drops with conditions

3. **Language Provider**:
   - Generates localization files with translations
   - Covers various translation types:
     - Items and blocks
     - Entities and containers
     - Creative tabs
     - Death messages and UI text

4. **Data Generator Setup**:
   - \`gatherData\`: Registration point for all providers
   - Conditionally includes client or server data based on event flags

## Benefits of Data Generation:
- **Consistency**: Programmatically ensure data files follow the correct format
- **Maintainability**: Update many data files by changing a single value in code
- **Workflow**: Changes to data happen alongside code changes
- **Validation**: Errors are caught at compile time rather than runtime

## When to Use:
- Mods with many similar items, blocks, or recipes
- Complex data structures that are error-prone to write manually
- Projects requiring multiple language translations
- Better integration with source control and development workflow

## How to Extend:
- Add providers for block states and models
- Generate tag files for items, blocks, and other registries
- Create advancement providers
- Add support for additional languages
- Generate world structures or dimension settings`
    },
    {
      id: "network-packets",
      name: "Network Packet System",
      description: "Set up client-server network communication",
      category: "networking",
      difficulty: "intermediate",
      code: `// 1. Network Handler
public class ModNetworking {
    private static final String PROTOCOL_VERSION = "1";
    public static final ResourceLocation CHANNEL_ID = new ResourceLocation(MOD_ID, "main");
    
    private static SimpleChannel channel;
    
    public static void register() {
        // Create the network channel
        channel = NetworkRegistry.newSimpleChannel(
            CHANNEL_ID,
            () -> PROTOCOL_VERSION,
            PROTOCOL_VERSION::equals,
            PROTOCOL_VERSION::equals
        );
        
        // Register packets
        int id = 0;
        channel.registerMessage(id++, SyncDataPacket.class, 
            SyncDataPacket::encode, 
            SyncDataPacket::decode, 
            SyncDataPacket::handle);
            
        channel.registerMessage(id++, ButtonPressedPacket.class, 
            ButtonPressedPacket::encode, 
            ButtonPressedPacket::decode, 
            ButtonPressedPacket::handle);
    }
    
    // Send to server
    public static void sendToServer(Object packet) {
        channel.sendToServer(packet);
    }
    
    // Send to one client
    public static void sendToClient(Object packet, ServerPlayer player) {
        channel.send(PacketDistributor.PLAYER.with(() -> player), packet);
    }
    
    // Send to all clients
    public static void sendToAllClients(Object packet) {
        channel.send(PacketDistributor.ALL.noArg(), packet);
    }
    
    // Send to clients near a position
    public static void sendToNearbyPlayers(Object packet, BlockPos pos, Level level, int range) {
        channel.send(
            PacketDistributor.NEAR.with(() -> new PacketDistributor.TargetPoint(
                pos.getX(), pos.getY(), pos.getZ(), range, level.dimension()
            )),
            packet
        );
    }
}

// 2. Example Packets
// Server -> Client sync packet
public class SyncDataPacket {
    private final BlockPos pos;
    private final CompoundTag data;
    
    public SyncDataPacket(BlockPos pos, CompoundTag data) {
        this.pos = pos;
        this.data = data;
    }
    
    public static void encode(SyncDataPacket packet, FriendlyByteBuf buffer) {
        buffer.writeBlockPos(packet.pos);
        buffer.writeNbt(packet.data);
    }
    
    public static SyncDataPacket decode(FriendlyByteBuf buffer) {
        BlockPos pos = buffer.readBlockPos();
        CompoundTag data = buffer.readNbt();
        return new SyncDataPacket(pos, data);
    }
    
    public static void handle(SyncDataPacket packet, Supplier<NetworkEvent.Context> contextSupplier) {
        NetworkEvent.Context context = contextSupplier.get();
        context.enqueueWork(() -> {
            // Make sure we're on the client
            if (Minecraft.getInstance().level != null) {
                BlockEntity blockEntity = Minecraft.getInstance().level.getBlockEntity(packet.pos);
                if (blockEntity != null) {
                    // Update block entity data
                    blockEntity.load(packet.data);
                }
            }
        });
        context.setPacketHandled(true);
    }
}

// Client -> Server button packet
public class ButtonPressedPacket {
    private final BlockPos pos;
    private final int buttonId;
    
    public ButtonPressedPacket(BlockPos pos, int buttonId) {
        this.pos = pos;
        this.buttonId = buttonId;
    }
    
    public static void encode(ButtonPressedPacket packet, FriendlyByteBuf buffer) {
        buffer.writeBlockPos(packet.pos);
        buffer.writeInt(packet.buttonId);
    }
    
    public static ButtonPressedPacket decode(FriendlyByteBuf buffer) {
        BlockPos pos = buffer.readBlockPos();
        int buttonId = buffer.readInt();
        return new ButtonPressedPacket(pos, buttonId);
    }
    
    public static void handle(ButtonPressedPacket packet, Supplier<NetworkEvent.Context> contextSupplier) {
        NetworkEvent.Context context = contextSupplier.get();
        context.enqueueWork(() -> {
            // Make sure we're on the server and have a player
            ServerPlayer player = context.getSender();
            if (player != null) {
                ServerLevel level = player.serverLevel();
                BlockPos pos = packet.pos;
                
                // Validate position is loaded and in range
                if (level.isLoaded(pos) && pos.closerThan(player.blockPosition(), 8)) {
                    BlockEntity blockEntity = level.getBlockEntity(pos);
                    if (blockEntity instanceof CustomBlockEntity customBE) {
                        // Handle the button press
                        customBE.handleButtonPress(packet.buttonId, player);
                    }
                }
            }
        });
        context.setPacketHandled(true);
    }
}

// 3. Usage Examples
// Sending from server to client
public class CustomBlockEntity extends BlockEntity {
    private int counter = 0;
    
    // Update clients when counter changes
    public void incrementCounter() {
        counter++;
        syncToClient();
    }
    
    private void syncToClient() {
        if (level != null && !level.isClientSide()) {
            CompoundTag tag = new CompoundTag();
            this.saveAdditional(tag);
            
            // Send to all players tracking this chunk
            ModNetworking.sendToNearbyPlayers(
                new SyncDataPacket(this.worldPosition, tag),
                this.worldPosition,
                this.level,
                64
            );
        }
    }
    
    // Handle button press from client
    public void handleButtonPress(int buttonId, ServerPlayer player) {
        switch (buttonId) {
            case 0:
                incrementCounter();
                break;
            case 1:
                // Do something else
                break;
        }
    }
}

// Sending from client to server (e.g., in a screen class)
public class CustomScreen extends Screen {
    private final BlockPos blockPos;
    
    public CustomScreen(BlockPos pos, Component title) {
        super(title);
        this.blockPos = pos;
    }
    
    @Override
    protected void init() {
        super.init();
        
        // Add a button
        this.addRenderableWidget(Button.builder(Component.literal("Press Me"), button -> {
            // Send packet to server when clicked
            ModNetworking.sendToServer(new ButtonPressedPacket(blockPos, 0));
        }).bounds(width / 2 - 50, height / 2, 100, 20).build());
    }
}`,
      explanation: `This template sets up a client-server network communication system in NeoForge 1.21.5, essential for mods that need to synchronize data across the client and server.

## Key Components:
1. **Network Handler**:
   - Sets up a SimpleChannel for packet registration and sending
   - Includes protocol versioning to ensure compatibility
   - Provides helper methods for sending packets to different targets:
     - Server
     - Specific client(s)
     - All clients
     - Clients near a position

2. **Example Packets**:
   - \`SyncDataPacket\` (Server → Client): Synchronizes BlockEntity data
     - \`encode\`: Writes data to the network buffer
     - \`decode\`: Reads data from the network buffer
     - \`handle\`: Processes the packet on the receiving side
   - \`ButtonPressedPacket\` (Client → Server): Sends UI interaction to server
     - Includes safety validation to prevent cheating
     - Demonstrates proper client → server communication pattern

3. **Usage Examples**:
   - BlockEntity synchronization
   - GUI button interactions
   - Basic security validation

## Technical Aspects:
- \`FriendlyByteBuf\`: Specialized buffer for network serialization
- \`context.enqueueWork()\`: Ensures packet handling occurs on the game thread
- \`context.setPacketHandled(true)\`: Marks the packet as successfully processed
- \`PacketDistributor\`: Handles targeting of packet delivery

## Best Practices Demonstrated:
- **Security**: Validating positions and permissions on the server
- **Performance**: Sending only to clients that need the data
- **Thread Safety**: Processing packets on the correct thread
- **Clean Architecture**: Separation of packet logic from game logic

## Common Network Use Cases:
- Synchronizing TileEntity/BlockEntity data
- Sending GUI interactions
- Triggering particle effects
- Custom player actions
- Command results

## How to Extend:
- Add more packet types for different data needs
- Implement more complex data structures
- Add additional validation and security checks
- Optimize network usage for high-frequency updates`
    },
    {
      id: "creative-tab",
      name: "Custom Creative Tab",
      description: "Create a custom creative mode tab with your mod's items",
      category: "items",
      difficulty: "beginner",
      code: `// Creative Tab Registration
public class ModCreativeTabs {
    // Creative Tab for regular items
    public static final DeferredHolder<CreativeModeTab, CreativeModeTab> MOD_TAB = 
        RegistryManager.CREATIVE_MODE_TABS.register("mod_tab", () -> 
            CreativeModeTab.builder()
                .title(Component.translatable("itemGroup." + MOD_ID + ".mod_tab"))
                .icon(() -> new ItemStack(ModItems.CUSTOM_ITEM.get()))
                .displayItems((params, output) -> {
                    // Add blocks
                    output.accept(ModBlocks.CUSTOM_BLOCK.get());
                    output.accept(ModBlocks.SPECIAL_BLOCK.get());
                    
                    // Add items
                    output.accept(ModItems.CUSTOM_ITEM.get());
                    output.accept(ModItems.SPECIAL_ITEM.get());
                    
                    // Add tools
                    output.accept(ModItems.CUSTOM_SWORD.get());
                    output.accept(ModItems.CUSTOM_PICKAXE.get());
                    
                    // You can also add vanilla items if relevant to your mod
                    output.accept(Items.DIAMOND);
                })
                .build()
        );
        
    // Creative Tab with categorized items (for mods with many items)
    public static final DeferredHolder<CreativeModeTab, CreativeModeTab> CATEGORIZED_TAB = 
        RegistryManager.CREATIVE_MODE_TABS.register("categorized_tab", () -> 
            CreativeModeTab.builder()
                .title(Component.translatable("itemGroup." + MOD_ID + ".categorized_tab"))
                .icon(() -> new ItemStack(ModItems.SPECIAL_ITEM.get()))
                .displayItems((params, output) -> {
                    // Group by categories
                    
                    // Blocks section
                    output.accept(ModBlocks.CUSTOM_BLOCK.get());
                    output.accept(ModBlocks.SPECIAL_BLOCK.get());
                    
                    // Separator item
                    ItemStack separator = new ItemStack(Items.BLACK_STAINED_GLASS_PANE);
                    separator.setHoverName(Component.literal("§r§8Resources"));
                    output.accept(separator);
                    
                    // Resources section
                    output.accept(ModItems.RAW_MATERIAL.get());
                    output.accept(ModItems.PROCESSED_MATERIAL.get());
                    
                    // Another separator
                    ItemStack toolSeparator = new ItemStack(Items.BLACK_STAINED_GLASS_PANE);
                    toolSeparator.setHoverName(Component.literal("§r§8Tools & Weapons"));
                    output.accept(toolSeparator);
                    
                    // Tools section
                    output.accept(ModItems.CUSTOM_SWORD.get());
                    output.accept(ModItems.CUSTOM_PICKAXE.get());
                })
                .build()
        );
        
    // Creative Tab with searchable items (for mods with many items)
    public static final DeferredHolder<CreativeModeTab, CreativeModeTab> SEARCHABLE_TAB = 
        RegistryManager.CREATIVE_MODE_TABS.register("searchable_tab", () -> 
            CreativeModeTab.builder()
                .title(Component.translatable("itemGroup." + MOD_ID + ".searchable_tab"))
                .icon(() -> new ItemStack(ModItems.CUSTOM_ITEM.get()))
                .searchBar(40) // Width of search bar
                .displayItems((params, output) -> {
                    // Add all items from the mod
                    ModItems.ITEMS.getEntries().forEach(item -> 
                        output.accept(item.get()));
                    
                    ModBlocks.BLOCKS.getEntries().forEach(block -> 
                        output.accept(block.get()));
                })
                .build()
        );
    
    public static void register() {
        // Initialize the class to register creative tabs
        MyMod.LOGGER.info("Registering creative tabs");
    }
}

// Usage in main mod class
public class MyMod {
    public static final String MOD_ID = "mymod";
    public static final Logger LOGGER = LogUtils.getLogger();
    
    public MyMod() {
        // Register tabs
        ModCreativeTabs.register();
        
        // Other initialization code
    }
}

// Example items and blocks registration for reference
public class ModItems {
    public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, MOD_ID);
    
    // Example items
    public static final RegistryObject<Item> CUSTOM_ITEM = ITEMS.register("custom_item", 
        () -> new Item(new Item.Properties()));
        
    public static final RegistryObject<Item> SPECIAL_ITEM = ITEMS.register("special_item", 
        () -> new Item(new Item.Properties()));
        
    public static final RegistryObject<Item> RAW_MATERIAL = ITEMS.register("raw_material", 
        () -> new Item(new Item.Properties()));
        
    public static final RegistryObject<Item> PROCESSED_MATERIAL = ITEMS.register("processed_material", 
        () -> new Item(new Item.Properties()));
        
    public static final RegistryObject<Item> CUSTOM_SWORD = ITEMS.register("custom_sword", 
        () -> new SwordItem(Tiers.IRON, 3, -2.4F, new Item.Properties()));
        
    public static final RegistryObject<Item> CUSTOM_PICKAXE = ITEMS.register("custom_pickaxe", 
        () -> new PickaxeItem(Tiers.IRON, 1, -2.8F, new Item.Properties()));
}

public class ModBlocks {
    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, MOD_ID);
    
    // Example blocks
    public static final RegistryObject<Block> CUSTOM_BLOCK = BLOCKS.register("custom_block", 
        () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.STONE)));
        
    public static final RegistryObject<Block> SPECIAL_BLOCK = BLOCKS.register("special_block", 
        () -> new Block(BlockBehaviour.Properties.of().mapColor(MapColor.QUARTZ)));
}`,
      explanation: `This template demonstrates creating custom creative mode tabs in NeoForge 1.21.5, allowing you to organize your mod's items in the creative inventory.

## Key Components:
1. **Basic Creative Tab**:
   - \`MOD_TAB\`: A simple tab that displays all your mod's items
   - Uses \`CreativeModeTab.builder()\` to configure the tab
   - Sets a title and icon
   - \`displayItems\`: Adds items to the tab

2. **Categorized Tab**:
   - Organizes items into visual groups using separator items
   - Custom hover names on separators create section headings
   - Particularly useful for mods with many related items

3. **Searchable Tab**:
   - Includes a search bar for filtering items
   - Automatically adds all items from your mod's registries
   - Best for mods with lots of items

4. **Registration**:
   - Uses \`DeferredHolder\` from the registry system
   - Organized in a dedicated class for creative tabs

## Technical Aspects:
- \`Component.translatable\`: Creates localizable text for the tab name
- \`ItemStack\` used for both the tab icon and items
- Custom naming with formatting codes for separators
- Search bar width can be customized

## Best Practices:
- Group related items together
- Use visual separators for clarity in large item sets
- Provide meaningful organization for players
- Make your most important/commonly used items easily accessible

## How to Extend:
- Add conditional display based on game stage or player capabilities
- Create multiple tabs for different item categories
- Add tooltips or special rendering for items in the tab
- Create themed organization with custom separator items
- Add vanilla items that complement your mod items`
    }
  ];

  // Helper function to filter templates
  const getFilteredTemplates = () => {
    if (selectedCategory === "all") {
      return codeTemplates.filter(template => {
        if (difficultyLevel === "all") return true;
        return template.difficulty === difficultyLevel;
      });
    }
    
    return codeTemplates.filter(template => {
      const categoryMatch = template.category === selectedCategory;
      if (difficultyLevel === "all") return categoryMatch;
      return categoryMatch && template.difficulty === difficultyLevel;
    });
  };

  // Generate code from custom prompt
  const handleGenerateCode = async () => {
    if (!generationPrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description of the code you want to generate.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call Claude API
      // For demonstration purposes, we'll simulate the generation

      setTimeout(() => {
        // Sample generated code based on common requests
        let code = "";
        let explanation = "";
        
        if (generationPrompt.toLowerCase().includes("block")) {
          code = `public class ExampleBlock extends Block {
    public ExampleBlock() {
        super(Properties.of()
            .mapColor(MapColor.STONE)
            .strength(3.0F)
            .requiresCorrectToolForDrops()
            .sound(SoundType.STONE));
    }
    
    @Override
    public InteractionResult use(BlockState state, Level level, BlockPos pos, 
                               Player player, InteractionHand hand, BlockHitResult hit) {
        if (!level.isClientSide) {
            // Server-side logic
            player.sendSystemMessage(Component.literal("You clicked on Example Block!"));
        }
        
        return InteractionResult.sidedSuccess(level.isClientSide);
    }
    
    @Override
    public void animateTick(BlockState state, Level level, BlockPos pos, RandomSource random) {
        // Client-side particle effects
        if (random.nextInt(10) == 0) {
            level.addParticle(
                ParticleTypes.FLAME,
                pos.getX() + 0.5 + random.nextDouble() * 0.4 - 0.2,
                pos.getY() + 0.5 + random.nextDouble() * 0.4 - 0.2,
                pos.getZ() + 0.5 + random.nextDouble() * 0.4 - 0.2,
                0.0, 0.0, 0.0);
        }
    }
}

// Register in your mod's registration class:
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "block")),
            new ResourceLocation(MOD_ID, "example_block"),
            () -> new ExampleBlock());
            
        // Don't forget to register the block item too
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "item")),
            new ResourceLocation(MOD_ID, "example_block"),
            () -> new BlockItem(ModBlocks.EXAMPLE_BLOCK.get(), new Item.Properties()));
    });
}`;

          explanation = `I've generated a custom block for NeoForge 1.21.5 with the following features:

1. **Base Properties**:
   - Medium hardness and resistance (3.0F)
   - Requires the correct tool to harvest (like a pickaxe)
   - Stone sound type when walked on or broken
   - Stone map color for minimaps

2. **Interactive Behavior**:
   - Custom behavior when right-clicked
   - Sends a message to the player (server-side only)
   - Returns appropriate interaction result for both client and server

3. **Visual Effects**:
   - \`animateTick\` method adds occasional flame particles
   - Particles appear randomly near the center of the block
   - Only runs on the client side for performance

4. **Modern Registration**:
   - Uses the component registry system
   - Registers both the block and its item form
   - Uses proper resource keys and locations

**How to Use This Code**:
1. Add this class to your mod
2. Add the registration code to your registry setup
3. Create block models, textures, and blockstates in your resource pack
4. Add a localization entry for the block name

**To Extend This Block**:
- Add custom block states for different appearances
- Implement \`onRemove\` for special behavior when broken
- Add a block entity for storing data`;
        } else if (generationPrompt.toLowerCase().includes("entity")) {
          code = `public class CustomEntity extends PathfinderMob {
    private static final EntityDataAccessor<Boolean> IS_CHARGING = 
        SynchedEntityData.defineId(CustomEntity.class, EntityDataSerializers.BOOLEAN);
    
    public CustomEntity(EntityType<? extends PathfinderMob> entityType, Level level) {
        super(entityType, level);
    }
    
    public static AttributeSupplier.Builder createAttributes() {
        return Mob.createMobAttributes()
            .add(Attributes.MAX_HEALTH, 30.0)
            .add(Attributes.MOVEMENT_SPEED, 0.25)
            .add(Attributes.ATTACK_DAMAGE, 5.0)
            .add(Attributes.ARMOR, 2.0)
            .add(Attributes.FOLLOW_RANGE, 24.0);
    }
    
    @Override
    protected void defineSynchedData() {
        super.defineSynchedData();
        this.entityData.define(IS_CHARGING, false);
    }
    
    public boolean isCharging() {
        return this.entityData.get(IS_CHARGING);
    }
    
    public void setCharging(boolean charging) {
        this.entityData.set(IS_CHARGING, charging);
    }
    
    @Override
    protected void registerGoals() {
        // Basic goals
        this.goalSelector.addGoal(1, new FloatGoal(this));
        this.goalSelector.addGoal(2, new CustomChargeGoal(this, 1.5D));
        this.goalSelector.addGoal(3, new MeleeAttackGoal(this, 1.0D, true));
        this.goalSelector.addGoal(4, new WaterAvoidingRandomStrollGoal(this, 0.8D));
        this.goalSelector.addGoal(5, new LookAtPlayerGoal(this, Player.class, 8.0F));
        this.goalSelector.addGoal(6, new RandomLookAroundGoal(this));
        
        // Target goals
        this.targetSelector.addGoal(1, new HurtByTargetGoal(this));
        this.targetSelector.addGoal(2, new NearestAttackableTargetGoal<>(this, Player.class, true));
        this.targetSelector.addGoal(3, new NearestAttackableTargetGoal<>(this, Animal.class, false));
    }
    
    // Custom AI goal for charging attack
    static class CustomChargeGoal extends Goal {
        private final PathfinderMob mob;
        private final double speedModifier;
        private LivingEntity target;
        private int chargeCooldown = 0;
        
        public CustomChargeGoal(PathfinderMob mob, double speedModifier) {
            this.mob = mob;
            this.speedModifier = speedModifier;
            this.setFlags(EnumSet.of(Goal.Flag.MOVE));
        }
        
        @Override
        public boolean canUse() {
            if (chargeCooldown > 0) {
                chargeCooldown--;
                return false;
            }
            
            this.target = this.mob.getTarget();
            if (target == null) return false;
            
            double distSqr = this.mob.distanceToSqr(target);
            return distSqr >= 9.0D && distSqr <= 36.0D; // Between 3 and 6 blocks away
        }
        
        @Override
        public void start() {
            // Start charging
            this.mob.getNavigation().moveTo(target, this.speedModifier);
            ((CustomEntity)mob).setCharging(true);
        }
        
        @Override
        public void stop() {
            // Stop charging
            ((CustomEntity)mob).setCharging(false);
            chargeCooldown = 60; // 3 second cooldown
        }
        
        @Override
        public boolean canContinueToUse() {
            return !this.mob.getNavigation().isDone() && 
                  this.mob.getTarget() != null &&
                  this.mob.getTarget().isAlive();
        }
    }
    
    @Override
    public void aiStep() {
        super.aiStep();
        
        // Add particle effects when charging
        if (this.isCharging() && this.level().isClientSide()) {
            for (int i = 0; i < 2; i++) {
                this.level().addParticle(
                    ParticleTypes.FLAME,
                    this.getRandomX(0.5D),
                    this.getRandomY(),
                    this.getRandomZ(0.5D),
                    0, 0, 0);
            }
        }
    }
    
    @Override
    protected SoundEvent getAmbientSound() {
        return SoundEvents.RAVAGER_AMBIENT;
    }
    
    @Override
    protected SoundEvent getHurtSound(DamageSource damageSource) {
        return SoundEvents.RAVAGER_HURT;
    }
    
    @Override
    protected SoundEvent getDeathSound() {
        return SoundEvents.RAVAGER_DEATH;
    }
    
    @Override
    protected void playStepSound(BlockPos pos, BlockState blockState) {
        this.playSound(SoundEvents.RAVAGER_STEP, 0.15F, 1.0F);
    }
}

// Registration
public static void register(ComponentRegistry registry) {
    // Create entity type
    EntityType<CustomEntity> CUSTOM_ENTITY_TYPE = EntityType.Builder
        .of(CustomEntity::new, MobCategory.MONSTER)
        .sized(1.0F, 1.8F)
        .build(new ResourceLocation(MOD_ID, "custom_entity").toString());
        
    // Register entity type and attributes
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "entity_type")),
            new ResourceLocation(MOD_ID, "custom_entity"),
            () -> CUSTOM_ENTITY_TYPE);
            
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "attribute")),
            new ResourceLocation(MOD_ID, "custom_entity_attributes"),
            () -> CustomEntity.createAttributes().build());
    });
}`;

          explanation = `I've generated a custom mob entity for NeoForge 1.21.5 with the following features:

1. **Base Attributes**:
   - 30 health points (15 hearts)
   - Medium movement speed
   - Strong attack damage (5.0)
   - Some armor protection
   - Good detection range (24 blocks)

2. **AI Behavior System**:
   - Basic movement and looking behaviors
   - Custom charging attack with cooldown
   - Targets players and animals
   - Responds to being hurt

3. **Synced Data**:
   - Tracks charging state between client and server
   - Allows for visual effects when charging

4. **Custom AI Goal**:
   - Special charging attack that activates when the target is at the right distance
   - Increases speed during charge
   - Includes a cooldown to prevent spam

5. **Visual and Audio Effects**:
   - Flame particles when charging
   - Borrowed sound effects from Ravager (you should replace with your own)
   - Step sounds when walking

6. **Modern Registration**:
   - Properly sized hitbox (1.0 × 1.8 blocks)
   - Monster category for spawning rules
   - Registers both entity type and its attributes

**To Make This Entity Complete**:
1. Create model and texture files
2. Add entity renderer
3. Set up spawn conditions
4. Create a spawn egg item
5. Add loot tables for drops

**To Extend This Entity**:
- Add more custom attacks
- Implement ranged attacks
- Add custom animations
- Create special drops or interactions`;
        } else {
          code = `public class CustomItem extends Item {
    public CustomItem() {
        super(new Item.Properties().stacksTo(16));
    }
    
    @Override
    public InteractionResultHolder<ItemStack> use(Level level, Player player, InteractionHand hand) {
        ItemStack stack = player.getItemInHand(hand);
        
        if (!level.isClientSide()) {
            // Server-side effects
            player.getCooldowns().addCooldown(this, 20); // 1 second cooldown
            
            // Apply status effect to player
            player.addEffect(new MobEffectInstance(MobEffects.MOVEMENT_SPEED, 200, 1)); // Speed II for 10 seconds
            
            // Play sound
            level.playSound(null, player.getX(), player.getY(), player.getZ(), 
                SoundEvents.EXPERIENCE_ORB_PICKUP, SoundSource.PLAYERS, 0.5F, 0.4F);
                
            // Damage the item
            if (!player.getAbilities().instabuild) {
                stack.hurtAndBreak(1, player, (p) -> p.broadcastBreakEvent(hand));
            }
        } else {
            // Client-side particles
            for (int i = 0; i < 10; i++) {
                level.addParticle(
                    ParticleTypes.EFFECT,
                    player.getX() + (level.random.nextDouble() - 0.5) * 1.0,
                    player.getY() + level.random.nextDouble() * 2.0,
                    player.getZ() + (level.random.nextDouble() - 0.5) * 1.0,
                    0.0, 0.1, 0.0);
            }
        }
        
        return InteractionResultHolder.success(stack);
    }
    
    @Override
    public void appendHoverText(ItemStack stack, @Nullable Level level, List<Component> tooltip, TooltipFlag flag) {
        tooltip.add(Component.translatable("item." + MOD_ID + ".custom_item.tooltip")
            .withStyle(ChatFormatting.GRAY));
        tooltip.add(Component.literal("Right-click to activate speed boost")
            .withStyle(ChatFormatting.BLUE));
    }
}

// Registration
public static void register(ComponentRegistry registry) {
    registry.register(registration -> {
        registration.register(ResourceKey.createRegistryKey(
            new ResourceLocation("minecraft", "item")),
            new ResourceLocation(MOD_ID, "custom_item"),
            () -> new CustomItem());
    });
}`;

          explanation = `I've generated a custom item for NeoForge 1.21.5 with the following features:

1. **Basic Properties**:
   - Limited stack size (16 items per stack)
   - No other special properties by default

2. **Right-Click Functionality**:
   - Overridden \`use\` method to handle right-click in air or on blocks
   - Applies a Speed II effect to the player for 10 seconds
   - Adds a 1-second cooldown to prevent spam
   - Plays a sound effect when used
   - Creates visual particles around the player
   - Takes 1 point of damage per use (if not in creative mode)

3. **Tooltip Information**:
   - Adds descriptive text when hovering over the item
   - Includes a translatable tooltip (for localization support)
   - Adds a blue hint about right-click functionality

4. **Client-Server Split**:
   - Properly separates client and server-side code
   - Server handles gameplay effects, sounds, and durability
   - Client handles visual particles

5. **Modern Registration**:
   - Uses the component registry system
   - Properly defines resource keys and locations

**How to Complete This Item**:
1. Add an item model JSON file
2. Create a texture file
3. Add localization entries including the tooltip
4. Optional: Create a custom renderer if needed

**To Extend This Item**:
- Add durability component for limited uses
- Implement different effects based on where it's used
- Add crafting recipes to create/repair the item
- Store NBT data for more complex functionality`;
        }
        
        setGeneratedCode(code);
        setGenerationExplanation(explanation);
        setIsGenerating(false);
      }, 2500);
      
    } catch (error) {
      console.error("Error generating code:", error);
      setIsGenerating(false);
      
      toast({
        title: "Generation Failed",
        description: "There was a problem generating code. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Apply template to editor
  const applyTemplate = (template: CodeTemplate) => {
    if (!editor || !file) {
      toast({
        title: "No Editor Available",
        description: "Please open a file to apply the template to.",
        variant: "destructive",
      });
      return;
    }
    
    editor.setValue(template.code);
    
    toast({
      title: "Template Applied",
      description: `The ${template.name} template has been applied to ${file.name}.`,
    });
    
    onOpenChange(false);
  };

  // Apply generated code to editor
  const applyGeneratedCode = () => {
    if (!editor || !file) {
      toast({
        title: "No Editor Available",
        description: "Please open a file to apply the generated code to.",
        variant: "destructive",
      });
      return;
    }
    
    editor.setValue(generatedCode);
    
    toast({
      title: "Code Applied",
      description: `The generated code has been applied to ${file.name}.`,
    });
    
    onOpenChange(false);
  };

  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "The code has been copied to your clipboard.",
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-emerald-400" />
            Educational Code Generation
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate NeoForge 1.21.5 code with detailed explanations using Claude AI
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="bg-gray-800/70">
            <TabsTrigger value="templates">Code Templates</TabsTrigger>
            <TabsTrigger value="generation">Custom Generation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="pt-4 max-h-[70vh] overflow-auto">
            <div className="flex mb-4 space-x-2">
              <div>
                <Label htmlFor="category-filter" className="text-sm text-gray-400 mb-1.5 block">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="blocks">Blocks</SelectItem>
                    <SelectItem value="items">Items</SelectItem>
                    <SelectItem value="entities">Entities</SelectItem>
                    <SelectItem value="crafting">Crafting</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="difficulty-filter" className="text-sm text-gray-400 mb-1.5 block">Difficulty</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {getFilteredTemplates().map((template) => (
                <Card key={template.id} className="p-4 bg-gray-800/30 border-gray-700 transition-colors hover:bg-gray-800/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-white">{template.name}</h3>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          template.difficulty === 'beginner' 
                            ? 'bg-green-900/20 text-green-400 border border-green-900/50' 
                            : template.difficulty === 'intermediate'
                            ? 'bg-blue-900/20 text-blue-400 border border-blue-900/50'
                            : 'bg-purple-900/20 text-purple-400 border border-purple-900/50'
                        }`}>
                          {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                    </div>
                    <Button onClick={() => setSelectedTemplate(template)}>
                      <Code className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </Card>
              ))}
              
              {getFilteredTemplates().length === 0 && (
                <div className="text-center p-8 bg-gray-800/30 border border-gray-700 rounded-md">
                  <LightbulbIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-white">No templates found</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Try changing your category or difficulty filter.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="generation" className="space-y-4 pt-4 max-h-[70vh] overflow-auto">
            <div className="space-y-2">
              <Label htmlFor="code-prompt">Describe the code you need:</Label>
              <Textarea 
                id="code-prompt"
                placeholder="E.g., Create a custom block that emits light and drops a special item when broken"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                className="h-24 bg-gray-800 border-gray-700 resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateCode}
                  disabled={isGenerating || !generationPrompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {generatedCode && (
              <div className="space-y-4 border-t border-gray-700 pt-4 mt-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-medium text-white">Generated Code:</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedCode)}
                      >
                        <Clipboard className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        size="sm"
                        onClick={applyGeneratedCode}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-950 rounded-md p-3 overflow-x-auto max-h-[300px] overflow-y-auto">
                    <pre className="text-sm text-green-400 font-mono">
                      {generatedCode}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Explanation:</h3>
                  <div className="bg-gray-800/30 rounded-md p-4 text-sm text-gray-300 max-h-[300px] overflow-y-auto">
                    {generationExplanation.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Template details modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-medium text-white">{selectedTemplate.name}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <Tabs defaultValue="code">
                  <TabsList className="bg-gray-800/70">
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code" className="pt-4">
                    <div className="bg-gray-950 rounded-md p-3 overflow-x-auto">
                      <pre className="text-sm text-green-400 font-mono">
                        {selectedTemplate.code}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="explanation" className="pt-4">
                    <div className="bg-gray-800/30 rounded-md p-4 text-sm text-gray-300">
                      {selectedTemplate.explanation.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="mb-3">{paragraph}</p>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="p-4 border-t border-gray-700 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTemplate(null)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    copyToClipboard(selectedTemplate.code);
                    setSelectedTemplate(null);
                  }}
                  className="mr-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Code
                </Button>
                <Button 
                  onClick={() => {
                    applyTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Apply Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}