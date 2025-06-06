import { useState, useEffect, useCallback } from "react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { configureMonaco } from "@/lib/monaco-config";
import { useToast } from "@/hooks/use-toast";
import { Check, Maximize2, Minimize2, File, FileText, Settings, Search, X } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { ProjectFile, ProjectFolder } from "@/types/project";

// Initialize Monaco configuration
configureMonaco();

interface CodeEditorProps {
  initialContent?: string;
  language?: string;
  fileId?: string;
  fileName?: string;
  onSave?: (content: string) => void;
  isReadOnly?: boolean;
  onFileSelect?: (file: ProjectFile) => void;
  projectStructure?: (ProjectFile | ProjectFolder)[];
}

interface CodeSuggestion {
  fileId: string;
  originalCode: string;
  suggestedCode: string;
  description: string;
  startLine?: number;
  endLine?: number;
}

export default function CodeEditor({
  initialContent = "",
  language = "java",
  fileId,
  fileName = "Untitled.java",
  onSave,
  isReadOnly = false,
  onFileSelect,
  projectStructure: files = []
}: CodeEditorProps) {
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [content, setContent] = useState(initialContent);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [openFilesMenu, setOpenFilesMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();
  const { selectFile } = useAppContext();

  // Editor initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const editorContainer = document.getElementById("monaco-editor-container");
    if (!editorContainer) return;
    
    // Cleanup any existing editor
    if (editor) {
      editor.dispose();
    }
    
    // Create new editor
    const newEditor = monaco.editor.create(editorContainer, {
      value: initialContent,
      language: language,
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: true },
      readOnly: isReadOnly,
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on",
      wordWrap: "on",
      renderLineHighlight: "all",
      roundedSelection: true,
      cursorBlinking: "smooth",
    });
    
    setEditor(newEditor);
    
    const model = newEditor.getModel();
    if (model) {
      // Listen for content changes
      const disposable = model.onDidChangeContent(() => {
        setContent(newEditor.getValue());
      });
      
      return () => {
        disposable.dispose();
        newEditor.dispose();
      };
    }
    
    return () => {
      newEditor.dispose();
    };
  }, [initialContent, language, isReadOnly]);

  // Handle window resize for fullscreen
  useEffect(() => {
    const handleResize = () => {
      if (editor) {
        editor.layout();
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [editor]);

  // Method to save content
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(content);
      toast({
        title: "File saved",
        description: `${fileName} has been saved successfully.`,
      });
    }
  }, [content, fileName, onSave, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Apply code suggestion to editor
  const applyCodeSuggestion = (suggestion: CodeSuggestion) => {
    if (!editor || !fileId || suggestion.fileId !== fileId) return;
    
    const model = editor.getModel();
    if (!model) return;
    
    // If specific lines are provided, use them
    if (suggestion.startLine !== undefined && suggestion.endLine !== undefined) {
      const startPosition = { lineNumber: suggestion.startLine, column: 1 };
      const endPosition = { lineNumber: suggestion.endLine + 1, column: 1 };
      
      editor.executeEdits("suggestion", [
        {
          range: new monaco.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
          ),
          text: suggestion.suggestedCode,
        },
      ]);
    } 
    // Otherwise try to find and replace the original code
    else if (suggestion.originalCode) {
      const content = model.getValue();
      const updatedContent = content.replace(suggestion.originalCode, suggestion.suggestedCode);
      
      if (content !== updatedContent) {
        editor.setValue(updatedContent);
      } else {
        // If replacement didn't work, append to the end
        editor.setValue(content + "\n\n" + suggestion.suggestedCode);
      }
    } 
    // Just append the code if no other option works
    else {
      const content = model.getValue();
      editor.setValue(content + "\n\n" + suggestion.suggestedCode);
    }
    
    toast({
      title: "Code applied",
      description: suggestion.description || "Suggested code has been applied.",
    });
    
    // Remove the applied suggestion
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };

  // Function to get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || "";
  };

  // Function to get appropriate file icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    
    // Map extensions to appropriate icons
    if (['java', 'js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'cs'].includes(ext)) {
      return <FileText className="h-4 w-4 mr-1" />;
    } else if (['json', 'xml', 'yml', 'yaml', 'toml', 'md', 'txt'].includes(ext)) {
      return <File className="h-4 w-4 mr-1" />;
    } else {
      return <File className="h-4 w-4 mr-1" />;
    }
  };

  // Function to get all files from project structure recursively
  const getAllFiles = (structure: any[]): ProjectFile[] => {
    let files: ProjectFile[] = [];
    
    const traverse = (items: any[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          files.push(item as ProjectFile);
        } else if (item.type === 'folder' && item.children) {
          traverse(item.children);
        }
      }
    };
    
    traverse(structure);
    return files;
  };
  
  // Filter files based on search query
  const getFilteredFiles = (): ProjectFile[] => {
    const allFiles = getAllFiles(files);
    
    if (!searchQuery) {
      return allFiles;
    }
    
    const query = searchQuery.toLowerCase();
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(query) || 
      file.path.toLowerCase().includes(query)
    );
  };

  // Listen for code suggestions from Claude via an event listener
  useEffect(() => {
    const handleCodeSuggestion = (e: Event) => {
      const event = e as CustomEvent<CodeSuggestion>;
      if (event.detail && fileId && event.detail.fileId === fileId) {
        setSuggestions(prev => [...prev, event.detail]);
        
        toast({
          title: "New code suggestion",
          description: "Claude has suggested code changes for this file.",
        });
      }
    };
    
    window.addEventListener("codeSuggestion", handleCodeSuggestion as EventListener);
    return () => window.removeEventListener("codeSuggestion", handleCodeSuggestion as EventListener);
  }, [fileId, toast]);

  return (
    <div 
      className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-gray-900" : "h-full"}`}
    >
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpenFilesMenu(!openFilesMenu)}
            className="h-8 text-xs text-gray-300 flex items-center mr-2 hover:bg-gray-700"
          >
            <File className="h-4 w-4 mr-1" /> Open Files
          </Button>
          <div className="text-sm font-mono text-gray-300">{fileName}</div>
        </div>
        <div className="flex gap-2">
          {!isReadOnly && (
            <Button 
              size="sm"
              variant="outline"
              onClick={handleSave}
              className="h-8 text-xs bg-gray-700 hover:bg-gray-600"
            >
              Save
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* File manager icon bar - moved to a dropdown to prevent overlapping */}
      {openFilesMenu && (
        <div className="absolute top-10 left-0 z-30 w-64 bg-gray-800 border border-gray-700 shadow-lg rounded-md">
          {/* Search bar */}
          <div className="flex items-center p-1 border-b border-gray-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSearch(!showSearch)}
              className="h-8 w-8 mr-1 flex items-center justify-center"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {showSearch && (
              <div className="flex-1 flex items-center">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="h-8 text-sm bg-gray-900 border-gray-700"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="h-8 w-8 ml-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* File buttons */}
          <div className="max-h-60 overflow-y-auto p-1">
            <div className="flex flex-col gap-1">
              {getFilteredFiles().map((file, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Use the callback if provided, otherwise use the context function
                    if (onFileSelect) {
                      onFileSelect(file);
                    } else {
                      selectFile(file);
                    }
                    // Close the file menu after selection
                    setOpenFilesMenu(false);
                  }}
                  className={`h-8 justify-start text-xs flex items-center whitespace-nowrap 
                    ${fileId === file.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </Button>
              ))}
              
              {getFilteredFiles().length === 0 && (
                <div className="text-xs text-gray-400 py-1 px-2">
                  No files match your search
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative flex-1">
        <div 
          id="monaco-editor-container"
          className="absolute inset-0"
        />
      </div>
      
      {suggestions.length > 0 && (
        <div className="p-2 bg-gray-800 border-t border-gray-700 max-h-40 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Code Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-2 bg-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-300">{suggestion.description || "Code suggestion"}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyCodeSuggestion(suggestion)}
                    className="h-7 text-xs bg-emerald-800 hover:bg-emerald-700 border-emerald-700"
                  >
                    <Check className="h-3 w-3 mr-1" /> Apply
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}