import React, { useState } from 'react';
import { MapPin, Star, ArrowUpRight } from 'lucide-react';
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
  rating,
  price
}) => {
  const [showGallery, setShowGallery] = useState(false);

  const galleryImages = [image, image, image];

  return (
    <>
      <div
        className="group relative overflow-hidden h-[420px] cursor-pointer transition-all duration-500 hover:outline hover:outline-1 hover:outline-gold-400/20"
        onClick={() => setShowGallery(true)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/40 to-transparent group-hover:from-forest-950/95 transition-all duration-500" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-5">
          {/* Top Labels */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex items-center gap-2 bg-forest-950/60 backdrop-blur-sm p-2 border border-gold-500/10">
              <Star className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-xs text-mist-200 font-medium">{rating}</span>
            </div>
            <div className="bg-forest-950/60 backdrop-blur-sm px-3 py-1.5 border border-gold-500/10">
              <span className="text-[10px] uppercase tracking-wider text-gold-300/70">{price}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-2xl sm:text-3xl font-serif text-mist-100 mb-2 group-hover:tracking-wider transition-all duration-300"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-3.5 w-3.5 text-gold-400/70" />
            <span className="text-xs text-mist-400/80 uppercase tracking-wider">{location}</span>
          </div>

          {/* Description */}
          <p className="text-mist-300/70 text-sm leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-3 text-mist-300/60 group-hover:text-mist-100 transition-colors">
            <span
              className="text-sm tracking-wider"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Explore
            </span>
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Border Accent */}
        <div className="absolute inset-0 border border-gold-500/5 group-hover:border-gold-500/15 transition-colors duration-300" />
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
