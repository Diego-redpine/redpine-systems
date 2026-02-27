'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { useDataMode } from '@/hooks/useDataMode';
import { toast } from '@/components/ui/Toaster';
import GalleryUploadModal from './GalleryUploadModal';

interface Album {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  display_order: number;
  image_count: number;
}

interface GalleryImage {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
  album_id?: string;
  display_order: number;
  original_name?: string;
  created_at: string;
}

interface GalleryManagerProps {
  configColors: DashboardColors;
  entityType: string;
}

// Demo data for unauthenticated/dummy mode
const DEMO_ALBUMS: Album[] = [
  { id: 'demo_1', name: 'Portfolio', description: 'Our best work', cover_image_url: '', display_order: 0, image_count: 12 },
  { id: 'demo_2', name: 'Before & After', description: 'Transformation gallery', cover_image_url: '', display_order: 1, image_count: 8 },
  { id: 'demo_3', name: 'Team', description: 'Meet the crew', cover_image_url: '', display_order: 2, image_count: 5 },
];

const DEMO_IMAGES: GalleryImage[] = Array.from({ length: 9 }, (_, i) => ({
  id: `demo_img_${i}`,
  image_url: '',
  caption: ['Beautiful result', 'Client showcase', 'Latest project', 'Detail shot', 'Final look', 'Work in progress', 'Fresh design', 'Custom piece', 'Happy client'][i],
  album_id: i < 4 ? 'demo_1' : i < 7 ? 'demo_2' : 'demo_3',
  display_order: i,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

// Placeholder colors for demo images without actual URLs
const PLACEHOLDER_COLORS = [
  '#E8D5B7', '#B7C9E8', '#B7E8D5', '#E8B7C9', '#D5B7E8',
  '#C9E8B7', '#E8E0B7', '#B7D5E8', '#E8C9B7',
];

export default function GalleryManager({ configColors, entityType }: GalleryManagerProps) {
  const { mode: dataMode } = useDataMode();
  const isDummy = dataMode === 'dummy';

  const [viewMode, setViewMode] = useState<'albums' | 'gallery'>('gallery');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');

  const btnColor = configColors.buttons || '#1A1A1A';
  const textColor = configColors.text || '#1A1A1A';
  const cardBg = configColors.cards || '#FFFFFF';
  const borderColor = configColors.borders || '#E5E7EB';
  const headingColor = configColors.headings || '#1A1A1A';

  const fetchData = useCallback(async () => {
    if (isDummy) {
      setAlbums(DEMO_ALBUMS);
      setImages(DEMO_IMAGES);
      setIsLoading(false);
      return;
    }

    try {
      const [albumsRes, imagesRes] = await Promise.all([
        fetch('/api/gallery/albums'),
        fetch('/api/gallery'),
      ]);

      if (albumsRes.ok) {
        const { albums: a } = await albumsRes.json();
        setAlbums(a || []);
      }
      if (imagesRes.ok) {
        const { images: imgs } = await imagesRes.json();
        setImages(imgs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch gallery data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDummy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (imageId: string) => {
    if (isDummy) {
      setImages(prev => prev.filter(i => i.id !== imageId));
      return;
    }

    try {
      const res = await fetch(`/api/gallery/${imageId}`, { method: 'DELETE' });
      if (res.ok) {
        setImages(prev => prev.filter(i => i.id !== imageId));
        toast.success('Photo deleted');
      }
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (isDummy) {
      setAlbums(prev => prev.filter(a => a.id !== albumId));
      setImages(prev => prev.map(i => i.album_id === albumId ? { ...i, album_id: undefined } : i));
      return;
    }

    try {
      const res = await fetch(`/api/gallery/albums?id=${albumId}`, { method: 'DELETE' });
      if (res.ok) {
        setAlbums(prev => prev.filter(a => a.id !== albumId));
        setImages(prev => prev.map(i => i.album_id === albumId ? { ...i, album_id: undefined } : i));
        if (selectedAlbum?.id === albumId) setSelectedAlbum(null);
        toast.success('Album deleted');
      }
    } catch {
      toast.error('Failed to delete album');
    }
  };

  const handleSaveCaption = async (imageId: string) => {
    if (isDummy) {
      setImages(prev => prev.map(i => i.id === imageId ? { ...i, caption: captionText } : i));
      setEditingCaption(null);
      return;
    }

    try {
      const res = await fetch(`/api/gallery/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionText }),
      });
      if (res.ok) {
        setImages(prev => prev.map(i => i.id === imageId ? { ...i, caption: captionText } : i));
        setEditingCaption(null);
      }
    } catch {
      toast.error('Failed to update caption');
    }
  };

  // Filter images based on selected album
  const displayImages = selectedAlbum
    ? images.filter(i => i.album_id === selectedAlbum.id)
    : images;

  const totalCount = images.length;
  const entityLabel = entityType === 'portfolios' ? 'Portfolio' : entityType === 'images' ? 'Photos' : 'Gallery';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: btnColor }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="flex items-center gap-3">
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1" style={{ backgroundColor: `${borderColor}40` }}>
          <button
            onClick={() => { setViewMode('albums'); setSelectedAlbum(null); }}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: viewMode === 'albums' ? btnColor : 'transparent',
              color: viewMode === 'albums' ? '#FFFFFF' : textColor,
            }}
          >
            Albums
          </button>
          <button
            onClick={() => { setViewMode('gallery'); setSelectedAlbum(null); }}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: viewMode === 'gallery' ? btnColor : 'transparent',
              color: viewMode === 'gallery' ? '#FFFFFF' : textColor,
            }}
          >
            All Photos
          </button>
        </div>

        {/* Back button when viewing album */}
        {selectedAlbum && (
          <button
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:opacity-70 transition-colors"
            style={{ color: textColor }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        <div className="flex-1" />

        {/* Photo count */}
        <span className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
          {selectedAlbum ? `${displayImages.length} photo${displayImages.length !== 1 ? 's' : ''}` : `${totalCount} total`}
        </span>

        {/* Upload button */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: btnColor }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload
        </button>
      </div>

      {/* Albums View */}
      {viewMode === 'albums' && !selectedAlbum && (
        <div>
          {albums.length === 0 ? (
            <div className="text-center py-16" style={{ backgroundColor: cardBg }}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: headingColor }}>No albums yet</p>
              <p className="text-xs mt-1 opacity-50">Create an album to organize your photos</p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-medium text-white"
                style={{ backgroundColor: btnColor }}
              >
                Create Album
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map((album) => {
                const coverColor = PLACEHOLDER_COLORS[album.display_order % PLACEHOLDER_COLORS.length];
                return (
                  <div
                    key={album.id}
                    className="overflow-hidden cursor-pointer group relative"
                    style={{ backgroundColor: cardBg }}
                    onClick={() => setSelectedAlbum(album)}
                  >
                    {/* Cover */}
                    <div className="aspect-square relative overflow-hidden">
                      {album.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={album.cover_image_url} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: coverColor }}>
                          <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}

                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium truncate" style={{ color: headingColor }}>{album.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: textColor, opacity: 0.5 }}>
                        {album.image_count} photo{album.image_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Album detail view (after clicking an album) */}
      {viewMode === 'albums' && selectedAlbum && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: headingColor }}>
            {selectedAlbum.name}
            {selectedAlbum.description && (
              <span className="font-normal opacity-50 ml-2">{selectedAlbum.description}</span>
            )}
          </h3>
          {renderPhotoGrid(displayImages)}
        </div>
      )}

      {/* Gallery View (all photos) */}
      {viewMode === 'gallery' && (
        <div>
          {displayImages.length === 0 ? (
            <div className="text-center py-16" style={{ backgroundColor: cardBg }}>
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: headingColor }}>No photos yet</p>
              <p className="text-xs mt-1 opacity-50">Upload your first photo to get started</p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-medium text-white"
                style={{ backgroundColor: btnColor }}
              >
                Upload Photos
              </button>
            </div>
          ) : (
            renderPhotoGrid(displayImages)
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && displayImages[lightboxIndex] && (
        <Lightbox
          images={displayImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Upload Modal */}
      <GalleryUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onComplete={fetchData}
        configColors={configColors}
        existingAlbums={albums}
        preselectedAlbumId={selectedAlbum?.id}
      />
    </div>
  );

  function renderPhotoGrid(photos: GalleryImage[]) {
    return (
      <div style={{ columnCount: 3, columnGap: 12 }}>
        {photos.map((photo, idx) => {
          const placeholderColor = PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length];
          return (
            <div
              key={photo.id}
              className="relative group overflow-hidden mb-3"
              style={{ breakInside: 'avoid' }}
            >
              {photo.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.image_url}
                  alt={photo.caption || ''}
                  className="w-full block cursor-pointer"
                  onClick={() => setLightboxIndex(idx)}
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-full aspect-square flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: placeholderColor }}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                <div className="w-full p-2 flex items-center justify-between">
                  {/* Caption */}
                  {editingCaption === photo.id ? (
                    <div className="flex-1 flex gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={captionText}
                        onChange={e => setCaptionText(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-white/90 text-black"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveCaption(photo.id); if (e.key === 'Escape') setEditingCaption(null); }}
                      />
                      <button
                        onClick={() => handleSaveCaption(photo.id)}
                        className="px-2 py-1 text-xs bg-white/90 text-black"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-white truncate flex-1">
                      {photo.caption || ''}
                    </p>
                  )}

                  <div className="flex gap-1 ml-2">
                    {/* Edit caption */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCaption(photo.id); setCaptionText(photo.caption || ''); }}
                      className="w-6 h-6 bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                      className="w-6 h-6 bg-white/20 text-white flex items-center justify-center hover:bg-red-500/80"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

// Lightbox component
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const image = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [currentIndex, hasPrev, hasNext, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        {image.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.image_url}
            alt={image.caption || ''}
            className="max-w-full max-h-[80vh] object-contain"
          />
        ) : (
          <div className="w-96 h-96 flex items-center justify-center" style={{ backgroundColor: PLACEHOLDER_COLORS[currentIndex % PLACEHOLDER_COLORS.length] }}>
            <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Caption + counter */}
        <div className="mt-3 text-center">
          {image.caption && <p className="text-white text-sm">{image.caption}</p>}
          <p className="text-white/50 text-xs mt-1">{currentIndex + 1} / {images.length}</p>
        </div>
      </div>
    </div>
  );
}
