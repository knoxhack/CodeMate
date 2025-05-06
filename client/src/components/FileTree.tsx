import { Folder, File, ChevronRight, ChevronDown, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { ProjectFile, ProjectFolder } from "@/types/project";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FileTreeItemProps {
  item: ProjectFile | ProjectFolder;
  depth?: number;
  searchTerm?: string;
}

function FileTreeItem({ item, depth = 0, searchTerm = "" }: FileTreeItemProps) {
  const { selectFile, selectedFile } = useAppContext();
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  
  const isFolder = 'children' in item;
  const isSelected = selectedFile?.path === item.path;
  
  // For search functionality
  const isMatch = searchTerm.length > 0 && item.name.toLowerCase().includes(searchTerm.toLowerCase());
  const hasMatchingChildren = isFolder && (item as ProjectFolder).children.some(child => {
    if ('children' in child) {
      return containsMatchingItem(child, searchTerm);
    }
    return child.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Auto expand folders that have matching children when searching
  useEffect(() => {
    if (searchTerm && isFolder && hasMatchingChildren) {
      setIsOpen(true);
    }
  }, [searchTerm, isFolder, hasMatchingChildren]);
  
  // Hide items not matching search criteria
  if (searchTerm && !isMatch && !hasMatchingChildren) {
    return null;
  }
  
  const toggleFolder = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleItemClick = () => {
    if (!isFolder) {
      selectFile(item);
    } else {
      toggleFolder();
    }
  };
  
  return (
    <li>
      <div 
        className={cn(
          "flex items-center py-1 px-1 rounded",
          isSelected && !isFolder ? "bg-gray-800 bg-opacity-40" : "hover:bg-gray-800 hover:bg-opacity-20",
          isFolder ? "text-text-secondary" : isSelected ? "text-amber-400" : "text-text-muted",
          isMatch ? "bg-gray-700 bg-opacity-40" : "",
          "cursor-pointer",
          isMobile ? "py-2" : "py-1"
        )}
        onClick={handleItemClick}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} />
            ) : (
              <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} />
            )}
            <Folder className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} />
            {item.name}
          </>
        ) : (
          <>
            <File className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-1`} />
            {item.name}
          </>
        )}
      </div>
      
      {isFolder && isOpen && (
        <ul>
          {(item as ProjectFolder).children.map((child, index) => (
            <FileTreeItem key={index} item={child} depth={depth + 1} searchTerm={searchTerm} />
          ))}
        </ul>
      )}
    </li>
  );
}

// Helper function to check if a folder contains any matching items
function containsMatchingItem(folder: ProjectFolder, searchTerm: string): boolean {
  return folder.children.some(child => {
    if ('children' in child) {
      return containsMatchingItem(child, searchTerm);
    }
    return child.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
}

export default function FileTree() {
  const { projectStructure } = useAppContext();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  return (
    <div className="w-full h-full bg-background-dark border-r border-gray-800 flex flex-col">
      <div className="p-2 text-text-secondary font-medium border-b border-gray-800 flex justify-between items-center">
        <span className={isMobile ? "text-base" : "text-sm"}>File Tree</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={() => setIsSearching(!isSearching)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {isSearching && (
        <div className="px-2 py-1 border-b border-gray-800 flex items-center">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="text-sm bg-background-dark border-gray-700 h-8"
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1 flex-shrink-0" 
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      <div className="overflow-y-auto flex-1 p-2">
        <ul className={isMobile ? "text-base" : "text-sm"}>
          {projectStructure.map((item, index) => (
            <FileTreeItem key={index} item={item} searchTerm={searchTerm} />
          ))}
        </ul>
      </div>
    </div>
  );
}
