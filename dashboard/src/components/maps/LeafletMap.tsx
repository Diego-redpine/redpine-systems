'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- Types ---

export interface MapMarker {
  id: string;
  position: [number, number];
  label?: string;
  color?: string;
  type?: 'business' | 'customer' | 'stop';
  popupContent?: string;
}

export interface MapPolygon {
  id: string;
  positions: [number, number][];
  color: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  highlighted?: boolean;
}

export interface MapPolyline {
  id: string;
  positions: [number, number][];
  color: string;
  weight?: number;
  dashArray?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  polygons?: MapPolygon[];
  polylines?: MapPolyline[];
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  className?: string;
  style?: React.CSSProperties;
  fitBounds?: [number, number][];
}

// --- Custom Marker Icons ---

function createStopIcon(number: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="13" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="14" y="18" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="system-ui">${number}</text>
    </svg>`,
  });
}

function createBusinessIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18C26 6.48 21.52 2 16 2z" fill="#EF4444" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="12" r="4" fill="white"/>
    </svg>`,
  });
}

function createCustomerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6" fill="#9CA3AF" stroke="white" stroke-width="2"/>
    </svg>`,
  });
}

// --- Auto-fit bounds ---

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (bounds.length > 0) {
      const latLngBounds = L.latLngBounds(bounds.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(latLngBounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [map, bounds]);

  return null;
}

// --- Click handler ---

function MapClickHandler({ onClick }: { onClick: (latlng: { lat: number; lng: number }) => void }) {
  const map = useMap();

  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onClick]);

  return null;
}

// --- Main Component ---

export default function LeafletMap({
  center,
  zoom = 12,
  markers = [],
  polygons = [],
  polylines = [],
  onMapClick,
  className = '',
  style,
  fitBounds,
}: LeafletMapProps) {
  const cssInjected = useRef(false);

  // Inject Leaflet CSS once
  useEffect(() => {
    if (!cssInjected.current && typeof window !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
      cssInjected.current = true;
    }
  }, []);

  // Memoize icons to prevent re-creation on each render
  const businessIcon = useMemo(() => createBusinessIcon(), []);
  const customerIcon = useMemo(() => createCustomerIcon(), []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      scrollWheelZoom={true}
      zoomControl={true}
      wheelDebounceTime={100}
      wheelPxPerZoomLevel={120}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {fitBounds && fitBounds.length > 0 && <FitBounds bounds={fitBounds} />}

      {onMapClick && <MapClickHandler onClick={onMapClick} />}

      {/* Territory polygons */}
      {polygons.map((poly) => (
        <Polygon
          key={poly.id}
          positions={poly.positions}
          pathOptions={{
            color: poly.color,
            fillColor: poly.fillColor || poly.color,
            fillOpacity: poly.highlighted ? 0.35 : (poly.fillOpacity ?? 0.15),
            weight: poly.highlighted ? 3 : (poly.weight ?? 2),
          }}
        />
      ))}

      {/* Route lines */}
      {polylines.map((line) => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{
            color: line.color,
            weight: line.weight ?? 3,
            dashArray: line.dashArray,
          }}
        />
      ))}

      {/* Markers */}
      {markers.map((marker) => {
        let icon: L.DivIcon;
        switch (marker.type) {
          case 'business':
            icon = businessIcon;
            break;
          case 'customer':
            icon = customerIcon;
            break;
          case 'stop':
            icon = createStopIcon(parseInt(marker.label || '1'), marker.color || '#3B82F6');
            break;
          default:
            icon = customerIcon;
        }

        return (
          <Marker key={marker.id} position={marker.position} icon={icon}>
            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
