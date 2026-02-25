/**
 * Retail — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Retail businesses center on INVENTORY as the core entity. Every business type
 * needs product catalog management, customer tracking with loyalty pipelines,
 * and order/transaction tracking. Unlike service businesses, retail has no
 * calendar/scheduling — it's walk-in or online order flow.
 *
 * Covers: retail_store, boutique, jewelry_store, thrift_store, gift_shop,
 *         pet_store, smoke_shop, vape_shop, supplement_store, phone_repair,
 *         electronics_store, furniture_store, florist_shop, bookstore,
 *         retail, shop
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const RETAIL_TYPES = new Set([
  'retail_store', 'boutique', 'jewelry_store', 'thrift_store', 'gift_shop',
  'pet_store', 'smoke_shop', 'vape_shop', 'supplement_store', 'phone_repair',
  'electronics_store', 'furniture_store', 'florist_shop', 'bookstore',
  'retail', 'shop',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── RETAIL STORE (GENERAL) ──────────────────────────────────────────
  // The baseline retail template. Product catalog with variants, customer
  // loyalty pipeline, order tracking. Works for any general merchandise store.
  retail_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Active', 'Loyal', 'VIP', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Products', view: 'table', _locked: true },
          { id: 'categories', label: 'Categories', view: 'cards' },
          { id: 'purchase_orders', label: 'Purchase Orders', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Processing', 'Ready', 'Completed', 'Returned'] },
          { id: 'returns', label: 'Returns & Exchanges', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Associates', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── BOUTIQUE / CLOTHING STORE ───────────────────────────────────────
  // Variant-heavy inventory (size x color). Personal shopping and styling
  // appointments are optional. Seasonal rotation and markdown management
  // drive sell-through. E-commerce with BOPIS is increasingly standard.
  boutique: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Browsing', 'Active', 'VIP', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Insider', 'Trendsetter', 'Style Icon', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Apparel & Accessories', view: 'table', _locked: true },
          { id: 'new_arrivals', label: 'New Arrivals', view: 'cards' },
          { id: 'purchase_orders', label: 'Purchase Orders', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Processing', 'Ready for Pickup', 'Shipped', 'Completed'] },
          { id: 'returns', label: 'Returns & Exchanges', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Lookbook', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Sales Associates', view: 'cards' },
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

  // ── JEWELRY STORE ───────────────────────────────────────────────────
  // High-value serialized inventory. Custom order and repair pipelines are
  // major revenue streams alongside retail. Layaway for expensive pieces.
  // Gemstone 4C tracking, appraisals, and insurance documentation set this apart.
  jewelry_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Clients', icon: 'people',
        components: [
          { id: 'clients', label: 'Clients', view: 'pipeline', _locked: true,
            stages: ['Browsing', 'Consultation', 'Custom Order', 'Active', 'VIP'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Silver', 'Gold', 'Platinum', 'Diamond'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Collection', icon: 'box',
        components: [
          { id: 'inventory', label: 'Jewelry Inventory', view: 'table', _locked: true },
          { id: 'watches', label: 'Watches', view: 'table' },
          { id: 'appraisals', label: 'Appraisals', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Custom & Repair', icon: 'list',
        components: [
          { id: 'custom_orders', label: 'Custom Orders', view: 'pipeline',
            stages: ['Consultation', 'Design / CAD', 'Stone Selection', 'Client Approval', 'Production', 'Quality Check', 'Ready', 'Delivered'] },
          { id: 'repairs', label: 'Repairs', view: 'pipeline',
            stages: ['Intake', 'Estimate', 'Approved', 'In Repair', 'Quality Check', 'Ready', 'Picked Up'] },
          { id: 'layaway', label: 'Layaway', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Showcase', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Jewelers & Associates', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'layaway_payments', label: 'Layaway Payments', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── THRIFT / CONSIGNMENT STORE ──────────────────────────────────────
  // Dual-sided: consignors (sellers) and shoppers (buyers). Consignor split
  // percentages, automated markdowns, and payout management are core.
  // Item lifecycle pipeline tracks from intake through markdown cycles to
  // sale or return. ConsignCloud and SimpleConsign are the competitors.
  thrift_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Shoppers', icon: 'people',
        components: [
          { id: 'clients', label: 'Shoppers', view: 'pipeline', _locked: true,
            stages: ['New', 'Active', 'Regular', 'Loyal', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Thrifter', 'Treasure Hunter', 'Super Saver', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Items', view: 'table', _locked: true },
          { id: 'item_lifecycle', label: 'Item Lifecycle', view: 'pipeline',
            stages: ['Intake', 'Priced & Tagged', 'On Floor', 'Markdown 1', 'Markdown 2', 'Final Markdown', 'Sold / Returned'] },
          { id: 'markdowns', label: 'Markdown Schedule', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Consignors', icon: 'users',
        components: [
          { id: 'consignors', label: 'Consignors', view: 'table', _locked: true },
          { id: 'intake', label: 'Intake Queue', view: 'pipeline',
            stages: ['Scheduled', 'Receiving', 'Sorting', 'Quality Check', 'Priced', 'On Floor'] },
          { id: 'payouts', label: 'Payouts', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Associates', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'consignor_payouts', label: 'Consignor Payouts', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── GIFT SHOP ───────────────────────────────────────────────────────
  // High SKU diversity with low quantity per item. Gift cards are a major
  // revenue category. Gift wrapping and personalization services.
  // Seasonal inventory rotation (Valentine's, Mother's Day, Christmas).
  // Local artisan/maker consignment tracking for unique items.
  gift_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Returning', 'Regular', 'Loyal'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Member', 'Gift Giver', 'Super Shopper', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Gifts & Products', view: 'table', _locked: true },
          { id: 'gift_cards', label: 'Gift Cards', view: 'table' },
          { id: 'seasonal', label: 'Seasonal Items', view: 'cards' },
          { id: 'vendors', label: 'Vendors & Artisans', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Gift Wrapping', 'Ready', 'Shipped', 'Completed'] },
          { id: 'personalization', label: 'Personalization Queue', view: 'pipeline',
            stages: ['Requested', 'In Progress', 'Ready'] },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Associates', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PET STORE ───────────────────────────────────────────────────────
  // Hybrid retail + services (grooming, training). Pet profiles linked to
  // customer accounts. Food/supply subscriptions for recurring revenue.
  // Vaccination record tracking required for grooming. Breed-specific
  // product recommendations and weight-based food portioning.
  pet_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Pet Owners', icon: 'people',
        components: [
          { id: 'clients', label: 'Pet Owners', view: 'pipeline', _locked: true,
            stages: ['New', 'Active', 'Subscriber', 'Loyal', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'pet_profiles', label: 'Pet Profiles', view: 'cards' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Puppy Pack', 'Good Boy', 'Best Friend', 'Top Dog'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Pet Supplies', view: 'table', _locked: true },
          { id: 'food', label: 'Food & Treats', view: 'table' },
          { id: 'subscriptions', label: 'Autoship Subscriptions', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Grooming', icon: 'calendar',
        components: [
          { id: 'grooming', label: 'Grooming Appointments', view: 'pipeline',
            stages: ['Drop-off', 'Checked In', 'Grooming', 'Ready for Pickup', 'Picked Up'] },
          { id: 'grooming_calendar', label: 'Grooming Calendar', view: 'calendar' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Pet Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Associates & Groomers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'subscription_billing', label: 'Subscription Billing', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── SMOKE SHOP ──────────────────────────────────────────────────────
  // Age verification at every sale is a legal requirement. Tobacco and vape
  // tax calculation varies by jurisdiction. Nicotine strength and flavor
  // tracking for inventory. Limited marketing channels due to advertising
  // restrictions. Loyalty is critical for retention.
  smoke_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Active', 'Regular', 'VIP', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Products', view: 'table', _locked: true },
          { id: 'vape_liquids', label: 'Vape & E-Liquids', view: 'table' },
          { id: 'tobacco', label: 'Tobacco & Cigars', view: 'table' },
          { id: 'accessories', label: 'Accessories & Glass', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Compliance', icon: 'list',
        components: [
          { id: 'age_verification', label: 'Age Verification Log', view: 'table' },
          { id: 'licenses', label: 'Licenses & Permits', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Associates', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── SUPPLEMENT STORE ────────────────────────────────────────────────
  // Health and nutrition focused retail. Customer profiles track fitness goals,
  // dietary restrictions, and supplement stacks. Subscription/auto-reorder is
  // a major revenue driver. Staff need product knowledge for recommendations.
  // Loyalty tiers themed around fitness progression.
  supplement_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Active', 'Subscriber', 'Loyal', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Starter', 'Committed', 'Dedicated', 'Elite'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Supplements', view: 'table', _locked: true },
          { id: 'proteins', label: 'Proteins & Powders', view: 'table' },
          { id: 'vitamins', label: 'Vitamins & Wellness', view: 'table' },
          { id: 'subscriptions', label: 'Auto-Reorder Plans', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Processing', 'Ready', 'Shipped', 'Completed'] },
          { id: 'returns', label: 'Returns', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Nutrition Advisors', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'subscription_billing', label: 'Subscription Billing', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── PHONE REPAIR ────────────────────────────────────────────────────
  // Service-oriented retail: repair pipeline is the core workflow. Parts
  // inventory tied to repair jobs. Device intake with condition documentation.
  // Quick turnaround tracking. Warranty management for completed repairs.
  // Accessories retail is secondary revenue.
  phone_repair: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['Walk-in', 'Device Checked In', 'In Repair', 'Ready', 'Picked Up'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Returning', 'Regular', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Repairs', icon: 'list',
        components: [
          { id: 'repairs', label: 'Repair Queue', view: 'pipeline', _locked: true,
            stages: ['Intake', 'Diagnosis', 'Estimate Sent', 'Approved', 'Parts Ordered', 'In Repair', 'Testing', 'Ready', 'Picked Up'] },
          { id: 'warranties', label: 'Warranties', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Parts & Components', view: 'table', _locked: true },
          { id: 'accessories', label: 'Accessories & Cases', view: 'table' },
          { id: 'devices', label: 'Devices for Sale', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Technicians', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'estimates', label: 'Estimates', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── ELECTRONICS STORE ───────────────────────────────────────────────
  // Serialized inventory (serial numbers per unit). Extended warranty and
  // protection plan sales are major margin drivers. Trade-in program for
  // used devices. Technical support and repair services secondary revenue.
  // Product demos and setup services can be booked.
  electronics_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Browsing', 'Active', 'Loyal', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Member', 'Plus', 'Pro', 'Elite'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'inventory', label: 'Products', view: 'table', _locked: true },
          { id: 'warranties', label: 'Extended Warranties', view: 'table' },
          { id: 'trade_ins', label: 'Trade-Ins', view: 'pipeline',
            stages: ['Submitted', 'Evaluated', 'Offer Made', 'Accepted', 'Credit Issued'] },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Processing', 'Ready for Pickup', 'Shipped', 'Delivered', 'Completed'] },
          { id: 'returns', label: 'Returns & Exchanges', view: 'table' },
          { id: 'service_requests', label: 'Tech Support', view: 'pipeline',
            stages: ['Submitted', 'Triaged', 'In Progress', 'Resolved'] },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Sales & Tech Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'financing', label: 'Financing Plans', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── FURNITURE STORE ─────────────────────────────────────────────────
  // High-value items with long sales cycles. Delivery scheduling and tracking
  // are essential. Custom order pipeline for made-to-order pieces (fabric,
  // finish, dimensions). Showroom management with floor model tracking.
  // Financing is common for large purchases.
  furniture_store: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['Browsing', 'Consultation', 'Quote Sent', 'Purchased', 'Delivered'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Returning', 'Preferred', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Showroom', icon: 'box',
        components: [
          { id: 'inventory', label: 'Furniture Catalog', view: 'table', _locked: true },
          { id: 'floor_models', label: 'Floor Models', view: 'cards' },
          { id: 'custom_orders', label: 'Custom Orders', view: 'pipeline',
            stages: ['Consultation', 'Design Selected', 'Fabric / Finish Chosen', 'Ordered', 'In Production', 'Shipped', 'Received', 'Ready'] },
        ],
      },
      {
        id: 'tab_4', label: 'Delivery', icon: 'list',
        components: [
          { id: 'deliveries', label: 'Deliveries', view: 'pipeline', _locked: true,
            stages: ['Scheduled', 'Loading', 'En Route', 'Delivered', 'Setup Complete'] },
          { id: 'delivery_calendar', label: 'Delivery Calendar', view: 'calendar' },
          { id: 'returns', label: 'Returns & Claims', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Room Inspiration', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Sales & Delivery Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'financing', label: 'Financing Plans', view: 'table' },
          { id: 'deposits', label: 'Deposits', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── FLORIST SHOP (RETAIL) ───────────────────────────────────────────
  // Retail-focused florist selling arrangements from a storefront. Not the
  // event/wedding florist (that's CREATIVE_EVENTS). Perishable inventory
  // management is critical — flowers have shelf life. Daily arrangement
  // production, walk-in and phone orders, delivery routing.
  // Seasonal peaks (Valentine's, Mother's Day, funerals).
  florist_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New', 'Returning', 'Regular', 'Loyal', 'Inactive'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Seedling', 'Budding', 'Blooming', 'Perennial'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Arrangements', icon: 'box',
        components: [
          { id: 'inventory', label: 'Fresh Inventory', view: 'table', _locked: true },
          { id: 'arrangements', label: 'Arrangements', view: 'cards' },
          { id: 'plants', label: 'Plants & Gifts', view: 'table' },
          { id: 'purchase_orders', label: 'Wholesale Orders', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Orders', icon: 'list',
        components: [
          { id: 'orders', label: 'Orders', view: 'pipeline', _locked: true,
            stages: ['Received', 'Designing', 'Arranged', 'Ready for Pickup', 'Out for Delivery', 'Delivered'] },
          { id: 'delivery_calendar', label: 'Delivery Schedule', view: 'calendar' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Arrangement Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Designers & Drivers', view: 'cards' },
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

  // ── BOOKSTORE ───────────────────────────────────────────────────────
  // ISBN-based inventory. Special orders are a core service for indie
  // bookstores. Author events, signings, and book clubs drive community
  // engagement and foot traffic. Publisher catalog integration and
  // returnability tracking are unique to book retail.
  bookstore: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Readers', icon: 'people',
        components: [
          { id: 'clients', label: 'Readers', view: 'pipeline', _locked: true,
            stages: ['New', 'Active', 'Book Club Member', 'Regular', 'Bibliophile'] },
          { id: 'contacts', label: 'Contacts', view: 'table' },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['Reader', 'Bookworm', 'Literary Enthusiast', 'Patron'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Books', icon: 'box',
        components: [
          { id: 'inventory', label: 'Book Inventory', view: 'table', _locked: true },
          { id: 'staff_picks', label: 'Staff Picks', view: 'cards' },
          { id: 'special_orders', label: 'Special Orders', view: 'pipeline',
            stages: ['Requested', 'Ordered from Publisher', 'Shipped', 'Received', 'Customer Notified', 'Picked Up'] },
          { id: 'gifts_stationery', label: 'Gifts & Stationery', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Events', icon: 'calendar',
        components: [
          { id: 'events', label: 'Author Events & Signings', view: 'calendar' },
          { id: 'book_clubs', label: 'Book Clubs', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Staff', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Booksellers', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },
};

// ── Generic aliases ──────────────────────────────────────────────────

// "vape_shop" uses smoke_shop template (same regulatory requirements)
TEMPLATES.vape_shop = structuredClone(TEMPLATES.smoke_shop);

// "retail" generic → retail_store (most common retail type)
TEMPLATES.retail = structuredClone(TEMPLATES.retail_store);

// "shop" generic → retail_store
TEMPLATES.shop = structuredClone(TEMPLATES.retail_store);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for a Retail business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getRetailTemplate(businessType: string): TemplateResult | null {
  if (!RETAIL_TYPES.has(businessType)) return null;

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
  const result = getRetailTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
