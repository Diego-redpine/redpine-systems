import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getBusinessContext } from '@/lib/crud';
import { RecurrenceFrequency } from '@/types/data';

const VALID_FREQUENCIES: RecurrenceFrequency[] = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];

function getNextDate(fromDate: Date, frequency: RecurrenceFrequency): Date {
  const next = new Date(fromDate);
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return next;
  }
  return next;
}

// POST /api/data/recurring — Generate recurring instances from templates
export async function POST(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const generated: { entity: string; templateId: string; newId: string }[] = [];

    // Process both entity types
    for (const entityType of ['appointments', 'invoices'] as const) {
      // Find active templates
      const { data: templates, error: fetchErr } = await supabase
        .from(entityType)
        .select('*')
        .eq('user_id', context.businessOwnerId)
        .eq('is_recurring_template', true)
        .neq('recurrence', 'none');

      if (fetchErr || !templates) continue;

      for (const template of templates) {
        const frequency = template.recurrence as RecurrenceFrequency;
        if (!VALID_FREQUENCIES.includes(frequency)) continue;

        // Check if recurrence has ended
        if (template.recurrence_end_date && new Date(template.recurrence_end_date) < now) {
          continue;
        }

        // Find the most recent instance generated from this template
        const { data: lastGenerated } = await supabase
          .from('recurring_log')
          .select('generated_at')
          .eq('user_id', context.businessOwnerId)
          .eq('entity_type', entityType)
          .eq('template_id', template.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        // Determine the base date for next occurrence
        const lastDate = lastGenerated?.generated_at
          ? new Date(lastGenerated.generated_at)
          : new Date(template.created_at);

        const nextDate = getNextDate(lastDate, frequency);

        // Only generate if the next occurrence is due (on or before now)
        if (nextDate > now) continue;

        // Build the new record — strip template-specific fields
        const { id: _id, created_at: _ca, updated_at: _ua, is_recurring_template: _irt, ...recordFields } = template;

        // For appointments, shift start_time and end_time
        if (entityType === 'appointments' && template.start_time && template.end_time) {
          const origStart = new Date(template.start_time);
          const origEnd = new Date(template.end_time);
          const duration = origEnd.getTime() - origStart.getTime();

          // Calculate how many intervals forward
          const nextStart = new Date(nextDate);
          nextStart.setHours(origStart.getHours(), origStart.getMinutes(), origStart.getSeconds());
          const nextEnd = new Date(nextStart.getTime() + duration);

          recordFields.start_time = nextStart.toISOString();
          recordFields.end_time = nextEnd.toISOString();
        }

        // For invoices, shift due_date
        if (entityType === 'invoices' && template.due_date) {
          recordFields.due_date = nextDate.toISOString().split('T')[0];
          recordFields.status = 'pending';
          recordFields.paid_at = null;
        }

        // Mark as an instance (not a template)
        recordFields.is_recurring_template = false;
        recordFields.recurring_template_id = template.id;

        const { data: newRecord, error: insertErr } = await supabase
          .from(entityType)
          .insert(recordFields)
          .select()
          .single();

        if (insertErr || !newRecord) {
          console.error(`Failed to generate recurring ${entityType}:`, insertErr);
          continue;
        }

        // Log the generation
        await supabase.from('recurring_log').insert({
          user_id: context.businessOwnerId,
          entity_type: entityType,
          template_id: template.id,
          generated_id: newRecord.id,
        });

        generated.push({
          entity: entityType,
          templateId: template.id,
          newId: newRecord.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      message: `Generated ${generated.length} recurring record(s)`,
    });
  } catch (error) {
    console.error('POST /api/data/recurring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recurring records' },
      { status: 500 }
    );
  }
}
