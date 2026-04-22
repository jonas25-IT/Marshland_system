import React, { useEffect, useState } from 'react';

const RugeziMap = ({ species = [] }) => {
  // Rugezi Marshland coordinates: 1°30'46.6"S 29°54'14.2"E
  const center = [-1.512944, 29.903944];

  // Generate random habitat points around Rugezi for demo
  const habitatPoints = [
    { name: 'North Sector', lat: -1.505, lng: 29.908, species: 15, color: '#3b82f6' },
    { name: 'Central Marsh', lat: -1.512, lng: 29.904, species: 28, color: '#10b981' },
    { name: 'Eastern Wetland', lat: -1.518, lng: 29.912, species: 12, color: '#8b5cf6' },
    { name: 'Southern Buffer', lat: -1.525, lng: 29.898, species: 9, color: '#f59e0b' },
    { name: 'Western Corridor', lat: -1.510, lng: 29.892, species: 18, color: '#ef4444' },
  ];

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height: '500px', borderRadius: '12px', overflow: 'hidden' }}>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${center[1] - 0.02}%2C${center[0] - 0.02}%2C${center[1] + 0.02}%2C${center[0] + 0.02}&layer=mapnik&marker=${center[1]}%2C${center[0]}`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Rugezi Marshland Map"
        />
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RugeziMap;
