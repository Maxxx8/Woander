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

  const cardsPerView = isMobile ? mobileCards : isTablet ? tabletCards : desktopCards; const maxIndex = Math.max(0, totalCards - cardsPerView);
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

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

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
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${desktopCards} gap-6 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Arrows - Hidden on mobile */}
      {showArrows && !isMobile && totalCards > cardsPerView && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-forest-900/90 backdrop-blur-sm p-2.5 transition-all duration-300 ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-forest-800'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-mist-300" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-forest-900/90 backdrop-blur-sm p-2.5 transition-all duration-300 ${
              currentIndex >= maxIndex ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-forest-800'
            }`}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-mist-300" />
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
          className="flex"
          style={{
            transform: getTransform(),
            gap: `${gap}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            willChange: isDragging ? 'transform' : 'auto',
            transition: isDragging ? 'none' : 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
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
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-500 ${
                index === currentIndex
                  ? 'w-8 h-1 bg-gold-500/70'
                  : 'w-1 h-1 bg-mist-600/40 hover:bg-mist-500/60'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint (mobile only) */}
      {isMobile && currentIndex === 0 && totalCards > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-forest-900/80 backdrop-blur-sm border border-gold-500/10 text-mist-400 text-xs px-4 py-2 tracking-wider uppercase">
          Swipe to explore
        </div>
      )}
    </div>
  );
};

export default SwipeableCardContainer;
