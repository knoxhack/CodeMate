import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useAppContext } from "@/context/AppContext";
import { configureMonaco } from "@/lib/monaco-config";
import { useTheme } from "@/hooks/use-theme";
import { X } from "lucide-react";

export default function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { selectedFile, updateFileContent } = useAppContext();
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Configure Monaco editor
    configureMonaco();
    
    const editor = monaco.editor.create(editorRef.current, {
      automaticLayout: true,
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      language: 'java',
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', Consolas, monospace",
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      lineNumbers: 'on',
      renderWhitespace: 'none',
      tabSize: 2,
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
  }, [theme]);
  
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
      <div className="flex items-center border-b border-gray-800 bg-background-panel text-sm">
        <div className="flex items-center px-4 py-2 border-r border-gray-800 bg-gray-800">
          <span className="mr-2 text-emerald-400">{selectedFile.name}</span>
          <button className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
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
