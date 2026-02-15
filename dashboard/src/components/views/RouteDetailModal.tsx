'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import type { MapMarker, MapPolygon, MapPolyline } from '@/components/maps/LeafletMap';
import type { RouteStop } from '@/lib/dummy-data';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), { ssr: false });

interface RouteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Record<string, unknown>;
  allCustomers: { id: string; name: string; address: string; lat: number; lon: number }[];
  configColors: DashboardColors;
  onSave?: (updatedRoute: Record<string, unknown>) => void;
}

// --- Sortable Stop Card ---

function SortableStopCard({
  stop,
  index,
  routeColor,
  onRemove,
  textColor,
}: {
  stop: RouteStop;
  index: number;
  routeColor: string;
  onRemove: (id: string) => void;
  textColor: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>

      {/* Stop number badge */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
        style={{ background: routeColor }}
      >
        {index + 1}
      </div>

      {/* Stop details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: textColor }}>
          {stop.customer_name}
        </p>
        <p className="text-xs truncate" style={{ color: textColor, opacity: 0.5 }}>
          {stop.address}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {stop.service_type && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100" style={{ color: textColor, opacity: 0.7 }}>
              {stop.service_type}
            </span>
          )}
          {stop.estimated_duration && (
            <span className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
              {stop.estimated_duration} min
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(stop.id)}
        className="flex-shrink-0 mt-1 text-gray-300 hover:text-red-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// --- Main Modal ---

export default function RouteDetailModal({
  isOpen,
  onClose,
  route,
  allCustomers,
  configColors,
  onSave,
}: RouteDetailModalProps) {
  const cf = route.custom_fields as Record<string, unknown> | undefined;
  const initialStops = (cf?.stops_ordered as RouteStop[]) || [];
  const territory = (cf?.territory_polygon as [number, number][]) || [];
  const routeColor = (cf?.territory_color as string) || '#3B82F6';

  const [stops, setStops] = useState<RouteStop[]>(initialStops);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const textColor = configColors.text || '#1A1A1A';
  const borderColor = configColors.borders || '#E5E7EB';

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStops((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        return reordered.map((s, i) => ({ ...s, order: i }));
      });
    }
  }, []);

  const handleRemoveStop = useCallback((stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId).map((s, i) => ({ ...s, order: i })));
  }, []);

  // Filter customers not already in stops
  const availableCustomers = useMemo(() => {
    const stopCustomerNames = new Set(stops.map((s) => s.customer_name));
    return allCustomers.filter((c) => !stopCustomerNames.has(c.name));
  }, [allCustomers, stops]);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return availableCustomers.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return availableCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [availableCustomers, searchQuery]);

  const handleAddCustomer = useCallback((customer: typeof allCustomers[0]) => {
    const newStop: RouteStop = {
      id: `stop_new_${Date.now()}`,
      customer_name: customer.name,
      address: customer.address,
      lat: customer.lat,
      lon: customer.lon,
      order: stops.length,
    };
    setStops((prev) => [...prev, newStop]);
    setSearchQuery('');
    setIsSearching(false);
  }, [stops.length]);

  // Map data for the detail view
  const mapMarkers = useMemo<MapMarker[]>(() => {
    return stops.map((stop, i) => ({
      id: `detail_stop_${stop.id}`,
      position: [stop.lat, stop.lon] as [number, number],
      label: String(i + 1),
      color: routeColor,
      type: 'stop' as const,
      popupContent: `${i + 1}. ${stop.customer_name}`,
    }));
  }, [stops, routeColor]);

  const mapPolygons = useMemo<MapPolygon[]>(() => {
    if (territory.length < 3) return [];
    return [{
      id: 'detail_territory',
      positions: territory,
      color: routeColor,
      fillColor: routeColor,
      fillOpacity: 0.1,
      weight: 2,
    }];
  }, [territory, routeColor]);

  const mapPolylines = useMemo<MapPolyline[]>(() => {
    if (stops.length < 2) return [];
    return [{
      id: 'detail_route_line',
      positions: stops.map((s) => [s.lat, s.lon] as [number, number]),
      color: routeColor,
      weight: 3,
    }];
  }, [stops, routeColor]);

  const mapBounds = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = stops.map((s) => [s.lat, s.lon]);
    territory.forEach((pt) => pts.push(pt));
    return pts;
  }, [stops, territory]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (stops.length === 0) return [44.9778, -93.2650];
    const avgLat = stops.reduce((sum, s) => sum + s.lat, 0) / stops.length;
    const avgLon = stops.reduce((sum, s) => sum + s.lon, 0) / stops.length;
    return [avgLat, avgLon];
  }, [stops]);

  // Total time calculation
  const totalDuration = stops.reduce((sum, s) => sum + (s.estimated_duration || 0), 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={onClose}
      title={route.name as string}
      subtitle={`Driver: ${route.driver as string} · ${stops.length} stops · ${totalHours > 0 ? `${totalHours}h ` : ''}${totalMins}m total`}
      maxWidth="max-w-6xl"
      noPadding
      configColors={configColors}
    >
      <div className="flex" style={{ height: '65vh' }}>
        {/* Left: Stop List (50%) */}
        <div className="w-1/2 flex flex-col border-r" style={{ borderColor }}>
          {/* Add Stop area */}
          <div className="p-3 border-b" style={{ borderColor }}>
            {isSearching ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none focus:ring-2"
                    style={{ borderColor, color: textColor }}
                    autoFocus
                  />
                  <button
                    onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                    className="text-sm text-gray-400 hover:text-gray-600 px-2"
                  >
                    Cancel
                  </button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleAddCustomer(c)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: textColor }}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs ml-2" style={{ opacity: 0.5 }}>{c.address}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center py-2" style={{ color: textColor, opacity: 0.5 }}>
                    No matching customers
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearching(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed text-sm font-medium transition-colors hover:opacity-80"
                style={{ borderColor: routeColor, color: routeColor }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Stop
              </button>
            )}
          </div>

          {/* Sortable stops list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {stops.map((stop, i) => (
                  <SortableStopCard
                    key={stop.id}
                    stop={stop}
                    index={i}
                    routeColor={routeColor}
                    onRemove={handleRemoveStop}
                    textColor={textColor}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {stops.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center" style={{ color: textColor, opacity: 0.4 }}>
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-sm font-medium">No stops yet</p>
                <p className="text-xs mt-1">Click "Add Stop" to add customers</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Route Map (50%) */}
        <div className="w-1/2">
          <LeafletMap
            center={mapCenter}
            zoom={13}
            markers={mapMarkers}
            polygons={mapPolygons}
            polylines={mapPolylines}
            fitBounds={mapBounds.length > 0 ? mapBounds : undefined}
            className="w-full h-full"
          />
        </div>
      </div>
    </CenterModal>
  );
}
