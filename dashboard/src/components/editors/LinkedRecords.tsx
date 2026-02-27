'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

interface RecordLink {
  id: string;
  source_entity: string;
  source_id: string;
  target_entity: string;
  target_id: string;
  link_type: string;
  target_label?: string; // Resolved display name
  created_at: string;
}

interface LinkedRecordsProps {
  entityType: string;
  recordId: string;
  configColors: DashboardColors;
}

// Common linkable entity types
const LINKABLE_ENTITIES = [
  'clients', 'leads', 'invoices', 'appointments', 'tasks',
  'products', 'staff', 'documents', 'messages',
];

export default function LinkedRecords({
  entityType,
  recordId,
  configColors,
}: LinkedRecordsProps) {
  const [links, setLinks] = useState<RecordLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const buttonBg = configColors.buttons || '#DC2626';
  const buttonText = getContrastText(buttonBg);
  const borderColor = configColors.borders || '#E5E7EB';
  const textColor = configColors.text || '#1A1A1A';
  const headingColor = configColors.headings || '#1A1A1A';

  // Fetch existing links
  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/links?entityType=${entityType}&recordId=${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch {
      // Silently fail — links are supplementary
    }
  }, [entityType, recordId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Search for records to link
  useEffect(() => {
    if (!selectedEntity || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/data/${selectedEntity}?search=${encodeURIComponent(searchQuery)}&pageSize=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.data || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedEntity, searchQuery]);

  // Create link
  const handleLink = async (targetRecord: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_entity: entityType,
          source_id: recordId,
          target_entity: selectedEntity,
          target_id: String(targetRecord.id),
          link_type: 'related',
        }),
      });

      if (res.ok) {
        toast.success(`Linked to ${String(targetRecord.name || targetRecord.title || targetRecord.id)}`);
        setIsAdding(false);
        setSearchQuery('');
        setSelectedEntity('');
        fetchLinks();
      } else {
        toast.error('Failed to create link');
      }
    } catch {
      toast.error('Failed to create link');
    }
  };

  // Delete link
  const handleUnlink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/links?id=${linkId}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== linkId));
        toast.success('Link removed');
      }
    } catch {
      toast.error('Failed to remove link');
    }
  };

  // Get display label for a link
  const getLabel = (link: RecordLink) => {
    return link.target_label || link.target_id.slice(0, 8);
  };

  // Available entities to link to (exclude self)
  const availableEntities = LINKABLE_ENTITIES.filter(e => e !== entityType);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4
          className="text-sm font-medium"
          style={{ color: headingColor }}
        >
          Linked Records
        </h4>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: buttonBg }}
          >
            + Link
          </button>
        )}
      </div>

      {/* Existing links as chips */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {links.map(link => (
            <span
              key={link.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium "
              style={{
                backgroundColor: configColors.background || '#F3F4F6',
                color: textColor,
              }}
            >
              <span className="opacity-50 capitalize">
                {link.target_entity.slice(0, -1)}:
              </span>
              {getLabel(link)}
              <button
                onClick={() => handleUnlink(link.id)}
                className="ml-0.5 hover:opacity-70"
                style={{ color: configColors.icons || '#9CA3AF' }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {links.length === 0 && !isAdding && (
        <p className="text-xs" style={{ color: configColors.icons || '#9CA3AF' }}>
          No linked records yet
        </p>
      )}

      {/* Add link form */}
      {isAdding && (
        <div
          className="p-3 border space-y-3"
          style={{ borderColor }}
        >
          {/* Entity type selector */}
          <select
            value={selectedEntity}
            onChange={e => {
              setSelectedEntity(e.target.value);
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="w-full px-3 py-2 text-sm border"
            style={{
              borderColor,
              backgroundColor: configColors.background || '#F9FAFB',
              color: textColor,
            }}
          >
            <option value="">Select entity type...</option>
            {availableEntities.map(entity => (
              <option key={entity} value={entity}>
                {entity.charAt(0).toUpperCase() + entity.slice(1)}
              </option>
            ))}
          </select>

          {/* Search input */}
          {selectedEntity && (
            <input
              type="text"
              placeholder={`Search ${selectedEntity}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border"
              style={{
                borderColor,
                backgroundColor: configColors.background || '#F9FAFB',
                color: textColor,
              }}
              autoFocus
            />
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map(result => (
                <button
                  key={String(result.id)}
                  onClick={() => handleLink(result)}
                  className="w-full text-left px-3 py-2 text-sm hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: configColors.background || '#F9FAFB',
                    color: textColor,
                  }}
                >
                  {String(result.name || result.title || result.subject || result.invoice_number || result.id)}
                </button>
              ))}
            </div>
          )}

          {isSearching && (
            <p className="text-xs" style={{ color: configColors.icons || '#9CA3AF' }}>Searching...</p>
          )}

          <button
            onClick={() => {
              setIsAdding(false);
              setSelectedEntity('');
              setSearchQuery('');
            }}
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: configColors.icons || '#9CA3AF' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
