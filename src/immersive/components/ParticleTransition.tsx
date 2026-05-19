import React, { useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import gsap from 'gsap';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface ParticleTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
  particleCount?: number;
  colors?: string[];
  duration?: number;
}

export const ParticleTransition: React.FC<ParticleTransitionProps> = ({
  isActive,
  onComplete,
  particleCount = 100,
  colors = ['#06D6A0', '#118AB2', '#073B4C', '#EF476F'],
  duration = 1000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { enableAnimations } = useAccessibility();

  useEffect(() => {
    if (!isActive || !enableAnimations || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2;

      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      };
    });

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha = 1 - progress;

        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, enableAnimations, particleCount, colors, duration, onComplete]);

  if (!isActive || !enableAnimations) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};

interface ImageParticleDissolveProps {
  imageUrl: string;
  isDissolving: boolean;
  onComplete?: () => void;
  particleDensity?: number;
}

export const ImageParticleDissolve: React.FC<ImageParticleDissolveProps> = ({
  imageUrl,
  isDissolving,
  onComplete,
  particleDensity = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enableAnimations } = useAccessibility();

  useEffect(() => {
    if (!isDissolving || !enableAnimations || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
        alpha: number;
      }> = [];

      for (let y = 0; y < canvas.height; y += particleDensity) {
        for (let x = 0; x < canvas.width; x += particleDensity) {
          const index = (y * canvas.width + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const a = imageData.data[index + 3];

          if (a > 128) {
            particles.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * -5 - 2,
              color: `rgb(${r},${g},${b})`,
              alpha: 1,
            });
          }
        }
      }

      const startTime = Date.now();
      const duration = 2000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.3;
          particle.alpha = 1 - progress;

          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particleDensity, particleDensity);
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    };

    img.src = imageUrl;
  }, [isDissolving, imageUrl, enableAnimations, particleDensity, onComplete]);

  if (!isDissolving || !enableAnimations) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
