import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as monaco from "monaco-editor";
import { configureMonaco } from "@/lib/monaco-config";
import { 
  Loader2, Save, Play, ArrowLeft, Code, Bug, RotateCcw, 
  FileCode, Layers, Zap, BookOpen, GitCompare, FlaskConical, 
  Settings, RefreshCcw, Search, X, MessageSquare, Terminal,
  FolderOpen, FileText, ChevronRight, ChevronDown, File
} from "lucide-react";
import SimpleClaudeAssistant from "@/components/SimpleClaudeAssistant";
import CodeEditor from "@/components/CodeEditor";
import { ProjectFile, ProjectFolder } from "@/types/project";

// Import specialized features
import IntelligentCodeCompletion from "@/components/features/IntelligentCodeCompletion";
import ModMigrationWizard from "@/components/features/ModMigrationWizard";
import InteractiveErrorDebugging from "@/components/features/InteractiveErrorDebugging";
import EducationalCodeGeneration from "@/components/features/EducationalCodeGeneration";
import ModArchitectureVisualizer from "@/components/features/ModArchitectureVisualizer";
import AutomatedTestingSuite from "@/components/features/AutomatedTestingSuite";
import SmartRefactoringTools from "@/components/features/SmartRefactoringTools";
import InteractiveDocumentation from "@/components/features/InteractiveDocumentation";
import CollaborativeCodeReview from "@/components/features/CollaborativeCodeReview";
import MinecraftSpecificDebugging from "@/components/features/MinecraftSpecificDebugging";

// Interfaces
interface Project {
  id: number;
  name: string;
  description: string;
  modVersion: string;
  minecraftVersion: string;
  neoForgeVersion: string;
  userId: number;
}

interface File {
  id: number;
  name: string;
  path: string;
  content: string;
  projectId: number;
}

