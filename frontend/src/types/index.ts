// Type definitions based on CONTEXT.md data model

export type UserRole = 'central' | 'delegado' | 'productor';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  province?: string;
  full_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  title: string;
  description?: string;
  long_description?: string;
  province: string;
  city?: string;
  category?: string;
  
  // Pricing
  price?: string;
  price_numeric?: number;
  price_per_person?: number;
  min_group_size?: number;
  max_group_size?: number;
  
  // Ownership
  created_by?: string;
  producer_id?: string;
  delegado_id?: string;
  central_id?: string;
  
  // Status
  status: 'draft' | 'pending' | 'published' | 'archived';
  
  // Media
  main_image?: string;
  images?: string[];
  
  // Additional
  duration?: string;
  language?: string;
  included?: string[];
  requirements?: string;
  cancellation_policy?: string;
  metadata?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  experience_id: string;
  
  // Customer
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  
  // Details
  participants: number;
  booking_date?: string;
  selected_time?: string;
  
  // Pricing
  total_amount: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  
  // Payment
  payment_provider?: string;
  payment_id?: string;
  
  special_requests?: string;
  metadata?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  
  // Relations (optional)
  experience?: Experience;
}

export interface Review {
  id: string;
  experience_id: string;
  user_id: string | null;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: 'stripe' | 'paypal' | 'cash' | 'transfer';
  provider_payment_id?: string;
  provider_metadata?: Record<string, any>;
  created_at: string;
}

export interface CommissionRule {
  id: string;
  scope: 'global' | 'user' | 'experience';
  user_id?: string;
  experience_id?: string;
  province?: string;
  central_percentage: number;
  delegado_percentage: number;
  productor_percentage: number;
  notes?: string;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTimeline {
  id: string;
  user_id: string;
  type: 'email' | 'whatsapp' | 'internal' | 'approval' | 'commission_change';
  subject?: string;
  content?: string;
  direction?: 'inbound' | 'outbound';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  related_booking_id?: string;
  related_experience_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface MessageThread {
  id: string;
  subject?: string | null;
  created_by: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MessageParticipant {
  thread_id: string;
  user_id: string;
  role?: string | null;
  last_read_at?: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
}
