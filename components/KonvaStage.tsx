'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useApp } from '@/context/AppContext';
import CanvasImageObj from './CanvasImageObj';
import CanvasBubbleObj from './CanvasBubbleObj';
import Konva from 'konva';

const KonvaStage = React.forwardRef<Konva.Stage>((props, ref) => {
  const { 
    canvasImages, 
    addCanvasImage, 
    updateCanvasImage, 
    deleteCanvasImage,
    bubbles, 
    updateBubble,
    deleteBubble
  } = useApp();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Use local ref if none provided, but we need to merge refs if we want internal access too.
  // Actually, we can just use the provided ref.
  const internalRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Check if it's an image or bubble
        const isImage = canvasImages.some(img => img.id === selectedId);
        if (isImage) {
          deleteCanvasImage(selectedId);
        } else {
          deleteBubble(selectedId);
        }
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, canvasImages, bubbles, deleteCanvasImage, deleteBubble]);
  
  // Combine refs utility
  const setRef = (node: Konva.Stage | null) => {
    internalRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = internalRef.current;
    if (!stage) return;
    
    stage.setPointersPositions(e);
    const pointerPosition = stage.getPointerPosition();
    const x = pointerPosition ? pointerPosition.x : 100;
    const y = pointerPosition ? pointerPosition.y : 100;

    const files = Array.from(e.dataTransfer.files);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          addCanvasImage(reader.result as string, x, y);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  // A4 size @ 96 DPI approx 794 x 1123
  const WIDTH = 794;
  const HEIGHT = 1123;

  return (
    <div 
      className="bg-slate-800 shadow-2xl overflow-hidden" 
      style={{ width: WIDTH, height: HEIGHT }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        width={WIDTH}
        height={HEIGHT}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        ref={setRef}
        className="bg-white"
      >
        <Layer>
          {/* Background Paper */}
          <Rect width={WIDTH} height={HEIGHT} fill="white" />
          
          {/* Images */}
          {canvasImages.map((img) => (
            <CanvasImageObj
              key={img.id}
              image={img}
              isSelected={img.id === selectedId}
              onSelect={() => setSelectedId(img.id)}
              onChange={(newAttrs) => updateCanvasImage(img.id, newAttrs)}
            />
          ))}

          {/* Bubbles */}
          {bubbles.map((bubble) => (
            <CanvasBubbleObj
              key={bubble.id}
              bubble={bubble}
              isSelected={bubble.id === selectedId}
              onSelect={() => setSelectedId(bubble.id)}
              onChange={(newAttrs) => updateBubble(bubble.id, newAttrs)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
});

KonvaStage.displayName = 'KonvaStage';
export default KonvaStage;
