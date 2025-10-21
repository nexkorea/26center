import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
};

export type MoveInCard = {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  floor_number: string;
  room_number: string;
  move_in_date: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  employee_count: number;
  parking_needed: boolean;
  parking_count: number;
  special_requests?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_important: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
  };
};

export type Complaint = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  admin_id?: string;
  response_date?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
  };
  admin_profiles?: {
    name: string;
    email: string;
  };
};