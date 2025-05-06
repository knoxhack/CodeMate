import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import * as monaco from "monaco-editor";
import { configureMonaco } from "@/lib/monaco-config";
import { Loader2, Save, Play, ArrowLeft, Code, Bug, RotateCcw, 
  FileCode, Layers, Zap, BookOpen, GitCompare, FlaskConical, 
  Settings, RefreshCcw, Search } from "lucide-react";

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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">{project?.name}</h1>
            <span className="text-sm text-gray-400">
              {project?.minecraftVersion} • {project?.modVersion}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSaveFile}
              disabled={!unsavedChanges || saveFileMutation.isPending}
              className={unsavedChanges ? "text-amber-400 border-amber-400/50" : ""}
            >
              {saveFileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
            
            <Button size="sm">
              <Play className="h-4 w-4 mr-1" />
              Build & Run
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
            <div className="h-full bg-gray-900/50 border-r border-gray-700 p-2">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-sm font-medium text-gray-300">Project Files</h2>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Search className="h-4 w-4" />
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
                    onClick={() => handleSelectFile(file)}
                  >
                    <FileCode className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Main editor area */}
          <ResizablePanel defaultSize={60}>
            <Tabs 
              value={selectedTab} 
              onValueChange={setSelectedTab}
              className="h-full flex flex-col"
            >
              <div className="bg-gray-800/30 px-4 pt-2">
                <TabsList className="bg-gray-800/50">
                  <TabsTrigger value="code-editor" className="data-[state=active]:bg-gray-900">
                    <Code className="h-4 w-4 mr-2" />
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger value="architecture" className="data-[state=active]:bg-gray-900">
                    <Layers className="h-4 w-4 mr-2" />
                    Architecture
                  </TabsTrigger>
                  <TabsTrigger value="testing" className="data-[state=active]:bg-gray-900">
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Testing
                  </TabsTrigger>
                  <TabsTrigger value="migration" className="data-[state=active]:bg-gray-900">
                    <GitCompare className="h-4 w-4 mr-2" />
                    Migration
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="code-editor" className="flex-1 pt-0 mt-0">
                <div className="h-full flex flex-col">
                  {selectedFile ? (
                    <div id="monaco-editor-container" className="h-full w-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">Select a file to edit</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="architecture" className="flex-1 pt-0 mt-0">
                <ModArchitectureVisualizer projectId={projectId} />
              </TabsContent>
              
              <TabsContent value="testing" className="flex-1 pt-0 mt-0">
                <AutomatedTestingSuite projectId={projectId} />
              </TabsContent>
              
              <TabsContent value="migration" className="flex-1 pt-0 mt-0">
                <ModMigrationWizard projectId={projectId} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Right sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Tabs defaultValue="features" className="h-full flex flex-col">
              <TabsList className="mx-2 mt-2 bg-gray-800/50">
                <TabsTrigger value="features">
                  <Zap className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="documentation">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Docs
                </TabsTrigger>
                <TabsTrigger value="errors">
                  <Bug className="h-4 w-4 mr-2" />
                  Errors
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="features" className="flex-1 pt-0 overflow-auto">
                <div className="p-4 space-y-3">
                  <h3 className="text-sm text-gray-400 font-medium mb-2">CLAUDE CODE FEATURES</h3>
                  
                  <Card className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-gray-700 cursor-pointer p-3" onClick={() => handleOpenFeatureModal('code-completion')}>
                    <div className="flex items-start">
                      <div className="bg-blue-600/20 p-2 rounded mr-3">
                        <Code className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Intelligent Code Completion</h4>
                        <p className="text-xs text-gray-400 mt-1">Context-aware suggestions for NeoForge 1.21.5</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-gray-700 cursor-pointer p-3" onClick={() => handleOpenFeatureModal('error-debugging')}>
                    <div className="flex items-start">
                      <div className="bg-amber-600/20 p-2 rounded mr-3">
                        <Bug className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Interactive Error Debugging</h4>
                        <p className="text-xs text-gray-400 mt-1">AI-powered error analysis with fix suggestions</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-gray-700 cursor-pointer p-3" onClick={() => handleOpenFeatureModal('educational-code')}>
                    <div className="flex items-start">
                      <div className="bg-emerald-600/20 p-2 rounded mr-3">
                        <BookOpen className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Educational Code Generation</h4>
                        <p className="text-xs text-gray-400 mt-1">Generate code with detailed explanations</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-gray-700 cursor-pointer p-3" onClick={() => handleOpenFeatureModal('refactoring')}>
                    <div className="flex items-start">
                      <div className="bg-purple-600/20 p-2 rounded mr-3">
                        <RotateCcw className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Smart Refactoring Tools</h4>
                        <p className="text-xs text-gray-400 mt-1">Optimize code with Minecraft best practices</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-gray-700 cursor-pointer p-3" onClick={() => handleOpenFeatureModal('minecraft-debugging')}>
                    <div className="flex items-start">
                      <div className="bg-green-600/20 p-2 rounded mr-3">
                        <Settings className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Minecraft-Specific Debugging</h4>
                        <p className="text-xs text-gray-400 mt-1">Analyze in-game behavior and performance</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors border-gray-700 cursor-pointer p-3" onClick={() => handleOpenFeatureModal('code-review')}>
                    <div className="flex items-start">
                      <div className="bg-red-600/20 p-2 rounded mr-3">
                        <GitCompare className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Collaborative Code Review</h4>
                        <p className="text-xs text-gray-400 mt-1">AI-powered review suggestions and feedback</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="documentation" className="flex-1 pt-0 overflow-auto">
                <InteractiveDocumentation fileId={selectedFile?.id} />
              </TabsContent>
              
              <TabsContent value="errors" className="flex-1 pt-0 overflow-auto">
                <InteractiveErrorDebugging projectId={projectId} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Feature modals */}
      <IntelligentCodeCompletion 
        open={featureModalOpen === 'code-completion'} 
        onOpenChange={() => setFeatureModalOpen(null)}
        editor={editorRef.current}
        file={selectedFile}
      />
      
      <EducationalCodeGeneration
        open={featureModalOpen === 'educational-code'}
        onOpenChange={() => setFeatureModalOpen(null)}
        editor={editorRef.current}
        file={selectedFile}
        projectId={projectId}
      />
      
      <SmartRefactoringTools
        open={featureModalOpen === 'refactoring'}
        onOpenChange={() => setFeatureModalOpen(null)}
        editor={editorRef.current}
        file={selectedFile}
        projectId={projectId}
      />
      
      <MinecraftSpecificDebugging
        open={featureModalOpen === 'minecraft-debugging'}
        onOpenChange={() => setFeatureModalOpen(null)}
        projectId={projectId}
      />
      
      <CollaborativeCodeReview
        open={featureModalOpen === 'code-review'}
        onOpenChange={() => setFeatureModalOpen(null)}
        file={selectedFile}
        projectId={projectId}
      />
    </div>
  );
}