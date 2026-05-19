import { supabase } from '../shared/supabase';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
  };
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  user: {
    name: string;
    url: string;
  };
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface MediaItem {
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  source: 'pexels' | 'unsplash';
  sourceId: string;
  keywords: string[];
  category: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
}

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const TRAVEL_KEYWORDS = [
  'mountain landscape travel',
  'ocean beach sunset',
  'forest nature hiking',
  'desert adventure landscape',
  'city skyline night',
  'tropical paradise beach',
  'ancient temple architecture',
  'waterfall nature landscape',
  'northern lights aurora',
  'canyon rock formation',
  'snow mountain peak',
  'tropical island aerial',
  'sunset landscape scenic',
  'adventure cliff hiking',
  'cultural festival celebration',
  'street market travel',
  'lighthouse ocean coast',
  'bridge architecture travel',
  'countryside rural landscape',
  'volcano nature landscape'
];

export class MediaService {
  private static async fetchFromPexelsPhotos(query: string, perPage: number = 15): Promise<MediaItem[]> {
    if (!PEXELS_API_KEY) {
      console.warn('Pexels API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) throw new Error('Pexels API request failed');

      const data = await response.json();
      return data.photos.map((photo: PexelsPhoto) => ({
        url: photo.src.large2x,
        type: 'image' as const,
        source: 'pexels' as const,
        sourceId: photo.id.toString(),
        keywords: query.split(' '),
        category: this.categorizeKeywords(query),
        width: photo.width,
        height: photo.height,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
      }));
    } catch (error) {
      console.error('Error fetching from Pexels Photos:', error);
      return [];
    }
  }

  private static async fetchFromPexelsVideos(query: string, perPage: number = 10): Promise<MediaItem[]> {
    if (!PEXELS_API_KEY) {
      console.warn('Pexels API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (!response.ok) throw new Error('Pexels Videos API request failed');

      const data = await response.json();
      return data.videos.map((video: PexelsVideo) => {
        const hdFile = video.video_files.find(f => f.quality === 'hd' && f.width <= 1920) || video.video_files[0];
        return {
          url: hdFile.link,
          thumbnailUrl: video.image,
          type: 'video' as const,
          source: 'pexels' as const,
          sourceId: video.id.toString(),
          keywords: query.split(' '),
          category: this.categorizeKeywords(query),
          width: video.width,
          height: video.height,
          photographer: video.user.name,
          photographerUrl: video.user.url,
        };
      });
    } catch (error) {
      console.error('Error fetching from Pexels Videos:', error);
      return [];
    }
  }

  private static async fetchFromUnsplash(query: string, perPage: number = 15): Promise<MediaItem[]> {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Unsplash API request failed');

      const data = await response.json();
      return data.results.map((photo: UnsplashPhoto) => ({
        url: photo.urls.regular,
        type: 'image' as const,
        source: 'unsplash' as const,
        sourceId: photo.id,
        keywords: query.split(' '),
        category: this.categorizeKeywords(query),
        width: photo.width,
        height: photo.height,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
      }));
    } catch (error) {
      console.error('Error fetching from Unsplash:', error);
      return [];
    }
  }

  private static categorizeKeywords(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('mountain') || lowerQuery.includes('peak') || lowerQuery.includes('hiking')) {
      return 'mountains';
    }
    if (lowerQuery.includes('beach') || lowerQuery.includes('ocean') || lowerQuery.includes('sea')) {
      return 'coastal';
    }
    if (lowerQuery.includes('city') || lowerQuery.includes('urban') || lowerQuery.includes('street')) {
      return 'urban';
    }
    if (lowerQuery.includes('forest') || lowerQuery.includes('jungle') || lowerQuery.includes('tree')) {
      return 'nature';
    }
    if (lowerQuery.includes('desert') || lowerQuery.includes('sand') || lowerQuery.includes('dune')) {
      return 'desert';
    }
    if (lowerQuery.includes('temple') || lowerQuery.includes('culture') || lowerQuery.includes('heritage')) {
      return 'cultural';
    }
    return 'adventure';
  }

  static async fetchAndCacheMedia(keywords: string[] = TRAVEL_KEYWORDS, includeVideos: boolean = true): Promise<void> {
    const allMedia: MediaItem[] = [];

    for (const keyword of keywords.slice(0, 10)) {
      const [pexelsPhotos, unsplashPhotos, pexelsVideos] = await Promise.all([
        this.fetchFromPexelsPhotos(keyword, 5),
        this.fetchFromUnsplash(keyword, 5),
        includeVideos ? this.fetchFromPexelsVideos(keyword, 2) : Promise.resolve([]),
      ]);

      allMedia.push(...pexelsPhotos, ...unsplashPhotos, ...pexelsVideos);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await this.saveMediaToDatabase(allMedia);
  }

  private static async saveMediaToDatabase(mediaItems: MediaItem[]): Promise<void> {
    const uniqueMedia = mediaItems.filter((item, index, self) =>
      index === self.findIndex(t => t.sourceId === item.sourceId && t.source === item.source)
    );

    for (const item of uniqueMedia) {
      try {
        const { error } = await supabase
          .from('media_library')
          .upsert({
            url: item.url,
            thumbnail_url: item.thumbnailUrl,
            type: item.type,
            source: item.source,
            source_id: item.sourceId,
            keywords: item.keywords,
            category: item.category,
            width: item.width,
            height: item.height,
            photographer: item.photographer,
            photographer_url: item.photographerUrl,
          }, {
            onConflict: 'source,source_id',
            ignoreDuplicates: true,
          });

        if (error) {
          console.error('Error saving media:', error);
        }
      } catch (error) {
        console.error('Error in saveMediaToDatabase:', error);
      }
    }
  }

  static async getRandomMedia(type?: 'image' | 'video', category?: string, limit: number = 10) {
    let query = supabase
      .from('media_library')
      .select('*')
      .eq('is_active', true);

    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(limit * 3);

    if (error) {
      console.error('Error fetching media:', error);
      return [];
    }

    const shuffled = data?.sort(() => Math.random() - 0.5) || [];
    return shuffled.slice(0, limit);
  }

  static async incrementMediaUsage(mediaId: string): Promise<void> {
    try {
      await supabase.rpc('increment_media_usage', { media_id: mediaId });
    } catch (error) {
      console.error('Error incrementing media usage:', error);
    }
  }

  static async getMediaByCategory(category: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching media by category:', error);
      return [];
    }

    return data || [];
  }
}
