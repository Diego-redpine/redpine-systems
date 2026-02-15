'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMap, Polygon, Polyline, CircleMarker } from 'react-leaflet';

interface TerritoryDrawToolProps {
  isDrawing: boolean;
  onComplete: (polygon: [number, number][]) => void;
  onCancel: () => void;
  color: string;
}

export default function TerritoryDrawTool({ isDrawing, onComplete, onCancel, color }: TerritoryDrawToolProps) {
  const map = useMap();
  const [points, setPoints] = useState<[number, number][]>([]);
  const [cursorPos, setCursorPos] = useState<[number, number] | null>(null);

  // Reset points when drawing starts
  useEffect(() => {
    if (isDrawing) {
      setPoints([]);
      setCursorPos(null);
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
    return () => {
      map.getContainer().style.cursor = '';
    };
  }, [isDrawing, map]);

  // Click to add point
  const handleClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!isDrawing) return;
    const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
    setPoints(prev => [...prev, newPoint]);
  }, [isDrawing]);

  // Double-click to close polygon
  const handleDblClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!isDrawing || points.length < 3) return;
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
    onComplete([...points]);
    setPoints([]);
    setCursorPos(null);
  }, [isDrawing, points, onComplete]);

  // Track cursor for preview line
  const handleMouseMove = useCallback((e: L.LeafletMouseEvent) => {
    if (!isDrawing || points.length === 0) return;
    setCursorPos([e.latlng.lat, e.latlng.lng]);
  }, [isDrawing, points.length]);

  // Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        setPoints([]);
        setCursorPos(null);
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, onCancel]);

  // Attach map event listeners
  useEffect(() => {
    if (!isDrawing) return;

    map.on('click', handleClick);
    map.on('dblclick', handleDblClick);
    map.on('mousemove', handleMouseMove);
    map.doubleClickZoom.disable();

    return () => {
      map.off('click', handleClick);
      map.off('dblclick', handleDblClick);
      map.off('mousemove', handleMouseMove);
      map.doubleClickZoom.enable();
    };
  }, [isDrawing, map, handleClick, handleDblClick, handleMouseMove]);

  if (!isDrawing) return null;

  // Build the preview line from last point to cursor
  const previewLine: [number, number][] = [];
  if (cursorPos && points.length > 0) {
    previewLine.push(points[points.length - 1], cursorPos);
  }

  // Close line from cursor to first point (when 3+ points exist)
  const closeLine: [number, number][] = [];
  if (cursorPos && points.length >= 3) {
    closeLine.push(cursorPos, points[0]);
  }

  return (
    <>
      {/* Partially drawn polygon fill */}
      {points.length >= 3 && (
        <Polygon
          positions={points}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.1, weight: 2, dashArray: '6 4' }}
        />
      )}

      {/* Placed vertices */}
      {points.map((pt) => (
        <CircleMarker
          key={`${pt[0]}_${pt[1]}`}
          center={pt}
          radius={5}
          pathOptions={{ color: 'white', fillColor: color, fillOpacity: 1, weight: 2 }}
        />
      ))}

      {/* Preview line to cursor */}
      {previewLine.length === 2 && (
        <Polyline positions={previewLine} pathOptions={{ color, weight: 2, dashArray: '4 4', opacity: 0.6 }} />
      )}

      {/* Close line to first point */}
      {closeLine.length === 2 && (
        <Polyline positions={closeLine} pathOptions={{ color, weight: 2, dashArray: '4 4', opacity: 0.4 }} />
      )}
    </>
  );
}
