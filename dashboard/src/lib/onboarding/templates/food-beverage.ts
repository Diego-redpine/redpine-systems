/**
 * Food & Beverage — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Covers: restaurant, cafe, coffee_shop, bakery, food_truck, catering, bar,
 *         brewery, juice_bar, meal_prep, pizza_shop, ice_cream_shop, deli,
 *         food, bistro, diner, pub, winery, distillery
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const FOOD_BEVERAGE_TYPES = new Set([
  'restaurant', 'cafe', 'coffee_shop', 'bakery', 'food_truck', 'catering',
  'bar', 'brewery', 'juice_bar', 'meal_prep', 'pizza_shop', 'ice_cream_shop',
  'deli', 'food', 'bistro', 'diner', 'pub', 'winery', 'distillery',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── RESTAURANT (FULL SERVICE) ─────────────────────────────────────
  // Pipeline = guest journey from reservation through payment.
  // Menu tab is card-based for visual item management.
  // Orders tab tracks dine-in, takeout, and delivery in one pipeline.
  restaurant: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Guests', icon: 'people',
        components: [
          { id: 'clients', label: 'Guest Journey', view: 'pipeline', _locked: true,
            stages: ['Reservation', 'Confirmed', 'Seated', 'Order Placed', 'Served', 'Check Presented', 'Paid'] },
          { id: 'contacts', label: 'Guest Directory', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Regular', 'VIP', 'Elite'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Reservations', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Reservations', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Preparing', 'Ready', 'Served', 'Completed'] },
        ],
      },
      {
        id: 'tab_5', label: 'Menu', icon: 'box',
        components: [
          { id: 'menu_items', label: 'Menu Items', view: 'cards' },
          { id: 'beverages', label: 'Beverages', view: 'cards' },
          { id: 'specials', label: 'Daily Specials', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tip Tracking', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── CAFE / COFFEE SHOP ────────────────────────────────────────────
  // Walk-in focused. No reservations — Schedule tab becomes order queue.
  // Loyalty is essential for coffee shops (stamps/points model).
  cafe: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Order Placed', 'Preparing', 'Ready for Pickup', 'Completed'] },
          { id: 'contacts', label: 'Regulars', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Regular', 'Gold', 'Platinum'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menu', icon: 'box',
        components: [
          { id: 'drinks', label: 'Drinks', view: 'cards' },
          { id: 'food_items', label: 'Pastries & Food', view: 'cards' },
          { id: 'retail', label: 'Retail (Beans & Merch)', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Baristas', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Baristas', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tip Tracking', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── BAKERY ────────────────────────────────────────────────────────
  // Dual flow: walk-in counter sales + custom order pipeline.
  // Custom orders (cakes, event pastries) use consultation→deposit→production workflow.
  // Gallery is essential for showcasing custom cake designs.
  bakery: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Custom Orders', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'Quote Sent', 'Deposit Received', 'In Production', 'Decorating', 'Ready for Pickup', 'Completed'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Order Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Products', icon: 'box',
        components: [
          { id: 'baked_goods', label: 'Baked Goods', view: 'cards' },
          { id: 'custom_cakes', label: 'Custom Cakes', view: 'cards' },
          { id: 'seasonal', label: 'Seasonal Items', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Cake Gallery', view: 'cards', _locked: true },
          { id: 'portfolios', label: 'Design Portfolio', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Bakers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Bakers & Decorators', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── FOOD TRUCK ────────────────────────────────────────────────────
  // Location-driven business. Schedule tab doubles as location calendar.
  // Events/catering pipeline for booked gigs. Simplified menu (8-15 items).
  food_truck: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Order Queue', view: 'pipeline', _locked: true,
            stages: ['Received', 'Preparing', 'Ready', 'Picked Up'] },
          { id: 'event_bookings', label: 'Event Bookings', view: 'pipeline',
            stages: ['Inquiry', 'Quote Sent', 'Deposit Paid', 'Menu Confirmed', 'Event Day', 'Invoiced', 'Paid'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Locations', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Location Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menu', icon: 'box',
        components: [
          { id: 'menu_items', label: 'Menu', view: 'cards' },
          { id: 'specials', label: 'Daily Specials', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Crew', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Crew', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tips', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── CATERING COMPANY ──────────────────────────────────────────────
  // Event-driven with long sales cycle. Proposals pipeline is the heart.
  // Multi-milestone payments (deposit → progress → final).
  // Tasting appointments drive conversions.
  catering: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Events', icon: 'people',
        components: [
          { id: 'clients', label: 'Event Pipeline', view: 'pipeline', _locked: true,
            stages: ['Inquiry', 'Consultation', 'Proposal Sent', 'Revision', 'Accepted', 'Deposit Received', 'Menu Finalized', 'Prep Day', 'Event Day', 'Final Invoice', 'Paid'] },
          { id: 'contacts', label: 'Clients', view: 'table' },
          { id: 'tastings', label: 'Tastings', view: 'pipeline',
            stages: ['Requested', 'Scheduled', 'Completed', 'Booked'] },
        ],
      },
      {
        id: 'tab_3', label: 'Calendar', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Event Calendar', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menus', icon: 'box',
        components: [
          { id: 'menu_packages', label: 'Menu Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons & Extras', view: 'cards' },
          { id: 'dietary', label: 'Dietary Options', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Event Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Event Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Chefs & Servers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── BAR / LOUNGE / NIGHTCLUB ──────────────────────────────────────
  // Tab-based operations. Tabs (open bar tabs) are the core workflow.
  // Events tab for DJ nights, live music, private parties.
  // Inventory tracks by pour/bottle/keg.
  bar: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Guests', icon: 'people',
        components: [
          { id: 'clients', label: 'Bar Tabs', view: 'pipeline', _locked: true,
            stages: ['Walk-in', 'Tab Opened', 'Drinks Ordered', 'Tab Running', 'Close Tab', 'Settled'] },
          { id: 'contacts', label: 'Guest List', view: 'table' },
          { id: 'vip', label: 'VIP Guests', view: 'cards' },
        ],
      },
      {
        id: 'tab_3', label: 'Events', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Events Calendar', view: 'calendar', _locked: true },
          { id: 'events', label: 'Event Bookings', view: 'pipeline',
            stages: ['Inquiry', 'Quote Sent', 'Deposit Paid', 'Confirmed', 'Event Night', 'Settled'] },
        ],
      },
      {
        id: 'tab_4', label: 'Drinks', icon: 'box',
        components: [
          { id: 'cocktails', label: 'Cocktails', view: 'cards' },
          { id: 'beer_wine', label: 'Beer & Wine', view: 'table' },
          { id: 'spirits', label: 'Spirits', view: 'table' },
          { id: 'bottle_service', label: 'Bottle Service', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Bartenders & Staff', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tip Pooling', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── BREWERY / TAPROOM ─────────────────────────────────────────────
  // Production-focused. Brew pipeline tracks batches from grain to glass.
  // Taproom is the retail face; distribution handles wholesale.
  // Flight management is a unique feature.
  brewery: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Taproom', icon: 'people',
        components: [
          { id: 'clients', label: 'Taproom Orders', view: 'pipeline', _locked: true,
            stages: ['Walk-in', 'Seated', 'Order Placed', 'Served', 'Tab Closed'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
          { id: 'loyalty', label: 'Mug Club', view: 'pipeline',
            stages: ['Member', 'Silver', 'Gold', 'Founding'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Events', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Events & Taproom', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Beer Menu', icon: 'box',
        components: [
          { id: 'on_tap', label: 'On Tap', view: 'cards' },
          { id: 'cans_bottles', label: 'Cans & Bottles', view: 'cards' },
          { id: 'flights', label: 'Flight Builder', view: 'cards' },
          { id: 'food_menu', label: 'Food Menu', view: 'cards' },
          { id: 'merch', label: 'Merchandise', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Brewery Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tips', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── JUICE BAR / SMOOTHIE SHOP ─────────────────────────────────────
  // Walk-in + order-ahead focused. Heavy modifier system (boosts, add-ons).
  // Cleanse programs are a unique upsell. Perishable inventory is critical.
  juice_bar: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Order Queue', view: 'pipeline', _locked: true,
            stages: ['Order Placed', 'Customizing', 'Preparing', 'Ready', 'Picked Up'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Regular', 'Health Nut', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menu', icon: 'box',
        components: [
          { id: 'smoothies', label: 'Smoothies', view: 'cards' },
          { id: 'juices', label: 'Fresh Juices', view: 'cards' },
          { id: 'bowls', label: 'Acai & Bowls', view: 'cards' },
          { id: 'wellness_shots', label: 'Wellness Shots', view: 'cards' },
          { id: 'cleanses', label: 'Cleanse Programs', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team Members', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tips', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── MEAL PREP SERVICE ─────────────────────────────────────────────
  // Subscription-first model. Subscriber lifecycle pipeline replaces booking.
  // Production and delivery are the operational core.
  // Weekly menu rotation with customer meal selection.
  meal_prep: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Subscribers', icon: 'people',
        components: [
          { id: 'clients', label: 'Subscriber Lifecycle', view: 'pipeline', _locked: true,
            stages: ['Free Trial', 'Subscribed', 'Active', 'At-Risk', 'Paused', 'Cancelled', 'Win-Back'] },
          { id: 'contacts', label: 'All Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Production & Delivery', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Weekly Orders', view: 'pipeline', _locked: true,
            stages: ['Meal Selection', 'Order Confirmed', 'In Production', 'Packed', 'Out for Delivery', 'Delivered'] },
        ],
      },
      {
        id: 'tab_5', label: 'Meals', icon: 'box',
        components: [
          { id: 'meal_plans', label: 'Meal Plans', view: 'cards' },
          { id: 'weekly_menu', label: 'Weekly Menu', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons & Snacks', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Kitchen Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Kitchen & Drivers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'subscriptions', label: 'Subscription Billing', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PIZZA SHOP ────────────────────────────────────────────────────
  // High-volume order flow: walk-in + phone + online. Delivery-heavy.
  // Simpler than full restaurant — focused on speed and volume.
  pizza_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Order Tracker', view: 'pipeline', _locked: true,
            stages: ['Received', 'Making', 'In Oven', 'Ready', 'Out for Delivery', 'Completed'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Regular', 'VIP', 'Legend'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menu', icon: 'box',
        components: [
          { id: 'pizzas', label: 'Pizzas', view: 'cards' },
          { id: 'sides', label: 'Sides & Apps', view: 'cards' },
          { id: 'drinks', label: 'Drinks', view: 'table' },
          { id: 'deals', label: 'Deals & Combos', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tips', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── ICE CREAM SHOP ────────────────────────────────────────────────
  // Walk-in focused, seasonal business. Flavor rotation is key.
  // Catering/event orders for parties and weddings.
  // Gallery showcases sundaes, cakes, and creations.
  ice_cream_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Walk-in', 'Order Placed', 'Scooping', 'Ready', 'Completed'] },
          { id: 'catering_orders', label: 'Catering Orders', view: 'pipeline',
            stages: ['Inquiry', 'Quote Sent', 'Deposit Paid', 'Prepping', 'Delivered', 'Completed'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menu', icon: 'box',
        components: [
          { id: 'flavors', label: 'Flavors', view: 'cards' },
          { id: 'sundaes', label: 'Sundaes & Specials', view: 'cards' },
          { id: 'ice_cream_cakes', label: 'Ice Cream Cakes', view: 'cards' },
          { id: 'toppings', label: 'Toppings & Add-Ons', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Creations Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Scoopers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tips', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── DELI / SANDWICH SHOP ──────────────────────────────────────────
  // Quick-service with catering side. Order pipeline is simple and fast.
  // Catering pipeline for office lunch orders and platters.
  deli: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Orders', icon: 'people',
        components: [
          { id: 'clients', label: 'Order Queue', view: 'pipeline', _locked: true,
            stages: ['Received', 'Making', 'Ready', 'Picked Up'] },
          { id: 'catering_orders', label: 'Catering Orders', view: 'pipeline',
            stages: ['Inquiry', 'Quote Sent', 'Confirmed', 'Prepping', 'Ready', 'Delivered'] },
          { id: 'contacts', label: 'Customers', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Regular', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Menu', icon: 'box',
        components: [
          { id: 'sandwiches', label: 'Sandwiches', view: 'cards' },
          { id: 'sides_soups', label: 'Sides & Soups', view: 'cards' },
          { id: 'platters', label: 'Catering Platters', view: 'cards' },
          { id: 'drinks', label: 'Drinks', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'tips', label: 'Tips', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── WINERY / TASTING ROOM ─────────────────────────────────────────
  // Reservation-based tastings. Wine club membership pipeline.
  // Events (harvest dinners, wine-pairing nights) drive revenue.
  // Gallery showcases vineyard, process, and pairings.
  winery: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Guests', icon: 'people',
        components: [
          { id: 'clients', label: 'Tasting Reservations', view: 'pipeline', _locked: true,
            stages: ['Reservation', 'Confirmed', 'Checked In', 'Tasting', 'Completed', 'Purchase'] },
          { id: 'contacts', label: 'Guest Directory', view: 'table' },
          { id: 'wine_club', label: 'Wine Club', view: 'pipeline',
            stages: ['Prospect', 'New Member', 'Active', 'VIP Collector', 'Legacy'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Reservations', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Tastings & Events', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Wine List', icon: 'box',
        components: [
          { id: 'wines', label: 'Wines', view: 'cards' },
          { id: 'tasting_flights', label: 'Tasting Flights', view: 'cards' },
          { id: 'food_pairings', label: 'Food Pairings', view: 'cards' },
          { id: 'merch', label: 'Merchandise', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Vineyard & Wine Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'wine_club_billing', label: 'Club Billing', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── DISTILLERY / SPIRITS TASTING ──────────────────────────────────
  // Similar to winery but with spirits focus. Tour + tasting model.
  // Cocktail classes and private events are revenue drivers.
  // Bottle sales (retail) are a major component.
  distillery: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Guests', icon: 'people',
        components: [
          { id: 'clients', label: 'Tours & Tastings', view: 'pipeline', _locked: true,
            stages: ['Reservation', 'Confirmed', 'Checked In', 'Tour', 'Tasting', 'Completed'] },
          { id: 'contacts', label: 'Guest Directory', view: 'table' },
          { id: 'loyalty', label: 'Spirits Club', view: 'pipeline',
            stages: ['Member', 'Enthusiast', 'Connoisseur', 'Founder'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Reservations', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Tours & Events', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Spirits', icon: 'box',
        components: [
          { id: 'spirits', label: 'Spirits Collection', view: 'cards' },
          { id: 'tasting_flights', label: 'Tasting Flights', view: 'cards' },
          { id: 'cocktails', label: 'Signature Cocktails', view: 'cards' },
          { id: 'merch', label: 'Merchandise & Bottles', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Distillery Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },
};

// ── Generic aliases ──────────────────────────────────────────────────

// "coffee_shop" is a cafe
TEMPLATES.coffee_shop = structuredClone(TEMPLATES.cafe);

// "food" generic → restaurant (most common food business)
TEMPLATES.food = structuredClone(TEMPLATES.restaurant);

// "bistro" → restaurant with minor relabeling
TEMPLATES.bistro = structuredClone(TEMPLATES.restaurant);

// "diner" → restaurant (same pipeline, different vibe)
TEMPLATES.diner = structuredClone(TEMPLATES.restaurant);

// "pub" → bar (pub is a bar with food emphasis)
TEMPLATES.pub = structuredClone(TEMPLATES.bar);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for a Food & Beverage business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getFoodBeverageTemplate(businessType: string): TemplateResult | null {
  if (!FOOD_BEVERAGE_TYPES.has(businessType)) return null;

  const templateData = TEMPLATES[businessType];
  if (!templateData) return null;

  const template = structuredClone(templateData);

  // Collect locked component IDs
  const lockedIds = new Set<string>();
  for (const tab of template.tabs) {
    for (const comp of tab.components) {
      if (comp._locked) {
        lockedIds.add(comp.id);
      }
    }
  }

  return { template, lockedIds };
}

/**
 * Get the template formatted as a JSON string for injection into the AI prompt.
 * Includes _locked flags so AI knows what it cannot remove.
 */
export function getTemplateAsPromptJson(businessType: string): string | null {
  const result = getFoodBeverageTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
