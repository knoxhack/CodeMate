import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  onResize: (size: number) => void;
  direction: 'left' | 'right' | 'up' | 'down';
  isVertical?: boolean;
  minSize?: number;
  maxSize?: number;
}

export default function ResizablePanel({
  children,
  width,
  height,
  onResize,
  direction,
  isVertical = false,
  minSize = 100,
  maxSize = Infinity
}: ResizablePanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = isVertical ? e.clientY : e.clientX;
    startSizeRef.current = isVertical ? height || 0 : width || 0;
    
    // Capture mouse events on the window
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const currentPos = isVertical ? e.clientY : e.clientX;
    const delta = currentPos - startPosRef.current;
    
    let newSize;
    if (direction === 'left' || direction === 'up') {
      newSize = startSizeRef.current - delta;
    } else {
      newSize = startSizeRef.current + delta;
    }
    
    // Clamp between min and max
    newSize = Math.max(minSize, Math.min(maxSize, newSize));
    
    onResize(newSize);
  };
  
  const handleMouseUp = () => {
    setIsResizing(false);
    
    // Remove event listeners
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  
  return (
    <div 
      ref={panelRef}
      className="relative"
      style={isVertical ? { height: `${height}px` } : { width: `${width}px` }}
    >
      {children}
      
      <div 
        className={cn(
          "absolute z-10",
          isVertical 
            ? "cursor-row-resize h-1.5 w-full left-0 hover:bg-primary/30"
            : "cursor-col-resize w-1.5 h-full top-0 hover:bg-primary/30",
          isResizing ? "bg-primary/30" : "bg-transparent",
          direction === 'right' ? "right-0" : 
          direction === 'left' ? "left-0" : 
          direction === 'up' ? "top-0" : "bottom-0"
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
