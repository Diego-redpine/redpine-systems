import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, searchRead, create, write } from '@/lib/odoo';

// GET /api/odoo/contacts - Fetch contacts
export async function GET(request: NextRequest) {
  try {
    const client = await getOdooClient();

    if (!client) {
      // Return dummy data if Odoo is not available
      return NextResponse.json({
        success: true,
        source: 'dummy',
        data: {
          clients: [
            { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0101' },
            { id: 2, name: 'Emily Chen', email: 'emily@email.com', phone: '555-0102' },
            { id: 3, name: 'Maria Garcia', email: 'maria@email.com', phone: '555-0103' },
          ],
          staff: [
            { id: 4, name: 'Jessica (Owner)', role: 'Nail Tech' },
            { id: 5, name: 'Amanda', role: 'Nail Tech' },
          ],
        },
      });
    }

    // Fetch customers (clients)
    const clients = await searchRead(
      client,
      'res.partner',
      [['customer_rank', '>', 0]],
      ['id', 'name', 'email', 'phone', 'mobile', 'create_date'],
      50,
      0,
      'create_date desc'
    );

    // Fetch employees (staff)
    const staff = await searchRead(
      client,
      'hr.employee',
      [],
      ['id', 'name', 'job_title', 'work_email', 'work_phone'],
      50
    );

    return NextResponse.json({
      success: true,
      source: 'odoo',
      data: {
        clients: clients.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || c.mobile || '',
        })),
        staff: staff.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.job_title || 'Team Member',
          email: s.work_email || '',
        })),
      },
    });
  } catch (error) {
    console.error('Odoo contacts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/odoo/contacts - Create contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, isCustomer } = body;

    const client = await getOdooClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Odoo not available' },
        { status: 503 }
      );
    }

    const contactId = await create(client, 'res.partner', {
      name,
      email,
      phone,
      customer_rank: isCustomer ? 1 : 0,
    });

    return NextResponse.json({
      success: true,
      data: { id: contactId },
    });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// PUT /api/odoo/contacts - Update contact
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone } = body;

    const client = await getOdooClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Odoo not available' },
        { status: 503 }
      );
    }

    await write(client, 'res.partner', [id], {
      name,
      email,
      phone,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}
