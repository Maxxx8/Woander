import { useState, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  maxVerticalDistance?: number;
}

interface SwipeGestureReturn {
  touchStart: number | null;
  touchEnd: number | null;
  currentOffset: number;
  isDragging: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  maxVerticalDistance = 100
}: SwipeGestureOptions): SwipeGestureReturn => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startTime = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setIsDragging(true);
    startTime.current = Date.now();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null || touchStartY === null) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const diffX = touchStart - currentX;
    const diffY = Math.abs(touchStartY - currentY);

    // If vertical swipe is too large, ignore horizontal swipe
    if (diffY > maxVerticalDistance) {
      return;
    }

    setTouchEnd(currentX);
    setCurrentOffset(-diffX);
  }, [touchStart, touchStartY, maxVerticalDistance]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setCurrentOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const duration = Date.now() - startTime.current;
    const velocity = Math.abs(distance / duration);

    // Swipe with velocity or sufficient distance
    const isLeftSwipe = distance > minSwipeDistance || (distance > 20 && velocity > 0.5);
    const isRightSwipe = distance < -minSwipeDistance || (distance < -20 && velocity > 0.5);

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    setIsDragging(false);
    setCurrentOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  // Mouse events for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setTouchStartY(e.clientY);
    setIsDragging(true);
    startTime.current = Date.now();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (touchStart === null || touchStartY === null || !isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const diffX = touchStart - currentX;
    const diffY = Math.abs(touchStartY - currentY);

    if (diffY > maxVerticalDistance) {
      return;
    }

    setTouchEnd(currentX);
    setCurrentOffset(-diffX);
  }, [touchStart, touchStartY, isDragging, maxVerticalDistance]);

  const handleMouseUp = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setCurrentOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      setTouchStartY(null);
    }
  }, [isDragging]);

  return {
    touchStart,
    touchEnd,
    currentOffset,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
};
