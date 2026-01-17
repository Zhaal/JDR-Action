'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Asset, Panel, Chapter, AssetType, CanvasImage, Bubble } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  // Assets (Global Library)
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  getAssetsByType: (type: AssetType) => Asset[];

  // Chapters (Management)
  chapters: Chapter[];
  activeChapterId: string | null;
  addChapter: () => void;
  deleteChapter: (id: string) => void;
  setActiveChapter: (id: string) => void;
  updateChapterTitle: (id: string, title: string) => void;

  // Active Chapter Panels
  activePanels: Panel[];
  addPanel: () => void;
  updatePanel: (id: string, panel: Partial<Panel>) => void;
  deletePanel: (id: string) => void;
  updatePanelAssetPose: (panelId: string, assetId: string, pose: string) => void;

  // Studio (Canvas)
  canvasImages: CanvasImage[];
  addCanvasImage: (url: string, x: number, y: number) => void;
  updateCanvasImage: (id: string, attrs: Partial<CanvasImage>) => void;
  deleteCanvasImage: (id: string) => void;

  bubbles: Bubble[];
  addBubble: () => void;
  updateBubble: (id: string, attrs: Partial<Bubble>) => void;
  deleteBubble: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // --- Assets ---
  const [assets, setAssets, isAssetsLoaded] = useLocalStorage<Asset[]>('gemidesk-assets', []);
  
  // Migration logic - Only run if fully loaded and really empty
  useEffect(() => {
    if (isAssetsLoaded && assets.length === 0) {
        const oldChars = localStorage.getItem('gemidesk-characters');
        if (oldChars) {
            try {
                const parsed = JSON.parse(oldChars);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log("Migrating old characters...");
                    const converted: Asset[] = parsed.map((c: any) => ({
                        id: c.id,
                        type: 'character',
                        name: c.name,
                        description: c.description,
                        imageUrl: c.imageUrl,
                        cw: c.cw
                    }));
                    setAssets(converted);
                }
            } catch (e) { console.error("Migration failed", e); }
        }
    }
  }, [isAssetsLoaded]); // Depend only on loading state

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    setAssets((prev) => [...prev, { ...asset, id: uuidv4() }]);
  };

  const updateAsset = (id: string, asset: Partial<Asset>) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...asset } : a)));
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const getAssetsByType = (type: AssetType) => assets.filter(a => a.type === type);

  // --- Chapters ---
  const [chapters, setChapters] = useLocalStorage<Chapter[]>('gemidesk-chapters', []);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeChapterId && chapters.length > 0) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: uuidv4(),
      title: 'Nouveau Chapitre',
      panels: [],
    };
    setChapters((prev) => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const deleteChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
    if (activeChapterId === id) {
      setActiveChapterId(null);
    }
  };

  const updateChapterTitle = (id: string, title: string) => {
    setChapters((prev) => prev.map(c => c.id === id ? { ...c, title } : c));
  };

  // --- Panels ---
  
  const getActiveChapter = () => chapters.find(c => c.id === activeChapterId);
  const activePanels = getActiveChapter()?.panels || [];

  const addPanel = () => {
    if (!activeChapterId) return;
    const newPanel: Panel = { 
      id: uuidv4(), 
      title: 'Nouvelle Scène',
      description: '', 
      dialogue: '', 
      secret: '',
      ambiance: '',
      activeAssetIds: [] 
    };
    
    setChapters((prev) => prev.map(c => {
      if (c.id === activeChapterId) {
        return { ...c, panels: [...c.panels, newPanel] };
      }
      return c;
    }));
  };

  const updatePanel = (panelId: string, updatedFields: Partial<Panel>) => {
    if (!activeChapterId) return;
    setChapters((prev) => prev.map(c => {
      if (c.id === activeChapterId) {
        return {
          ...c,
          panels: c.panels.map(p => p.id === panelId ? { ...p, ...updatedFields } : p)
        };
      }
      return c;
    }));
  };

  const deletePanel = (panelId: string) => {
    if (!activeChapterId) return;
    setChapters((prev) => prev.map(c => {
      if (c.id === activeChapterId) {
        return {
          ...c,
          panels: c.panels.filter(p => p.id !== panelId)
        };
      }
      return c;
    }));
  };

  const updatePanelAssetPose = (panelId: string, assetId: string, pose: string) => {
    if (!activeChapterId) return;
    setChapters((prev) => prev.map(c => {
      if (c.id === activeChapterId) {
        return {
          ...c,
          panels: c.panels.map(p => {
            if (p.id === panelId) {
              const newPoses = { ...(p.assetPoses || {}), [assetId]: pose };
              return { ...p, assetPoses: newPoses };
            }
            return p;
          })
        };
      }
      return c;
    }));
  };

  // --- Studio ---
  const [canvasImages, setCanvasImages] = useState<CanvasImage[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const addCanvasImage = (url: string, x: number, y: number) => {
    const newImg: CanvasImage = {
        id: uuidv4(),
        url,
        x,
        y,
        width: 200, // Default
        height: 200,
        rotation: 0
    };
    setCanvasImages(prev => [...prev, newImg]);
  };

  const updateCanvasImage = (id: string, attrs: Partial<CanvasImage>) => {
    setCanvasImages(prev => prev.map(img => img.id === id ? { ...img, ...attrs } : img));
  };

  const deleteCanvasImage = (id: string) => {
    setCanvasImages(prev => prev.filter(img => img.id !== id));
  };

  const addBubble = () => {
    const newBubble: Bubble = {
        id: uuidv4(),
        text: "Double-cliquez...",
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        tailX: 50,
        tailY: 100
    };
    setBubbles(prev => [...prev, newBubble]);
  };

  const updateBubble = (id: string, attrs: Partial<Bubble>) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, ...attrs } : b));
  };

  const deleteBubble = (id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        getAssetsByType,
        chapters,
        activeChapterId,
        addChapter,
        deleteChapter,
        setActiveChapter: setActiveChapterId,
        updateChapterTitle,
        activePanels,
        addPanel,
        updatePanel,
        deletePanel,
        updatePanelAssetPose,
        canvasImages,
        addCanvasImage,
        updateCanvasImage,
        deleteCanvasImage,
        bubbles,
        addBubble,
        updateBubble,
        deleteBubble,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}