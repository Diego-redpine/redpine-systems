/**
 * COO Memory System — Structured memory extraction and retrieval.
 *
 * After each COO conversation, we run a lightweight extraction prompt (Haiku)
 * to pull out any memory-worthy facts. Memories are categorized, scored for
 * confidence, and supersede conflicting older memories.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type MemoryCategory =
  | 'goal'
  | 'preference'
  | 'client_note'
  | 'milestone'
  | 'decision'
  | 'concern'
  | 'idea';

export interface CooMemory {
  id: string;
  user_id: string;
  category: MemoryCategory;
  content: string;
  confidence: number;
  superseded_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ExtractedMemory {
  category: MemoryCategory;
  content: string;
  confidence: number;
  supersedes?: string; // content of memory this replaces
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const EXTRACTION_PROMPT = `You are a memory extraction system for an AI business assistant (COO).
Analyze the conversation and extract any facts worth remembering for future conversations.

Categories:
- goal: Business goals the owner mentioned (e.g., "wants to expand to second location")
- preference: Personal or business preferences (e.g., "prefers Tuesday meetings", "doesn't like automated emails")
- client_note: Facts about specific clients (e.g., "Bob always pays late", "Sarah prefers 2pm slots")
- milestone: Business achievements or events (e.g., "hit 100 clients in March", "hired a new stylist")
- decision: Decisions the owner made (e.g., "decided to raise prices 10%", "chose to add massage services")
- concern: Worries or problems (e.g., "worried about no-shows", "struggling with staff scheduling")
- idea: Future ideas the owner mentioned (e.g., "thinking about loyalty program", "wants to try Instagram ads")

Rules:
- Only extract facts with 80%+ confidence
- Skip small talk, greetings, and generic statements
- If a new fact contradicts a known fact, mark it as superseding the old one
- Keep content concise (1 sentence max)
- Return empty array if nothing is memory-worthy

Respond with ONLY valid JSON array:
[{"category": "...", "content": "...", "confidence": 0.0-1.0, "supersedes": "old memory content or null"}]

If nothing to extract, respond with: []`;

/**
 * Extract memories from a conversation using Claude Haiku.
 * Returns structured memory objects ready for storage.
 */
export async function extractMemories(
  conversation: ChatMessage[],
  existingMemories: CooMemory[],
  apiKey: string
): Promise<ExtractedMemory[]> {
  if (conversation.length < 2) return [];

  const memoryContext = existingMemories.length > 0
    ? `\n\nExisting memories (check for conflicts):\n${existingMemories.map(m => `- [${m.category}] ${m.content}`).join('\n')}`
    : '';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: EXTRACTION_PROMPT + memoryContext,
      messages: conversation.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    console.error('[COO Memory] Extraction API error:', res.status);
    return [];
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? '[]';

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (m: ExtractedMemory) =>
        m.category && m.content && typeof m.confidence === 'number' && m.confidence >= 0.8
    );
  } catch {
    console.error('[COO Memory] Failed to parse extraction result:', text);
    return [];
  }
}

/**
 * Load all active (non-superseded) memories for a user.
 */
export async function loadMemories(
  userId: string,
  supabase: SupabaseClient
): Promise<CooMemory[]> {
  const { data, error } = await supabase
    .from('coo_memories')
    .select('*')
    .eq('user_id', userId)
    .is('superseded_by', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[COO Memory] Load error:', error);
    return [];
  }

  return data || [];
}

/**
 * Save extracted memories, handling supersession of conflicting ones.
 */
export async function saveMemories(
  userId: string,
  extracted: ExtractedMemory[],
  existingMemories: CooMemory[],
  supabase: SupabaseClient
): Promise<CooMemory[]> {
  const saved: CooMemory[] = [];

  for (const mem of extracted) {
    // Insert the new memory
    const { data: newMem, error: insertError } = await supabase
      .from('coo_memories')
      .insert({
        user_id: userId,
        category: mem.category,
        content: mem.content,
        confidence: mem.confidence,
      })
      .select()
      .single();

    if (insertError || !newMem) {
      console.error('[COO Memory] Insert error:', insertError);
      continue;
    }

    // If this supersedes an existing memory, mark the old one
    if (mem.supersedes) {
      const oldMemory = existingMemories.find(
        m => m.content.toLowerCase().includes(mem.supersedes!.toLowerCase()) ||
             mem.supersedes!.toLowerCase().includes(m.content.toLowerCase())
      );

      if (oldMemory) {
        await supabase
          .from('coo_memories')
          .update({ superseded_by: newMem.id, updated_at: new Date().toISOString() })
          .eq('id', oldMemory.id);
      }
    }

    saved.push(newMem);
  }

  return saved;
}

/**
 * Format memories for injection into COO system prompt context.
 */
export function formatMemoriesForPrompt(memories: CooMemory[]): string {
  if (memories.length === 0) return '';

  const grouped: Record<string, string[]> = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m.content);
  }

  const sections = Object.entries(grouped).map(([category, items]) => {
    const label = category.replace('_', ' ').replace(/^\w/, c => c.toUpperCase());
    return `${label}:\n${items.map(i => `  - ${i}`).join('\n')}`;
  });

  return `\n--- Your Memory Journal ---\n${sections.join('\n\n')}\n--- End Memory Journal ---`;
}
