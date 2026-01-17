'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Book, Plus, Trash2, Scroll } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChapterSidebar() {
  const { 
    chapters, 
    activeChapterId, 
    setActiveChapter, 
    addChapter, 
    deleteChapter,
    updateChapterTitle 
  } = useApp();

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-200 w-64">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2 text-amber-500">
          <Book className="w-5 h-5" />
          Grimoire
        </h2>
        <button 
          onClick={addChapter}
          className="p-1.5 bg-indigo-900/50 hover:bg-indigo-800 rounded text-indigo-300 transition"
          title="Nouveau Chapitre"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chapters.length === 0 && (
          <div className="text-center text-xs text-slate-600 mt-10 italic px-4">
            Aucun chapitre.<br/>Commencez par en créer un.
          </div>
        )}

        {chapters.map((chapter) => (
          <div 
            key={chapter.id}
            className={cn(
              "group flex items-center gap-2 p-2 rounded cursor-pointer transition border border-transparent",
              activeChapterId === chapter.id 
                ? "bg-slate-900 border-slate-700 text-amber-100" 
                : "hover:bg-slate-900/50 text-slate-400"
            )}
            onClick={() => setActiveChapter(chapter.id)}
          >
            <Scroll className={cn("w-4 h-4 flex-shrink-0", activeChapterId === chapter.id ? "text-amber-500" : "text-slate-600")} />
            
            <div className="flex-1 min-w-0">
              {activeChapterId === chapter.id ? (
                <input 
                  className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder-slate-600"
                  value={chapter.title}
                  onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Nom du chapitre..."
                />
              ) : (
                <div className="text-sm font-medium truncate">{chapter.title}</div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if(confirm('Supprimer ce chapitre ?')) deleteChapter(chapter.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
