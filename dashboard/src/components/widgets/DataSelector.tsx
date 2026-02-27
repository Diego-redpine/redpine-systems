'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface DataItem {
  id: string;
  name: string;
  type?: string;
  meta?: string;
}

interface DataSelectorProps {
  entityType: 'forms' | 'products' | 'services' | 'reviews' | 'gallery';
  isOpen: boolean;
  onSelect: (item: DataItem) => void;
  onClose: () => void;
  accentColor?: string;
}

// Demo data for each entity type — matches dummy-data.ts entries
const DEMO_DATA: Record<string, DataItem[]> = {
  forms: [
    { id: 'form_1', name: 'Client Intake', type: 'Intake', meta: '156 submissions' },
    { id: 'form_2', name: 'Feedback Survey', type: 'Survey', meta: '89 submissions' },
    { id: 'form_3', name: 'Medical History', type: 'Medical', meta: '67 submissions' },
    { id: 'form_4', name: 'Contact Form', type: 'Lead Capture', meta: '234 submissions' },
    { id: 'form_5', name: 'Booking Request', type: 'Intake', meta: '45 submissions' },
  ],
  products: [
    { id: 'prod_1', name: 'Classic Manicure', type: 'Nails', meta: '$35' },
    { id: 'prod_2', name: 'Gel Pedicure', type: 'Nails', meta: '$55' },
    { id: 'prod_3', name: 'Full Set Acrylic', type: 'Nails', meta: '$75' },
    { id: 'prod_4', name: 'Hair Color', type: 'Hair', meta: '$120' },
    { id: 'prod_5', name: 'Deep Tissue Massage', type: 'Spa', meta: '$90' },
    { id: 'prod_6', name: 'Facial Treatment', type: 'Skin', meta: '$85' },
  ],
  services: [
    { id: 'svc_1', name: 'Initial Consultation', type: 'Consultation', meta: '30 min' },
    { id: 'svc_2', name: 'Follow-up Visit', type: 'Appointment', meta: '15 min' },
    { id: 'svc_3', name: 'Full Treatment', type: 'Service', meta: '60 min' },
    { id: 'svc_4', name: 'Express Service', type: 'Service', meta: '20 min' },
  ],
  reviews: [
    { id: 'rev_source_all', name: 'All Reviews', type: 'Aggregate', meta: 'Show all reviews' },
    { id: 'rev_source_recent', name: 'Recent Reviews', type: 'Filter', meta: 'Last 30 days' },
    { id: 'rev_source_top', name: 'Top Rated', type: 'Filter', meta: '5-star only' },
  ],
  gallery: [
    { id: 'gal_all', name: 'Entire Gallery', type: 'Gallery', meta: 'Display all your photos' },
    { id: 'gal_albums', name: 'Select Albums', type: 'Albums', meta: 'Choose albums to display' },
    { id: 'gal_select', name: 'Select Photos', type: 'Pick', meta: 'Choose individual photos' },
  ],
};

// Demo photos for the photo picker — simulates platform uploads
const DEMO_PHOTOS = [
  { id: 'photo_1', url: '', label: 'Nail Art Design 1' },
  { id: 'photo_2', url: '', label: 'Gel Manicure Set' },
  { id: 'photo_3', url: '', label: 'Salon Interior' },
  { id: 'photo_4', url: '', label: 'Pedicure Station' },
  { id: 'photo_5', url: '', label: 'French Tips' },
  { id: 'photo_6', url: '', label: 'Acrylic Full Set' },
  { id: 'photo_7', url: '', label: 'Product Display' },
  { id: 'photo_8', url: '', label: 'Team Photo' },
  { id: 'photo_9', url: '', label: 'Chrome Nails' },
  { id: 'photo_10', url: '', label: 'Waiting Area' },
  { id: 'photo_11', url: '', label: 'Nail Polish Wall' },
  { id: 'photo_12', url: '', label: 'Happy Client' },
];

