// Config versioning helpers for undo/restore functionality (F6)

import { SupabaseClient } from '@supabase/supabase-js';
import { DashboardTab, ConfigVersion } from '@/types/config';

/**
 * Save a version snapshot of the current config state.
 * Called BEFORE updating a config to preserve the previous state.
 */
export async function saveConfigVersion(
  supabase: SupabaseClient,
  configId: string,
  currentTabs: DashboardTab[],
  currentColors: Record<string, string> | null
): Promise<ConfigVersion | null> {
  // Get the current highest version number for this config
  const { data: existingVersions, error: queryError } = await supabase
    .from('config_versions')
    .select('version_number')
    .eq('config_id', configId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (queryError) {
    console.error('Error querying config versions:', queryError);
    return null;
  }

  // Calculate next version number
  const nextVersionNumber = existingVersions && existingVersions.length > 0
    ? existingVersions[0].version_number + 1
    : 1;

  // Insert the new version snapshot
  const { data: newVersion, error: insertError } = await supabase
    .from('config_versions')
    .insert({
      config_id: configId,
      version_number: nextVersionNumber,
      tabs_snapshot: currentTabs,
      colors_snapshot: currentColors,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error saving config version:', insertError);
    return null;
  }

  return newVersion as ConfigVersion;
}

/**
 * Prune old versions to keep storage bounded.
 * Keeps the most recent `keepCount` versions, deletes older ones.
 */
export async function pruneConfigVersions(
  supabase: SupabaseClient,
  configId: string,
  keepCount: number = 20
): Promise<void> {
  // Get all versions for this config ordered by version number descending
  const { data: allVersions, error: queryError } = await supabase
    .from('config_versions')
    .select('id, version_number')
    .eq('config_id', configId)
    .order('version_number', { ascending: false });

  if (queryError) {
    console.error('Error querying versions for pruning:', queryError);
    return;
  }

  if (!allVersions || allVersions.length <= keepCount) {
    // Nothing to prune
    return;
  }

  // Get IDs of versions to delete (beyond keepCount)
  const versionsToDelete = allVersions.slice(keepCount);
  const idsToDelete = versionsToDelete.map(v => v.id);

  // Delete old versions
  const { error: deleteError } = await supabase
    .from('config_versions')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('Error pruning config versions:', deleteError);
  }
}

/**
 * Get the most recent version for a config (for undo).
 */
export async function getLatestVersion(
  supabase: SupabaseClient,
  configId: string
): Promise<ConfigVersion | null> {
  const { data, error } = await supabase
    .from('config_versions')
    .select('*')
    .eq('config_id', configId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest version:', error);
    return null;
  }

  return data as ConfigVersion;
}

/**
 * Get a specific version by ID.
 */
export async function getVersionById(
  supabase: SupabaseClient,
  versionId: string
): Promise<ConfigVersion | null> {
  const { data, error } = await supabase
    .from('config_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (error) {
    console.error('Error fetching version by ID:', error);
    return null;
  }

  return data as ConfigVersion;
}

/**
 * Get version history for a config.
 */
export async function getVersionHistory(
  supabase: SupabaseClient,
  configId: string,
  limit: number = 20
): Promise<ConfigVersion[]> {
  const { data, error } = await supabase
    .from('config_versions')
    .select('*')
    .eq('config_id', configId)
    .order('version_number', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching version history:', error);
    return [];
  }

  return (data || []) as ConfigVersion[];
}
