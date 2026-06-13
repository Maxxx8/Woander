import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import TouchGallery from './TouchGallery';

interface DestinationCardProps {
  title: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  price: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  title,
  location,
  description,
  image,
  price
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const galleryImages = [image, image, image];

  return (
    <>
      <div
        className="group relative overflow-hidden cursor-pointer h-[480px] border border-forest-700 hover:border-gold-400/30 transition-all duration-500"
        onClick={() => setShowGallery(true)}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url(${image})`,
            filter: 'grayscale(40%) brightness(0.55) saturate(0.7)',
          }}
        />
        {/* On hover, reveal color */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          style={{
            backgroundImage: `url(${image})`,
            filter: 'brightness(0.45)',
          }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/40 to-transparent" />

        {/* Price tag */}
        <div className="absolute top-5 right-5 z-10">
          <span className="font-jetbrains text-[10px] text-gold-400/80 tracking-widest border border-gold-400/20 px-3 py-1">
            {price}
          </span>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-7 z-10">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-3 w-3 text-gold-400/60 flex-shrink-0" />
            <span className="font-jetbrains text-[10px] text-mist-600 tracking-widest uppercase">{location}</span>
          </div>

          <h3 className="font-display text-3xl font-light text-cream mb-3 leading-tight group-hover:text-gold-200 transition-colors duration-300">
            {title}
          </h3>

          <p className="text-mist-600 text-sm leading-relaxed mb-5 line-clamp-2 font-light group-hover:text-mist-400 transition-colors duration-300">
            {description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-jetbrains text-[10px] text-gold-400/40 tracking-widest uppercase group-hover:text-gold-400/80 transition-colors duration-500">
              View Details →
            </span>
          </div>
        </div>
      </div>

      <TouchGallery
        images={galleryImages}
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </>
  );
};

export default DestinationCard;
