import { supabase } from '../shared/supabase';
import { expandedQuotes } from '../data/expandedQuotes';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  tags: string[];
  background_media_id?: string;
  mood: string;
  usage_count: number;
  favorite_count: number;
}

export class QuotesService {
  static async seedQuotesToDatabase(): Promise<void> {
    for (const quote of expandedQuotes) {
      try {
        const { error } = await supabase
          .from('quotes_library')
          .upsert({
            text: quote.text,
            author: quote.author,
            category: quote.category,
            tags: quote.tags,
            mood: quote.mood,
            source: 'curated',
            is_verified: true,
            is_active: true,
          }, {
            onConflict: 'text',
            ignoreDuplicates: true,
          });

        if (error) {
          console.error('Error seeding quote:', error);
        }
      } catch (error) {
        console.error('Error in seedQuotesToDatabase:', error);
      }
    }
  }

  static async getRandomQuotes(count: number = 3, category?: string): Promise<Quote[]> {
    let query = supabase
      .from('quotes_library')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(count * 5);

    if (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }

    const shuffled = data?.sort(() => Math.random() - 0.5) || [];
    return shuffled.slice(0, count);
  }

  static async getQuotesByCategory(category: string, limit: number = 10): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes_library')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching quotes by category:', error);
      return [];
    }

    return data || [];
  }

  static async getQuotesByMood(mood: string, limit: number = 10): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes_library')
      .select('*')
      .eq('mood', mood)
      .eq('is_active', true)
      .order('favorite_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching quotes by mood:', error);
      return [];
    }

    return data || [];
  }

  static async searchQuotes(searchTerm: string, limit: number = 10): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes_library')
      .select('*')
      .or(`text.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.error('Error searching quotes:', error);
      return [];
    }

    return data || [];
  }

  static async incrementQuoteUsage(quoteId: string): Promise<void> {
    try {
      await supabase.rpc('increment_quote_usage', { quote_id: quoteId });
    } catch (error) {
      console.error('Error incrementing quote usage:', error);
    }
  }

  static async getUserFavoriteQuotes(userId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('user_favorite_quotes')
      .select(`
        quote_id,
        quotes_library (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorite quotes:', error);
      return [];
    }

    return data?.map((item: any) => item.quotes_library).filter(Boolean) || [];
  }

  static async addFavoriteQuote(userId: string, quoteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_favorite_quotes')
      .insert({
        user_id: userId,
        quote_id: quoteId,
      });

    if (error) {
      console.error('Error adding favorite quote:', error);
      return false;
    }

    await supabase
      .from('quotes_library')
      .update({ favorite_count: supabase.rpc('increment', { x: 1 }) })
      .eq('id', quoteId);

    return true;
  }

  static async removeFavoriteQuote(userId: string, quoteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_favorite_quotes')
      .delete()
      .eq('user_id', userId)
      .eq('quote_id', quoteId);

    if (error) {
      console.error('Error removing favorite quote:', error);
      return false;
    }

    return true;
  }

  static async pairQuotesWithMedia(): Promise<void> {
    const { data: quotes } = await supabase
      .from('quotes_library')
      .select('id, category, tags')
      .is('background_media_id', null)
      .limit(50);

    if (!quotes) return;

    for (const quote of quotes) {
      const categoryKeywords = quote.category?.split('-').join(' ') || 'travel';

      const { data: media } = await supabase
        .from('media_library')
        .select('id')
        .eq('type', 'image')
        .contains('keywords', [categoryKeywords])
        .limit(1)
        .maybeSingle();

      if (media) {
        await supabase
          .from('quotes_library')
          .update({ background_media_id: media.id })
          .eq('id', quote.id);
      }
    }
  }

  static async getQuoteWithMedia(quoteId: string) {
    const { data, error } = await supabase
      .from('quotes_library')
      .select(`
        *,
        media_library (*)
      `)
      .eq('id', quoteId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching quote with media:', error);
      return null;
    }

    return data;
  }
}
