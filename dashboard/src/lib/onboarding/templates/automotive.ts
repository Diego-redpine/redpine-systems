/**
 * Automotive — Template Family
 *
 * Enterprise-first templates. Each business type has its OWN complete template.
 * AI customizes labels, removes _removable tabs, adds user-requested components.
 * Locked components (_locked: true) cannot be removed by AI.
 *
 * Covers: auto_repair, mechanic, body_shop, tire_shop, oil_change, car_wash,
 *         car_dealership, auto_detailing, motorcycle_shop, towing,
 *         auto_body, auto_glass, transmission_shop, muffler_shop, automotive
 */

import type { TemplateConfig, TemplateResult } from './beauty-body';

// All business types in this family
export const AUTOMOTIVE_TYPES = new Set([
  'auto_repair', 'mechanic', 'body_shop', 'tire_shop', 'oil_change',
  'car_wash', 'car_dealership', 'auto_detailing', 'motorcycle_shop',
  'towing', 'auto_body', 'auto_glass', 'transmission_shop',
  'muffler_shop', 'automotive',
]);

// ── Enterprise Templates ─────────────────────────────────────────────

const TEMPLATES: Record<string, TemplateConfig> = {

  // ── AUTO REPAIR SHOP ────────────────────────────────────────────────
  // Core flow: vehicle check-in → diagnosis → estimate → approval → repair → QC → pickup.
  // Work Orders pipeline is the central entity. Vehicles are tracked per customer.
  // DVI (Digital Vehicle Inspection) is a locked component — industry standard.
  auto_repair: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_3', label: 'Work Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Repair Orders', view: 'pipeline', _locked: true,
            stages: ['Scheduled', 'Checked In', 'Diagnosis', 'Estimate Sent', 'Approved', 'Parts Ordered', 'In Progress', 'Quality Check', 'Ready for Pickup', 'Picked Up'] },
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Viewed', 'Approved', 'Declined'] },
          { id: 'inspections', label: 'Inspections (DVI)', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'parts', label: 'Parts Inventory', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Technicians', view: 'cards' },
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

  // ── BODY SHOP / COLLISION ───────────────────────────────────────────
  // Long repair cycles (5-14 days). Insurance claims are central.
  // Production pipeline tracks vehicle through disassembly → body → paint → reassembly.
  // Estimates + supplements are critical locked components.
  body_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
          { id: 'insurance', label: 'Insurance Claims', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Repair Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Repair Pipeline', view: 'pipeline', _locked: true,
            stages: ['Estimate Appt', 'Vehicle Drop-Off', 'Disassembly', 'Supplement Submitted', 'Parts Ordered', 'Parts Received', 'Structural', 'Body Work', 'Paint', 'Reassembly', 'Detail & QC', 'Ready for Pickup'] },
          { id: 'estimates', label: 'Estimates & Supplements', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent to Insurance', 'Under Review', 'Approved', 'Supplement Needed'] },
          { id: 'photos', label: 'Repair Photos', view: 'cards' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Estimate Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Parts & Materials', icon: 'box',
        components: [
          { id: 'parts', label: 'Parts Orders', view: 'table' },
          { id: 'materials', label: 'Paint & Materials', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Body Techs & Painters', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_payments', label: 'Insurance Payments', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── TIRE SHOP ──────────────────────────────────────────────────────
  // Tire inventory is THE critical entity — searchable by size, brand, fitment.
  // Work orders shorter cycle than auto repair (1-2 hours typical).
  // Warranty tracking for road hazard warranties is important revenue.
  tire_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_3', label: 'Work Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Work Orders', view: 'pipeline', _locked: true,
            stages: ['Walk-in / Appt', 'Vehicle Assessment', 'Tire Selected', 'Quote Approved', 'Installation', 'Balance & Alignment', 'Quality Check', 'Ready', 'Paid'] },
          { id: 'estimates', label: 'Quotes', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Inventory', icon: 'box',
        components: [
          { id: 'tire_inventory', label: 'Tire Inventory', view: 'table', _locked: true },
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'warranties', label: 'Warranties', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Installers', view: 'cards' },
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

  // ── OIL CHANGE / QUICK LUBE ─────────────────────────────────────────
  // High-volume, short-cycle service (15-30 min). Walk-in dominant.
  // Simpler pipeline than full auto repair. Upsell inspection is key.
  // Maintenance reminders (next oil change) drive repeat business.
  oil_change: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
          { id: 'loyalty', label: 'Loyalty', view: 'pipeline',
            stages: ['New', 'Regular', 'Preferred', 'VIP'],
            _auto_progress: true },
        ],
      },
      {
        id: 'tab_3', label: 'Service Queue', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Service Queue', view: 'pipeline', _locked: true,
            stages: ['Walk-in', 'Checked In', 'In Bay', 'Inspection', 'Service Complete', 'Ready'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-On Services', view: 'cards' },
          { id: 'products', label: 'Fluids & Filters', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Lube Techs', view: 'cards' },
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

  // ── CAR WASH ────────────────────────────────────────────────────────
  // Drive-up model — no appointments. Membership is THE key entity (recurring revenue).
  // Transactions are high-volume, fast (under 45 seconds per car).
  // Equipment maintenance tracking replaces traditional schedule.
  car_wash: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Members', icon: 'people',
        components: [
          { id: 'clients', label: 'Members', view: 'pipeline', _locked: true,
            stages: ['New', 'Basic', 'Plus', 'Premium', 'Unlimited', 'Cancelled'] },
          { id: 'contacts', label: 'All Customers', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Memberships', icon: 'calendar',
        components: [
          { id: 'membership_plans', label: 'Wash Plans', view: 'cards', _locked: true },
          { id: 'memberships', label: 'Active Members', view: 'table' },
          { id: 'gift_cards', label: 'Gift Cards', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Wash Packages', icon: 'box',
        components: [
          { id: 'packages', label: 'Wash Packages', view: 'cards' },
          { id: 'add_ons', label: 'Add-On Services', view: 'cards' },
        ],
      },
      {
        id: 'tab_5', label: 'Equipment', icon: 'box',
        components: [
          { id: 'equipment', label: 'Equipment', view: 'table' },
          { id: 'maintenance', label: 'Maintenance Log', view: 'list' },
        ],
      },
      {
        id: 'tab_6', label: 'Attendants', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Attendants', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Transactions', view: 'table', _locked: true },
          { id: 'membership_billing', label: 'Membership Billing', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── CAR DEALERSHIP ──────────────────────────────────────────────────
  // Sales pipeline is the core. Inventory (vehicles for sale) is critical.
  // Service department is secondary but important for post-sale revenue.
  // F&I (finance & insurance) is a key revenue center.
  car_dealership: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Leads & Customers', view: 'pipeline', _locked: true,
            stages: ['Website Lead', 'Phone Inquiry', 'Showroom Visit', 'Test Drive', 'Negotiation', 'F&I', 'Sold', 'Delivered'] },
          { id: 'contacts', label: 'Contact Directory', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Inventory', icon: 'box',
        components: [
          { id: 'vehicle_inventory', label: 'Vehicle Inventory', view: 'table', _locked: true },
          { id: 'trade_ins', label: 'Trade-In Appraisals', view: 'pipeline',
            stages: ['Submitted', 'Inspected', 'Appraised', 'Offer Made', 'Accepted', 'Declined'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Deals', icon: 'dollar',
        components: [
          { id: 'deals', label: 'Active Deals', view: 'pipeline', _locked: true,
            stages: ['Prospect', 'Quote Given', 'Negotiating', 'Pending F&I', 'Paperwork', 'Funded', 'Delivered'] },
          { id: 'fi_products', label: 'F&I Products', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Service Dept', icon: 'box', _removable: true,
        components: [
          { id: 'service_orders', label: 'Service Orders', view: 'pipeline',
            stages: ['Scheduled', 'Checked In', 'In Service', 'Ready', 'Picked Up'] },
          { id: 'parts', label: 'Parts', view: 'table' },
        ],
      },
      {
        id: 'tab_7', label: 'Sales Team', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Sales Team', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'financing', label: 'Financing', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── AUTO DETAILING ──────────────────────────────────────────────────
  // Appointment-based with tiered packages by vehicle size.
  // Before/after photos are critical marketing assets.
  // Ceramic coating and PPF are premium services with warranty tracking.
  // Some are mobile (travel to customer) — location field matters.
  auto_detailing: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'pipeline', _locked: true,
            stages: ['New Lead', 'Booked', 'Confirmed', 'In Service', 'Completed'] },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
          { id: 'contacts', label: 'Contacts', view: 'list' },
        ],
      },
      {
        id: 'tab_3', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_4', label: 'Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Detail Packages', view: 'cards' },
          { id: 'coatings', label: 'Coatings & PPF', view: 'cards' },
          { id: 'add_ons', label: 'Add-Ons', view: 'cards' },
          { id: 'products', label: 'Detailing Products', view: 'table' },
        ],
      },
      {
        id: 'tab_5', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Before & After', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_6', label: 'Detailers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Detailers', view: 'cards' },
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

  // ── MOTORCYCLE SHOP ─────────────────────────────────────────────────
  // Hybrid: sales (new/used bikes) + service/repair + parts + accessories.
  // Seasonal business — spring/summer peak. Winter storage is a revenue stream.
  // Riders are passionate — community and events matter.
  motorcycle_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Riders', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Bikes on File', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_3', label: 'Work Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Service Orders', view: 'pipeline', _locked: true,
            stages: ['Scheduled', 'Drop-Off', 'Diagnosis', 'Estimate Sent', 'Approved', 'In Progress', 'Quality Check', 'Ready', 'Picked Up'] },
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Inventory', icon: 'box',
        components: [
          { id: 'bike_inventory', label: 'Bikes for Sale', view: 'cards' },
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'parts', label: 'Parts & Accessories', view: 'table' },
          { id: 'gear', label: 'Riding Gear', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Gallery', icon: 'image',
        components: [
          { id: 'galleries', label: 'Bike Gallery', view: 'cards', _locked: true },
        ],
      },
      {
        id: 'tab_7', label: 'Mechanics', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Mechanics', view: 'cards' },
        ],
      },
      {
        id: 'tab_8', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── TOWING COMPANY ──────────────────────────────────────────────────
  // Dispatch-driven, not appointment-driven. Calls are the core entity.
  // Driver/truck management with GPS tracking. Impound lot is secondary revenue.
  // Motor club accounts (AAA, insurance roadside) are key B2B relationships.
  towing: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Dispatch', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Active Calls', view: 'pipeline', _locked: true,
            stages: ['Call Received', 'Dispatched', 'En Route', 'On Scene', 'Loaded', 'En Route to Dest', 'Delivered', 'Invoiced'] },
        ],
      },
      {
        id: 'tab_3', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'accounts', label: 'Accounts & Contracts', view: 'table' },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Schedule', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Fleet', icon: 'box',
        components: [
          { id: 'trucks', label: 'Trucks', view: 'cards' },
          { id: 'impound', label: 'Impound Lot', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Drivers', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Drivers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'storage_fees', label: 'Storage Fees', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── AUTO GLASS ──────────────────────────────────────────────────────
  // Windshield repair/replacement is the core service. Insurance claims are common.
  // Mobile service (travel to customer) is standard in this industry.
  // ADAS recalibration after windshield replacement is a growing revenue stream.
  auto_glass: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
          { id: 'insurance', label: 'Insurance Claims', view: 'table' },
        ],
      },
      {
        id: 'tab_3', label: 'Work Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Work Orders', view: 'pipeline', _locked: true,
            stages: ['Quote Requested', 'Quote Sent', 'Approved', 'Glass Ordered', 'Scheduled', 'In Progress', 'ADAS Calibration', 'Complete'] },
          { id: 'estimates', label: 'Quotes', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Inventory', icon: 'box',
        components: [
          { id: 'glass_inventory', label: 'Glass Inventory', view: 'table' },
          { id: 'packages', label: 'Service Menu', view: 'cards' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Installers', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'insurance_payments', label: 'Insurance Payments', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── TRANSMISSION SHOP ───────────────────────────────────────────────
  // Specialty shop — longer repair cycles (2-5 days for rebuild).
  // Diagnosis is critical (transmission diagnostics are complex).
  // Rebuilds vs replacements — estimate approval is a big decision for the customer.
  transmission_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_3', label: 'Work Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Repair Orders', view: 'pipeline', _locked: true,
            stages: ['Diagnosis Scheduled', 'Vehicle In', 'Diagnostic Testing', 'Estimate Prepared', 'Estimate Sent', 'Approved', 'Teardown', 'Parts Ordered', 'Rebuild / Install', 'Testing', 'Quality Check', 'Ready'] },
          { id: 'estimates', label: 'Estimates', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Services & Parts', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'parts', label: 'Transmission Parts', view: 'table' },
          { id: 'cores', label: 'Core Inventory', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Transmission Techs', view: 'cards' },
        ],
      },
      {
        id: 'tab_7', label: 'Payments', icon: 'dollar',
        components: [
          { id: 'invoices', label: 'Invoices', view: 'table', _locked: true },
          { id: 'warranties', label: 'Warranty Claims', view: 'table' },
          { id: 'expenses', label: 'Expenses', view: 'table' },
        ],
      },
    ],
  },

  // ── MUFFLER / EXHAUST SHOP ──────────────────────────────────────────
  // Specialty shop — exhaust, mufflers, catalytic converters, custom exhaust.
  // Walk-in heavy. Quick diagnosis (listen to the car). Simpler workflow.
  // Custom exhaust work is a premium service with longer timelines.
  muffler_shop: {
    tabs: [
      {
        id: 'tab_1', label: 'Dashboard', icon: 'home',
        components: [],
      },
      {
        id: 'tab_2', label: 'Customers', icon: 'people',
        components: [
          { id: 'clients', label: 'Customers', view: 'table', _locked: true },
          { id: 'vehicles', label: 'Vehicles', view: 'table', _locked: true },
        ],
      },
      {
        id: 'tab_3', label: 'Work Orders', icon: 'list',
        components: [
          { id: 'work_orders', label: 'Work Orders', view: 'pipeline', _locked: true,
            stages: ['Walk-in / Appt', 'Inspection', 'Quote Given', 'Approved', 'Parts Sourced', 'In Progress', 'Test & QC', 'Ready'] },
          { id: 'estimates', label: 'Quotes', view: 'pipeline', _locked: true,
            stages: ['Draft', 'Sent', 'Approved', 'Declined'] },
        ],
      },
      {
        id: 'tab_4', label: 'Schedule', icon: 'calendar',
        components: [
          { id: 'calendar', label: 'Appointments', view: 'calendar', _locked: true },
        ],
      },
      {
        id: 'tab_5', label: 'Parts & Services', icon: 'box',
        components: [
          { id: 'packages', label: 'Service Menu', view: 'cards' },
          { id: 'custom_exhaust', label: 'Custom Exhaust', view: 'cards' },
          { id: 'parts', label: 'Parts Inventory', view: 'table' },
        ],
      },
      {
        id: 'tab_6', label: 'Technicians', icon: 'users', _removable: true,
        components: [
          { id: 'staff', label: 'Exhaust Techs', view: 'cards' },
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

// Generic aliases — clone a sensible default
TEMPLATES.mechanic = structuredClone(TEMPLATES.auto_repair);
TEMPLATES.auto_body = structuredClone(TEMPLATES.body_shop);
TEMPLATES.automotive = structuredClone(TEMPLATES.auto_repair);

// ── Public API ────────────────────────────────────────────────────────

/**
 * Get the full template config for an Automotive business type.
 * Returns { template, lockedIds } or null if not found.
 */
export function getAutomotiveTemplate(businessType: string): TemplateResult | null {
  if (!AUTOMOTIVE_TYPES.has(businessType)) return null;

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
  const result = getAutomotiveTemplate(businessType);
  if (!result) return null;
  return JSON.stringify(result.template, null, 2);
}