// Main component
export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const [selectedTab, setSelectedTab] = useState("code-editor");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState<string | null>(null);
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);

  // Query project data
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && !!projectId,
  });

  // Query project files
  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesError,
  } = useQuery<File[]>({
    queryKey: [`/api/projects/${projectId}/files`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && !!projectId,
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async (fileData: { id: number; content: string }) => {
      const res = await apiRequest("PUT", `/api/files/${fileData.id}`, {
        content: fileData.content,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}/files`],
      });
      setUnsavedChanges(false);
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize editor
  useEffect(() => {
    configureMonaco();
    
    // Handle beforeunload event for unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      editorRef.current?.dispose();
    };
  }, [unsavedChanges]);

  // Select first file when files are loaded
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  // Initialize editor when selected file changes
  useEffect(() => {
    if (selectedFile && document.getElementById("monaco-editor-container")) {
      if (editorRef.current) {
        editorRef.current.dispose();
      }

      const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        value: selectedFile.content,
        language: getLanguageFromFilename(selectedFile.name),
        theme: "minecraft-dark",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: "on",
        formatOnPaste: true,
        formatOnType: true,
      };

      monacoRef.current = monaco;
      editorRef.current = monaco.editor.create(
        document.getElementById("monaco-editor-container") as HTMLElement,
        editorOptions
      );

      // Handle content changes
      editorRef.current.onDidChangeModelContent(() => {
        setUnsavedChanges(true);
      });

      // Enhanced key bindings
      editorRef.current.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          handleSaveFile();
        }
      );
    }
  }, [selectedFile]);

  // Helper function to determine language from filename
  const getLanguageFromFilename = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    if (!extension) return "text";

    switch (extension) {
      case "java":
        return "java";
      case "json":
        return "json";
      case "xml":
        return "xml";
      case "properties":
        return "properties";
      case "txt":
        return "text";
      case "md":
        return "markdown";
      case "gradle":
        return "groovy";
      case "toml":
        return "toml";
      default:
        return "text";
    }
  };

  // Save current file
  const handleSaveFile = () => {
    if (!selectedFile || !editorRef.current) return;
    
    const content = editorRef.current.getValue();
    saveFileMutation.mutate({
      id: selectedFile.id,
      content: content,
    });
  };

  // Select file for editing
  const handleSelectFile = (file: File) => {
    if (unsavedChanges) {
      if (window.confirm("You have unsaved changes. Do you want to discard them?")) {
        setSelectedFile(file);
        setUnsavedChanges(false);
      }
    } else {
      setSelectedFile(file);
    }
  };

  // Open feature modal
  const handleOpenFeatureModal = (featureId: string) => {
    setFeatureModalOpen(featureId);
  };

  // Toggle file explorer
  const toggleFileExplorer = () => {
    setShowFileExplorer(prev => !prev);
  };

  // Loading state
  if (projectLoading || filesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium text-white">Loading project...</h2>
      </div>
    );
  }

  // Error state
  if (projectError || filesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-md w-full bg-red-900/20 p-8 rounded-lg border border-red-700 text-center">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Error Loading Project</h2>
          <p className="text-gray-300 mb-8">
            There was a problem loading the project. Please try again later.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/80 border-b border-gray-700 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <h1 className="text-lg md:text-xl font-bold text-white truncate">{project?.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="hidden md:inline-block text-sm text-gray-400 mr-2">
              {project?.minecraftVersion} • {project?.modVersion}
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSaveFile}
              disabled={!unsavedChanges || saveFileMutation.isPending}
              className={unsavedChanges ? "text-amber-400 border-amber-400/50" : ""}
            >
              {saveFileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden md:inline-block ml-1">Save</span>
            </Button>
            
            <Button size="sm" variant="default" className="h-8 px-2 md:px-3">
              <Play className="h-4 w-4" />
              <span className="hidden md:inline-block ml-1">Run</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="md:hidden"
              onClick={() => setFileManagerOpen(prev => !prev)}
            >
              <FileCode className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile file manager drawer (only visible on mobile) */}
      {fileManagerOpen && (
        <div className="md:hidden bg-gray-900/70 border-b border-gray-700 p-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-gray-300">Project Files</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setFileManagerOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={`px-2 py-1.5 rounded text-sm cursor-pointer flex items-center ${
                  selectedFile?.id === file.id
                    ? "bg-blue-900/30 text-blue-300"
                    : "hover:bg-gray-800 text-gray-300 hover:text-white"
                }`}
                onClick={() => {
                  handleSelectFile(file);
                  setFileManagerOpen(false);
                }}
              >
                <FileCode className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Chat */}
      <SimpleClaudeAssistant
        projectId={projectId}
        projectName={project?.name || "Project"}
        files={files}
        currentFile={selectedFile || undefined}
        onApplySuggestion={(suggestion) => {
          // This would be implemented to apply code suggestions to the editor
          console.log("Applying suggestion:", suggestion);
          if (editorRef.current && suggestion.code) {
            // Insert the suggested code at cursor position
            const position = editorRef.current.getPosition();
            if (position) {
              editorRef.current.executeEdits("", [
                {
                  range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                  ),
                  text: suggestion.code
                }
              ]);
              setUnsavedChanges(true);
            }
          }
        }}
      />

      {/* Main content - Mobile First Layout */}
      <div className="flex-grow flex flex-col relative">
        {/* File Explorer Button (always visible) */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 left-2 z-10 bg-gray-800/70"
          onClick={toggleFileExplorer}
        >
          {showFileExplorer ? <X className="h-4 w-4 mr-2" /> : <File className="h-4 w-4 mr-2" />}
          <span>{showFileExplorer ? "Close Files" : "Open Files"}</span>
        </Button>

        {/* File Explorer (toggle visibility) */}
        {showFileExplorer && (
          <div className="absolute top-12 left-2 z-10 bg-gray-900/90 border border-gray-700 rounded-md shadow-lg p-3 w-[280px] max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <FolderOpen className="h-4 w-4 mr-2 text-blue-400" />
                Project Files
              </h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="space-y-1 mt-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`px-2 py-1.5 rounded text-sm cursor-pointer flex items-center ${
                    selectedFile?.id === file.id
                      ? "bg-blue-900/30 text-blue-300"
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                  onClick={() => {
                    handleSelectFile(file);
                    // Don't close the file explorer when selecting a file
                  }}
                >
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Main editor area */}
        <div className="flex-grow flex flex-col">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="flex-grow flex flex-col"
          >
            <div className="bg-gray-800/30 px-4 pt-2 overflow-x-auto">
              <TabsList className="bg-gray-800/50">
                <TabsTrigger value="code-editor" className="data-[state=active]:bg-gray-900">
                  <Code className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Code Editor</span>
                </TabsTrigger>
                <TabsTrigger value="architecture" className="data-[state=active]:bg-gray-900">
                  <Layers className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Architecture</span>
                </TabsTrigger>
                <TabsTrigger value="testing" className="data-[state=active]:bg-gray-900">
                  <FlaskConical className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Testing</span>
                </TabsTrigger>
                <TabsTrigger value="migration" className="data-[state=active]:bg-gray-900">
                  <GitCompare className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Migration</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="code-editor" className="flex-grow pt-0 mt-0">
              <div className="h-full flex flex-col">
                {selectedFile ? (
                  <CodeEditor
                    initialContent={selectedFile.content}
                    language={getLanguageFromFilename(selectedFile.name)}
                    fileId={selectedFile.path}
                    fileName={selectedFile.name}
                    onSave={(content) => {
                      saveFileMutation.mutate({
                        id: selectedFile.id,
                        content: content,
                      });
                    }}
                    onFileSelect={(file) => {
                      // Find the matching file from our files array
                      const dbFile = files.find(f => f.path === file.path);
                      if (dbFile) {
                        handleSelectFile(dbFile);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400 mb-3">No file selected</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFileExplorer(true)}
                      >
                        <File className="h-4 w-4 mr-2" />
                        Open File Explorer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="architecture" className="flex-grow pt-0 mt-0">
              <ModArchitectureVisualizer projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="testing" className="flex-grow pt-0 mt-0">
              <AutomatedTestingSuite projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="migration" className="flex-grow pt-0 mt-0">
              <ModMigrationWizard projectId={projectId} />
            </TabsContent>
          </Tabs>
          
          {/* Console Output */}
          <div className="h-[25vh] border-t border-gray-700 bg-gray-900/50 overflow-hidden flex flex-col">
            <div className="bg-gray-800/30 px-3 py-2 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <Terminal className="h-4 w-4 mr-2 text-gray-400" />
                Console Output
              </h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <RefreshCcw className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-grow p-2 overflow-auto">
              <pre className="text-xs text-green-300 font-mono">
                {"> NeoForge 1.21.5 initialized\n> Loading mod assets...\n> Registering blocks: 3 custom blocks registered\n> Registering items: 7 custom items registered\n> Entity registration complete\n> Mod initialization complete\n> Ready for development"}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature modals */}
      {featureModalOpen === 'code-completion' && (
        <IntelligentCodeCompletion 
          open={true} 
          onOpenChange={() => setFeatureModalOpen(null)}
          editor={editorRef.current}
          file={selectedFile}
        />
      )}
      
      {featureModalOpen === 'educational-code' && (
        <EducationalCodeGeneration
          open={true}
          onOpenChange={() => setFeatureModalOpen(null)}
          editor={editorRef.current}
          file={selectedFile}
          projectId={projectId}
        />
      )}
      
      {featureModalOpen === 'refactoring' && (
        <SmartRefactoringTools
          open={true}
          onOpenChange={() => setFeatureModalOpen(null)}
          editor={editorRef.current}
          file={selectedFile}
          projectId={projectId}
        />
      )}
      
      {featureModalOpen === 'minecraft-debugging' && (
        <MinecraftSpecificDebugging
          open={true}
          onOpenChange={() => setFeatureModalOpen(null)}
          projectId={projectId}
        />
      )}
      
      {featureModalOpen === 'code-review' && (
        <CollaborativeCodeReview
          open={true}
          onOpenChange={() => setFeatureModalOpen(null)}
          file={selectedFile}
          projectId={projectId}
        />
      )}
    </div>
  );
}