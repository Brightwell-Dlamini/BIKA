import React, { useState } from 'react';
import { Incident, Region, Severity } from '../types';
import { MapPin, ShieldAlert, Eye, Filter, RotateCcw } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface EswatiniMapProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const EswatiniMap: React.FC<EswatiniMapProps> = ({
  incidents,
  onSelectIncident,
  selectedRegion,
  onSelectRegion
}) => {
  const { t } = useLanguage();
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const getMarkerColor = (severity: Severity, status: string) => {
    if (status === 'Resolved' || status === 'Closed') return 'bg-emerald-500 border-emerald-300 text-white';
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 animate-bounce border-red-300 ring-4 ring-red-500/30 text-white';
      case 'HIGH': return 'bg-orange-500 border-orange-200 text-white';
      case 'MEDIUM': return 'bg-amber-400 border-amber-100 text-slate-950 font-bold';
      case 'LOW': return 'bg-sky-500 border-sky-200 text-white';
      default: return 'bg-slate-400 border-white text-white';
    }
  };

  // Convert lat/lng coordinates roughly to SVG canvas percentages for Eswatini region map
  // Eswatini bounds: Lat -25.7 to -27.3, Lng 30.7 to 32.2
  // Map ViewBox: 0 0 500 560
  const mapCoordinatesToPercent = (lat?: number, lng?: number) => {
    if (!lat || !lng) return { x: 50, y: 50 };
    const minLat = -27.35;
    const maxLat = -25.65;
    const minLng = 30.65;
    const maxLng = 32.25;

    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;

    return {
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(12, Math.min(88, y))
    };
  };

  // Region colors matching Eswatini national regional breakdown image
  const getRegionFill = (regionName: Region) => {
    const isSelected = selectedRegion === regionName;
    const isHovered = hoveredRegion === regionName;

    if (isSelected) {
      return '#f59e0b'; // Gold highlight
    }
    if (isHovered) {
      return '#38bdf8'; // Sky blue hover
    }

    switch (regionName) {
      case 'Hhohho': return '#0369a1'; // North: Deep Blue-Teal
      case 'Manzini': return '#0891b2'; // Central-West: Bright Cyan-Teal
      case 'Shiselweni': return '#0f766e'; // South: Muted Deep Emerald-Teal
      case 'Lubombo': return '#1d4ed8'; // East: Royal Blue
      default: return '#1e293b';
    }
  };

  const filteredIncidents = selectedRegion === 'All' || !selectedRegion 
    ? incidents 
    : incidents.filter(i => i.region === selectedRegion);

  return (
    <div className="relative bg-slate-900/95 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm tracking-wide flex items-center space-x-2">
              <span>ESWATINI NATIONWIDE INCIDENT MAP</span>
              {selectedRegion !== 'All' && selectedRegion && (
                <span className="bg-yellow-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {selectedRegion} REGION
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Click region boundary or marker pins to view regional reports
            </p>
          </div>
        </div>

        {/* Severity Legend */}
        <div className="flex items-center space-x-3 text-[11px] bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-slate-300">Critical</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">High</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Medium</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-slate-300">Low</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Resolved</span>
          </span>
        </div>
      </div>

      {/* Map Interactive Frame */}
      <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

        {/* SVG Region Shapes for Eswatini */}
        <svg viewBox="0 0 500 560" className="w-full h-full drop-shadow-2xl select-none">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* HHOHHO (North Region) */}
          <g className="cursor-pointer transition-transform duration-200"
             onClick={() => onSelectRegion(selectedRegion === 'Hhohho' ? 'All' : 'Hhohho')}
             onMouseEnter={() => setHoveredRegion('Hhohho')}
             onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M 220 40 
                 C 180 55, 140 85, 120 120 
                 C 100 155, 110 185, 130 205 
                 C 160 230, 200 220, 240 210 
                 C 270 200, 310 205, 330 185 
                 C 350 160, 340 120, 310 85 
                 C 280 50, 250 35, 220 40 Z"
              fill={getRegionFill('Hhohho')}
              fillOpacity={selectedRegion === 'Hhohho' ? 0.95 : 0.7}
              stroke={selectedRegion === 'Hhohho' ? '#fbbf24' : '#38bdf8'}
              strokeWidth={selectedRegion === 'Hhohho' ? "3.5" : "2"}
              className="transition-all duration-300 hover:brightness-125"
            />
            <text x="210" y="130" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle" className="pointer-events-none tracking-widest drop-shadow">
              HHOHHO
            </text>
            <text x="210" y="148" fill="#bae6fd" fontSize="10" fontWeight="600" textAnchor="middle" className="pointer-events-none">
              (Mbabane / Piggs Peak)
            </text>
          </g>

          {/* MANZINI (Central-West Region) */}
          <g className="cursor-pointer transition-transform duration-200"
             onClick={() => onSelectRegion(selectedRegion === 'Manzini' ? 'All' : 'Manzini')}
             onMouseEnter={() => setHoveredRegion('Manzini')}
             onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M 120 120
                 C 100 155, 110 185, 130 205
                 C 160 230, 200 220, 240 210
                 C 270 200, 300 220, 310 250
                 C 320 280, 290 320, 270 340
                 C 230 360, 180 350, 130 340
                 C 90 330, 75 270, 85 210
                 C 95 160, 110 135, 120 120 Z"
              fill={getRegionFill('Manzini')}
              fillOpacity={selectedRegion === 'Manzini' ? 0.95 : 0.7}
              stroke={selectedRegion === 'Manzini' ? '#fbbf24' : '#22d3ee'}
              strokeWidth={selectedRegion === 'Manzini' ? "3.5" : "2"}
              className="transition-all duration-300 hover:brightness-125"
            />
            <text x="185" y="270" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle" className="pointer-events-none tracking-widest drop-shadow">
              MANZINI
            </text>
            <text x="185" y="288" fill="#cff4fc" fontSize="10" fontWeight="600" textAnchor="middle" className="pointer-events-none">
              (Manzini / Matsapha)
            </text>
          </g>

          {/* SHISELWENI (South Region) */}
          <g className="cursor-pointer transition-transform duration-200"
             onClick={() => onSelectRegion(selectedRegion === 'Shiselweni' ? 'All' : 'Shiselweni')}
             onMouseEnter={() => setHoveredRegion('Shiselweni')}
             onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M 130 340
                 C 180 350, 230 360, 270 340
                 C 300 360, 320 390, 325 430
                 C 330 470, 280 520, 230 525
                 C 170 530, 120 480, 115 430
                 C 110 380, 120 350, 130 340 Z"
              fill={getRegionFill('Shiselweni')}
              fillOpacity={selectedRegion === 'Shiselweni' ? 0.95 : 0.7}
              stroke={selectedRegion === 'Shiselweni' ? '#fbbf24' : '#34d399'}
              strokeWidth={selectedRegion === 'Shiselweni' ? "3.5" : "2"}
              className="transition-all duration-300 hover:brightness-125"
            />
            <text x="210" y="440" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle" className="pointer-events-none tracking-widest drop-shadow">
              SHISELWENI
            </text>
            <text x="210" y="458" fill="#d1fae5" fontSize="10" fontWeight="600" textAnchor="middle" className="pointer-events-none">
              (Nhlangano / Hlathikhulu)
            </text>
          </g>

          {/* LUBOMBO (East Region) */}
          <g className="cursor-pointer transition-transform duration-200"
             onClick={() => onSelectRegion(selectedRegion === 'Lubombo' ? 'All' : 'Lubombo')}
             onMouseEnter={() => setHoveredRegion('Lubombo')}
             onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M 310 85
                 C 340 120, 350 160, 330 185
                 C 310 205, 270 200, 240 210
                 C 270 200, 300 220, 310 250
                 C 320 280, 290 320, 270 340
                 C 300 360, 320 390, 325 430
                 C 360 410, 410 360, 420 300
                 C 430 230, 420 150, 390 100
                 C 360 70, 330 75, 310 85 Z"
              fill={getRegionFill('Lubombo')}
              fillOpacity={selectedRegion === 'Lubombo' ? 0.95 : 0.7}
              stroke={selectedRegion === 'Lubombo' ? '#fbbf24' : '#60a5fa'}
              strokeWidth={selectedRegion === 'Lubombo' ? "3.5" : "2"}
              className="transition-all duration-300 hover:brightness-125"
            />
            <text x="360" y="250" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle" className="pointer-events-none tracking-widest drop-shadow">
              LUBOMBO
            </text>
            <text x="360" y="268" fill="#dbeafe" fontSize="10" fontWeight="600" textAnchor="middle" className="pointer-events-none">
              (Siteki / Big Bend)
            </text>
          </g>
        </svg>

        {/* Live Pin Markers */}
        {filteredIncidents.map((inc) => {
          const { x, y } = mapCoordinatesToPercent(inc.coordinates?.lat, inc.coordinates?.lng);
          return (
            <div
              key={inc.id}
              style={{ top: `${y}%`, left: `${x}%` }}
              onClick={() => onSelectIncident(inc)}
              onMouseEnter={() => setHoveredIncident(inc)}
              onMouseLeave={() => setHoveredIncident(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-130 ${getMarkerColor(inc.severity, inc.status)}`}>
                <span className="text-[10px] font-extrabold">{inc.severity.charAt(0)}</span>
              </div>
            </div>
          );
        })}

        {/* Hover Incident Card Tooltip */}
        {hoveredIncident && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-slate-700 rounded-2xl p-3.5 shadow-2xl z-30 backdrop-blur pointer-events-none animate-fadeIn">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-yellow-400 font-extrabold">{hoveredIncident.id}</span>
              <span className="text-slate-400 font-semibold">{hoveredIncident.region} • {hoveredIncident.mode}</span>
            </div>
            <div className="text-xs font-extrabold text-white truncate mb-1">
              {hoveredIncident.category} - {hoveredIncident.location}
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {hoveredIncident.description}
            </p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <span>Click region boundary or marker pins to view regional reports.</span>
          {selectedRegion !== 'All' && (
            <button
              onClick={() => onSelectRegion('All')}
              className="flex items-center space-x-1 text-yellow-400 hover:underline font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Region Filter</span>
            </button>
          )}
        </div>
        <span className="text-yellow-400 font-extrabold">
          {filteredIncidents.length} Active Pins Plotted ({selectedRegion} Region)
        </span>
      </div>
    </div>
  );
};
