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
        className="group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer h-[450px] hover:shadow-glow-lg"
        onClick={() => setShowGallery(true)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent group-hover:from-charcoal/90 transition-all duration-500" />

        <div className="absolute inset-0 glass opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
          <div className="flex justify-between items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
              <Star className="h-4 w-4 text-teal-400 fill-current" />
              <span className="text-sm text-white font-semibold">{rating}</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-sm font-medium text-white">
              {price}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 drop-shadow-lg">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-400 flex-shrink-0" />
                <span className="text-sm text-white/80">{location}</span>
              </div>
            </div>

            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
              {description}
            </p>

            <button className="w-full group/btn px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-teal-500/90 to-teal-600/90 backdrop-blur-sm text-white hover:from-teal-500 hover:to-teal-600 flex items-center justify-center gap-2 active:scale-95">
              <span>Explore</span>
              <ArrowUpRight className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </button>
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