import React, { useState, useEffect } from 'react';
import { Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import BackgroundMedia from './BackgroundMedia';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuth } from '../shared/AuthContext';
import { QuotesService } from '../services/quotesService';
import { MediaService } from '../services/mediaService';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  mood: string;
  background_media_id?: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail_url?: string;
}

interface EnhancedQuoteSectionProps {
  quotes?: Quote[];
  autoRotate?: boolean;
  rotateInterval?: number;
  showControls?: boolean;
  enableFavorites?: boolean;
}

const EnhancedQuoteSection: React.FC<EnhancedQuoteSectionProps> = ({
  quotes: initialQuotes,
  autoRotate = true,
  rotateInterval = 10000,
  showControls = true,
  enableFavorites = true
}) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { elementRef, isVisible } = useScrollReveal();
  const { user } = useAuth();

  useEffect(() => {
    const loadQuotes = async () => {
      if (initialQuotes && initialQuotes.length > 0) {
        setQuotes(initialQuotes);
      } else {
        const fetchedQuotes = await QuotesService.getRandomQuotes(5);
        setQuotes(fetchedQuotes);
      }
    };

    loadQuotes();
  }, [initialQuotes]);

  useEffect(() => {
    const loadMedia = async () => {
      if (quotes[currentIndex]) {
        const currentQuote = quotes[currentIndex];

        if (currentQuote.background_media_id) {
          const { data } = await MediaService.getRandomMedia('image', undefined, 1);
          if (data && data[0]) {
            setMedia(data[0]);
          }
        } else {
          const randomMedia = await MediaService.getRandomMedia(undefined, currentQuote.category, 1);
          if (randomMedia && randomMedia[0]) {
            setMedia(randomMedia[0]);
          }
        }

        if (currentQuote.id) {
          await QuotesService.incrementQuoteUsage(currentQuote.id);
        }
      }
    };

    loadMedia();
  }, [currentIndex, quotes]);

  useEffect(() => {
    if (!autoRotate || quotes.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, currentIndex, quotes.length]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleFavorite = async () => {
    if (!user || !quotes[currentIndex]?.id) return;

    if (isFavorite) {
      await QuotesService.removeFavoriteQuote(user.id, quotes[currentIndex].id);
      setIsFavorite(false);
    } else {
      await QuotesService.addFavoriteQuote(user.id, quotes[currentIndex].id);
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    const currentQuote = quotes[currentIndex];
    if (!currentQuote) return;

    const shareText = `"${currentQuote.text}" - ${currentQuote.author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Quote copied to clipboard!');
    }
  };

  if (!quotes || quotes.length === 0) return null;

  const currentQuote = quotes[currentIndex];
  if (!currentQuote) return null;

  return (
    <section
      ref={elementRef as React.RefObject<HTMLElement>}
      className="relative py-32 md:py-40 overflow-hidden"
    >
      {media && (
        <BackgroundMedia
          url={media.url}
          type={media.type}
          thumbnailUrl={media.thumbnail_url}
          alt={`${currentQuote.author} quote background`}
          overlay={true}
          overlayOpacity={0.6}
          kenBurns={media.type === 'image'}
        />
      )}

      <div className={`relative z-10 max-w-5xl mx-auto px-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="glassmorphism-dark rounded-3xl p-8 md:p-12 backdrop-blur-xl">
          <div className="mb-2">
            <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium">
              {currentQuote.category}
            </span>
          </div>

          <blockquote className="text-2xl md:text-4xl lg:text-5xl text-white font-light leading-relaxed mb-8 animate-text-reveal">
            <span className="block mb-2 text-4xl md:text-6xl text-white/30">"</span>
            {currentQuote.text}
            <span className="inline-block ml-2 text-4xl md:text-6xl text-white/30">"</span>
          </blockquote>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <cite className="text-xl md:text-2xl text-orange-300 italic not-italic font-medium">
              — {currentQuote.author}
            </cite>

            <div className="flex items-center gap-3">
              {enableFavorites && user && (
                <button
                  onClick={handleFavorite}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  aria-label="Favorite quote"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-110"
                aria-label="Share quote"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showControls && quotes.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous quote"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-2">
                {quotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true);
                        setCurrentIndex(index);
                        setTimeout(() => setIsAnimating(false), 600);
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to quote ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next quote"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            {currentQuote.mood && (
              <span className="capitalize">{currentQuote.mood} • </span>
            )}
            Quote {currentIndex + 1} of {quotes.length}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};

export default EnhancedQuoteSection;
