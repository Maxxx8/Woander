import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import gsap from 'gsap';

interface CursorPosition {
  x: number;
  y: number;
}

export const MagneticCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { enableAnimations, enable3D } = useAccessibility();
  const mousePosition = useRef<CursorPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enableAnimations || !enable3D) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };

      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(cursorDotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      });

      const target = e.target as HTMLElement;
      const isMagnetic = target.closest('[data-magnetic="true"]');

      if (isMagnetic) {
        const rect = isMagnetic.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.3;
        const deltaY = (e.clientY - centerY) * 0.3;

        gsap.to(isMagnetic, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
        });

        setIsHovering(true);
      } else {
        const allMagnetic = document.querySelectorAll('[data-magnetic="true"]');
        allMagnetic.forEach((element) => {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)',
          });
        });

        setIsHovering(false);
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a, button')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, [enableAnimations, enable3D]);

  if (!enableAnimations || !enable3D) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: '40px',
          height: '40px',
          left: '-20px',
          top: '-20px',
          transform: 'translate(0, 0)',
        }}
      >
        <div
          className={`w-full h-full rounded-full border-2 transition-all duration-300 ${
            isHovering
              ? 'border-white scale-150'
              : 'border-white/50 scale-100'
          }`}
        />
      </div>

      <div
        ref={cursorDotRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: '8px',
          height: '8px',
          left: '-4px',
          top: '-4px',
          transform: 'translate(0, 0)',
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-150 ${
            isHovering ? 'bg-white scale-0' : 'bg-white scale-100'
          }`}
        />
      </div>

      <style>{`
        body {
          cursor: none !important;
        }
        a, button, [role="button"] {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

interface MagneticElementProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticElement: React.FC<MagneticElementProps> = ({
  children,
  strength = 0.3,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { enableAnimations, enable3D } = useAccessibility();

  useEffect(() => {
    if (!enableAnimations || !enable3D || !elementRef.current) return;

    const element = elementRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableAnimations, enable3D, strength]);

  return (
    <div
      ref={elementRef}
      className={className}
      data-magnetic="true"
    >
      {children}
    </div>
  );
};
