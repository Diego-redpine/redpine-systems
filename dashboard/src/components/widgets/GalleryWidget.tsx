'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DataSelector, DataItem } from './DataSelector';

interface GalleryWidgetProps {
  blockProps: Record<string, string>;
  inBuilder: boolean;
  styles?: string;
  heading?: string;
  viewMode?: string;
  layout?: string;
  columns?: number;
  showCaptions?: boolean;
  lightbox?: boolean;
  maxPhotos?: number;
  accentColor?: string;
  linkedGalleryId?: string;
  linkedGalleryName?: string;
  [key: string]: unknown;
}

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption?: string;
  album_id?: string;
}

interface GalleryAlbum {
  id: string;
  name: string;
  cover_image_url?: string;
  image_count: number;
}

const PLACEHOLDER_COLORS = ['#E8D5B7', '#B7C9E8', '#B7E8D5', '#E8B7C9', '#D5B7E8', '#C9E8B7', '#E8E0B7', '#B7D5E8', '#E8C9B7'];

const DEMO_PHOTOS: GalleryPhoto[] = Array.from({ length: 9 }, (_, i) => ({
  id: `demo_${i}`,
  image_url: '',
  caption: ['Beautiful result', 'Client showcase', 'Latest project', 'Detail shot', 'Final look', 'Before & after', 'Fresh design', 'Custom piece', 'Happy client'][i],
  album_id: i < 4 ? 'a1' : i < 7 ? 'a2' : 'a3',
}));

const DEMO_ALBUMS: GalleryAlbum[] = [
  { id: 'a1', name: 'Portfolio', cover_image_url: '', image_count: 4 },
  { id: 'a2', name: 'Before & After', cover_image_url: '', image_count: 3 },
  { id: 'a3', name: 'Team', cover_image_url: '', image_count: 2 },
];

