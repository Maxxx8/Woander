import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface HeadingAnchor {
  element: HTMLElement;
  y: number;
}

interface ScrollLineProps {
  color?: string;
  width?: number;
  glowIntensity?: number;
  headingSelectors?: string[];
}

const ScrollLine: React.FC<ScrollLineProps> = ({
  color = '#3B82F6',
  width = 3,
  glowIntensity = 8,
  headingSelectors = ['h1', 'h2', '.section-title'],
}) => {
  const { progress, velocity } = useScrollProgress();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [headingAnchors, setHeadingAnchors] = useState<HeadingAnchor[]>([]);

  useEffect(() => {
    const updateDimensions = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      setViewportHeight(docHeight);
      setIsMobile(window.innerWidth < 768);

      const anchors: HeadingAnchor[] = [];
      headingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            const rect = el.getBoundingClientRect();
            const y = rect.top + window.scrollY;
            anchors.push({ element: el, y });
          }
        });
      });
      anchors.sort((a, b) => a.y - b.y);
      setHeadingAnchors(anchors);

      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        setPathLength(length);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const observer = new MutationObserver(updateDimensions);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, []);

  const generatePath = () => {
    const height = viewportHeight || 5000;
    const centerX = 50;
    const amplitude = isMobile ? 10 : 20;
    const frequency = isMobile ? 0.002 : 0.0015;
    const twistFactor = isMobile ? 0.8 : 1.2;

    let path = `M ${centerX} 0`;

    const segments = 100;
    for (let i = 1; i <= segments; i++) {
      const y = (height / segments) * i;
      const t = i / segments;

      const sineWave = Math.sin(y * frequency) * amplitude;
      const cosineWave = Math.cos(y * frequency * 1.3) * amplitude * 0.6;
      const twist = Math.sin(t * Math.PI * 4) * amplitude * twistFactor * 0.3;

      let x = centerX + sineWave + cosineWave + twist;

      headingAnchors.forEach(anchor => {
        const anchorT = anchor.y / height;
        const distance = Math.abs(t - anchorT);
        if (distance < 0.08) {
          const influence = 1 - (distance / 0.08);
          const pull = (Math.random() * 10 - 5) * influence;
          x += pull * (isMobile ? 0.5 : 1);
        }
      });

      const prevY = (height / segments) * (i - 1);
      const prevT = (i - 1) / segments;
      const prevSine = Math.sin(prevY * frequency) * amplitude;
      const prevCosine = Math.cos(prevY * frequency * 1.3) * amplitude * 0.6;
      const prevTwist = Math.sin(prevT * Math.PI * 4) * amplitude * twistFactor * 0.3;
      let prevX = centerX + prevSine + prevCosine + prevTwist;

      headingAnchors.forEach(anchor => {
        const anchorT = anchor.y / height;
        const distance = Math.abs(prevT - anchorT);
        if (distance < 0.08) {
          const influence = 1 - (distance / 0.08);
          const pull = (Math.random() * 10 - 5) * influence;
          prevX += pull * (isMobile ? 0.5 : 1);
        }
      });

      const cp1Y = prevY + (y - prevY) * 0.33;
      const cp2Y = prevY + (y - prevY) * 0.66;
      const cp1X = prevX + (x - prevX) * 0.33 + Math.sin(i * 0.3) * 2;
      const cp2X = prevX + (x - prevX) * 0.66 + Math.cos(i * 0.3) * 2;

      path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y}`;
    }

    return path;
  };

  const drawLength = pathLength * progress;
  const velocityScale = Math.min(Math.abs(velocity) * 2, 1);
  const dynamicGlow = glowIntensity * (1 + velocityScale);
  const effectiveWidth = isMobile ? width * 0.7 : width;

  if (isMobile && window.innerWidth < 640) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 w-full pointer-events-none z-20" style={{ height: viewportHeight }}>
      <svg
        ref={svgRef}
        className="absolute left-0 top-0 w-full h-full"
        style={{ height: viewportHeight }}
        viewBox={`0 0 100 ${viewportHeight}`}
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset={`${progress * 100}%`} stopColor={color} stopOpacity="1" />
            <stop offset={`${Math.min(progress * 100 + 5, 100)}%`} stopColor={color} stopOpacity="0.3" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation={dynamicGlow} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="softBlur" />
            <feMerge>
              <feMergeNode in="softBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={generatePath()}
          fill="none"
          stroke={color}
          strokeWidth={effectiveWidth * 0.5}
          strokeOpacity="0.2"
          filter="url(#softGlow)"
        />

        <path
          ref={pathRef}
          d={generatePath()}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth={effectiveWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - drawLength}
          style={{
            transition: 'stroke-dashoffset 0.1s ease-out',
          }}
        />

        {headingAnchors.map((anchor, index) => {
          const anchorY = anchor.y;
          const anchorProgress = anchorY / viewportHeight;

          if (progress < anchorProgress - 0.05) return null;

          const rect = anchor.element.getBoundingClientRect();
          const headingX = (rect.left + rect.width / 2) / window.innerWidth * 100;

          const lineX = 50 + Math.sin(anchorY * (isMobile ? 0.003 : 0.002)) * (isMobile ? 8 : 15);

          return (
            <g key={index}>
              <line
                x1={lineX}
                y1={anchorY}
                x2={headingX}
                y2={anchorY}
                stroke={color}
                strokeWidth={effectiveWidth * 0.6}
                strokeOpacity="0.4"
                strokeDasharray="3,3"
                filter="url(#softGlow)"
                style={{
                  transition: 'all 0.5s ease-out',
                }}
              />
              <circle
                cx={headingX}
                cy={anchorY}
                r={3}
                fill={color}
                opacity={0.8}
                filter="url(#glow)"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ScrollLine;
