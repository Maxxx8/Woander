import React, { useState, useEffect, useRef } from 'react';

interface BackgroundMediaProps {
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  alt?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  kenBurns?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  url,
  type,
  thumbnailUrl,
  alt = 'Background',
  overlay = true,
  overlayOpacity = 0.5,
  kenBurns = false,
  className = '',
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Video autoplay failed:', error);
      });
    }
  }, [type, url]);

  const handleMediaLoad = () => {
    setIsLoaded(true);
    setTimeout(() => setShowThumbnail(false), 300);
  };

  const handleVideoCanPlay = () => {
    setIsLoaded(true);
    setTimeout(() => setShowThumbnail(false), 300);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {thumbnailUrl && showThumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{
            backgroundImage: `url("${thumbnailUrl}")`,
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}

      {type === 'image' ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={url}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              kenBurns ? 'animate-ken-burns' : ''
            } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              objectPosition: 'center center',
              minWidth: '100%',
              minHeight: '100%'
            }}
            onLoad={handleMediaLoad}
            loading="lazy"
          />
        </div>
      ) : (
        <>
          {!isMobile ? (
            <video
              ref={videoRef}
              src={url}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={handleVideoCanPlay}
              onLoadedData={handleVideoCanPlay}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img
                src={thumbnailUrl || url}
                alt={alt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  kenBurns ? 'animate-ken-burns' : ''
                } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  objectPosition: 'center center',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
                onLoad={handleMediaLoad}
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"
          style={{
            opacity: overlayOpacity,
          }}
        />
      )}

      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}

      {!isLoaded && !thumbnailUrl && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse" />
      )}
    </div>
  );
};

export default BackgroundMedia;
