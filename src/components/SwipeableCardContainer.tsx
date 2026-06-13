import React, { useState, useEffect, Children, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery';

interface SwipeableCardContainerProps {
  children: React.ReactNode;
  showDots?: boolean;
  showArrows?: boolean;
  mobileCards?: number;
  tabletCards?: number;
  desktopCards?: number;
  gap?: number;
  className?: string;
}

const SwipeableCardContainer: React.FC<SwipeableCardContainerProps> = ({
  children,
  showDots = true,
  showArrows = true,
  mobileCards = 1,
  tabletCards = 2,
  desktopCards = 3,
  gap = 16,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const childrenArray = Children.toArray(children);
  const totalCards = childrenArray.length;

  // Determine cards per view based on breakpoint
  const cardsPerView = isMobile ? mobileCards : isTablet ? tabletCards : desktopCards;
  const maxIndex = Math.max(0, totalCards - cardsPerView);
  const showSwipe = isMobile || isTablet;

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const {
    currentOffset,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  } = useSwipeGesture({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
    minSwipeDistance: 50
  });

  // Reset index if it exceeds bounds after resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  // Calculate transform based on current index and offset
  const getTransform = () => {
    if (!containerRef.current) return 'translateX(0)';

    const containerWidth = containerRef.current.offsetWidth;
    const cardWidth = (containerWidth + gap) / cardsPerView;
    const baseTranslate = -(currentIndex * cardWidth);
    const dragOffset = isDragging ? currentOffset : 0;

    return `translateX(${baseTranslate + dragOffset}px)`;
  };

  // Desktop grid layout (no swipe)
  if (!showSwipe) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${desktopCards} gap-${gap / 4} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Arrows */}
      {showArrows && totalCards > cardsPerView && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-forest-900/90 border border-forest-700 p-2 transition-all ${
              currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:border-gold-400/40'
            }`}
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5 text-mist-400" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-forest-900/90 border border-forest-700 p-2 transition-all ${
              currentIndex >= maxIndex ? 'opacity-20 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:border-gold-400/40'
            }`}
            aria-label="Next card"
          >
            <ChevronRight className="w-5 h-5 text-mist-400" />
          </button>
        </>
      )}

      {/* Swipeable Container */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: getTransform(),
            gap: `${gap}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `calc((100% - ${gap * (cardsPerView - 1)}px) / ${cardsPerView})`
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {showDots && totalCards > cardsPerView && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-none ${
                index === currentIndex
                  ? 'w-8 h-px bg-gold-400'
                  : 'w-2 h-px bg-forest-700 hover:bg-mist-600'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint (mobile only, shows briefly) */}
      {isMobile && currentIndex === 0 && totalCards > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-forest-950/80 border border-forest-700 text-mist-500 font-jetbrains text-[10px] px-4 py-2 tracking-widest uppercase">
          ← Swipe to explore →
        </div>
      )}
    </div>
  );
};

export default SwipeableCardContainer;