export const GalleryWidget: React.FC<GalleryWidgetProps> = ({
  blockProps,
  inBuilder,
  styles,
  heading = 'Our Gallery',
  viewMode = 'gallery',
  layout = 'masonry',
  columns = 3,
  showCaptions = true,
  lightbox = true,
  maxPhotos = 0,
  accentColor = '#1A1A1A',
  linkedGalleryId,
  linkedGalleryName,
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [localLinkedId, setLocalLinkedId] = useState(linkedGalleryId);
  const [localLinkedName, setLocalLinkedName] = useState(linkedGalleryName);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handleSelect = useCallback((item: DataItem) => {
    setLocalLinkedId(item.id);
    setLocalLinkedName(item.name);
    setSelectorOpen(false);
  }, []);

  // Fetch gallery data on public site
  useEffect(() => {
    if (inBuilder || loaded) return;

    const fetchGallery = async () => {
      try {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        const subdomain = parts.length >= 3 ? parts[0] : '';
        if (!subdomain || subdomain === 'app' || subdomain === 'www') {
          setPhotos(DEMO_PHOTOS);
          setAlbums(DEMO_ALBUMS);
          setLoaded(true);
          return;
        }

        const res = await fetch(`/api/public/gallery?subdomain=${subdomain}`);
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.images || []);
          setAlbums(data.albums || []);
        }
      } catch {
        setPhotos(DEMO_PHOTOS);
        setAlbums(DEMO_ALBUMS);
      }
      setLoaded(true);
    };

    fetchGallery();
  }, [inBuilder, loaded]);

  // Builder mode — no link
  if (inBuilder && !localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{
          border: '2px dashed #D1D5DB',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          backgroundColor: '#F9FAFB',
        }}>
          <svg style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 12 }}>No gallery connected</p>
          <button
            onClick={() => setSelectorOpen(true)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              backgroundColor: accentColor,
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Select Gallery
          </button>
        </div>
        <DataSelector
          entityType="gallery"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // Builder mode — with link
  if (inBuilder && localLinkedId) {
    return (
      <div {...blockProps} className={styles || 'w-full'}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          {/* Header badge */}
          <div style={{
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: `${accentColor}08`,
            borderBottom: `1px solid ${accentColor}20`,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: `${accentColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg style={{ width: 14, height: 14, color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: accentColor, flex: 1 }}>
              {localLinkedName}
            </p>
            <button
              onClick={() => setSelectorOpen(true)}
              style={{
                fontSize: 12,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
                borderRadius: 6,
                padding: '4px 10px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              Change
            </button>
          </div>

          {/* Dimmed preview grid */}
          <div style={{ padding: 16, opacity: 0.5, pointerEvents: 'none' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{heading}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns, 3)}, 1fr)`, gap: 8 }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  backgroundColor: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: 20, height: 20, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DataSelector
          entityType="gallery"
          isOpen={selectorOpen}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
          accentColor={accentColor}
        />
      </div>
    );
  }

  // Public mode — real gallery
  const displayMode = localLinkedId === 'gal_albums' ? 'albums' : (viewMode || 'gallery');
  let displayPhotos = photos;
  if (selectedAlbumId) {
    displayPhotos = photos.filter(p => p.album_id === selectedAlbumId);
  }
  if (maxPhotos && maxPhotos > 0) {
    displayPhotos = displayPhotos.slice(0, maxPhotos);
  }

  const isAlbumsView = displayMode === 'albums' && !selectedAlbumId;

  return (
    <div {...blockProps} className={styles || 'w-full'}>
      <div style={{ padding: '20px 0' }}>
        {/* Heading */}
        {heading && (
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#1A1A1A', textAlign: 'center' }}>
            {heading}
          </h2>
        )}

        {/* Back button when in album detail */}
        {selectedAlbumId && (
          <button
            onClick={() => setSelectedAlbumId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: accentColor,
              marginBottom: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to albums
          </button>
        )}

        {/* Albums view */}
        {isAlbumsView && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`, gap: 16 }}>
            {albums.map((album, i) => (
              <div
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                }}
              >
                <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
                  {album.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={album.cover_image_url} alt={album.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg style={{ width: 32, height: 32, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{album.name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{album.image_count} photo{album.image_count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery / masonry view */}
        {!isAlbumsView && (
          <>
            {displayPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                <p style={{ fontSize: 14 }}>No photos yet</p>
              </div>
            ) : layout === 'masonry' ? (
              <div style={{ columnCount: columns, columnGap: 12 }}>
                {displayPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    style={{
                      breakInside: 'avoid',
                      marginBottom: 12,
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: lightbox ? 'pointer' : 'default',
                      position: 'relative',
                    }}
                    onClick={() => lightbox && setLightboxIdx(idx)}
                  >
                    {photo.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.image_url} alt={photo.caption || ''} style={{ width: '100%', display: 'block' }} loading="lazy" />
                    ) : (
                      <div style={{
                        width: '100%',
                        aspectRatio: `${1 + (idx % 3) * 0.3}`,
                        backgroundColor: PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg style={{ width: 24, height: 24, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                    {showCaptions && photo.caption && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '20px 10px 8px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        color: '#FFFFFF',
                        fontSize: 12,
                      }}>
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Grid layout */
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
                {displayPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    style={{
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: lightbox ? 'pointer' : 'default',
                      position: 'relative',
                    }}
                    onClick={() => lightbox && setLightboxIdx(idx)}
                  >
                    {photo.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.image_url} alt={photo.caption || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} loading="lazy" />
                    ) : (
                      <div style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg style={{ width: 24, height: 24, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                    {showCaptions && photo.caption && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '20px 10px 8px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        color: '#FFFFFF',
                        fontSize: 12,
                      }}>
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lightbox — portaled to body to escape canvas transform */}
        {lightboxIdx !== null && displayPhotos[lightboxIdx] && typeof document !== 'undefined' && createPortal(
          <div
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0,0,0,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxIdx(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Prev */}
            {lightboxIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#FFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next */}
            {lightboxIdx < displayPhotos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#FFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image */}
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {displayPhotos[lightboxIdx].image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPhotos[lightboxIdx].image_url}
                  alt={displayPhotos[lightboxIdx].caption || ''}
                  style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
                />
              ) : (
                <div style={{
                  width: 384,
                  height: 384,
                  borderRadius: 8,
                  backgroundColor: PLACEHOLDER_COLORS[lightboxIdx % PLACEHOLDER_COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: 48, height: 48, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
              {showCaptions && displayPhotos[lightboxIdx].caption && (
                <p style={{ color: '#FFF', fontSize: 14, marginTop: 12 }}>{displayPhotos[lightboxIdx].caption}</p>
              )}
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                {lightboxIdx + 1} / {displayPhotos.length}
              </p>
            </div>
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
};

export default GalleryWidget;
