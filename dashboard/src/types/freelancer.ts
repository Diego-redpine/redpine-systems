export interface FreelancerProfile {
  id: string;
  user_id: string;
  display_name: string;
  tagline: string;
  bio: string;
  avatar_url: string;
  hourly_rate_cents: number;
  category: string;
  skills: string[];
  portfolio: { title: string; image_url: string; description: string }[];
  location: string;
  languages: string[];
  response_time_hours: number;
  rating_avg: number;
  rating_count: number;
  total_orders: number;
  total_earnings_cents: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  stripe_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  name: string;
  price_cents: number;
  delivery_days: number;
  description: string;
  revisions: number;
  features: string[];
}

export interface Gig {
  id: string;
  freelancer_id: string;
  freelancer?: FreelancerProfile;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  pricing_tiers: {
    basic: PricingTier;
    standard: PricingTier;
    premium: PricingTier;
  };
  images: string[];
  tags: string[];
  is_active: boolean;
  order_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'active'
  | 'in_progress'
  | 'delivered'
  | 'revision'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Order {
  id: string;
  buyer_id: string;
  freelancer_id: string;
  gig_id: string;
  gig?: Gig;
  freelancer?: FreelancerProfile;
  tier: 'basic' | 'standard' | 'premium';
  requirements: string;
  total_cents: number;
  platform_fee_cents: number;
  freelancer_payout_cents: number;
  status: OrderStatus;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  delivered_at?: string;
  completed_at?: string;
  revision_count: number;
  max_revisions: number;
  created_at: string;
  updated_at: string;
}

export interface OrderMilestone {
  id: string;
  order_id: string;
  title: string;
  description: string;
  amount_cents: number;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved';
  submitted_at?: string;
  approved_at?: string;
  sort_order: number;
}

export interface FreelancerReview {
  id: string;
  order_id: string;
  reviewer_id: string;
  freelancer_id: string;
  gig_id: string;
  rating: number;
  review: string;
  created_at: string;
}

export interface FreelancerMessage {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
