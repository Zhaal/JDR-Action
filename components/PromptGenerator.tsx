'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Copy, Plus, Trash2, Wand2, User, MapPin, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Asset, AssetType } from '@/types';

export default function PromptGenerator() {
  const { 
    activeChapterId,
    chapters,
    activePanels, 
    addPanel, 
    updatePanel, 
    deletePanel,
    updatePanelAssetPose,
    assets,
    getAssetsByType
  } = useApp();

  // Get current chapter data safely
  const activeChapter = chapters.find(c => c.id === activeChapterId);

  if (!activeChapterId) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
        <Wand2 className="w-12 h-12 opacity-20" />
        <p>Sélectionnez ou créez un chapitre pour commencer.</p>
      </div>
    );
  }

  const generatePrompt = (panel: typeof activePanels[0]) => {
    // Find selected assets
    const selectedAssets = assets.filter(a => panel.activeAssetIds?.includes(a.id));
    
    // Separate by type
    const chars = selectedAssets.filter(a => a.type === 'character');
    const locs = selectedAssets.filter(a => a.type === 'location');
    const objs = selectedAssets.filter(a => a.type === 'object');

    // Build Descriptive Text Parts
    const parts = [];

    // 1. L'Action Brute
    if (panel.description) parts.push(`**L'ACTION BRUTE (Ce qui se passe) :**\n${panel.description}`);

    // 2. Le Ressenti / Secret
    if (panel.secret) parts.push(`**LE RESSENTI / SECRET (Intériorité des personnages) :**\n${panel.secret}`);

    // 3. L'Ambiance
    if (panel.ambiance) parts.push(`**L'AMBIANCE (Détails sensoriels) :**\n${panel.ambiance}`);

    // 4. Context Info
    if (locs.length > 0) {
        parts.push(`**LIEU :** ${locs.map(a => a.name).join(', ')}`);
    }

    if (chars.length > 0) {
        const charDesc = chars.map(a => {
            const pose = panel.assetPoses?.[a.id];
            const details = [];
            if (a.abilities) details.push(`Traits: ${a.abilities}`);
            if (a.spells) details.push(`Sorts: ${a.spells}`);
            if (a.equipment) details.push(`Équipement: ${a.equipment}`);
            if (a.familiar) details.push(`Familier: ${a.familiar}`);
            
            const instructionPart = a.instruction ? `\n   > Consigne RP: ${a.instruction}` : '';
            const detailsStr = details.length > 0 ? `\n   > Détails: ${details.join(' | ')}` : '';
            
            return `- ${a.name} (${a.description})${detailsStr}${instructionPart}${pose ? `\n   > ACTION ACTUELLE: ${pose}` : ''}`;
        }).join('\n');
        parts.push(`**PERSONNAGES PRÉSENTS :**\n${charDesc}`);
    }

    if (objs.length > 0) {
        parts.push(`**OBJETS IMPORTANTS :** ${objs.map(a => a.name).join(', ')}`);
    }

    return parts.join('\n\n');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleAssetInPanel = (panelId: string, assetId: string, currentIds: string[] = []) => {
    if (currentIds.includes(assetId)) {
      updatePanel(panelId, { activeAssetIds: currentIds.filter(id => id !== assetId) });
    } else {
      updatePanel(panelId, { activeAssetIds: [...currentIds, assetId] });
    }
  };

  const renderAssetSelector = (panel: typeof activePanels[0], type: AssetType, icon: React.ReactNode, label: string, colorClass: string) => {
    const typeAssets = getAssetsByType(type);
    const currentIds = panel.activeAssetIds || [];
    if (typeAssets.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className={cn("text-xs font-bold uppercase", colorClass)}>{label}</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
            {typeAssets.map(asset => {
              const isSelected = currentIds.includes(asset.id);
              return (
                <div key={asset.id} className="flex flex-col gap-2">
                  <button
                      onClick={() => toggleAssetInPanel(panel.id, asset.id, currentIds)}
                      className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-2 w-fit",
                      isSelected
                          ? "bg-slate-800 border-slate-500 text-white shadow-inner"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600"
                      )}
                      style={{
                          borderColor: isSelected ? (type === 'character' ? '#6366f1' : type === 'object' ? '#d97706' : '#059669') : undefined
                      }}
                  >
                      {isSelected && <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                          type === 'character' ? 'bg-indigo-400' : type === 'object' ? 'bg-amber-400' : 'bg-emerald-400'
                      )} />}
                      {asset.name}
                  </button>
                  
                  {isSelected && (
                    <div className="flex flex-col gap-2 ml-4 animate-in fade-in slide-in-from-left-2">
                      {/* Affichage des détails enregistrés pour les personnages */}
                      {type === 'character' && (asset.abilities || asset.spells || asset.equipment || asset.familiar || asset.instruction) && (
                        <div className="text-[10px] text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800/50 space-y-1">
                          {asset.abilities && <div><span className="font-bold text-indigo-400/70 uppercase text-[9px]">Dons:</span> {asset.abilities}</div>}
                          {asset.spells && <div><span className="font-bold text-indigo-400/70 uppercase text-[9px]">Sorts:</span> {asset.spells}</div>}
                          {asset.equipment && <div><span className="font-bold text-indigo-400/70 uppercase text-[9px]">Équipement:</span> {asset.equipment}</div>}
                          {asset.familiar && <div><span className="font-bold text-amber-400/70 uppercase text-[9px]">Familier:</span> {asset.familiar}</div>}
                          {asset.instruction && <div className="italic text-slate-400 border-t border-slate-800 pt-1 mt-1"><span className="font-bold text-slate-500 uppercase text-[9px]">Consigne:</span> {asset.instruction}</div>}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase flex-shrink-0">Action :</span>
                        <input 
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:border-slate-600 outline-none"
                          placeholder="Ex: Brandissant son épée, visage paniqué..."
                          value={panel.assetPoses?.[asset.id] || ''}
                          onChange={(e) => updatePanelAssetPose(panel.id, asset.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 p-6 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-amber-500 font-serif">
          <Wand2 className="w-6 h-6" />
          {activeChapter?.title || 'Éditeur de Prompts'}
        </h2>

        {/* Panels List */}
        <div className="space-y-8">
          {activePanels.map((panel, index) => {
            const generatedPrompt = generatePrompt(panel);
            
            return (
              <div key={panel.id} className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden relative group">
                {/* Header */}
                <div className="bg-slate-750 p-3 border-b border-slate-700 flex justify-between items-center">
                   <input
                    className="font-bold text-amber-500 font-serif bg-transparent border-none focus:outline-none focus:ring-0 placeholder-amber-500/50 w-full"
                    value={panel.title || `Scène ${index + 1}`}
                    onChange={(e) => updatePanel(panel.id, { title: e.target.value })}
                    placeholder={`Scène ${index + 1}`}
                   />
                   <button onClick={() => deletePanel(panel.id)} className="text-slate-600 hover:text-red-400 p-1 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Inputs */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">L'Action Brute (Ce qui se passe)</label>
                      <textarea
                        className="w-full h-24 bg-slate-900 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition resize-none"
                        value={panel.description}
                        onChange={(e) => updatePanel(panel.id, { description: e.target.value })}
                        placeholder="Ex: Combat contre le moine Serval..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Le Ressenti / Secret (Intériorité)</label>
                           <textarea
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition resize-none"
                            value={panel.secret || ''}
                            onChange={(e) => updatePanel(panel.id, { secret: e.target.value })}
                            placeholder="Ex: Vorek a peur que les coups ne réveillent le minotaure..."
                          />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">L'Ambiance (Sensoriel)</label>
                           <textarea
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition resize-none"
                            value={panel.ambiance || ''}
                            onChange={(e) => updatePanel(panel.id, { ambiance: e.target.value })}
                            placeholder="Ex: Chaleur étouffante, poussière..."
                          />
                        </div>
                    </div>
                  </div>

                  {/* Asset Selectors */}
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest border-b border-slate-800 pb-2">Éléments de Référence</h4>
                    {renderAssetSelector(panel, 'character', <User className="w-3 h-3 text-indigo-400"/>, 'Personnages', 'text-indigo-400')}
                    {renderAssetSelector(panel, 'location', <MapPin className="w-3 h-3 text-emerald-400"/>, 'Lieux', 'text-emerald-400')}
                    {renderAssetSelector(panel, 'object', <Box className="w-3 h-3 text-amber-400"/>, 'Objets', 'text-amber-400')}
                    
                    {assets.length === 0 && (
                        <div className="text-xs text-slate-600 italic text-center py-2">
                            Aucun élément disponible. Ajoutez-en dans la Bible Visuelle (gauche).
                        </div>
                    )}
                  </div>

                  {/* Generated Prompt */}
                  <div className="bg-black/40 rounded-lg p-4 border border-slate-700/50 flex gap-4 items-start">
                    <div className="flex-1 font-mono text-xs text-emerald-400/80 break-all leading-relaxed">
                      {generatedPrompt}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(generatedPrompt)}
                      className="p-3 bg-emerald-800 hover:bg-emerald-700 rounded-lg text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex-shrink-0"
                      title="Copier Prompt"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={addPanel}
            className="w-full py-6 bg-slate-800/50 hover:bg-slate-800 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 flex items-center justify-center gap-3 transition group"
          >
            <div className="p-2 bg-slate-700 rounded-full group-hover:bg-slate-600 transition">
               <Plus className="w-5 h-5" /> 
            </div>
            <span className="font-medium">Ajouter une case</span>
          </button>
          
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
