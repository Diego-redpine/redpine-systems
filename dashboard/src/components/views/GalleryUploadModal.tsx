'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import CenterModal from '@/components/ui/CenterModal';
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const btnColor = configColors.buttons || '#1A1A1A';
  const textColor = configColors.text || '#1A1A1A';
  const borderColor = configColors.borders || '#E5E7EB';

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
    setUploadProgress(0);
    onClose();
  };

  const title = mode === 'choose' ? 'Add to Gallery' : mode === 'photo' ? 'Upload Photos' : 'Create Album';

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="max-w-md"
      configColors={configColors}
    >
      {/* Step 1: Choose mode */}
      {mode === 'choose' && (
        <div className="space-y-3">
          <button
            onClick={() => setMode('photo')}
            className="w-full p-4 rounded-xl border-2 text-left transition-colors hover:border-current"
            style={{ borderColor, color: textColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${btnColor}15` }}>
                <svg className="w-5 h-5" style={{ color: btnColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Upload Photos</p>
                <p className="text-xs opacity-60">Add one or more photos to your gallery</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('album')}
            className="w-full p-4 rounded-xl border-2 text-left transition-colors hover:border-current"
            style={{ borderColor, color: textColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${btnColor}15` }}>
                <svg className="w-5 h-5" style={{ color: btnColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm">Create Album</p>
                <p className="text-xs opacity-60">Group photos into a named album</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Step 2a: Upload Photos */}
      {mode === 'photo' && (
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-current' : ''}`}
            style={{ borderColor: isDragActive ? btnColor : borderColor }}
          >
            <input {...getInputProps()} />
            <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-medium" style={{ color: textColor }}>
              {isDragActive ? 'Drop photos here' : 'Drag & drop photos or click to browse'}
            </p>
            <p className="text-xs mt-1 opacity-50">JPG, PNG, GIF, WebP — max 20MB each</p>
          </div>

          {/* File previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  {file.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
              <label className="text-xs font-medium mb-1 block" style={{ color: textColor, opacity: 0.7 }}>Add to Album (optional)</label>
              <select
                value={selectedAlbumId}
                onChange={e => setSelectedAlbumId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor, color: textColor }}
              >
                <option value="">No album</option>
                {existingAlbums.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Caption (single photo only) */}
          {files.length === 1 && (
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: textColor, opacity: 0.7 }}>Caption (optional)</label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Describe this photo..."
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor, color: textColor }}
              />
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${btnColor}20` }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: btnColor }}
                />
              </div>
              <p className="text-xs text-center opacity-60">{uploadProgress}%</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('choose'); setFiles([]); }}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor, color: textColor }}
              disabled={uploading}
            >
              Back
            </button>
            <button
              onClick={handleUploadPhotos}
              disabled={files.length === 0 || uploading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: btnColor }}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Step 2b: Create Album */}
      {mode === 'album' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: textColor, opacity: 0.7 }}>Album Name</label>
            <input
              type="text"
              value={albumName}
              onChange={e => setAlbumName(e.target.value)}
              placeholder="e.g., Summer Collection, Before & After"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor, color: textColor }}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: textColor, opacity: 0.7 }}>Description (optional)</label>
            <input
              type="text"
              value={albumDescription}
              onChange={e => setAlbumDescription(e.target.value)}
              placeholder="What's this album about?"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor, color: textColor }}
            />
          </div>

          {/* Dropzone for initial album photos */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: textColor, opacity: 0.7 }}>Photos (optional — add later too)</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-current' : ''}`}
              style={{ borderColor: isDragActive ? btnColor : borderColor }}
            >
              <input {...getInputProps()} />
              <p className="text-xs" style={{ color: textColor, opacity: 0.5 }}>
                {isDragActive ? 'Drop photos here' : 'Drag & drop or click to add photos'}
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  {file.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${btnColor}20` }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, backgroundColor: btnColor }}
                />
              </div>
              <p className="text-xs text-center opacity-60">{uploadProgress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setMode('choose'); setFiles([]); setAlbumName(''); setAlbumDescription(''); }}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{ borderColor, color: textColor }}
              disabled={uploading}
            >
              Back
            </button>
            <button
              onClick={handleCreateAlbum}
              disabled={!albumName.trim() || uploading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: btnColor }}
            >
              {uploading ? 'Creating...' : `Create Album${files.length > 0 ? ` (${files.length} photos)` : ''}`}
            </button>
          </div>
        </div>
      )}
    </CenterModal>
  );
}
