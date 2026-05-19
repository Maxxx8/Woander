import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAccessibility } from '../components/AccessibilityProvider';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  animation?: gsap.core.Timeline | gsap.core.Tween;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export const useScrollAnimation = (options: ScrollAnimationOptions) => {
  const { enableAnimations } = useAccessibility();
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!enableAnimations) return;

    const {
      trigger,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      pin = false,
      markers = false,
      animation,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
    } = options;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger,
      start,
      end,
      scrub,
      pin,
      markers,
      animation,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [enableAnimations, options]);

  return scrollTriggerRef;
};

export const useFadeInScroll = (elementRef: React.RefObject<HTMLElement>) => {
  const { enableAnimations } = useAccessibility();

  useEffect(() => {
    if (!enableAnimations || !elementRef.current) return;

    const element = elementRef.current;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'top 60%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === element) {
          st.kill();
        }
      });
    };
  }, [elementRef, enableAnimations]);
};

export const useParallaxScroll = (
  elementRef: React.RefObject<HTMLElement>,
  yPercent: number = -30
) => {
  const { enableAnimations } = useAccessibility();

  useEffect(() => {
    if (!enableAnimations || !elementRef.current) return;

    const element = elementRef.current;

    gsap.to(element, {
      yPercent,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === element) {
          st.kill();
        }
      });
    };
  }, [elementRef, yPercent, enableAnimations]);
};

export const useScaleInScroll = (elementRef: React.RefObject<HTMLElement>) => {
  const { enableAnimations } = useAccessibility();

  useEffect(() => {
    if (!enableAnimations || !elementRef.current) return;

    const element = elementRef.current;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === element) {
          st.kill();
        }
      });
    };
  }, [elementRef, enableAnimations]);
};

export const useStaggerScroll = (
  containerRef: React.RefObject<HTMLElement>,
  childSelector: string = '> *'
) => {
  const { enableAnimations } = useAccessibility();

  useEffect(() => {
    if (!enableAnimations || !containerRef.current) return;

    const container = containerRef.current;

    gsap.fromTo(
      container.querySelectorAll(childSelector),
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) {
          st.kill();
        }
      });
    };
  }, [containerRef, childSelector, enableAnimations]);
};
