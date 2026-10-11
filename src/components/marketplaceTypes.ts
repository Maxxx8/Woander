export interface MarketplacePackage {
  id: string;
  guide_id: string;
  title: string;
  description: string;
  tour_type: string;
  duration_hours: number;
  duration_days: number | null;
  price_per_person: number;
  currency: string;
  max_group_size: number;
  min_group_size: number;
  difficulty_level: string;
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
  rate_type: string;
  hourly_rate: number | null;
  daily_rate: number | null;
  package_status: string;
  booking_type: string;
  destination: string | null;
  departure_dates: string[] | null;
  accommodation_type: string | null;
  transport_type: string | null;
  meals_included: string[];
  equipment_included: string[];
  guide_included: boolean;
  operator_name: string | null;
  operator_instagram: string | null;
  operator_website: string | null;
  operator_phone: string | null;
  operator_email: string | null;
  is_operator_verified: boolean;
  itinerary: ItineraryDay[];
  pricing_notes: string | null;
  review_count: number;
  average_rating: number;
}

export interface ItineraryDay {
  day?: number;
  title?: string;
  description?: string;
}

export interface OperatorProfile {
  id: string;
  full_name: string;
  bio: string;
  profile_image: string | null;
  verification_badges: string[];
  average_rating: number;
  total_reviews: number;
  years_experience: number;
  location_city: string;
  location_state: string;
  is_operator_verified: boolean;
}

export interface TourReview {
  id: string;
  tour_id: string;
  user_id: string;
  overall_rating: number;
  review_text: string;
  is_verified_booking: boolean;
  created_at: string;
}

export const TOUR_TYPE_LABELS: Record<string, string> = {
  cultural: 'Cultural',
  adventure: 'Adventure',
  food: 'Food & Cuisine',
  history: 'Historical',
  nature: 'Nature & Wildlife',
  photography: 'Photography',
  walking: 'Walking & Hiking',
  cycling: 'Cycling',
  wildlife: 'Wildlife Safari',
  spiritual: 'Spiritual & Wellness',
  trek: 'Trekking',
  beach: 'Beach & Coastal',
  mountain: 'Mountain',
  forest: 'Forest',
  other: 'Other',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
  expert: 'Expert',
};

export const BOOKING_TYPE_LABELS: Record<string, string> = {
  instant: 'Instant Booking',
  enquiry: 'Request to Book',
};

export const ACCOMMODATION_OPTIONS = [
  'Hotel', 'Homestay', 'Guest House', 'Camp', 'Hostel', 'Resort', 'Mixed', 'None',
];

export const TRANSPORT_OPTIONS = [
  'Private Vehicle', 'Shared Vehicle', 'Public Transport', 'Train', 'Flight', 'Boat', 'None',
];

export const MEAL_OPTIONS = [
  'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'All Meals',
];

export const EQUIPMENT_OPTIONS = [
  'Trekking Poles', 'Sleeping Bag', 'Tent', 'Safety Gear', 'First Aid Kit', 'Water Bottle', 'Headlamp',
];

export function formatPrice(price: number, currency: string): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency + ' ';
  const formatted = price >= 1000
    ? price.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${symbol}${formatted}`;
}

export function formatDuration(pkg: { duration_hours: number; duration_days: number | null }): string {
  if (pkg.duration_days && pkg.duration_days > 0) {
    return `${pkg.duration_days} day${pkg.duration_days > 1 ? 's' : ''}`;
  }
  if (pkg.duration_hours >= 24) {
    const days = Math.floor(pkg.duration_hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (pkg.duration_hours >= 1) {
    return `${Math.round(pkg.duration_hours)} hour${pkg.duration_hours > 1 ? 's' : ''}`;
  }
  return '—';
}

export function getLocationString(pkg: { destination: string | null; location_city: string; location_state: string }): string {
  if (pkg.destination) return pkg.destination;
  const parts = [pkg.location_city, pkg.location_state].filter(Boolean);
  return parts.join(', ') || '—';
}
