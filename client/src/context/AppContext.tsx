import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProjectFile, ProjectFolder, ConsoleLogEntry, ChatMessage } from "@/types/project";
// Commented out the API import since we're using the client-side fallback system
// import { getChatResponse } from "@/lib/anthropic";

// Define the context type
interface AppContextType {
  projectName: string;
  setProjectName: (name: string) => void;
  projectStructure: (ProjectFile | ProjectFolder)[];
  setProjectStructure: (structure: (ProjectFile | ProjectFolder)[]) => void;
  selectedFile: ProjectFile | null;
  selectFile: (file: ProjectFile) => void;
  updateFileContent: (path: string, content: string) => void;
  
  // Console
  consoleOutput: ConsoleLogEntry[];
  addConsoleEntry: (entry: ConsoleLogEntry) => void;
  clearConsole: () => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addUserMessage: (content: string) => void;
  isClaudeThinking: boolean;
  continueDevelopment: () => void;
  fixError: () => void;
  resetChat: () => void;
  
  // Actions
  buildMod: () => void;
  runMod: () => void;
  saveMod: () => void;
}

// Create a default value for the context to avoid undefined errors
const defaultContextValue: AppContextType = {
  projectName: "",
  setProjectName: () => {},
  projectStructure: [],
  setProjectStructure: () => {},
  selectedFile: null,
  selectFile: () => {},
  updateFileContent: () => {},
  consoleOutput: [],
  addConsoleEntry: () => {},
  clearConsole: () => {},
  chatMessages: [],
  addUserMessage: () => {},
  isClaudeThinking: false,
  continueDevelopment: () => {},
  fixError: () => {},
  resetChat: () => {},
  buildMod: () => {},
  runMod: () => {},
  saveMod: () => {}
};

