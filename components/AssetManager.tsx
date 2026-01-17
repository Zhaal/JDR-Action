'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Trash2, Copy, Plus, User, Box, MapPin, Search, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';

export default function AssetManager() {
  const { assets, addAsset, updateAsset, deleteAsset, getAssetsByType } = useApp();
  const [activeType, setActiveType] = useState<AssetType>('character');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Temporary state for new asset
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    imageUrl: '',
    cw: 80,
    abilities: '',
    spells: '',
    equipment: '',
    instruction: '',
    familiar: '',
  });

  const handleSave = () => {
    if (!newAsset.name) return;
    
    if (editingId) {
        updateAsset(editingId, newAsset);
        setEditingId(null);
    } else {
        addAsset({
            ...newAsset,
            type: activeType,
        });
    }
    setNewAsset({ name: '', description: '', imageUrl: '', cw: 80, abilities: '', spells: '', equipment: '', instruction: '', familiar: '' });
    setIsAdding(false);
  };

  const startEdit = (asset: any) => {
      setNewAsset({
          name: asset.name,
          description: asset.description,
          imageUrl: asset.imageUrl,
          cw: asset.cw,
          abilities: asset.abilities || '',
          spells: asset.spells || '',
          equipment: asset.equipment || '',
          instruction: asset.instruction || '',
          familiar: asset.familiar || '',
      });
      setEditingId(asset.id);
      setIsAdding(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAssetBlock = (a: typeof assets[0]) => {
    return `${a.name}: ${a.description}
Ref: ${a.imageUrl} --cw ${a.cw}`;
  };

  const displayedAssets = getAssetsByType(activeType);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Header & Tabs */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-100">
          Bible Visuelle
        </h2>
        
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveType('character')}
            className={cn(
              "flex-1 py-1.5 rounded text-xs font-medium flex justify-center items-center gap-1 transition",
              activeType === 'character' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
            title="Personnages"
          >
            <User className="w-3 h-3" /> Persos
          </button>
          <button
            onClick={() => setActiveType('object')}
            className={cn(
              "flex-1 py-1.5 rounded text-xs font-medium flex justify-center items-center gap-1 transition",
              activeType === 'object' ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
            title="Objets"
          >
            <Box className="w-3 h-3" /> Objets
          </button>
          <button
            onClick={() => setActiveType('location')}
            className={cn(
              "flex-1 py-1.5 rounded text-xs font-medium flex justify-center items-center gap-1 transition",
              activeType === 'location' ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
            title="Lieux"
          >
            <MapPin className="w-3 h-3" /> Lieux
          </button>
        </div>
      </div>

      {/* Add Button */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/50">
         <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 text-xs flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-3 h-3" /> Ajouter un élément
        </button>
      </div>

      {/* Form */}
      {isAdding && (
        <div className="p-4 bg-slate-800 border-b border-slate-700 animate-in slide-in-from-top-2">
          <div className="space-y-3">
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
              placeholder="Nom"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              autoFocus
            />
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none"
              placeholder="Description"
              value={newAsset.description}
              onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
            />
            
            {activeType === 'character' && (
                <div className="space-y-2 bg-slate-900/30 p-2 rounded border border-slate-700/50">
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 outline-none"
                        placeholder="Dons / Traits (ex: Vision nocturne, Sang froid...)"
                        value={newAsset.abilities}
                        onChange={(e) => setNewAsset({ ...newAsset, abilities: e.target.value })}
                    />
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 outline-none"
                        placeholder="Sorts (ex: Boule de feu, Soin...)"
                        value={newAsset.spells}
                        onChange={(e) => setNewAsset({ ...newAsset, spells: e.target.value })}
                    />
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 outline-none"
                        placeholder="Équipement (ex: Épée longue, Cotte de mailles...)"
                        value={newAsset.equipment}
                        onChange={(e) => setNewAsset({ ...newAsset, equipment: e.target.value })}
                    />
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 outline-none"
                        placeholder="Familier (ex: Loup blanc nommé Ghost)"
                        value={newAsset.familiar}
                        onChange={(e) => setNewAsset({ ...newAsset, familiar: e.target.value })}
                    />
                    <textarea
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs focus:border-indigo-500 outline-none h-16 resize-none"
                        placeholder="Consigne RP spécifique (ex: Toujours sarcastique, ne parle jamais du passé...)"
                        value={newAsset.instruction}
                        onChange={(e) => setNewAsset({ ...newAsset, instruction: e.target.value })}
                    />
                </div>
            )}

            <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
              <label className="text-xs text-slate-400 block mb-1">Nom du fichier image</label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-indigo-500 outline-none font-mono text-indigo-300"
                placeholder="ex: heros.png"
                value={newAsset.imageUrl}
                onChange={(e) => setNewAsset({ ...newAsset, imageUrl: e.target.value })}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                ⚠️ Déposez l'image dans le dossier <b>public/assets</b> du projet.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-xs uppercase font-bold">Poids (CW): {newAsset.cw}</span>
              <input
                type="range"
                min="0"
                max="100"
                className="flex-1 accent-indigo-500"
                value={newAsset.cw}
                onChange={(e) => setNewAsset({ ...newAsset, cw: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="px-3 py-1.5 bg-indigo-600 rounded text-xs text-white hover:bg-indigo-500"
              >
                {editingId ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedAssets.length === 0 && !isAdding && (
          <div className="text-center text-slate-600 text-xs italic mt-10">
            Aucun élément dans cette catégorie.
          </div>
        )}

        {displayedAssets.map((asset) => (
          <div key={asset.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex gap-3 group hover:border-slate-600 transition">
            <div className="w-14 h-14 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-600 relative">
              {asset.imageUrl ? (
                <img 
                  src={asset.imageUrl.startsWith('http') ? asset.imageUrl : `/assets/${asset.imageUrl}`} 
                  alt={asset.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.classList.add('bg-red-900/20');
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  {activeType === 'character' ? <User /> : activeType === 'object' ? <Box /> : <MapPin />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className={cn(
                    "font-semibold text-sm truncate",
                    activeType === 'character' ? "text-indigo-300" :
                    activeType === 'object' ? "text-amber-300" : "text-emerald-300"
                )}>
                    {asset.name}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(asset)}
                    className="p-1 text-slate-500 hover:text-indigo-400"
                    title="Modifier"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(getAssetBlock(asset))}
                    className="p-1 text-slate-500 hover:text-white"
                    title="Copier Bloc"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 truncate mb-1">{asset.description}</p>
              <div className="text-[10px] bg-slate-900/50 p-1 rounded text-slate-500 font-mono truncate">
                 --cref [url] --cw {asset.cw}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}