import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Sparkles,
  Layers,
  Eye,
  Info,
  ShieldAlert,
  CloudSun,
  Crown,
  Search,
  Plus
} from 'lucide-react';
import { Character, LocationItem } from '../types';

interface WorldAtlasMapProps {
  locations: Character[];
  onSelectLocation: (loc: Character) => void;
  onAddLocation: () => void;
  onOpenMapStudio?: () => void;
}

// Coordinate generator or deterministic hash based on name
const getCoords = (name: string, index: number, total: number) => {
  // Semi-deterministic positioning on a fantasy map canvas (600x400)
  const margin = 80;
  const width = 640;
  const height = 420;

  // Well spaced grid/circle distribution
  const angle = (index / Math.max(1, total)) * 2 * Math.PI + 0.3;
  const radiusX = (width - margin * 2) * 0.42;
  const radiusY = (height - margin * 2) * 0.38;

  const x = width / 2 + radiusX * Math.cos(angle);
  const y = height / 2 + radiusY * Math.sin(angle);

  return { x: Math.round(x), y: Math.round(y) };
};

export const WorldAtlasMap: React.FC<WorldAtlasMapProps> = ({
  locations,
  onSelectLocation,
  onAddLocation,
  onOpenMapStudio,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string | null>(locations[0]?.id || null);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Location characters
  const activeLocation = locations.find((l) => l.id === selectedLocId) || locations[0];

  // Unique regions list
  const regions = Array.from(
    new Set(locations.map((l) => l.locationRegion || 'مناطق عامة').filter(Boolean))
  );

  const filteredLocations = locations.filter((loc) => {
    if (regionFilter !== 'all' && (loc.locationRegion || 'مناطق عامة') !== regionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        (loc.description && loc.description.toLowerCase().includes(q)) ||
        (loc.locationRegion && loc.locationRegion.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Controls & Legend Bar */}
      <div className="bg-white border border-[#EAE3D6] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 flex items-center justify-center text-[#2D5A43] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1C1E21]">
                أطلس العالم وخريطة المعالم (World Atlas Map)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#2D5A43] font-mono font-bold">
                {locations.length} مواقع
              </span>
            </div>
            <p className="text-xs text-[#756F68]">
              خريطة طبوغرافية بصرية لتوزيع المدن، القلاع، والواحات والتضاريس الجغرافية للرواية
            </p>
          </div>
        </div>

        {/* Region Filter & Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-1.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638]"
          >
            <option value="all">كل الأقاليم الجغرافية</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onAddLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C05638] hover:bg-[#a8492e] text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة موقع جديد</span>
          </button>

          {onOpenMapStudio && (
            <button
              type="button"
              onClick={onOpenMapStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EAE3D6]/60 border border-[#EAE3D6] text-[#C05638] font-bold text-xs transition-all shadow-xs active:scale-95"
              title="فتح استوديو بناء وتعديل خرائط العالم الإجرائية"
            >
              <Compass className="w-3.5 h-3.5 text-[#C05638]" />
              <span>محرر الخرائط (Azgaar)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Viewport & Details Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SVG Topographical Fantasy Map Canvas */}
        <div className="lg:col-span-8 bg-[#F5F0E6] border border-[#EAE3D6] rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[480px]">
          {/* Ancient Map Parchment Textures & Topographical Contour Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(45,90,67,0.06)_0,transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(192,86,56,0.05)_0,transparent_60%)] pointer-events-none" />

          {/* SVG Map Canvas */}
          <div className="w-full max-w-[640px] aspect-[16/11] relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 640 420"
              className="w-full h-full select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Decorative Map Compass Rose */}
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2D8C7" strokeWidth="0.8" strokeOpacity="0.7" />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width="640" height="420" fill="url(#grid-pattern)" rx="24" />

              {/* Topographical Island / Territory Outlines */}
              <path
                d="M 60,180 Q 120,60 260,80 T 460,90 T 580,220 T 440,360 T 200,340 Z"
                fill="#ECE4D4"
                stroke="#D6C7B0"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.9"
              />
              <path
                d="M 120,200 Q 180,120 300,130 T 480,160 T 480,300 T 240,300 Z"
                fill="#E2D7C3"
                stroke="#C7B49B"
                strokeWidth="1.5"
                opacity="0.9"
              />

              {/* Mountain ridge decorative sketches */}
              <path
                d="M 160,220 L 175,190 L 190,220 L 205,185 L 220,220 L 235,195 L 250,220"
                fill="none"
                stroke="#A39076"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <path
                d="M 380,260 L 395,230 L 410,260 L 425,225 L 440,260"
                fill="none"
                stroke="#A39076"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Trade Routes / Trails connecting locations */}
              {filteredLocations.map((loc, idx) => {
                if (idx === 0) return null;
                const prev = getCoords(filteredLocations[idx - 1].name, idx - 1, filteredLocations.length);
                const curr = getCoords(loc.name, idx, filteredLocations.length);
                return (
                  <path
                    key={`trail-${loc.id}`}
                    d={`M ${prev.x} ${prev.y} Q ${(prev.x + curr.x) / 2 + 15} ${(prev.y + curr.y) / 2 - 15} ${curr.x} ${curr.y}`}
                    fill="none"
                    stroke="#C05638"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    strokeOpacity="0.6"
                  />
                );
              })}

              {/* Interactive Location Landmarks / Pins */}
              {filteredLocations.map((loc, idx) => {
                const { x, y } = getCoords(loc.name, idx, filteredLocations.length);
                const isSelected = activeLocation?.id === loc.id;

                return (
                  <g
                    key={loc.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedLocId(loc.id)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Pulsing ring for active location */}
                    {isSelected && (
                      <circle
                        r="26"
                        fill="none"
                        stroke="#C05638"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: 'center' }}
                      />
                    )}

                    {/* Pin Beacon Circle */}
                    <circle
                      r="18"
                      fill="#FFFFFF"
                      stroke={isSelected ? '#C05638' : '#2D5A43'}
                      strokeWidth={isSelected ? '3' : '2'}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
                    />

                    {/* Fortress / Oasis icon glyph */}
                    <text
                      textAnchor="middle"
                      y="5"
                      fill={isSelected ? '#C05638' : '#2D5A43'}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {idx + 1}
                    </text>

                    {/* Location Name Label */}
                    <g transform="translate(0, 30)">
                      <rect
                        x="-52"
                        y="-10"
                        width="104"
                        height="20"
                        rx="6"
                        fill="#FFFFFF"
                        stroke={isSelected ? '#C05638' : '#EAE3D6'}
                        strokeWidth="1"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={isSelected ? '#C05638' : '#1C1E21'}
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : '600'}
                        fontFamily="serif"
                      >
                        {loc.name.length > 14 ? `${loc.name.substring(0, 13)}...` : loc.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-[#756F68] mt-2 z-10 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#2D5A43]" />
            انقر على أي معلم على الخريطة لعرض تضاريسه، مناخه، وأهميته الاستراتيجية في الحبكة
          </p>
        </div>

        {/* Selected Location Profile Card */}
        <div className="lg:col-span-4 bg-white border border-[#EAE3D6] rounded-3xl p-5 space-y-4 shadow-xs">
          {activeLocation ? (
            <>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE3D6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 flex items-center justify-center font-bold text-[#2D5A43] text-lg font-serif">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1C1E21] text-base font-serif">
                      {activeLocation.name}
                    </h4>
                    <span className="text-[11px] text-[#2D5A43] block font-medium">
                      {activeLocation.locationRegion || 'إقليم غير مصنف'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLocation(activeLocation)}
                  className="p-2 text-[#756F68] hover:text-[#C05638] rounded-xl hover:bg-[#FAF7F2] transition-colors"
                  title="تعديل بيانات الموقع"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Climate and Atmosphere */}
              {activeLocation.climateOrAtmosphere && (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs space-y-1">
                  <span className="text-[#756F68] flex items-center gap-1.5 font-semibold text-[11px]">
                    <CloudSun className="w-3.5 h-3.5 text-[#C05638]" />
                    المناخ والجو العام:
                  </span>
                  <p className="text-[#1C1E21] leading-relaxed font-serif">
                    {activeLocation.climateOrAtmosphere}
                  </p>
                </div>
              )}

              {/* Strategic Significance */}
              {(activeLocation as LocationItem).strategicSignificance && (
                <div className="p-3 rounded-xl bg-[#C05638]/5 border border-[#C05638]/20 text-xs space-y-1">
                  <span className="text-[#C05638] flex items-center gap-1.5 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C05638]" />
                    الأهمية الاستراتيجية في الحبكة:
                  </span>
                  <p className="text-[#1C1E21] leading-relaxed font-serif">
                    {(activeLocation as LocationItem).strategicSignificance}
                  </p>
                </div>
              )}

              {/* Hazards or Defenses */}
              {(activeLocation as LocationItem).hazardsOrDefenses && (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs space-y-1">
                  <span className="text-[#C05638] flex items-center gap-1.5 font-semibold text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#C05638]" />
                    التهديدات والتحصينات والأخطار:
                  </span>
                  <p className="text-[#1C1E21] leading-relaxed font-serif">
                    {(activeLocation as LocationItem).hazardsOrDefenses}
                  </p>
                </div>
              )}

              {/* Description */}
              {activeLocation.description && (
                <div className="space-y-1 text-xs">
                  <span className="text-[#756F68] block font-semibold">وصف المعلم والتضاريس:</span>
                  <p className="text-[#1C1E21] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D6] font-serif">
                    {activeLocation.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-[#756F68] text-xs">
              اختر موقعاً لعرض تفاصيله الجغرافية.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorldAtlasMap;
