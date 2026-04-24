import React, { useEffect, useState } from 'react';

const RugeziMap = ({ species = [] }) => {
  // Rugezi Marshland coordinates: 1°30'46.6"S 29°54'14.2"E
  const center = [-1.512944, 29.903944];
  const [mapError, setMapError] = useState(false);

  // Generate random habitat points around Rugezi for demo
  const habitatPoints = [
    { name: 'North Sector', lat: -1.505, lng: 29.908, species: 15, color: '#3b82f6' },
    { name: 'Central Marsh', lat: -1.512, lng: 29.904, species: 28, color: '#10b981' },
    { name: 'Eastern Wetland', lat: -1.518, lng: 29.912, species: 12, color: '#8b5cf6' },
    { name: 'Southern Buffer', lat: -1.525, lng: 29.898, species: 9, color: '#f59e0b' },
    { name: 'Western Corridor', lat: -1.510, lng: 29.892, species: 18, color: '#ef4444' },
  ];

  // Calculate bbox for OpenStreetMap
  const bbox = `${center[1] - 0.02},${center[0] - 0.02},${center[1] + 0.02},${center[0] + 0.02}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center[1]},${center[0]}`;

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height: '500px', borderRadius: '12px', overflow: 'hidden' }}>
        {!mapError ? (
          <iframe
            src={mapUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Rugezi Marshland Map"
            onError={() => setMapError(true)}
            onLoad={() => setMapError(false)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-green-900/20 flex items-center justify-center border border-white/10 rounded-xl">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold mb-2">Rugezi Marshland Map</h3>
              <p className="text-gray-400 text-sm mb-4">1°30'46.6"S 29°54'14.2"E</p>
              <p className="text-gray-500 text-xs">Interactive map temporarily unavailable</p>
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-400">Coordinates: {center[0]}, {center[1]}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay info */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
          <p className="text-white font-semibold text-sm">Rugezi Marshland</p>
          <p className="text-gray-300 text-xs">1°30'46.6"S 29°54'14.2"E</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="font-bold text-sm mb-3">Habitat Zones</h4>
        <div className="flex flex-wrap gap-4">
          {habitatPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: point.color }}
              />
              <span className="text-sm text-gray-400">{point.name}</span>
              <span className="text-xs text-gray-500">({point.species} species)</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Total Species Mapped: <span className="text-white font-semibold">{species.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RugeziMap;
