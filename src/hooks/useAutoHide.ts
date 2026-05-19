import { useState, useEffect } from 'react';

export const useAutoHide = (delay: number = 3000) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY < 100) {
            setIsVisible(true);
          } else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY + 10) {
            setIsVisible(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      const windowHeight = window.innerHeight;
      const isTopArea = e.clientY < 100;
      const isBottomArea = e.clientY > windowHeight - 100;

      if (isTopArea || isBottomArea) {
        setIsVisible(true);
        const timeout = setTimeout(() => {
          if (window.scrollY >= 100) {
            setIsVisible(false);
          }
        }, delay);
        setHideTimeout(timeout);
      }
    };

    const handleTouch = () => {
      setIsVisible(true);

      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      const timeout = setTimeout(() => {
        if (window.scrollY >= 100) {
          setIsVisible(false);
        }
      }, delay);
      setHideTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouch);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [lastScrollY, delay, hideTimeout]);

  return isVisible;
};
