// ===============================
// components/ProjectModal/Mobile/ModalHeader.tsx
// ===============================
"use client";

import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  projectTitle: string;
  projectId: string;
  isInfoVisible: boolean;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  projectTitle,
  projectId,
  isInfoVisible,
  onClose
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
      <button 
        onClick={onClose} 
        className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" 
        aria-label="Fermer"
      >
        <X size={24} />
      </button>
      
      <h2 
        id={`modal-title-${projectId}`} 
        className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4"
      >
        {projectTitle}
      </h2>
      
      <div className="w-8 h-8 shrink-0"></div>
    </div>
  );
};
