'use client';

/**
 * ImagePickerModal — For selecting a single image when clicking a blank frame
 * Two paths: Upload a new image, or Select from existing gallery
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/components/ui/Toaster';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (imageUrl: string) => void;
  accentColor?: string;
}

type PickerView = 'choose' | 'upload' | 'gallery';

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  album_id?: string;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onImageSelected,
  accentColor = '#1A1A1A',
}: ImagePickerModalProps) {
  const [view, setView] = useState<PickerView>('choose');
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const reset = () => {
    setView('choose');
    setSelectedImageUrl(null);
    setPreviewFile(null);
    setFileToUpload(null);
    setUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Upload path
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileToUpload(file);
      setPreviewFile(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!fileToUpload) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('include_in_gallery', 'false');

      const res = await fetch('/api/gallery', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const { image } = await res.json();
      onImageSelected(image.image_url);
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Gallery path
  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const { images } = await res.json();
        setGalleryImages(images || []);
      }
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSelectFromGallery = () => {
    setView('gallery');
    loadGallery();
  };

  const handleConfirmGallerySelection = () => {
    if (selectedImageUrl) {
      onImageSelected(selectedImageUrl);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={handleClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white w-full max-w-lg shadow-2xl flex flex-col"
          style={{ maxHeight: '80vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
            <div>
              <h2 className="text-sm font-semibold font-['Fira_Code'] uppercase tracking-wider text-zinc-900">
                {view === 'choose' ? 'Add Image' : view === 'upload' ? 'Upload Image' : 'Select Photo'}
              </h2>
              <p className="text-xs text-gray-500 font-['Fira_Code'] mt-0.5">
                {view === 'choose' ? 'Choose how to add an image to this frame' : view === 'upload' ? 'Upload a new photo' : 'Pick one photo from your gallery'}
              </p>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 text-gray-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">

            {/* Choose view */}
            {view === 'choose' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView('upload')}
                  className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 text-center transition-all hover:border-gray-400 hover:shadow-md bg-white"
                >
                  <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <svg className="w-7 h-7" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-zinc-800">Upload Image</p>
                    <p className="text-xs mt-1 text-gray-500">Upload a new photo</p>
                  </div>
                </button>
                <button
                  onClick={handleSelectFromGallery}
                  className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 text-center transition-all hover:border-gray-400 hover:shadow-md bg-white"
                >
                  <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <svg className="w-7 h-7" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-zinc-800">Select from Gallery</p>
                    <p className="text-xs mt-1 text-gray-500">Choose an existing photo</p>
                  </div>
                </button>
              </div>
            )}

            {/* Upload view */}
            {view === 'upload' && (
              <div className="space-y-4">
                {!previewFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-gray-500' : 'border-gray-300'}`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${accentColor}15` }}>
                      <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-zinc-800">
                      {isDragActive ? 'Drop photo here' : 'Drag & drop or click to browse'}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">JPG, PNG, GIF, WebP — max 20MB</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-video overflow-hidden border border-gray-200 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewFile} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <button
                      onClick={() => { setPreviewFile(null); setFileToUpload(null); }}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Choose a different image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gallery view */}
            {view === 'gallery' && (
              <div>
                {loadingGallery ? (
                  <div className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-500 mt-3">Loading gallery...</p>
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-500">No photos in your gallery yet.</p>
                    <button
                      onClick={() => setView('upload')}
                      className="text-xs mt-2 underline hover:opacity-70"
                      style={{ color: accentColor }}
                    >
                      Upload one instead
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map(img => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageUrl(img.image_url)}
                        className="relative aspect-square overflow-hidden border-2 transition-all"
                        style={{
                          borderColor: selectedImageUrl === img.image_url ? accentColor : '#e5e7eb',
                          boxShadow: selectedImageUrl === img.image_url ? `0 0 0 1px ${accentColor}` : 'none',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
                        {selectedImageUrl === img.image_url && (
                          <div
                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-white"
                            style={{ backgroundColor: accentColor }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
            <button
              onClick={view === 'choose' ? handleClose : () => { reset(); setView('choose'); }}
              className="px-4 py-2 text-sm font-medium border border-gray-200 text-zinc-700 transition-opacity hover:opacity-70"
              disabled={uploading}
            >
              {view === 'choose' ? 'Cancel' : 'Back'}
            </button>

            {view === 'upload' && (
              <button
                onClick={handleUpload}
                disabled={!fileToUpload || uploading}
                className="px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: accentColor }}
              >
                {uploading ? 'Uploading...' : 'Use This Photo'}
              </button>
            )}

            {view === 'gallery' && (
              <button
                onClick={handleConfirmGallerySelection}
                disabled={!selectedImageUrl}
                className="px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: accentColor }}
              >
                Select Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
