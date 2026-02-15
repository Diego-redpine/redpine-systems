// Portal Data — returns client data for portal widgets
// Supports both legacy format (appointments/invoices/messages) and
// new widget format (type=schedule|billing|progress|documents|profile|announcements|products)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function validateSession(request: NextRequest) {
  // Support both x-portal-token header and Authorization: Bearer token
  const token = request.headers.get('x-portal-token')
    || request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('portal_sessions')
    .select('client_id, user_id, config_id, expires_at, metadata')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;
  return session;
}

export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const studentId = searchParams.get('student_id') || session.client_id;
  const { user_id } = session;
  const supabase = getSupabaseAdmin();

  // New widget-based data types
  if (type) {
    switch (type) {
      case 'schedule': {
        const { data: records } = await supabase
          .from('records')
          .select('id, data')
          .eq('user_id', user_id)
          .in('entity_type', ['classes', 'appointments', 'calendar'])
          .order('created_at', { ascending: false })
          .limit(20);

        const schedule = (records || []).map(r => ({
          id: r.id,
          title: r.data?.title || r.data?.name || 'Untitled',
          date: r.data?.date || r.data?.start_time || '',
          time: r.data?.time || '',
          instructor: r.data?.instructor || r.data?.staff || '',
          spots_available: r.data?.spots_available ?? undefined,
          registered: r.data?.registrations?.includes(studentId) || false,
          type: r.data?.event_type || 'class',
        }));

        return NextResponse.json({ schedule });
      }

      case 'billing': {
        // Try records table first, then invoices table
        const { data: invoiceRecords } = await supabase
          .from('invoices')
          .select('id, invoice_number, amount_cents, status, due_date, paid_at, line_items, created_at')
          .eq('user_id', user_id)
          .eq('client_id', studentId)
          .order('created_at', { ascending: false })
          .limit(20);

        const invoices = (invoiceRecords || []).map(r => ({
          id: r.id,
          description: r.line_items?.[0]?.description || `Invoice #${r.invoice_number}`,
          amount: (r.amount_cents || 0) / 100,
          status: r.status || 'pending',
          due_date: r.due_date || '',
        }));

        return NextResponse.json({ invoices });
      }

      case 'progress': {
        // Fetch pipeline stages from config and student's current position
        const { data: config } = await supabase
          .from('configurations')
          .select('tabs')
          .eq('user_id', user_id)
          .limit(1)
          .single();

        type StageData = {
          id: string; name: string; color: string;
          color_secondary?: string; order: number;
          completed: boolean; current: boolean;
        };
        let stages: StageData[] = [];

        if (config?.tabs) {
          for (const tab of config.tabs) {
            for (const comp of tab.components || []) {
              if (comp.pipeline?.stages) {
                // Get student's current stage from records
                const { data: clientRecord } = await supabase
                  .from('records')
                  .select('data')
                  .eq('id', studentId)
                  .single();

                const currentStageId = clientRecord?.data?.stage_id || comp.pipeline.stages[0]?.id;
                let foundCurrent = false;

                stages = comp.pipeline.stages.map((s: { id: string; name: string; color: string; color_secondary?: string; order: number }) => {
                  const isCurrent = s.id === currentStageId;
                  if (isCurrent) foundCurrent = true;
                  return {
                    id: s.id,
                    name: s.name,
                    color: s.color,
                    color_secondary: s.color_secondary,
                    order: s.order,
                    completed: !isCurrent && !foundCurrent,
                    current: isCurrent,
                  };
                });
                break;
              }
            }
            if (stages.length > 0) break;
          }
        }

        return NextResponse.json({ stages });
      }

      case 'documents': {
        const { data: records } = await supabase
          .from('records')
          .select('id, data')
          .eq('user_id', user_id)
          .in('entity_type', ['documents', 'contracts', 'waivers'])
          .order('created_at', { ascending: false })
          .limit(20);

        const documents = (records || []).map(r => ({
          id: r.id,
          title: r.data?.title || r.data?.name || 'Document',
          type: r.data?.doc_type || 'form',
          status: r.data?.signatures?.[studentId] ? 'signed' : (r.data?.status || 'pending'),
          date: r.data?.signed_date || '',
          required: r.data?.required || false,
        }));

        return NextResponse.json({ documents });
      }

      case 'profile': {
        // Try records table, then clients table
        const { data: clientRecord } = await supabase
          .from('clients')
          .select('id, name, email, phone, address')
          .eq('id', studentId)
          .single();

        const profile = clientRecord ? {
          name: clientRecord.name || '',
          email: clientRecord.email || '',
          phone: clientRecord.phone || '',
          address: clientRecord.address || '',
          emergency_contact: '',
          emergency_phone: '',
        } : null;

        return NextResponse.json({ profile });
      }

      case 'announcements': {
        const { data: records } = await supabase
          .from('records')
          .select('id, data')
          .eq('user_id', user_id)
          .eq('entity_type', 'announcements')
          .order('created_at', { ascending: false })
          .limit(10);

        const announcements = (records || []).map(r => ({
          id: r.id,
          title: r.data?.title || 'Announcement',
          description: r.data?.description || r.data?.content || '',
          date: r.data?.date || '',
          type: r.data?.announcement_type || 'news',
          pinned: r.data?.pinned || false,
        }));

        return NextResponse.json({ announcements });
      }

      case 'products': {
        const { data: records } = await supabase
          .from('records')
          .select('id, data')
          .eq('user_id', user_id)
          .eq('entity_type', 'products')
          .order('created_at', { ascending: false })
          .limit(50);

        const products = (records || []).map(r => ({
          id: r.id,
          name: r.data?.name || r.data?.title || 'Product',
          description: r.data?.description || '',
          price: r.data?.price || 0,
          category: r.data?.category || 'general',
          image_url: r.data?.image_url || null,
        }));

        // Sort: priority categories first
        const priorityCats = new Set(['upgrade', 'test_fee', 'membership']);
        products.sort((a, b) => {
          const aPriority = priorityCats.has(a.category) ? 0 : 1;
          const bPriority = priorityCats.has(b.category) ? 0 : 1;
          return aPriority - bPriority;
        });

        return NextResponse.json({ products });
      }

      case 'students': {
        // Return list of students for this portal session (multi-student support)
        const students = session.metadata?.students || [{ id: session.client_id, name: '', email: '' }];
        return NextResponse.json({ students });
      }

      default:
        return NextResponse.json({ error: `Unknown data type: ${type}` }, { status: 400 });
    }
  }

  // Legacy format: return all data at once (backward compatibility)
  const { client_id } = session;

  const [appointmentsResult, invoicesResult, messagesResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, title, start_time, end_time, status, location, description')
      .eq('user_id', user_id)
      .eq('client_id', client_id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(20),

    supabase
      .from('invoices')
      .select('id, invoice_number, amount_cents, status, due_date, paid_at, line_items, created_at')
      .eq('user_id', user_id)
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('messages')
      .select('id, subject, content, type, is_read, created_at')
      .eq('user_id', user_id)
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const { data: pastAppointments } = await supabase
    .from('appointments')
    .select('id, title, start_time, end_time, status, location')
    .eq('user_id', user_id)
    .eq('client_id', client_id)
    .lt('start_time', new Date().toISOString())
    .order('start_time', { ascending: false })
    .limit(10);

  return NextResponse.json({
    appointments: {
      upcoming: appointmentsResult.data || [],
      past: pastAppointments || [],
    },
    invoices: invoicesResult.data || [],
    messages: messagesResult.data || [],
    // Include student list for multi-student support
    students: session.metadata?.students || [{ id: client_id, name: '', email: '' }],
  });
}

// POST /api/portal/data - Handle portal mutations (sign document, update profile)
export async function POST(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, student_id } = body;
  const supabase = getSupabaseAdmin();

  switch (action) {
    case 'sign_document': {
      const { document_id, signature } = body;
      if (!document_id || !signature) {
        return NextResponse.json({ error: 'document_id and signature required' }, { status: 400 });
      }

      const { data: doc } = await supabase
        .from('records')
        .select('id, data')
        .eq('id', document_id)
        .eq('user_id', session.user_id)
        .single();

      if (!doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      const signatures = doc.data?.signatures || {};
      signatures[student_id] = {
        signature_data: signature,
        signed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('records')
        .update({
          data: { ...doc.data, signatures, status: 'signed', signed_date: new Date().toISOString() },
        })
        .eq('id', document_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case 'update_profile': {
      const { profile } = body;
      if (!profile || !student_id) {
        return NextResponse.json({ error: 'profile and student_id required' }, { status: 400 });
      }

      // Update the client record
      const updateData: Record<string, string> = {};
      if (profile.name) updateData.name = profile.name;
      if (profile.email) updateData.email = profile.email;
      if (profile.phone) updateData.phone = profile.phone;
      if (profile.address) updateData.address = profile.address;

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', student_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
