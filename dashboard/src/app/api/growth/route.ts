// Growth Tracking API — Pine Tree progress
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// Level thresholds: points needed for each stage
const LEVEL_THRESHOLDS = [0, 50, 150, 400, 1000];
// Stage names: Seed(0), Sprout(1), Sapling(2), Pine(3), Mighty Pine(4)

export async function GET(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseUser(request);

    // Get or create growth record
    let { data } = await supabase
      .from('growth_tracking')
      .select('*')
      .eq('user_id', ctx.businessOwnerId)
      .single();

    if (!data) {
      const { data: created } = await supabase
        .from('growth_tracking')
        .insert({ user_id: ctx.businessOwnerId })
        .select()
        .single();
      data = created;
    }

    if (!data) return NextResponse.json({ error: 'Failed to load growth data' }, { status: 500 });

    // Calculate progress to next level
    const currentLevel = data.level as number;
    const currentPoints = data.points as number;
    const nextThreshold = currentLevel < 4 ? LEVEL_THRESHOLDS[currentLevel + 1] : LEVEL_THRESHOLDS[4];
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
    const progressToNext = currentLevel < 4
      ? Math.min(100, Math.round(((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
      : 100;

    return NextResponse.json({
      ...data,
      progress_to_next: progressToNext,
      next_threshold: nextThreshold,
      current_threshold: currentThreshold,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Award points for actions
export async function POST(request: NextRequest) {
  try {
    const ctx = await getBusinessContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, feature } = body;
    const supabase = getSupabaseUser(request);

    // Point values per action
    const pointMap: Record<string, number> = {
      record_created: 2,
      appointment_booked: 5,
      invoice_paid: 10,
      review_collected: 15,
      feature_used: 3,
    };

    const pointsToAdd = pointMap[action] || 1;

    // Get current growth record
    let { data } = await supabase
      .from('growth_tracking')
      .select('*')
      .eq('user_id', ctx.businessOwnerId)
      .single();

    if (!data) {
      const { data: created } = await supabase
        .from('growth_tracking')
        .insert({ user_id: ctx.businessOwnerId })
        .select()
        .single();
      data = created;
    }

    if (!data) return NextResponse.json({ error: 'Failed' }, { status: 500 });

    const newPoints = (data.points as number) + pointsToAdd;

    // Calculate new level
    let newLevel = 0;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newPoints >= LEVEL_THRESHOLDS[i]) { newLevel = i; break; }
    }

    const leveledUp = newLevel > (data.level as number);

    // Build update
    const updates: Record<string, unknown> = {
      points: newPoints,
      level: newLevel,
      updated_at: new Date().toISOString(),
    };

    // Increment counters
    if (action === 'record_created') updates.records_created = (data.records_created as number) + 1;
    if (action === 'appointment_booked') updates.appointments_booked = (data.appointments_booked as number) + 1;
    if (action === 'invoice_paid') updates.invoices_paid = (data.invoices_paid as number) + 1;
    if (action === 'review_collected') updates.reviews_collected = (data.reviews_collected as number) + 1;

    // Track feature usage
    if (feature && !(data.features_used as string[]).includes(feature)) {
      updates.features_used = [...(data.features_used as string[]), feature];
    }

    // Track milestones
    const milestones = [...(data.milestones_reached as string[])];
    if (leveledUp) {
      const stageNames = ['seed', 'sprout', 'sapling', 'pine', 'mighty_pine'];
      milestones.push(`reached_${stageNames[newLevel]}`);
      updates.milestones_reached = milestones;
    }

    await supabase
      .from('growth_tracking')
      .update(updates)
      .eq('user_id', ctx.businessOwnerId);

    return NextResponse.json({
      points: newPoints,
      level: newLevel,
      leveled_up: leveledUp,
      points_added: pointsToAdd,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
