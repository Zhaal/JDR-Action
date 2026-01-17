'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { MessageSquare, Download } from 'lucide-react';
import Konva from 'konva';

// Dynamic import for KonvaStage with no SSR
const KonvaStage = dynamic(() => import('./KonvaStage'), {
  ssr: false,
  loading: () => <div className="w-[794px] h-[1123px] bg-slate-800 animate-pulse flex items-center justify-center text-slate-500">Chargement du Studio...</div>,
});

export default function CanvasStudio() {
  const { addBubble } = useApp();
  const stageRef = useRef<Konva.Stage>(null);

  const handleExport = () => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const dataURL = stage.toDataURL({ pixelRatio: 2 }); // High res
    const link = document.createElement('a');
    link.download = 'planche-bd.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-4">
        <h2 className="text-lg font-bold text-slate-200 mr-4">Studio</h2>
        
        <button
          onClick={() => addBubble()}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ajouter Bulle</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition shadow-lg shadow-indigo-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Exporter PNG</span>
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-slate-950 p-8 flex justify-center">
        <div className="border border-slate-700">
           <KonvaStage ref={stageRef} />
        </div>
      </div>
    </div>
  );
}
