'use client';

import { useState, useCallback } from 'react';

/**
 * Upload object shape — matches what FreeFormSidebar expects.
 * `public_url` / `file_name` / `file_path` / `file_size` fields used by the sidebar.
 */
export interface UserUpload {
  id: string;
  public_url: string;
  file_name: string;
  file_path: string;
  file_size: number;
  type: 'image' | 'video' | 'file';
  createdAt: string;
  isLocal?: boolean;
}

interface FileValidation {
  valid: boolean;
  errors: string[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Stub hook for user uploads — will connect to Supabase Storage later.
 * Currently stores uploads in local state (demo mode).
 */
export function useUserUploads() {
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [isLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error] = useState<string | null>(null);

  const validateFile = useCallback((file: File): FileValidation => {
    const errors: string[] = [];
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File too large (${formatFileSize(file.size)}). Max: ${formatFileSize(MAX_FILE_SIZE)}`);
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`Unsupported file type: ${file.type}`);
    }
    return { valid: errors.length === 0, errors };
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<UserUpload | null> => {
    setIsUploading(true);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const upload: UserUpload = {
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        public_url: url,
        file_name: file.name,
        file_path: `local/${file.name}`,
        file_size: file.size,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
        createdAt: new Date().toISOString(),
        isLocal: true,
      };

      setUploads(prev => [upload, ...prev]);
      return upload;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadFile = uploadImage;

  const deleteUpload = useCallback((id: string, _filePath?: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  return { uploads, isLoading, isUploading, error, uploadFile, uploadImage, deleteUpload, validateFile, formatFileSize };
}
