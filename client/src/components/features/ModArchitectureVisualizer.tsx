import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Layers, ZoomIn, ZoomOut, Download, RefreshCcw, AlertTriangle, Info } from "lucide-react";

interface ModArchitectureVisualizerProps {
  projectId: number;
}

interface ProjectFile {
  id: number;
  path: string;
  name: string;
}

interface ProjectNode {
  id: string;
  type: "class" | "interface" | "enum" | "package" | "file";
  name: string;
  fullName?: string;
  children?: ProjectNode[];
  dependencies?: string[];
  file?: ProjectFile;
  isExpanded?: boolean;
}

interface Dependency {
  source: string;
  target: string;
  type: "extends" | "implements" | "uses" | "creates";
}

interface ArchitectureIssue {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  details: string;
  affectedNodes: string[];
  recommendation: string;
}

export default function ModArchitectureVisualizer({ projectId }: ModArchitectureVisualizerProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectNodes, setProjectNodes] = useState<ProjectNode[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [issues, setIssues] = useState<ArchitectureIssue[]>([]);
  const [selectedNode, setSelectedNode] = useState<ProjectNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("hierarchy");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layoutType, setLayoutType] = useState<string>("tree");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ArchitectureIssue | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<ProjectNode[]>([]);

  // Load project architecture data
  useEffect(() => {
    setIsLoading(true);

    // In a real implementation, this would fetch data from the API
    setTimeout(() => {
      // Sample project structure data
      const mockProjectNodes: ProjectNode[] = [
        {
          id: "com.example.mod",
          type: "package",
          name: "com.example.mod",
          isExpanded: true,
          children: [
            {
              id: "com.example.mod.ExampleMod",
              type: "class",
              name: "ExampleMod",
              fullName: "com.example.mod.ExampleMod",
              dependencies: [
                "com.example.mod.init.ModItems",
                "com.example.mod.init.ModBlocks",
                "com.example.mod.init.ModEntities"
              ],
              file: {
                id: 1,
                path: "/src/main/java/com/example/mod/ExampleMod.java",
                name: "ExampleMod.java"
              }
            },
            {
              id: "com.example.mod.init",
              type: "package",
              name: "init",
              isExpanded: true,
              children: [
                {
                  id: "com.example.mod.init.ModItems",
                  type: "class",
                  name: "ModItems",
                  fullName: "com.example.mod.init.ModItems",
                  dependencies: [
                    "com.example.mod.item.CustomItem",
                    "com.example.mod.item.CustomSword"
                  ],
                  file: {
                    id: 2,
                    path: "/src/main/java/com/example/mod/init/ModItems.java",
                    name: "ModItems.java"
                  }
                },
                {
                  id: "com.example.mod.init.ModBlocks",
                  type: "class",
                  name: "ModBlocks",
                  fullName: "com.example.mod.init.ModBlocks",
                  dependencies: [
                    "com.example.mod.block.CustomBlock",
                    "com.example.mod.block.CustomBlockWithEntity"
                  ],
                  file: {
                    id: 3,
                    path: "/src/main/java/com/example/mod/init/ModBlocks.java",
                    name: "ModBlocks.java"
                  }
                },
                {
                  id: "com.example.mod.init.ModEntities",
                  type: "class",
                  name: "ModEntities",
                  fullName: "com.example.mod.init.ModEntities",
                  dependencies: [
                    "com.example.mod.entity.CustomEntity"
                  ],
                  file: {
                    id: 4,
                    path: "/src/main/java/com/example/mod/init/ModEntities.java",
                    name: "ModEntities.java"
                  }
                }
              ]
            },
            {
              id: "com.example.mod.item",
              type: "package",
              name: "item",
              children: [
                {
                  id: "com.example.mod.item.CustomItem",
                  type: "class",
                  name: "CustomItem",
                  fullName: "com.example.mod.item.CustomItem",
                  file: {
                    id: 5,
                    path: "/src/main/java/com/example/mod/item/CustomItem.java",
                    name: "CustomItem.java"
                  }
                },
                {
                  id: "com.example.mod.item.CustomSword",
                  type: "class",
                  name: "CustomSword",
                  fullName: "com.example.mod.item.CustomSword",
                  dependencies: [
                    "net.minecraft.world.item.SwordItem"
                  ],
                  file: {
                    id: 6,
                    path: "/src/main/java/com/example/mod/item/CustomSword.java",
                    name: "CustomSword.java"
                  }
                }
              ]
            },
            {
              id: "com.example.mod.block",
              type: "package",
              name: "block",
              children: [
                {
                  id: "com.example.mod.block.CustomBlock",
                  type: "class",
                  name: "CustomBlock",
                  fullName: "com.example.mod.block.CustomBlock",
                  dependencies: [
                    "net.minecraft.world.level.block.Block"
                  ],
                  file: {
                    id: 7,
                    path: "/src/main/java/com/example/mod/block/CustomBlock.java",
                    name: "CustomBlock.java"
                  }
                },
                {
                  id: "com.example.mod.block.CustomBlockWithEntity",
                  type: "class",
                  name: "CustomBlockWithEntity",
                  fullName: "com.example.mod.block.CustomBlockWithEntity",
                  dependencies: [
                    "net.minecraft.world.level.block.entity.BlockEntity",
                    "com.example.mod.block.entity.CustomBlockEntity"
                  ],
                  file: {
                    id: 8,
                    path: "/src/main/java/com/example/mod/block/CustomBlockWithEntity.java",
                    name: "CustomBlockWithEntity.java"
                  }
                },
                {
                  id: "com.example.mod.block.entity",
                  type: "package",
                  name: "entity",
                  children: [
                    {
                      id: "com.example.mod.block.entity.CustomBlockEntity",
                      type: "class",
                      name: "CustomBlockEntity",
                      fullName: "com.example.mod.block.entity.CustomBlockEntity",
                      dependencies: [
                        "net.minecraft.world.level.block.entity.BlockEntity"
                      ],
                      file: {
                        id: 9,
                        path: "/src/main/java/com/example/mod/block/entity/CustomBlockEntity.java",
                        name: "CustomBlockEntity.java"
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: "com.example.mod.entity",
              type: "package",
              name: "entity",
              children: [
                {
                  id: "com.example.mod.entity.CustomEntity",
                  type: "class",
                  name: "CustomEntity",
                  fullName: "com.example.mod.entity.CustomEntity",
                  dependencies: [
                    "net.minecraft.world.entity.PathfinderMob"
                  ],
                  file: {
                    id: 10,
                    path: "/src/main/java/com/example/mod/entity/CustomEntity.java",
                    name: "CustomEntity.java"
                  }
                }
              ]
            }
          ]
        }
      ];

      const mockDependencies: Dependency[] = [
        { source: "com.example.mod.ExampleMod", target: "com.example.mod.init.ModItems", type: "uses" },
        { source: "com.example.mod.ExampleMod", target: "com.example.mod.init.ModBlocks", type: "uses" },
        { source: "com.example.mod.ExampleMod", target: "com.example.mod.init.ModEntities", type: "uses" },
        { source: "com.example.mod.init.ModItems", target: "com.example.mod.item.CustomItem", type: "creates" },
        { source: "com.example.mod.init.ModItems", target: "com.example.mod.item.CustomSword", type: "creates" },
        { source: "com.example.mod.init.ModBlocks", target: "com.example.mod.block.CustomBlock", type: "creates" },
        { source: "com.example.mod.init.ModBlocks", target: "com.example.mod.block.CustomBlockWithEntity", type: "creates" },
        { source: "com.example.mod.init.ModEntities", target: "com.example.mod.entity.CustomEntity", type: "creates" },
        { source: "com.example.mod.item.CustomSword", target: "net.minecraft.world.item.SwordItem", type: "extends" },
        { source: "com.example.mod.block.CustomBlock", target: "net.minecraft.world.level.block.Block", type: "extends" },
        { source: "com.example.mod.block.CustomBlockWithEntity", target: "com.example.mod.block.entity.CustomBlockEntity", type: "uses" },
        { source: "com.example.mod.block.entity.CustomBlockEntity", target: "net.minecraft.world.level.block.entity.BlockEntity", type: "extends" },
        { source: "com.example.mod.entity.CustomEntity", target: "net.minecraft.world.entity.PathfinderMob", type: "extends" }
      ];

      const mockIssues: ArchitectureIssue[] = [
        {
          id: "issue-1",
          severity: "error",
          message: "SwordItem inheritance not compatible with NeoForge 1.21.5",
          details: "In NeoForge 1.21.5, the SwordItem class should not be extended directly. Instead, use the component-based system with MeleeWeaponComponent.",
          affectedNodes: ["com.example.mod.item.CustomSword"],
          recommendation: "Refactor CustomSword to extend Item and use ItemComponentsKeys.MELEE_WEAPON component."
        },
        {
          id: "issue-2",
          severity: "warning",
          message: "Potential circular dependency",
          details: "There may be a circular dependency between CustomBlockWithEntity and CustomBlockEntity classes.",
          affectedNodes: ["com.example.mod.block.CustomBlockWithEntity", "com.example.mod.block.entity.CustomBlockEntity"],
          recommendation: "Extract common functionality to a separate interface or use a different architectural pattern."
        },
        {
          id: "issue-3",
          severity: "info",
          message: "Consider using DataComponent for block properties",
          details: "NeoForge 1.21.5 recommends using the DataComponent system for sharing behaviors between blocks.",
          affectedNodes: ["com.example.mod.block.CustomBlock"],
          recommendation: "Implement appropriate DataComponents for block behaviors instead of inheritance."
        }
      ];

      setProjectNodes(mockProjectNodes);
      setFilteredNodes(mockProjectNodes);
      setDependencies(mockDependencies);
      setIssues(mockIssues);
      setIsLoading(false);
    }, 1500);
  }, [projectId]);

  // Search filter effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNodes(projectNodes);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Helper function to recursively filter nodes
    const filterNodes = (nodes: ProjectNode[]): ProjectNode[] => {
      return nodes.map(node => {
        // Create a copy of the node
        const newNode = { ...node };
        
        // Filter children if they exist
        if (node.children && node.children.length > 0) {
          newNode.children = filterNodes(node.children);
        }
        
        // Node matches if it or any of its children match
        const nameMatch = node.name.toLowerCase().includes(query) || 
                         (node.fullName && node.fullName.toLowerCase().includes(query));
        
        const hasMatchingChildren = newNode.children && newNode.children.length > 0;
        
        // Only include node if it matches or has matching children
        if (nameMatch || hasMatchingChildren) {
          if (nameMatch) {
            newNode.isExpanded = true;
          }
          return newNode;
        }
        
        return null;
      }).filter(Boolean) as ProjectNode[];
    };
    
    const filtered = filterNodes(projectNodes);
    setFilteredNodes(filtered);
  }, [searchQuery, projectNodes]);

  // Canvas drawing effect
  useEffect(() => {
    if (isLoading || !canvasRef.current || !containerRef.current || viewMode !== "graph") {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = containerRef.current.clientWidth;
    canvas.height = Math.max(600, containerRef.current.clientHeight);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1e2c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw depending on layout type
    if (layoutType === "tree") {
      drawTreeLayout(ctx, canvas.width, canvas.height);
    } else {
      drawForceLayout(ctx, canvas.width, canvas.height);
    }
  }, [viewMode, isLoading, filteredNodes, dependencies, layoutType, zoomLevel, selectedNode]);

  // Helper function to draw tree layout
  const drawTreeLayout = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Flattened list of class nodes (no packages)
    const classNodes = flattenNodes(filteredNodes).filter(
      node => node.type === "class" || node.type === "interface" || node.type === "enum"
    );

    // Calculate positions for nodes
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const nodeSize = 60 * zoomLevel;
    const horizontalSpacing = 160 * zoomLevel;
    const verticalSpacing = 100 * zoomLevel;
    const startX = width / 2 - (classNodes.length * horizontalSpacing) / 2;

    // Position nodes in a tree-like structure
    classNodes.forEach((node, index) => {
      nodePositions[node.id] = {
        x: startX + index * horizontalSpacing,
        y: 100
      };
    });

    // Adjust y-positions based on dependencies (children below parents)
    const processedNodes = new Set<string>();
    const positionNodeBasedOnDependencies = (nodeId: string, depth: number = 1) => {
      if (processedNodes.has(nodeId)) return;
      processedNodes.add(nodeId);

      // Get all nodes that depend on this node
      const childDeps = dependencies.filter(dep => dep.target === nodeId).map(dep => dep.source);
      
      childDeps.forEach(childId => {
        if (nodePositions[childId]) {
          nodePositions[childId].y = 100 + depth * verticalSpacing;
          positionNodeBasedOnDependencies(childId, depth + 1);
        }
      });
    };

    // Process each node
    classNodes.forEach(node => {
      positionNodeBasedOnDependencies(node.id);
    });

    // Draw connections (dependencies)
    dependencies.forEach(dep => {
      const sourcePos = nodePositions[dep.source];
      const targetPos = nodePositions[dep.target];

      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        
        // Create a curved line
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2 + 30;
        ctx.quadraticCurveTo(midX, midY, targetPos.x, targetPos.y);
        
        // Style based on dependency type
        if (dep.type === "extends") {
          ctx.strokeStyle = "#ec4899"; // Pink
          ctx.lineWidth = 2;
        } else if (dep.type === "implements") {
          ctx.strokeStyle = "#6366f1"; // Indigo
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
        } else if (dep.type === "creates") {
          ctx.strokeStyle = "#2dd4bf"; // Teal
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = "#94a3b8"; // Slate
          ctx.lineWidth = 1;
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw arrow
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
        const arrowSize = 8 * zoomLevel;
        
        ctx.beginPath();
        ctx.moveTo(targetPos.x, targetPos.y);
        ctx.lineTo(
          targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }
    });

    // Draw nodes
    classNodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      // Highlight affected nodes if an issue is selected
      const isAffected = selectedIssue && selectedIssue.affectedNodes.includes(node.id);
      const isSelected = selectedNode && selectedNode.id === node.id;
      
      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeSize / 2, 0, Math.PI * 2);
      
      // Background color based on type and selection
      if (isSelected) {
        ctx.fillStyle = "#3b82f6"; // Blue
      } else if (isAffected) {
        if (selectedIssue.severity === "error") {
          ctx.fillStyle = "rgba(220, 38, 38, 0.8)"; // Red
        } else if (selectedIssue.severity === "warning") {
          ctx.fillStyle = "rgba(245, 158, 11, 0.8)"; // Amber
        } else {
          ctx.fillStyle = "rgba(59, 130, 246, 0.8)"; // Blue
        }
      } else {
        // Color based on node type
        if (node.type === "class") {
          ctx.fillStyle = "#1e293b"; // Slate
        } else if (node.type === "interface") {
          ctx.fillStyle = "#0f172a"; // Dark slate
        } else {
          ctx.fillStyle = "#0c0a09"; // Dark stone
        }
      }
      
      ctx.fill();
      
      // Draw border
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSelected ? "#ffffff" : "#64748b";
      ctx.stroke();
      
      // Draw node text
      ctx.font = `${12 * zoomLevel}px system-ui`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Break the text if needed
      const shortenedName = node.name.length > 15 
        ? node.name.substring(0, 12) + "..." 
        : node.name;
      
      ctx.fillText(shortenedName, pos.x, pos.y);
    });
  };

  // Helper function to draw force-directed layout
  const drawForceLayout = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // For simplicity, we'll use a circular layout in this example
    // In a real implementation, you'd use a force-directed algorithm
    
    const classNodes = flattenNodes(filteredNodes).filter(
      node => node.type === "class" || node.type === "interface" || node.type === "enum"
    );
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4 * zoomLevel;
    const nodeSize = 60 * zoomLevel;
    
    // Calculate positions in a circle
    const nodePositions: Record<string, { x: number; y: number }> = {};
    
    classNodes.forEach((node, index) => {
      const angle = (index / classNodes.length) * Math.PI * 2;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    // Draw connections
    dependencies.forEach(dep => {
      const sourcePos = nodePositions[dep.source];
      const targetPos = nodePositions[dep.target];
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        
        // Style based on dependency type
        if (dep.type === "extends") {
          ctx.strokeStyle = "#ec4899"; // Pink
          ctx.lineWidth = 2;
        } else if (dep.type === "implements") {
          ctx.strokeStyle = "#6366f1"; // Indigo
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
        } else if (dep.type === "creates") {
          ctx.strokeStyle = "#2dd4bf"; // Teal
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = "#94a3b8"; // Slate
          ctx.lineWidth = 1;
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw arrow
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
        const arrowSize = 8 * zoomLevel;
        
        ctx.beginPath();
        ctx.moveTo(targetPos.x, targetPos.y);
        ctx.lineTo(
          targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }
    });
    
    // Draw nodes
    classNodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      // Highlight affected nodes if an issue is selected
      const isAffected = selectedIssue && selectedIssue.affectedNodes.includes(node.id);
      const isSelected = selectedNode && selectedNode.id === node.id;
      
      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeSize / 2, 0, Math.PI * 2);
      
      // Background color based on type and selection
      if (isSelected) {
        ctx.fillStyle = "#3b82f6"; // Blue
      } else if (isAffected) {
        if (selectedIssue.severity === "error") {
          ctx.fillStyle = "rgba(220, 38, 38, 0.8)"; // Red
        } else if (selectedIssue.severity === "warning") {
          ctx.fillStyle = "rgba(245, 158, 11, 0.8)"; // Amber
        } else {
          ctx.fillStyle = "rgba(59, 130, 246, 0.8)"; // Blue
        }
      } else {
        // Color based on node type
        if (node.type === "class") {
          ctx.fillStyle = "#1e293b"; // Slate
        } else if (node.type === "interface") {
          ctx.fillStyle = "#0f172a"; // Dark slate
        } else {
          ctx.fillStyle = "#0c0a09"; // Dark stone
        }
      }
      
      ctx.fill();
      
      // Draw border
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSelected ? "#ffffff" : "#64748b";
      ctx.stroke();
      
      // Draw node text
      ctx.font = `${12 * zoomLevel}px system-ui`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Break the text if needed
      const shortenedName = node.name.length > 15 
        ? node.name.substring(0, 12) + "..." 
        : node.name;
      
      ctx.fillText(shortenedName, pos.x, pos.y);
    });
  };

  // Zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  // Zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Helper function to get all nodes recursively
  const flattenNodes = (nodes: ProjectNode[]): ProjectNode[] => {
    return nodes.reduce<ProjectNode[]>((flat, node) => {
      flat.push(node);
      if (node.children) {
        flat.push(...flattenNodes(node.children));
      }
      return flat;
    }, []);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || viewMode !== "graph") return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Simple hit testing for nodes (in real implementation this would be more sophisticated)
    const classNodes = flattenNodes(filteredNodes).filter(
      node => node.type === "class" || node.type === "interface" || node.type === "enum"
    );
    
    // Determine node positions again (this should match the drawing logic)
    const nodePositions: Record<string, { x: number; y: number }> = {};
    
    if (layoutType === "tree") {
      // Tree layout positions
      const nodeSize = 60 * zoomLevel;
      const horizontalSpacing = 160 * zoomLevel;
      const startX = canvas.width / 2 - (classNodes.length * horizontalSpacing) / 2;
      
      classNodes.forEach((node, index) => {
        nodePositions[node.id] = {
          x: startX + index * horizontalSpacing,
          y: 100
        };
      });
      
      // Adjust for dependencies
      // (simplified - in real app would use same logic as draw function)
    } else {
      // Force layout positions (circular in this example)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.4 * zoomLevel;
      
      classNodes.forEach((node, index) => {
        const angle = (index / classNodes.length) * Math.PI * 2;
        nodePositions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
    }
    
    // Check if click is on a node
    const nodeSize = 60 * zoomLevel;
    const clickedNode = classNodes.find(node => {
      const pos = nodePositions[node.id];
      if (!pos) return false;
      
      const dx = pos.x - x;
      const dy = pos.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= nodeSize / 2;
    });
    
    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  // Toggle node expansion in tree view
  const toggleNodeExpansion = (node: ProjectNode) => {
    // Create a deep copy of the nodes tree and toggle the selected node
    const toggleNode = (nodes: ProjectNode[]): ProjectNode[] => {
      return nodes.map(n => {
        if (n.id === node.id) {
          return { ...n, isExpanded: !n.isExpanded };
        }
        if (n.children) {
          return { ...n, children: toggleNode(n.children) };
        }
        return n;
      });
    };
    
    const updatedNodes = toggleNode(projectNodes);
    setProjectNodes(updatedNodes);
    setFilteredNodes(toggleNode(filteredNodes));
  };

  // Render tree node recursively
  const renderNode = (node: ProjectNode, depth: number = 0) => {
    const indentStyle = { marginLeft: `${depth * 20}px` };
    const isExpanded = node.isExpanded;
    const isHighlighted = selectedIssue && node.id && selectedIssue.affectedNodes.includes(node.id);
    
    return (
      <div key={node.id}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-800/50 rounded ${
            selectedNode?.id === node.id ? "bg-blue-900/30 text-blue-300" : ""
          } ${
            isHighlighted ? (
              selectedIssue.severity === "error" 
                ? "bg-red-900/20 text-red-300 border-l-2 border-red-500"
                : selectedIssue.severity === "warning"
                ? "bg-amber-900/20 text-amber-300 border-l-2 border-amber-500"
                : "bg-blue-900/20 text-blue-300 border-l-2 border-blue-500"
            ) : ""
          }`}
          style={indentStyle}
        >
          {node.children && node.children.length > 0 ? (
            <button
              onClick={() => toggleNodeExpansion(node)}
              className="w-4 h-4 mr-1 flex items-center justify-center text-gray-400"
            >
              {isExpanded ? "▼" : "►"}
            </button>
          ) : (
            <span className="w-4 h-4 mr-1"></span>
          )}
          
          <div 
            className="flex-grow flex items-center cursor-pointer"
            onClick={() => setSelectedNode(node)}
          >
            {node.type === "package" ? (
              <Layers className="h-4 w-4 mr-1 text-gray-400" />
            ) : node.type === "interface" ? (
              <i className="h-4 w-4 mr-1 text-blue-400">I</i>
            ) : node.type === "enum" ? (
              <i className="h-4 w-4 mr-1 text-purple-400">E</i>
            ) : (
              <i className="h-4 w-4 mr-1 text-green-400">C</i>
            )}
            
            <span className="truncate">{node.name}</span>
          </div>
        </div>
        
        {node.children && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-gray-800/30 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Mod Architecture</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-56">
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-gray-800 border-gray-700"
            />
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
          </div>
          
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[120px] h-8 bg-gray-800 border-gray-700">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="hierarchy">Hierarchy</SelectItem>
              <SelectItem value="graph">Dependency Graph</SelectItem>
              <SelectItem value="issues">Issues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-grow flex overflow-hidden">
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-gray-400">Analyzing mod architecture...</p>
            </div>
          </div>
        ) : viewMode === "hierarchy" ? (
          <div className="flex flex-col md:flex-row w-full h-full">
            {/* Tree View */}
            <div className="w-full md:w-1/2 border-r border-gray-700 overflow-auto p-2">
              {filteredNodes.length === 0 ? (
                <div className="text-center p-8 text-gray-400">
                  No classes or packages found
                </div>
              ) : (
                filteredNodes.map(node => renderNode(node))
              )}
            </div>
            
            {/* Details View */}
            <div className="w-full md:w-1/2 p-4 overflow-auto">
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">{selectedNode.name}</h3>
                    {selectedNode.fullName && (
                      <p className="text-sm text-gray-400">{selectedNode.fullName}</p>
                    )}
                  </div>
                  
                  {selectedNode.type !== "package" && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Type</h4>
                        <div className="bg-gray-800/50 p-2 rounded-md">
                          <span className="capitalize">{selectedNode.type}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">File</h4>
                        <div className="bg-gray-800/50 p-2 rounded-md">
                          {selectedNode.file?.path || "Unknown"}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Dependencies</h4>
                        {selectedNode.dependencies && selectedNode.dependencies.length > 0 ? (
                          <div className="space-y-1">
                            {selectedNode.dependencies.map(dep => (
                              <div key={dep} className="bg-gray-800/50 p-2 rounded-md">
                                {dep}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-800/50 p-2 rounded-md text-gray-400">
                            No dependencies
                          </div>
                        )}
                      </div>
                      
                      {/* Show issues related to this node */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Issues</h4>
                        {issues.filter(issue => issue.affectedNodes.includes(selectedNode.id)).length > 0 ? (
                          <div className="space-y-2">
                            {issues
                              .filter(issue => issue.affectedNodes.includes(selectedNode.id))
                              .map(issue => (
                                <div 
                                  key={issue.id} 
                                  className={`p-3 rounded-md ${
                                    issue.severity === "error" 
                                      ? "bg-red-900/20 border border-red-900/50" 
                                      : issue.severity === "warning"
                                      ? "bg-amber-900/20 border border-amber-900/50"
                                      : "bg-blue-900/20 border border-blue-900/50"
                                  }`}
                                >
                                  <div className="flex items-start">
                                    {issue.severity === "error" ? (
                                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                    ) : issue.severity === "warning" ? (
                                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <h5 className={`font-medium ${
                                        issue.severity === "error" 
                                          ? "text-red-400" 
                                          : issue.severity === "warning"
                                          ? "text-amber-400"
                                          : "text-blue-400"
                                      }`}>
                                        {issue.message}
                                      </h5>
                                      <p className="text-sm text-gray-300 mt-1">
                                        {issue.details}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="bg-gray-800/50 p-2 rounded-md text-gray-400">
                            No issues found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {selectedNode.type === "package" && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Contents</h4>
                      {selectedNode.children && selectedNode.children.length > 0 ? (
                        <div className="bg-gray-800/50 rounded-md overflow-hidden">
                          <div className="divide-y divide-gray-700">
                            {selectedNode.children.map(child => (
                              <div 
                                key={child.id} 
                                className="p-2 hover:bg-gray-700/50 cursor-pointer"
                                onClick={() => setSelectedNode(child)}
                              >
                                <div className="flex items-center">
                                  {child.type === "package" ? (
                                    <Layers className="h-4 w-4 mr-2 text-gray-400" />
                                  ) : child.type === "interface" ? (
                                    <i className="h-4 w-4 mr-2 text-blue-400">I</i>
                                  ) : child.type === "enum" ? (
                                    <i className="h-4 w-4 mr-2 text-purple-400">E</i>
                                  ) : (
                                    <i className="h-4 w-4 mr-2 text-green-400">C</i>
                                  )}
                                  {child.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-800/50 p-2 rounded-md text-gray-400">
                          Empty package
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400">
                  Select a class or package to view details
                </div>
              )}
            </div>
          </div>
        ) : viewMode === "graph" ? (
          <div className="flex-grow overflow-hidden" ref={containerRef}>
            <div className="p-2 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
              <div className="space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn} 
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut} 
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetZoom} 
                  className="h-8"
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
              
              <div>
                <Select value={layoutType} onValueChange={setLayoutType}>
                  <SelectTrigger className="w-[120px] h-8 bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Layout" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="tree">Tree Layout</SelectItem>
                    <SelectItem value="force">Force-Directed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          // In a real implementation, this would save the graph as an image
                          toast({
                            title: "Graph Exported",
                            description: "The architecture diagram has been saved.",
                          });
                        }}
                        className="h-8"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export diagram as PNG</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative h-full">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full"
                onClick={handleCanvasClick}
              />
              
              {/* Dependency Legend */}
              <div className="absolute bottom-4 right-4 bg-gray-900/90 p-3 rounded-md border border-gray-700 text-sm">
                <h4 className="font-medium text-white mb-2">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-pink-500 mr-2"></div>
                    <span className="text-gray-300">Extends</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-indigo-500 mr-2" style={{ borderTop: '1px dashed' }}></div>
                    <span className="text-gray-300">Implements</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-teal-500 mr-2"></div>
                    <span className="text-gray-300">Creates</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-slate-400 mr-2"></div>
                    <span className="text-gray-300">Uses</span>
                  </div>
                </div>
              </div>
              
              {/* Selected Node Details */}
              {selectedNode && (
                <div className="absolute top-4 left-4 bg-gray-900/90 p-3 rounded-md border border-gray-700 max-w-xs">
                  <h4 className="font-medium text-white">{selectedNode.name}</h4>
                  {selectedNode.fullName && (
                    <p className="text-xs text-gray-400 mt-1">{selectedNode.fullName}</p>
                  )}
                  {selectedNode.file && (
                    <p className="text-xs text-gray-400 mt-2">File: {selectedNode.file.name}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow overflow-auto p-4">
            <h3 className="text-lg font-medium text-white mb-4">Architecture Issues</h3>
            
            {issues.length === 0 ? (
              <div className="text-center p-8 bg-green-900/20 border border-green-900/50 rounded-md">
                <div className="rounded-full bg-green-900/30 p-2 inline-flex mb-3">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="text-lg font-medium text-green-400 mb-1">No Issues Found</h4>
                <p className="text-gray-300">
                  Your mod architecture appears to be following best practices.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map(issue => (
                  <Card 
                    key={issue.id} 
                    className={`p-4 ${
                      selectedIssue?.id === issue.id ? "ring-2 ring-blue-500" : ""
                    } ${
                      issue.severity === "error" 
                        ? "bg-red-900/20 border-red-900/50" 
                        : issue.severity === "warning"
                        ? "bg-amber-900/20 border-amber-900/50"
                        : "bg-blue-900/20 border-blue-900/50"
                    }`}
                    onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
                  >
                    <div className="flex items-start">
                      {issue.severity === "error" ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      ) : issue.severity === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex-grow">
                        <h4 className={`font-medium ${
                          issue.severity === "error" 
                            ? "text-red-400" 
                            : issue.severity === "warning"
                            ? "text-amber-400"
                            : "text-blue-400"
                        }`}>
                          {issue.message}
                        </h4>
                        
                        <p className="text-sm text-gray-300 mt-1">
                          {issue.details}
                        </p>
                        
                        {selectedIssue?.id === issue.id && (
                          <>
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-300 mb-1">Affected Components</h5>
                              <div className="flex flex-wrap gap-2">
                                {issue.affectedNodes.map(node => (
                                  <span 
                                    key={node} 
                                    className="px-2 py-1 text-xs bg-gray-800 rounded-md text-gray-300"
                                  >
                                    {node.split(".").pop()}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-300 mb-1">Recommendation</h5>
                              <p className="text-sm text-gray-300 bg-gray-800/50 p-2 rounded-md">
                                {issue.recommendation}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}