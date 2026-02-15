'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardColors } from '@/types/config';
import { EntityFieldConfig } from '@/lib/entity-fields';
import { getContrastText } from '@/lib/view-colors';
import type { MapMarker, MapPolygon } from '@/components/maps/LeafletMap';
import type { RouteStop } from '@/lib/dummy-data';

const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), { ssr: false });
const RouteDetailModal = lazy(() => import('./RouteDetailModal'));

interface RouteViewProps {
  data: Record<string, unknown>[];
  entityType: string;
  configColors: DashboardColors;
  fields: EntityFieldConfig['route'] | null;
  onRecordClick?: (record: Record<string, unknown>) => void;
}

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#DCFCE7', text: '#166534' },
  completed: { bg: '#E0E7FF', text: '#3730A3' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  paused: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function RouteView({ data, configColors }: RouteViewProps) {
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Record<string, unknown> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Extract business location from first route's custom_fields
  const businessLocation = useMemo(() => {
    if (data.length === 0) return { lat: 44.9778, lon: -93.2650, name: 'HQ' };
    const cf = data[0]?.custom_fields as Record<string, unknown> | undefined;
    return (cf?.business_location as { lat: number; lon: number; name: string }) || { lat: 44.9778, lon: -93.2650, name: 'HQ' };
  }, [data]);

  // Extract all customers from first route's custom_fields
  const allCustomers = useMemo(() => {
    if (data.length === 0) return [];
    const cf = data[0]?.custom_fields as Record<string, unknown> | undefined;
    return (cf?.all_customers as { id: string; name: string; address: string; lat: number; lon: number }[]) || [];
  }, [data]);

  // Build map markers
  const markers = useMemo<MapMarker[]>(() => {
    const m: MapMarker[] = [];

    // Business HQ pin
    m.push({
      id: 'business_hq',
      position: [businessLocation.lat, businessLocation.lon],
      type: 'business',
      popupContent: businessLocation.name,
    });

    // Customer pins (gray dots for all customers)
    allCustomers.forEach((c) => {
      m.push({
        id: `customer_${c.id}`,
        position: [c.lat, c.lon],
        type: 'customer',
        popupContent: `${c.name}\n${c.address}`,
      });
    });

    return m;
  }, [businessLocation, allCustomers]);

  // Build territory polygons from route data
  const polygons = useMemo<MapPolygon[]>(() => {
    return data.map((route) => {
      const cf = route.custom_fields as Record<string, unknown> | undefined;
      const territory = (cf?.territory_polygon as [number, number][]) || [];
      const color = (cf?.territory_color as string) || '#3B82F6';
      return {
        id: `territory_${route.id}`,
        positions: territory,
        color,
        fillColor: color,
        fillOpacity: hoveredRouteId === route.id ? 0.35 : 0.15,
        weight: hoveredRouteId === route.id ? 3 : 2,
        highlighted: hoveredRouteId === route.id,
      };
    });
  }, [data, hoveredRouteId]);

  // Compute map bounds from all territory polygons + business location
  const fitBounds = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [[businessLocation.lat, businessLocation.lon]];
    data.forEach((route) => {
      const cf = route.custom_fields as Record<string, unknown> | undefined;
      const territory = (cf?.territory_polygon as [number, number][]) || [];
      territory.forEach((pt) => points.push(pt));
    });
    allCustomers.forEach((c) => points.push([c.lat, c.lon]));
    return points;
  }, [data, businessLocation, allCustomers]);

  const handleRouteClick = useCallback((route: Record<string, unknown>) => {
    setSelectedRoute(route);
    setIsDetailOpen(true);
  }, []);

  const handleRouteSave = useCallback((updatedRoute: Record<string, unknown>) => {
    // In demo mode, update local state only
    setSelectedRoute(updatedRoute);
  }, []);

  const buttonColor = configColors.buttons || '#3B82F6';
  const cardBg = configColors.cards || '#FFFFFF';
  const textColor = configColors.text || '#1A1A1A';
  const borderColor = configColors.borders || '#E5E7EB';

  return (
    <div className="flex h-full gap-4" style={{ minHeight: '500px' }}>
      {/* Left: Route Cards (40%) */}
      <div className="w-[40%] flex flex-col gap-3 overflow-y-auto pl-1 pr-1 pb-2">
        {/* New Route button */}
        <button
          onClick={() => {
            const blankRoute: Record<string, unknown> = {
              id: `new-${Date.now()}`,
              name: 'New Route',
              driver: '',
              status: 'pending',
              custom_fields: {
                territory_color: buttonColor,
                stops_ordered: [],
                territory_polygon: [],
                business_location: businessLocation,
                all_customers: allCustomers,
              },
            };
            setSelectedRoute(blankRoute);
            setIsCreating(true);
            setIsDetailOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors hover:opacity-80"
          style={{ borderColor: buttonColor, color: buttonColor }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Route
        </button>

        {/* Route cards */}
        {data.map((route) => {
          const cf = route.custom_fields as Record<string, unknown> | undefined;
          const routeColor = (cf?.territory_color as string) || '#3B82F6';
          const stops = (cf?.stops_ordered as RouteStop[]) || [];
          const status = (route.status as string) || 'pending';
          const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.pending;
          const isHovered = hoveredRouteId === route.id;

          return (
            <div
              key={route.id as string}
              className="rounded-2xl shadow-sm cursor-pointer transition-all"
              style={{
                background: cardBg,
                borderLeft: `4px solid ${routeColor}`,
                border: isHovered ? `2px solid ${routeColor}` : `1px solid ${borderColor}`,
                borderLeftWidth: '4px',
                borderLeftColor: routeColor,
                boxShadow: isHovered ? `0 4px 12px ${routeColor}25` : 'none',
              }}
              onClick={() => handleRouteClick(route)}
              onMouseEnter={() => setHoveredRouteId(route.id as string)}
              onMouseLeave={() => setHoveredRouteId(null)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-base" style={{ color: textColor }}>
                    {route.name as string}
                  </h3>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    {status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm" style={{ color: textColor, opacity: 0.6 }}>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                    {route.driver as string}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {stops.length} stops
                  </span>
                  {typeof route.eta === 'string' && route.eta && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {route.eta}
                    </span>
                  )}
                </div>

                {/* Stop preview chips */}
                {stops.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {stops.slice(0, 4).map((stop, i) => (
                      <span
                        key={stop.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: `${routeColor}15`, color: routeColor }}
                      >
                        <span className="font-bold">{i + 1}</span>
                        <span className="truncate max-w-[100px]">{stop.customer_name}</span>
                      </span>
                    ))}
                    {stops.length > 4 && (
                      <span className="text-xs px-2 py-0.5" style={{ color: textColor, opacity: 0.5 }}>
                        +{stops.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center" style={{ color: textColor, opacity: 0.5 }}>
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            <p className="font-medium">No routes yet</p>
            <p className="text-sm mt-1">Create your first route to get started</p>
          </div>
        )}
      </div>

      {/* Right: Territory Map (60%) */}
      <div className="w-[60%] rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${borderColor}` }}>
        <LeafletMap
          center={[businessLocation.lat, businessLocation.lon]}
          zoom={12}
          markers={markers}
          polygons={polygons}
          fitBounds={fitBounds}
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        />
      </div>

      {/* Route Detail Modal */}
      {isDetailOpen && selectedRoute && (
        <Suspense fallback={null}>
          <RouteDetailModal
            isOpen={isDetailOpen}
            onClose={() => { setIsDetailOpen(false); setIsCreating(false); }}
            route={selectedRoute}
            allCustomers={allCustomers}
            configColors={configColors}
            onSave={handleRouteSave}
          />
        </Suspense>
      )}
    </div>
  );
}
