/**
 * Davsplace Studio Database Types
 */

export type Role = 'user' | 'admin';
export type LocationType = 'online' | 'offline' | 'hybrid';
export type MediaType = 'image' | 'youtube' | 'video';
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'review' | 'revision' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'artikel' | 'layanan' | 'portofolio' | 'event';
  description: string | null;
  icon: string | null;
  color: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  author_id: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  cta_label: string | null;
  cta_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  cover_image: string | null;
  price_start: number;
  price_type: 'fixed' | 'range' | 'custom';
  duration_estimate: string | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  whatsapp_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  service_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_company: string | null;
  notes: string | null;
  brief_content: any;
  status: OrderStatus;
  priority: Priority;
  price_quoted: number | null;
  price_final: number | null;
  payment_status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
  deadline_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
