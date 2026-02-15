import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

// Demo menu data for preview/unauthenticated mode
const DEMO_MENU = [
  {
    id: 'demo_1', name: 'Grilled Salmon', category: 'Entrees', price_cents: 2800,
    description: 'Fresh Atlantic salmon with herb butter, seasonal vegetables, and rice pilaf',
    allergens: ['fish'], is_available_online: true, display_order: 1,
    modifiers: [
      { group_name: 'Side Choice', is_required: true, max_selections: 1, options: [
        { name: 'Rice Pilaf', price_cents: 0 }, { name: 'Mashed Potatoes', price_cents: 0 },
        { name: 'Grilled Vegetables', price_cents: 0 }, { name: 'French Fries', price_cents: 150 },
      ]},
    ],
  },
  {
    id: 'demo_2', name: 'Caesar Salad', category: 'Starters', price_cents: 1400,
    description: 'Crisp romaine, house-made croutons, parmesan, and classic Caesar dressing',
    allergens: ['dairy', 'gluten'], is_available_online: true, display_order: 2,
    modifiers: [
      { group_name: 'Add Protein', is_required: false, max_selections: 1, options: [
        { name: 'Grilled Chicken', price_cents: 500 }, { name: 'Grilled Shrimp', price_cents: 700 },
        { name: 'Salmon', price_cents: 800 },
      ]},
    ],
  },
  {
    id: 'demo_3', name: 'Ribeye Steak', category: 'Entrees', price_cents: 4200,
    description: '12oz USDA Prime ribeye, chargrilled to your preference, with loaded baked potato',
    allergens: [], is_available_online: true, display_order: 3,
    modifiers: [
      { group_name: 'Temperature', is_required: true, max_selections: 1, options: [
        { name: 'Rare', price_cents: 0 }, { name: 'Medium Rare', price_cents: 0 },
        { name: 'Medium', price_cents: 0 }, { name: 'Medium Well', price_cents: 0 },
        { name: 'Well Done', price_cents: 0 },
      ]},
      { group_name: 'Add Toppings', is_required: false, max_selections: 3, options: [
        { name: 'Sauteed Mushrooms', price_cents: 300 }, { name: 'Blue Cheese Crumbles', price_cents: 250 },
        { name: 'Grilled Onions', price_cents: 200 },
      ]},
    ],
  },
  {
    id: 'demo_4', name: 'Tiramisu', category: 'Desserts', price_cents: 1200,
    description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream',
    allergens: ['dairy', 'eggs', 'gluten'], is_available_online: true, display_order: 4,
    modifiers: [],
  },
  {
    id: 'demo_5', name: 'Margherita Pizza', category: 'Entrees', price_cents: 1800,
    description: 'San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil',
    allergens: ['dairy', 'gluten'], is_available_online: true, display_order: 5,
    modifiers: [
      { group_name: 'Size', is_required: true, max_selections: 1, options: [
        { name: 'Personal (10")', price_cents: 0 }, { name: 'Medium (14")', price_cents: 400 },
        { name: 'Large (18")', price_cents: 800 },
      ]},
      { group_name: 'Extra Toppings', is_required: false, max_selections: 5, options: [
        { name: 'Pepperoni', price_cents: 200 }, { name: 'Mushrooms', price_cents: 150 },
        { name: 'Olives', price_cents: 150 }, { name: 'Bell Peppers', price_cents: 150 },
        { name: 'Italian Sausage', price_cents: 250 },
      ]},
    ],
  },
  {
    id: 'demo_6', name: 'Craft Lemonade', category: 'Drinks', price_cents: 500,
    description: 'Fresh-squeezed lemonade with a hint of lavender',
    allergens: [], is_available_online: true, display_order: 6,
    modifiers: [
      { group_name: 'Size', is_required: true, max_selections: 1, options: [
        { name: 'Regular', price_cents: 0 }, { name: 'Large', price_cents: 150 },
      ]},
    ],
  },
  {
    id: 'demo_7', name: 'Truffle Fries', category: 'Starters', price_cents: 1100,
    description: 'Hand-cut fries tossed with truffle oil, parmesan, and fresh herbs',
    allergens: ['dairy'], is_available_online: true, display_order: 7,
    modifiers: [],
  },
  {
    id: 'demo_8', name: 'Chocolate Lava Cake', category: 'Desserts', price_cents: 1300,
    description: 'Warm dark chocolate cake with molten center, served with vanilla ice cream',
    allergens: ['dairy', 'eggs', 'gluten'], is_available_online: true, display_order: 8,
    modifiers: [],
  },
];

// GET /api/public/menu?subdomain=X — Public menu for ordering page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || request.headers.get('x-subdomain');

    if (!subdomain) {
      // Return demo menu if no subdomain
      return NextResponse.json({
        success: true,
        data: groupByCategory(DEMO_MENU),
        businessName: 'Demo Restaurant',
        taxRate: 8.25,
        isDemo: true,
      });
    }

    const supabase = getSupabaseAdmin();

    // Resolve subdomain to owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, business_name, tax_rate, business_hours, timezone')
      .eq('subdomain', subdomain)
      .single();

    if (!profile) {
      // Fall back to demo
      return NextResponse.json({
        success: true,
        data: groupByCategory(DEMO_MENU),
        businessName: 'Demo Restaurant',
        taxRate: 8.25,
        isDemo: true,
      });
    }

    // Fetch menu items
    const { data: menuItems } = await supabase
      .from('menus')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_available_online', true)
      .order('display_order', { ascending: true });

    if (!menuItems || menuItems.length === 0) {
      // No real menu items — return demo
      return NextResponse.json({
        success: true,
        data: groupByCategory(DEMO_MENU),
        businessName: profile.business_name || 'Restaurant',
        taxRate: profile.tax_rate || 8.25,
        businessHours: profile.business_hours,
        timezone: profile.timezone,
        isDemo: true,
      });
    }

    // Fetch modifiers for these items
    const itemIds = menuItems.map(i => i.id);
    const { data: modifiers } = await supabase
      .from('menu_modifiers')
      .select('*')
      .eq('user_id', profile.id)
      .in('menu_item_id', itemIds)
      .order('display_order', { ascending: true });

    // Attach modifiers to items
    const itemsWithModifiers = menuItems.map(item => ({
      ...item,
      modifiers: (modifiers || []).filter(m => m.menu_item_id === item.id),
    }));

    return NextResponse.json({
      success: true,
      data: groupByCategory(itemsWithModifiers),
      businessName: profile.business_name || 'Restaurant',
      taxRate: profile.tax_rate || 8.25,
      businessHours: profile.business_hours,
      timezone: profile.timezone,
      isDemo: false,
    });
  } catch (error) {
    console.error('GET /api/public/menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// Group menu items by category
function groupByCategory(items: Record<string, unknown>[]) {
  const grouped: Record<string, Record<string, unknown>[]> = {};
  for (const item of items) {
    const cat = (item.category as string) || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }
  return grouped;
}
