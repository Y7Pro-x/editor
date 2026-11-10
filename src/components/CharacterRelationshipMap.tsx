import React, { useState, useMemo } from 'react';
import {
  Users,
  Network,
  Shield,
  Heart,
  Swords,
  GraduationCap,
  Sparkles,
  Link2,
  Info,
  Compass,
  ArrowRight,
  Eye,
  Filter,
  Layers,
  Crown,
  Smile
} from 'lucide-react';
import { Character, CharacterRelationship, CharacterRelationType, CharacterRole } from '../types';

interface CharacterRelationshipMapProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}

const RELATION_TYPE_CONFIG: Record<
  CharacterRelationType,
  { label: string; color: string; strokeColor: string; icon: React.ElementType }
> = {
  حليف: { label: 'حليف', color: 'text-[#2D5A43] bg-[#2D5A43]/10 border-[#2D5A43]/20', strokeColor: '#2D5A43', icon: Shield },
  صديق: { label: 'صديق', color: 'text-teal-700 bg-teal-50 border-teal-200', strokeColor: '#0F766E', icon: Smile },
  عدو: { label: 'عدو / خصم', color: 'text-[#C05638] bg-[#C05638]/10 border-[#C05638]/20', strokeColor: '#C05638', icon: Swords },
  منافس: { label: 'منافس', color: 'text-amber-800 bg-amber-50 border-amber-200', strokeColor: '#D97706', icon: Swords },
  معلم: { label: 'معلم / مرشد', color: 'text-purple-700 bg-purple-50 border-purple-200', strokeColor: '#7E22CE', icon: GraduationCap },
  تلميذ: { label: 'تلميذ', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', strokeColor: '#4338CA', icon: GraduationCap },
  عائلة: { label: 'قرابة / عائلة', color: 'text-sky-700 bg-sky-50 border-sky-200', strokeColor: '#0284C7', icon: Users },
  حب: { label: 'حب / مودة', color: 'text-rose-700 bg-rose-50 border-rose-200', strokeColor: '#E11D48', icon: Heart },
  ولاء: { label: 'ولاء وعهد', color: 'text-[#C05638] bg-[#FAF7F2] border-[#EAE3D6]', strokeColor: '#C05638', icon: Crown },
};

const ROLE_STYLES: Record<CharacterRole, { label: string; border: string; bg: string; text: string; glow: string }> = {
  بطل: { label: 'بطل القصة', border: 'border-[#C05638]', bg: 'bg-[#C05638]/10', text: 'text-[#C05638]', glow: 'shadow-xs' },
  خصم: { label: 'خصم / عدو', border: 'border-rose-400', bg: 'bg-rose-50', text: 'text-rose-700', glow: 'shadow-xs' },
  ثانوي: { label: 'شخصية مساعدة', border: 'border-[#2D5A43]', bg: 'bg-[#2D5A43]/10', text: 'text-[#2D5A43]', glow: 'shadow-xs' },
};

export const CharacterRelationshipMap: React.FC<CharacterRelationshipMapProps> = ({
  characters,
  onSelectCharacter,
}) => {
  // Only person items (category === 'شخصية')
  const people = useMemo(() => {
    return characters.filter((c) => (c.category || 'شخصية') === 'شخصية');
  }, [characters]);

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(people[0]?.id || null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [highlightRelation, setHighlightRelation] = useState<string>('all');

  // Filtered people
  const displayPeople = useMemo(() => {
    return people.filter((p) => {
      if (filterRole !== 'all' && p.role !== filterRole) return false;
      return true;
    });
  }, [people, filterRole]);

  // Selected person object
  const activePerson = people.find((p) => p.id === selectedPersonId) || people[0];

  // Calculate circular nodes for SVG graph
  const radius = 210;
  const centerX = 300;
  const centerY = 270;

  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; char: Character }>();
    const count = displayPeople.length;
    if (count === 0) return map;

    displayPeople.forEach((p, idx) => {
      // If one is selected, put it in center or place on circle
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      map.set(p.id, { x, y, char: p });
    });
    return map;
  }, [displayPeople, centerX, centerY, radius]);

  // Extract all relationship links
  const links = useMemo(() => {
    const list: {
      fromId: string;
      toId: string;
      fromName: string;
      toName: string;
      type: CharacterRelationType;
      desc?: string;
    }[] = [];

    people.forEach((p) => {
      if (p.relationships && p.relationships.length > 0) {
        p.relationships.forEach((rel) => {
          // Find target by ID or name
          const target = people.find(
            (other) => other.id === rel.targetCharacterId || other.name === rel.targetCharacterName
          );
          if (target && target.id !== p.id) {
            list.push({
              fromId: p.id,
              toId: target.id,
              fromName: p.name,
              toName: target.name,
              type: rel.relationType,
              desc: rel.description,
            });
          }
        });
      }
    });

    return list;
  }, [people]);

  // Active person's connections (incoming & outgoing)
  const activeConnections = useMemo(() => {
    if (!activePerson) return [];
    return links.filter(
      (l) => l.fromId === activePerson.id || l.toId === activePerson.id
    );
  }, [links, activePerson]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Controls & Legend Bar */}
      <div className="bg-white border border-[#EAE3D6] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638] shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1C1E21]">
                خريطة شبكة العلاقات بين الشخصيات (Character Relationship Map)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#C05638] font-mono font-bold">
                {people.length} شخوص
              </span>
            </div>
            <p className="text-xs text-[#756F68]">
              تصور تفاعلي للتحالفات، الصراعات، والروابط العاطفية بين أبطال وخصوم الرواية
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#756F68]">
            <Filter className="w-3.5 h-3.5 text-[#C05638]" />
            <span>تصفية الأدوار:</span>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-1.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] font-medium"
          >
            <option value="all">كل الأدوار ({people.length})</option>
            <option value="بطل">الأبطال</option>
            <option value="خصم">الخصوم</option>
            <option value="ثانوي">الشخصيات المساندة</option>
          </select>
        </div>
      </div>

      {/* Main Relationship Visual Viewport & Details Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Visual Graph Canvas (SVG Network) */}
        <div className="lg:col-span-8 bg-[#F9F6F0] border border-[#EAE3D6] rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[520px]">
          {/* Subtle Background Radial Aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,86,56,0.05)_0,transparent_70%)] pointer-events-none" />

          {/* Relation Types Color Legend */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-3 z-10">
            {Object.entries(RELATION_TYPE_CONFIG).slice(0, 6).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${config.color}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{config.label}</span>
                </div>
              );
            })}
          </div>

          {/* Network SVG Canvas */}
          <div className="w-full max-w-[600px] aspect-square relative z-10 flex items-center justify-center">
            <svg
              viewBox="0 0 600 540"
              className="w-full h-full select-none"
              style={{ overflow: 'visible' }}
            >
              {/* Connecting relationship curved lines */}
              {links.map((link, i) => {
                const source = nodePositions.get(link.fromId);
                const target = nodePositions.get(link.toId);
                if (!source || !target) return null;

                const isConnectedToActive =
                  activePerson &&
                  (link.fromId === activePerson.id || link.toId === activePerson.id);

                const strokeColor =
                  RELATION_TYPE_CONFIG[link.type]?.strokeColor || '#756F68';

                // Curve calculation
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                // Add slight offset for curved lines
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const curvature = 20 * (i % 2 === 0 ? 1 : -1);
                const ctrlX = midX - (dy / dist) * curvature;
                const ctrlY = midY + (dx / dist) * curvature;

                return (
                  <g key={`link-${link.fromId}-${link.toId}-${i}`}>
                    <path
                      d={`M ${source.x} ${source.y} Q ${ctrlX} ${ctrlY} ${target.x} ${target.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isConnectedToActive ? 2.5 : 1.2}
                      strokeOpacity={isConnectedToActive ? 0.9 : 0.4}
                      strokeDasharray={link.type === 'عدو' || link.type === 'منافس' ? '4 3' : 'none'}
                    />

                    {/* Midpoint relation type badge on line */}
                    {isConnectedToActive && (
                      <g transform={`translate(${ctrlX}, ${ctrlY})`}>
                        <rect
                          x="-28"
                          y="-10"
                          width="56"
                          height="20"
                          rx="6"
                          fill="#FFFFFF"
                          stroke={strokeColor}
                          strokeWidth="1"
                          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill={strokeColor}
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {link.type}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Interactive Character Nodes */}
              {Array.from(nodePositions.values()).map(({ x, y, char }) => {
                const isSelected = activePerson?.id === char.id;

                return (
                  <g
                    key={char.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedPersonId(char.id)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Pulsing ring for selected person */}
                    {isSelected && (
                      <circle
                        r="34"
                        fill="none"
                        stroke="#C05638"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: 'center' }}
                      />
                    )}

                    {/* Outer node circle */}
                    <circle
                      r="26"
                      fill="#FFFFFF"
                      stroke={isSelected ? '#C05638' : char.role === 'بطل' ? '#C05638' : char.role === 'خصم' ? '#E11D48' : '#2D5A43'}
                      strokeWidth={isSelected ? '3' : '2'}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
                    />

                    {/* Inner avatar text (first letter of name) */}
                    <text
                      textAnchor="middle"
                      y="6"
                      fill="#1C1E21"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="serif"
                    >
                      {char.name ? char.name.charAt(0) : 'ش'}
                    </text>

                    {/* Character Name Label underneath */}
                    <g transform="translate(0, 42)">
                      <rect
                        x="-48"
                        y="-10"
                        width="96"
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
                        {char.name.length > 12 ? `${char.name.substring(0, 11)}...` : char.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-[#756F68] mt-2 z-10">
            انقر على أي شخصية لتسليط الضوء على شبكة علاقاتها، أصدقائها، وخصومها في الرواية
          </p>
        </div>

        {/* Selected Person Detailed Sidebar Profile */}
        <div className="lg:col-span-4 bg-white border border-[#EAE3D6] rounded-3xl p-5 space-y-4 shadow-xs">
          {activePerson ? (
            <>
              {/* Header Profile Info */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE3D6]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg font-serif shadow-xs ${
                      ROLE_STYLES[activePerson.role || 'بطل'].border
                    } ${ROLE_STYLES[activePerson.role || 'بطل'].bg} ${ROLE_STYLES[activePerson.role || 'بطل'].text}`}
                  >
                    {activePerson.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1C1E21] text-base font-serif">
                      {activePerson.name}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                        ROLE_STYLES[activePerson.role || 'بطل'].border
                      } ${ROLE_STYLES[activePerson.role || 'بطل'].text}`}
                    >
                      {ROLE_STYLES[activePerson.role || 'بطل'].label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCharacter(activePerson)}
                  className="p-2 text-[#756F68] hover:text-[#C05638] rounded-xl hover:bg-[#FAF7F2] transition-colors"
                  title="فتح بطاقة الشخصية لتعديل التفاصيل"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Faction or Title */}
              {activePerson.factionAffiliation && (
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs">
                  <span className="text-[#756F68] block text-[11px] mb-0.5">الانتماء / الفصيل:</span>
                  <span className="text-[#C05638] font-semibold">{activePerson.factionAffiliation}</span>
                </div>
              )}

              {/* Person Conflict & Goal */}
              <div className="space-y-2 text-xs">
                {activePerson.goal && (
                  <div>
                    <span className="text-[#756F68] block font-semibold mb-0.5">الهدف والدافع:</span>
                    <p className="text-[#1C1E21] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EAE3D6] leading-relaxed font-serif">
                      {activePerson.goal}
                    </p>
                  </div>
                )}
                {activePerson.conflict && (
                  <div>
                    <span className="text-[#C05638] block font-semibold mb-0.5">الصراع الجوهري:</span>
                    <p className="text-[#1C1E21] bg-[#C05638]/5 p-2.5 rounded-lg border border-[#C05638]/20 leading-relaxed font-serif">
                      {activePerson.conflict}
                    </p>
                  </div>
                )}
              </div>

              {/* Direct Relationships List */}
              <div className="space-y-2 pt-2 border-t border-[#EAE3D6]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-[#C05638]" />
                    الروابط والعلاقات المباشرة:
                  </span>
                  <span className="text-[10px] bg-[#FAF7F2] border border-[#EAE3D6] px-2 py-0.5 rounded-full text-[#756F68] font-mono">
                    {activeConnections.length} روابط
                  </span>
                </div>

                {activeConnections.length === 0 ? (
                  <p className="text-xs text-[#756F68] py-3 text-center bg-[#FAF7F2] rounded-xl border border-[#EAE3D6]">
                    لا توجد علاقات مسجلة حالياً لهذه الشخصية.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeConnections.map((conn, idx) => {
                      const isOutgoing = conn.fromId === activePerson.id;
                      const otherName = isOutgoing ? conn.toName : conn.fromName;
                      const relConfig = RELATION_TYPE_CONFIG[conn.type] || RELATION_TYPE_CONFIG.حليف;
                      const RelIcon = relConfig.icon;

                      return (
                        <div
                          key={`conn-${idx}`}
                          className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1C1E21] font-serif">{otherName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold flex items-center gap-1 ${relConfig.color}`}>
                              <RelIcon className="w-3 h-3" />
                              {conn.type}
                            </span>
                          </div>
                          {conn.desc && (
                            <p className="text-[11px] text-[#756F68] leading-tight">
                              {conn.desc}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#756F68] text-xs">
              اختر شخصية لعرض علاقاتها.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterRelationshipMap;
