import React from 'react';

const Logo = ({ 
  size = 'medium', 
  variant = 'full', 
  className = '',
  showText = true,
  animated = false 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
    xlarge: 'text-4xl'
  };

  const baseClasses = "transition-all duration-300 ease-in-out";

  const logoClasses = `
    ${sizeClasses[size]} 
    ${baseClasses}
    ${animated ? 'animate-pulse hover:scale-110' : 'hover:scale-105'}
    ${className}
  `;

  const textClasses = `
    ${textSizes[size]} 
    font-bold 
    bg-gradient-to-r 
    from-green-600 
    via-emerald-600 
    to-teal-600 
    bg-clip-text 
    text-transparent 
    ${baseClasses}
  `;

  // Custom SVG Leaf Icon
  const LeafIcon = ({ className }) => (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
        fill="currentColor"
      />
      <path 
        d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
        fill="currentColor"
        opacity="0.7"
      />
      <path 
        d="M12 8c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.37L14.37 8.78C13.71 8.29 12.89 8 12 8z" 
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center ${logoClasses}`}>
        <div className="relative">
          {/* Outer ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-sm opacity-75"></div>
          
          {/* Main icon */}
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1.5">
            <LeafIcon className="w-full h-full text-white" />
          </div>
          
          {/* Inner highlight */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-60"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${baseClasses} ${className}`}>
      {/* Logo Icon */}
      <div className={`relative ${logoClasses}`}>
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-md opacity-60"></div>
        
        {/* Main logo circle */}
        <div className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-full p-2 shadow-lg">
          {/* Custom Leaf SVG */}
          <LeafIcon className="w-full h-full text-white drop-shadow-sm" />
          
          {/* Inner highlight for depth */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full opacity-40"></div>
          
          {/* Subtle inner shadow */}
          <div className="absolute inset-0 rounded-full shadow-inner"></div>
        </div>
        
        {/* Animated ring */}
        {animated && (
          <div className="absolute inset-0 rounded-full border-2 border-green-300 opacity-30 animate-ping"></div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="ml-3 flex flex-col">
          <h1 className={`${textClasses} leading-tight`}>
            Rugezi
          </h1>
          <span className="text-sm font-medium text-gray-600 leading-tight">
            Marshland
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
