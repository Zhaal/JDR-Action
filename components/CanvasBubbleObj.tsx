'use client';

import React, { useRef, useEffect } from 'react';
import { Group, Ellipse, Text, Line, Circle, Transformer } from 'react-konva';
import { Bubble } from '@/types';
import Konva from 'konva';

interface CanvasBubbleObjProps {
  bubble: Bubble;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<Bubble>) => void;
}

export default function CanvasBubbleObj({ bubble, isSelected, onSelect, onChange }: CanvasBubbleObjProps) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTailDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Stop propagation so the group doesn't drag
    e.cancelBubble = true;
    
    // The tail drag position is relative to the stage, but we store it as absolute or relative?
    // Let's store tailX/Y as absolute coordinates for simplicity in rendering line.
    // However, if we move the group, the tail should move with it? 
    // Yes, if tail is part of group, it moves with group.
    // But if we want to point to a character, maybe absolute is better?
    // Let's keep it simple: Tail coordinates are relative to the Group (0,0 is center of bubble).
    
    // Wait, the types defined tailX/Y. If I put them in a Group, everything inside is relative to Group X/Y.
    // So if I drag the control point, I get its new X/Y relative to group.
    
    const node = e.target;
    onChange({
      tailX: node.x(), // relative to group
      tailY: node.y(), // relative to group
    });
  };

  const handleTextDblClick = () => {
    const newText = prompt('Modifier le texte:', bubble.text);
    if (newText !== null) {
      onChange({ text: newText });
    }
  };

  // Convert absolute tail pos to relative if needed, but let's assume our data model stores relative tail offset for easier group dragging.
  // Actually, in `AppContext`, I initialized tailX/Y as absolute-ish values (x + 50).
  // Let's correct that assumption: tailX/Y in data model will be RELATIVE to bubble center.
  // So initial: tailX: 50, tailY: 50.
  
  // Safe check if older data or different init
  const tailX = bubble.tailX || 50;
  const tailY = bubble.tailY || 50;

  return (
    <>
      <Group
        ref={groupRef}
        x={bubble.x}
        y={bubble.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
      >
        {/* Tail Line */}
        <Line
          points={[0, 0, tailX, tailY]}
          stroke="black"
          strokeWidth={2}
        />
        
        {/* Bubble Body */}
        <Ellipse
          radiusX={bubble.width / 2}
          radiusY={bubble.height / 2}
          fill="white"
          stroke="black"
          strokeWidth={2}
          shadowColor="black"
          shadowBlur={5}
          shadowOpacity={0.1}
        />

        {/* Text */}
        <Text
          text={bubble.text}
          width={bubble.width * 0.8}
          height={bubble.height * 0.7}
          offsetX={bubble.width * 0.4}
          offsetY={bubble.height * 0.35}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fontFamily="Arial"
          fill="black"
          onDblClick={handleTextDblClick}
        />

        {/* Tail Control Point (Visible only when selected) */}
        {isSelected && (
          <Circle
            x={tailX}
            y={tailY}
            radius={6}
            fill="#10b981"
            draggable
            onDragMove={(e) => {
                 // Update visual line during drag if needed, handled by Konva auto-redraw usually
            }}
            onDragEnd={handleTailDrag}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