// Create the context with a default value
const AppContext = createContext<AppContextType>(defaultContextValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projectName, setProjectName] = useState("Example Mod");
  const [projectStructure, setProjectStructure] = useState<(ProjectFile | ProjectFolder)[]>(initialProjectStructure);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleLogEntry[]>(initialConsoleOutput);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isClaudeThinking, setIsClaudeThinking] = useState(false);
  
  // Initialize with a selected file
  useEffect(() => {
    if (!selectedFile && projectStructure.length > 0) {
      // Find MySword.java in the structure
      const srcFolder = projectStructure.find(item => item.name === 'src') as ProjectFolder;
      if (srcFolder) {
        const mainFolder = srcFolder.children.find(item => item.name === 'main') as ProjectFolder;
        if (mainFolder) {
          const javaFolder = mainFolder.children.find(item => item.name === 'java') as ProjectFolder;
          if (javaFolder) {
            const mySword = javaFolder.children.find(item => item.name === 'MySword.java') as ProjectFile;
            if (mySword) {
              setSelectedFile(mySword);
            }
          }
        }
      }
    }
  }, [projectStructure, selectedFile]);
  
  const selectFile = (file: ProjectFile) => {
    setSelectedFile(file);
  };
  
  const updateFileContent = (path: string, content: string) => {
    setProjectStructure(prevStructure => {
      const newStructure = [...prevStructure];
      updateFileInStructure(newStructure, path, content);
      return newStructure;
    });
    
    if (selectedFile && selectedFile.path === path) {
      setSelectedFile({
        ...selectedFile,
        content
      });
    }
  };
  
  const updateFileInStructure = (structure: (ProjectFile | ProjectFolder)[], path: string, content: string) => {
    for (const item of structure) {
      if ('children' in item) {
        // It's a folder, recurse into it
        updateFileInStructure(item.children, path, content);
      } else {
        // It's a file, check if it matches
        if (item.path === path) {
          item.content = content;
          return;
        }
      }
    }
  };
  
  const addConsoleEntry = (entry: ConsoleLogEntry) => {
    setConsoleOutput(prev => [...prev, entry]);
  };
  
  const clearConsole = () => {
    setConsoleOutput([]);
  };
  
  const addUserMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsClaudeThinking(true);
    
    try {
      // Demo mode - simulate a response
      // This is a fallback since the API key is out of credits
      // In a real app, this would be replaced with the actual API call
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let responseText = "";
      
      // Generate a mock response based on the user message content
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
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseText
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response from Claude:', error);
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
  
  const continueDevelopment = async () => {
    await addUserMessage("Continue with the mod development. What's the next step?");
  };
  
  const fixError = async () => {
    const errorLogs = consoleOutput
      .filter(log => log.type === 'error')
      .map(log => log.message)
      .join('\n');
    
    await addUserMessage(`I'm getting the following error(s), can you help fix it?\n\n${errorLogs}`);
  };
  
  const resetChat = () => {
    setChatMessages([]);
  };
  
  const buildMod = () => {
    // Mock building the mod
    addConsoleEntry({
      type: 'success',
      message: 'BUILD SUCCESS SUCCESSFUL',
      timestamp: new Date()
    });
    
    addConsoleEntry({
      type: 'success',
      message: 'GRADLE BUILLD SUCCESSFUL at:corp/CorruptOreBlock.java:42',
      timestamp: new Date()
    });
    
    // Add error entry for demo purposes
    addConsoleEntry({
      type: 'error',
      message: 'NullPointerException at line 42 CompeXCorruptOreBlock.java',
      timestamp: new Date(),
      clickable: true,
      onClick: () => {
        // Mock opening the file with error
        // In a real app, this would navigate to the file and line number
        console.log('Navigate to error location');
      }
    });
  };
  
  const runMod = () => {
    // Mock running the mod
    addConsoleEntry({
      type: 'success',
      message: 'Running mod...',
      timestamp: new Date()
    });
    
    // Add success message
    setTimeout(() => {
      addConsoleEntry({
        type: 'success',
        message: 'Mod running successfully!',
        timestamp: new Date()
      });
    }, 2000);
  };
  
  const saveMod = () => {
    // Mock saving the mod
    addConsoleEntry({
      type: 'success',
      message: 'Saving mod files...',
      timestamp: new Date()
    });
    
    // Add success message
    setTimeout(() => {
      addConsoleEntry({
        type: 'success',
        message: 'All files saved successfully',
        timestamp: new Date()
      });
    }, 1000);
  };
  
  return (
    <AppContext.Provider value={{
      projectName,
      setProjectName,
      projectStructure,
      setProjectStructure,
      selectedFile,
      selectFile,
      updateFileContent,
      consoleOutput,
      addConsoleEntry,
      clearConsole,
      chatMessages,
      addUserMessage,
      isClaudeThinking,
      continueDevelopment,
      fixError,
      resetChat,
      buildMod,
      runMod,
      saveMod
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Initial mock data
const initialProjectStructure: (ProjectFile | ProjectFolder)[] = [
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'main',
        path: '/src/main',
        type: 'folder',
        children: [
          {
            name: 'java',
            path: '/src/main/java',
            type: 'folder',
            children: [
              {
                name: 'CorruptOreBlock.java',
                path: '/src/main/java/CorruptOreBlock.java',
                type: 'file',
                content: '// CorruptOreBlock implementation\n\npackage com.example.mod.block;\n\nimport net.minecraft.world.level.block.Block;\n\npublic class CorruptOreBlock extends Block {\n    // Implementation goes here\n}'
              },
              {
                name: 'MySword.java',
                path: '/src/main/java/MySword.java',
                type: 'file',
                content: 'package commond.item;\n\nimport modern.mymod.item;\n\nimport on.modern.DataComponent<>;\n\npublic class ITEM DeferredRegister<ITEM>\n\npublic MySword class MySword {\n\n    public MySword(private CommonSpace<ITEM> s)\n    {\n        ...\n    }\n}'
              }
            ]
          },
          {
            name: 'resources',
            path: '/src/main/resources',
            type: 'folder',
            children: [
              {
                name: 'lang',
                path: '/src/main/resources/lang',
                type: 'folder',
                children: []
              },
              {
                name: 'modelstates',
                path: '/src/main/resources/modelstates',
                type: 'folder',
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
];

const initialConsoleOutput: ConsoleLogEntry[] = [
  {
    type: 'success',
    message: 'BUILD SUCCESS SUCCESSFUL',
    timestamp: new Date(),
    clickable: false
  },
  {
    type: 'success',
    message: 'GRADLE BUILLD SUCCESSFUL at:corp/CorruptOreBlock.java:42',
    timestamp: new Date(),
    clickable: false
  },
  {
    type: 'success',
    message: 'NUTLD SUCCESSFUL: GRODE S\\%C%SPQL',
    timestamp: new Date(),
    clickable: false
  },
  {
    type: 'error',
    message: 'NullPointerException at line 42 CompeXCorruptOreBlock.java',
    timestamp: new Date(),
    clickable: true,
    onClick: () => console.log('Navigate to error location')
  }
];
