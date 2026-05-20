import { supabase } from '../shared/supabase';
import type { TourGuide, Tour, TourBooking, TourReview } from '../shared/supabase';

export const vanguardService = {
  async getTourGuides(filters?: {
    location?: string;
    specialty?: string;
    minRating?: number;
    language?: string;
  }) {
    let query = supabase
      .from('tour_guides')
      .select('*')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('average_rating', { ascending: false });

    if (filters?.location) {
      query = query.or(`location_city.ilike.%${filters.location}%,location_state.ilike.%${filters.location}%`);
    }

    if (filters?.specialty) {
      query = query.contains('specialties', [filters.specialty]);
    }

    if (filters?.minRating) {
      query = query.gte('average_rating', filters.minRating);
    }

    if (filters?.language) {
      query = query.contains('languages', [filters.language]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as TourGuide[];
  },

  async getTourGuideById(id: string) {
    const { data, error } = await supabase
      .from('tour_guides')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data as TourGuide | null;
  },

  async getTourGuideByUserId(userId: string) {
    const { data, error } = await supabase
      .from('tour_guides')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as TourGuide | null;
  },

  async createTourGuide(guideData: Partial<TourGuide>) {
    const { data, error } = await supabase
      .from('tour_guides')
      .insert([guideData])
      .select()
      .single();

    if (error) throw error;
    return data as TourGuide;
  },

  async updateTourGuide(id: string, updates: Partial<TourGuide>) {
    const { data, error } = await supabase
      .from('tour_guides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TourGuide;
  },

  async getTours(filters?: {
    guideId?: string;
    tourType?: string;
    location?: string;
    maxPrice?: number;
    difficulty?: string;
  }) {
    let query = supabase
      .from('tours')
      .select('*, tour_guides(*)')
      .eq('is_active', true);

    if (filters?.guideId) {
      query = query.eq('guide_id', filters.guideId);
    }

    if (filters?.tourType) {
      query = query.eq('tour_type', filters.tourType);
    }

    if (filters?.location) {
      query = query.or(`location_city.ilike.%${filters.location}%,location_state.ilike.%${filters.location}%`);
    }

    if (filters?.maxPrice) {
      query = query.lte('price_per_person', filters.maxPrice);
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }

    query = query.order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getTourById(id: string) {
    const { data, error } = await supabase
      .from('tours')
      .select('*, tour_guides(*)')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTour(tourData: Partial<Tour>) {
    const { data, error } = await supabase
      .from('tours')
      .insert([tourData])
      .select()
      .single();

    if (error) throw error;
    return data as Tour;
  },

  async updateTour(id: string, updates: Partial<Tour>) {
    const { data, error } = await supabase
      .from('tours')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tour;
  },

  async deleteTour(id: string) {
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createBooking(bookingData: Partial<TourBooking>) {
    const { data, error } = await supabase
      .from('tour_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data as TourBooking;
  },

  async getBookingsByUserId(userId: string) {
    const { data, error } = await supabase
      .from('tour_bookings')
      .select('*, tours(*), tour_guides(*)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBookingsByGuideId(guideId: string) {
    const { data, error } = await supabase
      .from('tour_bookings')
      .select('*, tours(*)')
      .eq('guide_id', guideId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateBookingStatus(bookingId: string, status: TourBooking['status']) {
    const { data, error } = await supabase
      .from('tour_bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data as TourBooking;
  },

  async cancelBooking(bookingId: string, reason: string) {
    const { data, error } = await supabase
      .from('tour_bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data as TourBooking;
  },

  async getReviewsByGuideId(guideId: string) {
    const { data, error } = await supabase
      .from('tour_reviews')
      .select('*, tours(title)')
      .eq('guide_id', guideId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createReview(reviewData: Partial<TourReview>) {
    const { data, error } = await supabase
      .from('tour_reviews')
      .insert([reviewData])
      .select()
      .single();

    if (error) throw error;
    return data as TourReview;
  },

  async updateReview(reviewId: string, updates: Partial<TourReview>) {
    const { data, error } = await supabase
      .from('tour_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data as TourReview;
  },

  async addGuideResponse(reviewId: string, response: string) {
    const { data, error } = await supabase
      .from('tour_reviews')
      .update({
        guide_response: response,
        guide_response_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data as TourReview;
  },

  async checkAvailability(guideId: string, date: string) {
    const { data, error } = await supabase
      .from('tour_guide_availability')
      .select('*')
      .eq('guide_id', guideId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;

    if (!data) return { isAvailable: true };

    return { isAvailable: data.is_available, notes: data.notes };
  },

  async setAvailability(guideId: string, date: string, isAvailable: boolean, notes?: string) {
    const { data, error } = await supabase
      .from('tour_guide_availability')
      .upsert([{
        guide_id: guideId,
        date,
        is_available: isAvailable,
        notes: notes || '',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFeaturedGuides() {
    const { data, error } = await supabase
      .from('tour_guides')
      .select('*')
      .eq('status', 'approved')
      .eq('is_active', true)
      .contains('verification_badges', ['top_rated'])
      .order('average_rating', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data as TourGuide[];
  },

  async searchGuidesAndTours(searchTerm: string) {
    const guidesPromise = supabase
      .from('tour_guides')
      .select('*')
      .eq('status', 'approved')
      .eq('is_active', true)
      .or(`full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,location_city.ilike.%${searchTerm}%`);

    const toursPromise = supabase
      .from('tours')
      .select('*, tour_guides(*)')
      .eq('is_active', true)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_city.ilike.%${searchTerm}%`);

    const [guidesResult, toursResult] = await Promise.all([guidesPromise, toursPromise]);

    return {
      guides: guidesResult.data || [],
      tours: toursResult.data || [],
    };
  },
};
