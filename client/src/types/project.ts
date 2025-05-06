// File system structure types
export interface ProjectFile {
  name: string;
  path: string;
  type: 'file';
  content: string;
}

export interface ProjectFolder {
  name: string;
  path: string;
  type: 'folder';
  children: (ProjectFile | ProjectFolder)[];
}

// Console log entry type
export interface ConsoleLogEntry {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  clickable?: boolean;
  onClick?: () => void;
}

// Chat message type
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  codeBlock?: string;
  timestamp?: Date;
  codeSuggestions?: CodeSuggestion[]; // Array of code suggestions for editor integration
}

// Code suggestion from assistant
export interface CodeSuggestion {
  fileId: string; // Path of the file to modify
  originalCode: string; // The code to be replaced
  suggestedCode: string; // The suggested replacement code
  description: string; // Description of what the suggestion does
  startLine?: number; // Start line of the suggestion (optional)
  endLine?: number; // End line of the suggestion (optional)
}

// Project metadata
export interface ProjectMetadata {
  name: string;
  description?: string;
  modVersion?: string;
  minecraftVersion?: string;
  neoForgeVersion?: string;
  author?: string;
  license?: string;
}
