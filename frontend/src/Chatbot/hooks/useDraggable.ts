import { useState, useEffect, useRef, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableReturn {
  position: Position;
  ref: RefObject<HTMLDivElement>;
}

export const useDraggable = (initialPosition: Position = { x: 20, y: 20 }): UseDraggableReturn => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new position based on mouse position and offset
      const newPosition = {
        x: event.clientX - offset.x,
        y: event.clientY - offset.y
      };
      
      // Ensure the element stays within the viewport
      const element = ref.current;
      if (element) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;
        
        newPosition.x = Math.max(0, Math.min(newPosition.x, viewportWidth - elementWidth));
        newPosition.y = Math.max(0, Math.min(newPosition.y, viewportHeight - elementHeight));
      }
      
      setPosition(newPosition);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleMouseDown = (event: MouseEvent) => {
      if (event.target === element || element.contains(event.target as Node)) {
        setIsDragging(true);
        
        // Calculate the offset between mouse position and element position
        const rect = element.getBoundingClientRect();
        setOffset({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      }
    };
    
    element.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  return { position, ref };
}; 