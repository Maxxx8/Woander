import React, { useRef, useState, useEffect } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import gsap from 'gsap';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngle?: number;
  glareEffect?: boolean;
  scale?: number;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  tiltMaxAngle = 15,
  glareEffect = true,
  scale = 1.05,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { enableAnimations, enable3D } = useAccessibility();

  useEffect(() => {
    if (!cardRef.current || !enableAnimations || !enable3D) return;

    const card = cardRef.current;
    const glare = glareRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -tiltMaxAngle;
      const rotateY = ((x - centerX) / centerX) * tiltMaxAngle;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        scale: scale,
        duration: 0.3,
        ease: 'power2.out',
      });

      if (glare && glareEffect) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        gsap.to(glare, {
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          opacity: 0.4,
          duration: 0.3,
        });
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);

      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      });

      if (glare && glareEffect) {
        gsap.to(glare, {
          opacity: 0,
          duration: 0.3,
        });
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered, enableAnimations, enable3D, tiltMaxAngle, glareEffect, scale]);

  if (!enableAnimations || !enable3D) {
    return (
      <div className={`transform transition-transform hover:scale-105 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px)',
      }}
    >
      {glareEffect && (
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none rounded-inherit z-10"
          style={{
            opacity: 0,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      <div style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
};
