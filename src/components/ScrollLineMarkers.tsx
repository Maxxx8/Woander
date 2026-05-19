import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface MarkerPoint {
  position: number;
  label?: string;
  icon?: string;
}

interface HeadingAnchor {
  element: HTMLElement;
  y: number;
}

interface ScrollLineMarkersProps {
  color?: string;
  markers?: MarkerPoint[];
  headingSelectors?: string[];
}

const ScrollLineMarkers: React.FC<ScrollLineMarkersProps> = ({
  color = '#3B82F6',
  markers = [],
  headingSelectors = ['h1', 'h2', '.section-title'],
}) => {
  const { progress, velocity } = useScrollProgress();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [pathPoints, setPathPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [headingAnchors, setHeadingAnchors] = useState<HeadingAnchor[]>([]);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const docHeight = document.documentElement.scrollHeight;
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

      calculatePathPoints();
    };

    const calculatePathPoints = () => {
      if (!pathRef.current) return;

      const length = pathRef.current.getTotalLength();
      const points: Array<{ x: number; y: number }> = [];

      for (let i = 0; i <= 100; i++) {
        const position = (length * i) / 100;
        const point = pathRef.current.getPointAtLength(position);
        points.push({ x: point.x, y: point.y });
      }

      setPathPoints(points);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const observer = new MutationObserver(updateDimensions);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
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

      const prevY = (height / segments) * (i - 1);
      const prevT = (i - 1) / segments;
      const prevSine = Math.sin(prevY * frequency) * amplitude;
      const prevCosine = Math.cos(prevY * frequency * 1.3) * amplitude * 0.6;
      const prevTwist = Math.sin(prevT * Math.PI * 4) * amplitude * twistFactor * 0.3;
      const prevX = centerX + prevSine + prevCosine + prevTwist;

      const cp1Y = prevY + (y - prevY) * 0.33;
      const cp2Y = prevY + (y - prevY) * 0.66;
      const cp1X = prevX + (x - prevX) * 0.33 + Math.sin(i * 0.3) * 2;
      const cp2X = prevX + (x - prevX) * 0.66 + Math.cos(i * 0.3) * 2;

      path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y}`;
    }

    return path;
  };

  const getCurrentPoint = () => {
    const index = Math.floor(progress * (pathPoints.length - 1));
    return pathPoints[index] || { x: 50, y: 0 };
  };

  const currentPoint = getCurrentPoint();
  const velocityScale = Math.min(Math.abs(velocity) * 5, 1.5);
  const markerScale = 1 + velocityScale * 0.3;

  if (isMobile && window.innerWidth < 640) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 w-full pointer-events-none z-30" style={{ height: viewportHeight }}>
      <svg
        className="absolute left-0 top-0 w-full h-full"
        style={{ height: viewportHeight }}
        viewBox={`0 0 100 ${viewportHeight}`}
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <radialGradient id="markerGradient">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="70%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>

          <filter id="markerGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          ref={pathRef}
          d={generatePath()}
          fill="none"
          stroke="none"
        />

        {headingAnchors.map((anchor, index) => {
          const anchorY = anchor.y;
          const anchorProgress = anchorY / viewportHeight;

          if (progress < anchorProgress - 0.05) return null;

          const anchorPointIndex = Math.floor(anchorProgress * (pathPoints.length - 1));
          const anchorPoint = pathPoints[anchorPointIndex] || { x: 50, y: anchorY };
          const isActive = progress >= anchorProgress;

          return (
            <g key={`heading-${index}`}>
              <circle
                cx={anchorPoint.x}
                cy={anchorY}
                r={isActive ? 3.5 : 2}
                fill={color}
                opacity={isActive ? 1 : 0.4}
                filter={isActive ? 'url(#markerGlow)' : undefined}
                style={{
                  transition: 'all 0.3s ease-out',
                }}
              />
              {isActive && (
                <circle
                  cx={anchorPoint.x}
                  cy={anchorY}
                  r={6}
                  fill="url(#markerGradient)"
                  opacity={0.5}
                  style={{
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </g>
          );
        })}

        {markers.map((marker, index) => {
          const markerPointIndex = Math.floor(marker.position * (pathPoints.length - 1));
          const markerPoint = pathPoints[markerPointIndex] || { x: 50, y: 0 };
          const isActive = progress >= marker.position;

          return (
            <g key={`marker-${index}`}>
              <circle
                cx={markerPoint.x}
                cy={markerPoint.y}
                r={isActive ? 2.5 : 1.5}
                fill={color}
                opacity={isActive ? 1 : 0.3}
                filter={isActive ? 'url(#markerGlow)' : undefined}
                style={{
                  transition: 'all 0.3s ease-out',
                }}
              />
              {isActive && (
                <circle
                  cx={markerPoint.x}
                  cy={markerPoint.y}
                  r={4}
                  fill="url(#markerGradient)"
                  opacity={0.4}
                  style={{
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </g>
          );
        })}

        <g>
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={6 * markerScale}
            fill="url(#markerGradient)"
            opacity={0.3}
          />
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={4 * markerScale}
            fill={color}
            opacity={0.8}
            filter="url(#markerGlow)"
            style={{
              transition: 'all 0.1s ease-out',
            }}
          />
          <circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={2}
            fill="white"
            opacity={0.9}
          />
        </g>

        {velocity !== 0 && (
          <g>
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={12}
              fill="none"
              stroke={color}
              strokeWidth={0.5}
              opacity={velocityScale * 0.5}
              style={{
                animation: 'ripple 1s ease-out infinite',
              }}
            />
          </g>
        )}
      </svg>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.4;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.1;
            }
          }

          @keyframes ripple {
            0% {
              r: 4;
              opacity: 0.8;
            }
            100% {
              r: 16;
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ScrollLineMarkers;
