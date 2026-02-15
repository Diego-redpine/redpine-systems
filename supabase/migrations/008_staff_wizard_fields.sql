-- Migration 008: Staff Wizard Fields
-- Adds work model, pay structure, and availability to staff table
-- Adds staff_id FK to invoices for attribution

ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS staff_model TEXT CHECK (staff_model IN ('independent', 'employee', 'instructor')),
  ADD COLUMN IF NOT EXISTS pay_type TEXT CHECK (pay_type IN ('commission', 'booth_rental', 'hourly', 'salary', 'per_class')),
  ADD COLUMN IF NOT EXISTS pay_rate_cents INTEGER,
  ADD COLUMN IF NOT EXISTS commission_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';

-- Payment attribution: link invoices to specific staff members
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id);

-- Index for staff lookups by model
CREATE INDEX IF NOT EXISTS idx_staff_model ON public.staff(staff_model);
