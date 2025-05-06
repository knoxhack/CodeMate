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
