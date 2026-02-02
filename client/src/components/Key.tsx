import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KeyProps {
  note: string;
  isBlack?: boolean;
  isPressed: boolean;
  label?: string; // Keyboard mapping label
  onMouseDown: () => void;
  onMouseUp: () => void;
}

export const Key: React.FC<KeyProps> = ({ 
  note, 
  isBlack, 
  isPressed, 
  label, 
  onMouseDown, 
  onMouseUp 
}) => {
  return (
    <div
      className={cn(
        "relative select-none cursor-pointer transition-all duration-75 ease-out",
        isBlack ? "z-10 w-10 h-32 -mx-5" : "z-0 w-14 h-48 border-l border-[#ccc]",
        // Specific styling logic is handled by CSS classes for 3D effect
        isBlack ? "black-key-gradient rounded-b-md" : "white-key-gradient rounded-b-lg",
        isPressed && (isBlack ? "black-key-active" : "white-key-active")
      )}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent text selection
        onMouseDown();
      }}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={(e) => {
        e.preventDefault();
        onMouseDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onMouseUp();
      }}
    >
      <div className={cn(
        "absolute bottom-4 w-full text-center text-xs font-semibold pointer-events-none opacity-50",
        isBlack ? "text-gray-400" : "text-gray-500"
      )}>
        {label}
      </div>
      
      {/* Decorative reflection for polish */}
      {!isBlack && (
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-t-lg pointer-events-none" />
      )}
    </div>
  );
};
