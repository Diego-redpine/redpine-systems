'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import CenterModal from '@/components/ui/CenterModal';
import CustomSelect from '@/components/ui/CustomSelect';
import { DashboardColors } from '@/types/config';
import { toast } from '@/components/ui/Toaster';

interface Album {
  id: string;
  name: string;
  description?: string;
}

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  configColors: DashboardColors;
  existingAlbums: Album[];
  preselectedAlbumId?: string;
}

type UploadMode = 'choose' | 'photo' | 'album';

interface FileWithPreview extends File {
  preview?: string;
}

export default function GalleryUploadModal({
  isOpen,
  onClose,
  onComplete,
  configColors,
  existingAlbums,
  preselectedAlbumId,
}: GalleryUploadModalProps) {
  const [mode, setMode] = useState<UploadMode>(preselectedAlbumId ? 'photo' : 'choose');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState(preselectedAlbumId || '');
  const [caption, setCaption] = useState('');
  const [includeInGallery, setIncludeInGallery] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const btnColor = configColors.buttons || '#1A1A1A';
  const textColor = configColors.text || '#1A1A1A';
  const mutedColor = configColors.text ? `${configColors.text}99` : '#6B7280';
  const borderColor = configColors.borders || '#E5E7EB';
  const cardBg = configColors.cards || '#FFFFFF';
  const pageBg = configColors.background || '#F5F5F5';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const withPreviews = acceptedFiles.map(file =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles(prev => [...prev, ...withPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'] },
    maxSize: 20 * 1024 * 1024,
    multiple: mode === 'album',
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUploadPhotos = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        if (selectedAlbumId) formData.append('album_id', selectedAlbumId);
        if (caption && files.length === 1) formData.append('caption', caption);
        formData.append('include_in_gallery', String(includeInGallery));

        const res = await fetch('/api/gallery', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`);
      handleClose();
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      toast.error('Album name is required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create album first
      const albumRes = await fetch('/api/gallery/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: albumName.trim(), description: albumDescription.trim() || null }),
      });

      if (!albumRes.ok) {
        const err = await albumRes.json();
        throw new Error(err.error || 'Failed to create album');
      }

      const { album } = await albumRes.json();

      // Upload photos to the new album
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();
          formData.append('file', files[i]);
          formData.append('album_id', album.id);
          formData.append('include_in_gallery', String(includeInGallery));

          const res = await fetch('/api/gallery', { method: 'POST', body: formData });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Upload failed');
          }
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }
        toast.success(`Album "${albumName}" created with ${files.length} photos`);
      } else {
        toast.success(`Album "${albumName}" created`);
      }

      handleClose();
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Cleanup previews
    files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
    setMode(preselectedAlbumId ? 'photo' : 'choose');
    setAlbumName('');
    setAlbumDescription('');
    setSelectedAlbumId(preselectedAlbumId || '');
    setCaption('');
    setIncludeInGallery(true);
    setUploadProgress(0);
    onClose();
  };

  const title = mode === 'choose' ? 'Add to Gallery' : mode === 'photo' ? 'Upload Photos' : 'Create Album';
  const stepNum = mode === 'choose' ? 1 : 2;
  const stepLabel = mode === 'choose' ? 'Choose Action' : mode === 'photo' ? 'Upload Photos' : 'Create Album';

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={`Step ${stepNum} of 2 — ${stepLabel}`}
      maxWidth="max-w-2xl"
      configColors={configColors}
      noPadding
    >
      <div className="flex flex-col" style={{ minHeight: 380 }}>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 transition-all"
              style={{
                width: s === stepNum ? 32 : 16,
                backgroundColor: s <= stepNum ? btnColor : borderColor,
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 px-5 py-4">

      {/* Step 1: Choose mode */}
      {mode === 'choose' && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: mutedColor }}>
            What would you like to do?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: 'photo' as UploadMode,
                title: 'Upload Photos',
                desc: 'Add one or more photos to your gallery',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                ),
              },
              {
                value: 'album' as UploadMode,
                title: 'Create Album',
                desc: 'Group photos into a named album',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                ),
              },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className="flex flex-col items-center gap-3 p-5 border-2 text-center transition-all hover:shadow-md"
                style={{
                  borderColor,
                  backgroundColor: cardBg,
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: `${btnColor}15` }}>
                  <div style={{ color: btnColor }}>
                    {opt.icon}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: textColor }}>
                    {opt.title}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedColor }}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2a: Upload Photos */}
      {mode === 'photo' && (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-current' : ''}`}
            style={{ borderColor: isDragActive ? btnColor : borderColor }}
          >
            <input {...getInputProps()} />
            <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${btnColor}15` }}>
              <svg className="w-5 h-5" style={{ color: btnColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: textColor }}>
              {isDragActive ? 'Drop photos here' : 'Drag & drop photos or click to browse'}
            </p>
            <p className="text-xs mt-1" style={{ color: mutedColor }}>JPG, PNG, GIF, WebP — max 20MB each</p>
          </div>

          {/* File previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative aspect-square overflow-hidden group">
                  {file.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Album picker */}
          {existingAlbums.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Add to Album (optional)</label>
              <CustomSelect
                value={selectedAlbumId}
                onChange={value => setSelectedAlbumId(value)}
                options={existingAlbums.map(a => ({ value: a.id, label: a.name }))}
                placeholder="No album"
                style={{ borderColor, color: textColor, backgroundColor: pageBg }}
                buttonColor={btnColor}
              />
            </div>
          )}

          {/* Caption (single photo only) */}
          {files.length === 1 && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Caption (optional)</label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Describe this photo..."
                className="w-full px-3 py-2.5 border text-sm"
                style={{ borderColor, color: textColor, backgroundColor: pageBg }}
              />
            </div>
          )}

          {/* Include in gallery checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInGallery}
              onChange={e => setIncludeInGallery(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-2 accent-current"
              style={{ accentColor: btnColor }}
            />
            <div>
              <span className="text-sm font-medium block" style={{ color: textColor }}>Include in gallery</span>
              <span className="text-xs leading-relaxed block mt-0.5" style={{ color: mutedColor }}>
                Photos will appear on your website gallery. Uncheck to store photos without displaying them.
              </span>
            </div>
          </label>

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${btnColor}20` }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: btnColor }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: mutedColor }}>{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2b: Create Album */}
      {mode === 'album' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Album Name</label>
            <input
              type="text"
              value={albumName}
              onChange={e => setAlbumName(e.target.value)}
              placeholder="e.g., Summer Collection, Before & After"
              className="w-full px-3 py-2.5 border text-sm outline-none focus:ring-2"
              style={{ borderColor, color: textColor, backgroundColor: pageBg, '--tw-ring-color': btnColor } as React.CSSProperties}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Description (optional)</label>
            <input
              type="text"
              value={albumDescription}
              onChange={e => setAlbumDescription(e.target.value)}
              placeholder="What's this album about?"
              className="w-full px-3 py-2.5 border text-sm outline-none focus:ring-2"
              style={{ borderColor, color: textColor, backgroundColor: pageBg, '--tw-ring-color': btnColor } as React.CSSProperties}
            />
          </div>

          {/* Dropzone for initial album photos */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: mutedColor }}>Photos (optional — add later too)</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-current' : ''}`}
              style={{ borderColor: isDragActive ? btnColor : borderColor }}
            >
              <input {...getInputProps()} />
              <p className="text-xs" style={{ color: mutedColor }}>
                {isDragActive ? 'Drop photos here' : 'Drag & drop or click to add photos'}
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative aspect-square overflow-hidden group">
                  {file.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Include in gallery checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInGallery}
              onChange={e => setIncludeInGallery(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-2 accent-current"
              style={{ accentColor: btnColor }}
            />
            <div>
              <span className="text-sm font-medium block" style={{ color: textColor }}>Include in gallery</span>
              <span className="text-xs leading-relaxed block mt-0.5" style={{ color: mutedColor }}>
                Photos will appear on your website gallery. Uncheck to store photos without displaying them.
              </span>
            </div>
          </label>

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${btnColor}20` }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: btnColor }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: mutedColor }}>{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-t shrink-0"
          style={{ borderColor }}
        >
          <button
            onClick={mode === 'choose' ? handleClose : () => { setMode('choose'); setFiles([]); setAlbumName(''); setAlbumDescription(''); }}
            className="px-4 py-2 text-sm font-medium border transition-opacity hover:opacity-70"
            style={{ borderColor, color: textColor }}
            disabled={uploading}
          >
            {mode === 'choose' ? 'Cancel' : 'Back'}
          </button>

          {mode === 'photo' && (
            <button
              onClick={handleUploadPhotos}
              disabled={files.length === 0 || uploading}
              className="px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: btnColor }}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length !== 1 ? 's' : ''}`}
            </button>
          )}

          {mode === 'album' && (
            <button
              onClick={handleCreateAlbum}
              disabled={!albumName.trim() || uploading}
              className="px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: btnColor }}
            >
              {uploading ? 'Creating...' : `Create Album${files.length > 0 ? ` (${files.length} photos)` : ''}`}
            </button>
          )}
        </div>
      </div>
    </CenterModal>
  );
}
