import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const getSizeContainerClass = () => {
    switch (size) {
      case 'sm': return 'gap-1';
      case 'md': return 'gap-2';
      case 'lg': return 'gap-3';
      default: return 'gap-2';
    }
  };

  const handleMouseEnter = (starValue) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (starValue) => {
    if (!readonly && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className={`flex items-center ${getSizeContainerClass()}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating);
        const colorClass = isActive 
          ? 'text-yellow-400 fill-yellow-400' 
          : 'text-gray-300 fill-gray-300';
        
        return (
          <Star
            key={star}
            className={`${getSizeClass()} ${colorClass} ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400'
            } transition-colors`}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(star)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
