import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export interface Adventure {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  adventure_id: string;
  day_number: number;
  title: string;
  description: string;
  accommodation: string;
  accommodation_cost: number;
  activities_cost: number;
  meals_cost: number;
  transport_cost: number;
  notes: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string;
  avatar_url: string | null;
  location: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserContributions {
  id: string;
  user_id: string;
  gems_discovered: number;
  gems_verified: number;
  total_votes_received: number;
  explorer_level: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface TourGuide {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  profile_image: string | null;
  cover_image: string | null;
  languages: string[];
  specialties: string[];
  years_experience: number;
  certifications: any[];
  location_city: string;
  location_state: string;
  location_country: string;
  phone: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verification_badges: string[];
  average_rating: number;
  total_reviews: number;
  total_tours_completed: number;
  response_time_hours: number;
  approval_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  archetype?: never;
  hidden_gems_count?: number;
  field_notes_count?: number;
  hosted_gems?: string[];
  sample_field_notes?: string[];
}

export interface Tour {
  id: string;
  guide_id: string;
  title: string;
  description: string;
  tour_type: 'cultural' | 'adventure' | 'food' | 'history' | 'nature' | 'photography' | 'walking' | 'cycling' | 'wildlife' | 'spiritual' | 'other';
  duration_hours: number;
  price_per_person: number;
  currency: string;
  max_group_size: number;
  min_group_size: number;
  difficulty_level: 'easy' | 'moderate' | 'challenging' | 'expert';
  meeting_point: string;
  ending_point: string;
  included_items: string[];
  excluded_items: string[];
  requirements: string[];
  cancellation_policy: string;
  featured_image: string | null;
  gallery_images: string[];
  location_city: string;
  location_state: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourBooking {
  id: string;
  tour_id: string;
  guide_id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  number_of_people: number;
  total_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  special_requests: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  confirmation_code: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface TourReview {
  id: string;
  booking_id: string;
  tour_id: string;
  guide_id: string;
  user_id: string;
  overall_rating: number;
  knowledge_rating: number;
  communication_rating: number;
  professionalism_rating: number;
  value_rating: number;
  review_text: string;
  review_images: string[];
  is_verified_booking: boolean;
  helpful_count: number;
  guide_response: string | null;
  guide_response_at: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourGuideAvailability {
  id: string;
  guide_id: string;
  date: string;
  is_available: boolean;
  notes: string;
  created_at: string;
}
