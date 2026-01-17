'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import AssetManager from '@/components/AssetManager';
import PromptGenerator from '@/components/PromptGenerator';
import ChapterSidebar from '@/components/ChapterSidebar';

export default function Home() {
  return (
    <AppProvider>
      <main className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
        
        {/* Left Sidebar 1 - Characters (Bible) */}
        <aside className="w-[320px] flex flex-col border-r border-slate-800 bg-slate-925 z-20 shadow-xl">
           <AssetManager />
        </aside>

        {/* Left Sidebar 2 - Chapters (Quest Log) */}
        <aside className="flex-shrink-0 z-10">
          <ChapterSidebar />
        </aside>

        {/* Main Area - Prompt Engine (Grimoire) */}
        <section className="flex-1 relative bg-slate-950 flex flex-col min-w-0">
          <PromptGenerator />
        </section>

      </main>
    </AppProvider>
  );
}
