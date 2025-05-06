import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { useAppContext } from "@/hooks/useAppContext";
import { configureMonaco } from "@/lib/monaco-config";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, ZoomIn, ZoomOut, RotateCcw, PlayIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeSuggestion } from "@/types/project";

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { selectedFile, updateFileContent, runMod, saveMod } = useAppContext();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [fontSize, setFontSize] = useState(isMobile ? 16 : 14);
  
  const increaseFontSize = () => {
    setFontSize(prev => {
      const newSize = prev + 1;
      editorInstanceRef.current?.updateOptions({ fontSize: newSize });
      return newSize;
    });
  };
  
  const decreaseFontSize = () => {
    setFontSize(prev => {
      const newSize = Math.max(12, prev - 1);
      editorInstanceRef.current?.updateOptions({ fontSize: newSize });
      return newSize;
    });
  };
  
  const resetFontSize = () => {
    const defaultSize = isMobile ? 16 : 14;
    setFontSize(defaultSize);
    editorInstanceRef.current?.updateOptions({ fontSize: defaultSize });
  };
  
  // Handle applying a code suggestion from Claude
  const applyCodeSuggestion = (suggestion: CodeSuggestion) => {
    if (!editorInstanceRef.current || !selectedFile) return;
    
    // Only apply if the current file path matches the suggestion file path
    const currentPath = selectedFile.path;
    const suggestionPath = suggestion.fileId;
    
    console.log("Checking file paths:", {currentPath, suggestionPath});
    
    // If the file paths match, apply the suggestion
    if (currentPath.endsWith(suggestionPath) || suggestionPath.endsWith(currentPath)) {
      console.log("Applying code suggestion to file");
      
      const currentContent = editorInstanceRef.current.getValue();
      let newContent = currentContent;
      
      // If original code is found, replace it
      if (currentContent.includes(suggestion.originalCode)) {
        newContent = currentContent.replace(
          suggestion.originalCode, 
          suggestion.suggestedCode
        );
        
        // Update the editor content
        editorInstanceRef.current.setValue(newContent);
        
        // Update the file content in the app context
        updateFileContent(selectedFile.path, newContent);
        
        console.log("Code suggestion applied successfully");
      } else {
        console.warn("Could not find original code in the file");
        // If the original code isn't found, show a warning
        alert("Could not locate the code segment to replace. The file may have been modified.");
      }
    } else {
      console.log("File paths don't match");
      // If the file paths don't match, show a message
      alert(`This suggestion is for file: ${suggestion.fileId}. Please open that file to apply this suggestion.`);
    }
  };
  
  // Listen for code suggestion events from Claude
  useEffect(() => {
    const handleCodeSuggestion = (e: Event) => {
      const event = e as CustomEvent<CodeSuggestion>;
      console.log("Received code suggestion event:", event.detail);
      applyCodeSuggestion(event.detail);
    };
    
    window.addEventListener('claude-code-suggestion', handleCodeSuggestion);
    
    return () => {
      window.removeEventListener('claude-code-suggestion', handleCodeSuggestion);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!editorRef.current) return;
    
    // Configure Monaco editor
    configureMonaco();
    
    const editor = monaco.editor.create(editorRef.current, {
      automaticLayout: true,
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      language: 'java',
      minimap: { enabled: !isMobile },
      fontSize,
      fontFamily: "'JetBrains Mono', Consolas, monospace",
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      lineNumbers: 'on',
      renderWhitespace: 'none',
      tabSize: 2,
      wordWrap: isMobile ? 'on' : 'off',
      quickSuggestions: { other: !isMobile, comments: !isMobile, strings: !isMobile }
    });
    
    editorInstanceRef.current = editor;
    
    // Update content when file changes
    if (selectedFile) {
      editor.setValue(selectedFile.content || '');
    }
    
    // Cleanup function
    return () => {
      editor.dispose();
    };
  }, [theme, fontSize, isMobile]);
  
  // Update editor content when selected file changes
  useEffect(() => {
    if (editorInstanceRef.current && selectedFile) {
      // Set file content to editor
      editorInstanceRef.current.setValue(selectedFile.content || '');
      
      // Set language based on file extension
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'java') {
        monaco.editor.setModelLanguage(editorInstanceRef.current.getModel()!, 'java');
      } else if (ext === 'json') {
        monaco.editor.setModelLanguage(editorInstanceRef.current.getModel()!, 'json');
      } else if (ext === 'xml') {
        monaco.editor.setModelLanguage(editorInstanceRef.current.getModel()!, 'xml');
      } else if (ext === 'toml') {
        monaco.editor.setModelLanguage(editorInstanceRef.current.getModel()!, 'ini');
      }
      
      // Set up change event listener to update file content
      const disposable = editorInstanceRef.current.onDidChangeModelContent(() => {
        if (selectedFile) {
          const content = editorInstanceRef.current?.getValue() || '';
          updateFileContent(selectedFile.path, content);
        }
      });
      
      return () => {
        disposable.dispose();
      };
    }
  }, [selectedFile, updateFileContent]);
  
  if (!selectedFile) {
    return (
      <div className="flex-1 bg-background-dark flex items-center justify-center text-text-muted">
        <p>Select a file to edit</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-background-dark border-r border-gray-800">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-background-panel text-sm">
        <div className="flex items-center px-4 py-2 bg-gray-800 flex-shrink-0">
          <span className="text-emerald-400 whitespace-nowrap overflow-ellipsis overflow-hidden max-w-[180px]">
            {selectedFile.name}
          </span>
          {!isMobile && (
            <button className="text-gray-400 hover:text-white ml-2">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Font size controls and actions for mobile */}
        <div className="flex items-center px-2">
          {isMobile ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={saveMod}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={runMod}
              >
                <PlayIcon className="h-4 w-4" />
              </Button>
            </>
          ) : null}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={decreaseFontSize}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={resetFontSize}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"  
            className="h-8 w-8"
            onClick={increaseFontSize}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div 
        ref={editorRef} 
        className="flex-1 overflow-hidden"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      />
    </div>
  );
}
