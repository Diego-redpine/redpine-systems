'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/components/ui/Toaster';
import { DashboardColors } from '@/types/config';

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

interface FileAttachmentsProps {
  entityType: string;
  recordId: string | null;
  configColors: DashboardColors;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string | null): string {
  if (!type) return '📄';
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📕';
  if (type.includes('spreadsheet') || type.includes('csv')) return '📊';
  if (type.includes('document') || type.includes('word')) return '📝';
  if (type.includes('presentation')) return '📽️';
  if (type.includes('zip') || type.includes('archive')) return '📦';
  return '📄';
}

export default function FileAttachments({
  entityType,
  recordId,
  configColors,
  attachments,
  onAttachmentsChange,
}: FileAttachmentsProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!recordId) {
      toast.info('Save the record first, then add attachments');
      return;
    }

    setUploading(true);
    const newAttachments: Attachment[] = [];

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('recordId', recordId);

        const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(`Failed to upload ${file.name}: ${err.error || 'Unknown error'}`);
          continue;
        }

        const data = await res.json();
        newAttachments.push(data.attachment);
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
    setUploading(false);
  }, [entityType, recordId, attachments, onAttachmentsChange]);

  const deleteAttachment = async (attachment: Attachment) => {
    try {
      const res = await fetch(`/api/attachments?id=${attachment.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        toast.error('Failed to delete attachment');
        return;
      }

      onAttachmentsChange(attachments.filter(a => a.id !== attachment.id));
      toast.success('Attachment deleted');
    } catch {
      toast.error('Failed to delete attachment');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ color: configColors.headings || '#111827' }}
      >
        Attachments
      </label>

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-2 rounded-lg border text-sm"
              style={{ borderColor: configColors.borders || '#E5E7EB' }}
            >
              <span className="text-lg">{getFileIcon(att.file_type)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate block hover:underline"
                  style={{ color: configColors.buttons || '#3B82F6' }}
                >
                  {att.file_name}
                </a>
                <span
                  className="text-xs"
                  style={{ color: configColors.text || '#6B7280' }}
                >
                  {formatFileSize(att.file_size)}
                </span>
              </div>
              {/* Image preview */}
              {att.file_type?.startsWith('image/') && (
                <img
                  src={att.file_url}
                  alt={att.file_name}
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <button
                onClick={() => deleteAttachment(att)}
                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-400 bg-blue-50' : ''
        }`}
        style={{
          borderColor: isDragActive ? undefined : (configColors.borders || '#D1D5DB'),
          color: configColors.text || '#6B7280',
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-sm">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-sm">Drop files here</p>
        ) : (
          <p className="text-sm">
            Drop files here or <span style={{ color: configColors.buttons || '#3B82F6' }}>browse</span>
            <br />
            <span className="text-xs opacity-60">Max 10MB per file</span>
          </p>
        )}
      </div>
    </div>
  );
}
