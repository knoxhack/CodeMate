import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProjectFile, ProjectFolder, ConsoleLogEntry, ChatMessage } from "@/types/project";
import { getChatResponse } from "@/lib/anthropic";

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
      // Send the message to Claude
      const assistantMessage = await getChatResponse([
        ...chatMessages,
        userMessage
      ]);
      
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
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}