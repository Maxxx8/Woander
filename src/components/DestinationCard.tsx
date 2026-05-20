import React, { useState } from 'react';
import { MapPin, Star } from 'lucide-react';
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
  
  // Sample gallery images - in real app, these would come from props
  const galleryImages = [
    image,
    image, // You would have multiple images here
    image
  ];

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 cursor-pointer h-[500px] hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] animate-scale-in"
        onClick={() => setShowGallery(true)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent group-hover:from-black/80 group-hover:via-black/50 transition-all duration-500" />

        <div className="relative h-full flex flex-col justify-end p-8">
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold text-gray-800 shadow-lg">
            {price}
          </div>

          <div className="inline-flex items-center space-x-2 mb-4 self-start">
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-white font-semibold">{rating}</span>
            </div>
          </div>

          <h3 className="text-4xl font-bold text-white mb-3 transform transition-all duration-300 drop-shadow-2xl">
            {title}
          </h3>

          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-white/90">{location}</span>
          </div>

          <p className="text-white text-base leading-relaxed mb-4 line-clamp-2 drop-shadow-lg">
            {description}
          </p>

          <button className="w-full py-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-coral-500/80 to-sunset-500/80 backdrop-blur-sm text-white hover:from-coral-600 hover:to-sunset-600 shadow-lg">
            Explore Now
          </button>
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