const ENTITY_LABELS: Record<string, { title: string; icon: string }> = {
  forms: { title: 'Select a Form', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' },
  products: { title: 'Select Products', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' },
  services: { title: 'Select a Service', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  reviews: { title: 'Select Review Source', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  gallery: { title: 'Select Photos', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z' },
};

// Seeded color generator for consistent placeholder photo colors
function photoPlaceholderColor(id: string): string {
  const colors = [
    '#E8D5B7', '#B7D5E8', '#D5E8B7', '#E8B7D5',
    '#D5B7E8', '#B7E8D5', '#E8D5D5', '#D5D5E8',
    '#C4B5A0', '#A0B5C4', '#B5C4A0', '#C4A0B5',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
}

export const DataSelector: React.FC<DataSelectorProps> = ({
  entityType,
  isOpen,
  onSelect,
  onClose,
  accentColor = '#1A1A1A',
}) => {
  const [search, setSearch] = useState('');
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const items = DEMO_DATA[entityType] || [];
  const config = ENTITY_LABELS[entityType] || { title: 'Select', icon: '' };

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      i => i.name.toLowerCase().includes(q) || i.type?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const togglePhoto = useCallback((photoId: string) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }, []);

  const handlePhotoDone = useCallback(() => {
    const selectedIds = Array.from(selectedPhotos);
    onSelect({
      id: 'gal_select',
      name: `${selectedIds.length} photo${selectedIds.length !== 1 ? 's' : ''} selected`,
      type: 'Pick',
      meta: selectedIds.join(','),
    });
    setPhotoPickerOpen(false);
    setSelectedPhotos(new Set());
  }, [selectedPhotos, onSelect]);

  const handleItemClick = useCallback((item: DataItem) => {
    if (entityType === 'gallery' && item.id === 'gal_select') {
      setPhotoPickerOpen(true);
      return;
    }
    onSelect(item);
  }, [entityType, onSelect]);

  const handleClose = useCallback(() => {
    if (photoPickerOpen) {
      setPhotoPickerOpen(false);
      setSelectedPhotos(new Set());
      return;
    }
    onClose();
  }, [photoPickerOpen, onClose]);

  if (!isOpen) return null;

  // Photo picker sub-view (iOS Photos-style multi-select grid)
  const isPhotoPicker = photoPickerOpen && entityType === 'gallery';
  const modalWidth = isPhotoPicker ? 640 : 420;

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: modalWidth,
          maxHeight: '80vh',
          backgroundColor: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isPhotoPicker && (
              <button
                onClick={() => { setPhotoPickerOpen(false); setSelectedPhotos(new Set()); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
            </svg>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
              {isPhotoPicker ? 'Select Photos' : config.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: '#9CA3AF',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isPhotoPicker ? (
          <>
            {/* Photo picker grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 12px 4px' }}>
                Tap photos to select them for your gallery
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 4,
                }}
              >
                {DEMO_PHOTOS.map((photo) => {
                  const isSelected = selectedPhotos.has(photo.id);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => togglePhoto(photo.id)}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        borderRadius: 4,
                        overflow: 'hidden',
                        outline: isSelected ? `3px solid ${accentColor}` : 'none',
                        outlineOffset: -3,
                      }}
                    >
                      {/* Placeholder image — colored square with label */}
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: photoPlaceholderColor(photo.id),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 8,
                        }}
                      >
                        <span style={{
                          fontSize: 11,
                          color: '#555',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          fontWeight: 500,
                        }}>
                          {photo.label}
                        </span>
                      </div>

                      {/* Selection overlay + checkmark */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            padding: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Unselected circle indicator */}
                      {!isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 6,
                            right: 6,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            border: '2px solid rgba(255,255,255,0.8)',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Done button */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handlePhotoDone}
                disabled={selectedPhotos.size === 0}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: selectedPhotos.size > 0 ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: selectedPhotos.size > 0 ? accentColor : '#E5E7EB',
                  color: selectedPhotos.size > 0 ? '#fff' : '#9CA3AF',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {selectedPhotos.size > 0
                  ? `Done (${selectedPhotos.size} selected)`
                  : 'Select photos'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Search */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB' }}>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13 }}>
                  No items found
                </div>
              )}
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: `${accentColor}10`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#1A1A1A' }}>{item.name}</p>
                    <p style={{ fontSize: 11, margin: 0, color: '#9CA3AF' }}>
                      {item.type && <span>{item.type}</span>}
                      {item.type && item.meta && <span> &middot; </span>}
                      {item.meta && <span>{item.meta}</span>}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Portal to document.body to escape any CSS transform context (e.g. canvas scale)
  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }
  return modal;
};
