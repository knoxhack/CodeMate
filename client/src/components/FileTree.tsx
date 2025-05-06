import { Folder, File, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ProjectFile, ProjectFolder } from "@/types/project";
import { cn } from "@/lib/utils";

interface FileTreeItemProps {
  item: ProjectFile | ProjectFolder;
  depth?: number;
}

function FileTreeItem({ item, depth = 0 }: FileTreeItemProps) {
  const { selectFile, selectedFile } = useAppContext();
  const [isOpen, setIsOpen] = useState(true);
  
  const isFolder = 'children' in item;
  const isSelected = selectedFile?.path === item.path;
  
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
          "cursor-pointer"
        )}
        onClick={handleItemClick}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <Folder className="h-4 w-4 mr-1" />
            {item.name}
          </>
        ) : (
          <>
            <File className="h-4 w-4 mr-1" />
            {item.name}
          </>
        )}
      </div>
      
      {isFolder && isOpen && (
        <ul>
          {(item as ProjectFolder).children.map((child, index) => (
            <FileTreeItem key={index} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FileTree() {
  const { projectStructure } = useAppContext();
  
  return (
    <div className="w-full h-full bg-background-dark border-r border-gray-800 flex flex-col">
      <div className="p-2 text-text-secondary text-sm font-medium border-b border-gray-800">
        File Tree
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        <ul className="text-sm">
          {projectStructure.map((item, index) => (
            <FileTreeItem key={index} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}
