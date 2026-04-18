import React, { useState } from 'react';
import Logo from './Logo';

const LogoShowcase = () => {
  const [selectedSize, setSelectedSize] = useState('medium');
  const [animated, setAnimated] = useState(false);

  const sizes = ['small', 'medium', 'large', 'xlarge'];
  const variants = ['full', 'icon-only'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          🌿 Rugezi Marshland Logo Showcase
        </h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Logo Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedSize === size
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation
              </label>
              <button
                onClick={() => setAnimated(!animated)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  animated
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {animated ? 'Animated ✨' : 'Static'}
              </button>
            </div>
          </div>
        </div>

        {/* Logo Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {variants.map(variant => (
            <div key={variant} className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-semibold mb-6 text-center capitalize">
                {variant.replace('-', ' ')} Variant
              </h3>
              <div className="flex justify-center items-center h-32">
                <Logo
                  size={selectedSize}
                  variant={variant}
                  animated={animated}
                  showText={variant === 'full'}
                />
              </div>
              <div className="mt-6 text-center">
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {`<Logo size="${selectedSize}" variant="${variant}" animated={${animated}} />`}
                </code>
              </div>
            </div>
          ))}
        </div>

        {/* All Sizes Display */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">All Sizes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {sizes.map(size => (
              <div key={size} className="text-center">
                <div className="flex justify-center items-center h-24 mb-4">
                  <Logo
                    size={size}
                    variant="icon-only"
                    animated={animated}
                  />
                </div>
                <p className="text-sm font-medium text-gray-600 capitalize">{size}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">Usage Examples</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2">Navigation Bar</h4>
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Logo size="small" variant="icon-only" />
                <span className="ml-3 font-medium">Navigation</span>
              </div>
              <code className="text-sm text-gray-600 mt-2 block">
                {`<Logo size="small" variant="icon-only" />`}
              </code>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2">Dashboard Header</h4>
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Logo size="medium" variant="icon-only" />
                <span className="ml-3 font-medium">Dashboard</span>
              </div>
              <code className="text-sm text-gray-600 mt-2 block">
                {`<Logo size="medium" variant="icon-only" />`}
              </code>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-2">Home Page</h4>
              <div className="flex items-center bg-gray-50 p-3 rounded">
                <Logo size="large" variant="full" animated={true} />
              </div>
              <code className="text-sm text-gray-600 mt-2 block">
                {`<Logo size="large" variant="full" animated={true} />`}
              </code>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Primary Green</p>
              <p className="text-xs text-gray-500">#10b981 → #059669</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Secondary Teal</p>
              <p className="text-xs text-gray-500">#059669 → #0d9488</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Light Green</p>
              <p className="text-xs text-gray-500">#4ade80 → #34d399</p>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-white border-2 border-gray-200 rounded-lg mb-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full shadow-inner"></div>
              </div>
              <p className="text-sm font-medium">White Highlight</p>
              <p className="text-xs text-gray-500">#ffffff</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;
