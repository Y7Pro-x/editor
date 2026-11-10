import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  MapPin,
  Users,
  BookOpen,
  Plus,
  Compass,
  AlertTriangle,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { TimelineEvent, Chapter, TimelineEventType } from '../types';

interface StoryArcVisualMapProps {
  events: TimelineEvent[];
  chapters: Chapter[];
  onSelectEvent: (event: TimelineEvent) => void;
  onAddEvent: () => void;
}

// Assign estimated tension level based on event type if not explicitly set
const getEventTension = (type: TimelineEventType): number => {
  switch (type) {
    case 'ذروة':
      return 95; // Climax peak
    case 'نقطة_تحول':
      return 78; // Plot twist / midpoint
    case 'رئيسي':
      return 65; // Major plot development
    case 'فرعي':
      return 45; // Subplot / character moment
    case 'خلفية_تاريخية':
      return 35; // Flashback / lore
    case 'بداية':
      return 25; // Opening / status quo
    case 'نهاية':
      return 30; // Resolution / denouement
    default:
      return 50;
  }
};

const ACT_REGIONS = [
  { label: 'الفصل الأول: الاستهلال والمحفز', range: [0, 25], color: 'text-emerald-400', bg: 'rgba(16, 185, 129, 0.05)' },
  { label: 'الفصل الثاني أ: تصاعد الصراع', range: [25, 50], color: 'text-amber-400', bg: 'rgba(245, 158, 11, 0.05)' },
  { label: 'الفصل الثاني ب: أزمة المنتصف واللاعودة', range: [50, 75], color: 'text-orange-400', bg: 'rgba(249, 115, 22, 0.05)' },
  { label: 'الفصل الثالث: الذروة الكبرى والانفراج', range: [75, 100], color: 'text-rose-400', bg: 'rgba(244, 63, 94, 0.05)' },
];

export const StoryArcVisualMap: React.FC<StoryArcVisualMapProps> = ({
  events,
  chapters,
  onSelectEvent,
  onAddEvent,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const linkedChapter = selectedEvent?.chapterId
    ? chapters.find((c) => c.id === selectedEvent.chapterId)
    : null;

  // Viewbox Dimensions for narrative curve
  const width = 860;
  const height = 340;
  const paddingX = 65;
  const paddingTop = 45;
  const paddingBottom = 65;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingTop - paddingBottom;

  // Compute (x, y) coordinates for each event along the narrative timeline
  const positionedEvents = events.map((ev, index) => {
    const total = Math.max(1, events.length - 1);
    const progress = events.length === 1 ? 0.5 : index / total;
    const x = paddingX + progress * graphWidth;

    const tensionVal = getEventTension(ev.eventType);
    // Invert Y for SVG coordinates (0 at top, higher tension = higher position on screen)
    const y = paddingTop + graphHeight - (tensionVal / 100) * graphHeight;

    return {
      event: ev,
      x: Math.round(x),
      y: Math.round(y),
      tension: tensionVal,
      index,
    };
  });

  // Generate smooth cubic bezier SVG path across waypoints
  const generateCurvePath = () => {
    if (positionedEvents.length === 0) return '';
    if (positionedEvents.length === 1) {
      return `M ${paddingX} ${height / 2} L ${width - paddingX} ${height / 2}`;
    }

    let d = `M ${positionedEvents[0].x} ${positionedEvents[0].y}`;
    for (let i = 0; i < positionedEvents.length - 1; i++) {
      const current = positionedEvents[i];
      const next = positionedEvents[i + 1];
      const controlX1 = current.x + (next.x - current.x) * 0.45;
      const controlY1 = current.y;
      const controlX2 = current.x + (next.x - current.x) * 0.55;
      const controlY2 = next.y;
      d += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const curvePath = generateCurvePath();

  // Closed path for filled gradient under the curve
  const areaPath =
    positionedEvents.length > 0
      ? `${curvePath} L ${positionedEvents[positionedEvents.length - 1].x} ${height - paddingBottom} L ${positionedEvents[0].x} ${height - paddingBottom} Z`
      : '';

  // Peak climax event
  const peakEvent = positionedEvents.reduce(
    (max, cur) => (cur.tension > (max?.tension || 0) ? cur : max),
    positionedEvents[0]
  );

  return (
    <div className="bg-white border border-[#EAE3D6] rounded-3xl p-5 shadow-xs space-y-5" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1C1E21] font-serif">منحنى التوتر الدرامي وحبكة الرواية</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#C05638] font-mono font-bold">
                {events.length} محطة حدثية
              </span>
            </div>
            <p className="text-xs text-[#756F68]">
              خريطة مرئية بيانية لتوزيع الأحداث وتصاعد التوتر من الاستهلال حتى الذروة والانفراج
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {peakEvent && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              <Flame className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate max-w-[150px]">ذروة الحبكة: {peakEvent.event.title}</span>
            </div>
          )}
          <button
            onClick={onAddEvent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حدث للمنحنى</span>
          </button>
        </div>
      </div>

      {/* Narrative Curve Interactive SVG Canvas */}
      <div className="relative bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl overflow-hidden p-2">
        {/* Act Region Background Labels */}
        <div className="absolute top-2 left-4 right-4 flex justify-between pointer-events-none text-[10px] text-[#756F68] font-serif">
          {ACT_REGIONS.map((act, i) => (
            <span key={i} className="font-semibold text-stone-600">
              {act.label}
            </span>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '260px' }}
        >
          <defs>
            {/* Linear gradient under curve */}
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C05638" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#C05638" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing stroke filter */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#C05638" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Act Dividers Grid Lines */}
          {[0.25, 0.5, 0.75].map((pct, i) => {
            const xPos = paddingX + pct * graphWidth;
            return (
              <g key={i}>
                <line
                  x1={xPos}
                  y1={paddingTop - 10}
                  x2={xPos}
                  y2={height - paddingBottom + 15}
                  stroke="#EAE3D6"
                  strokeDasharray="4,4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Horizontal Tension Reference Lines */}
          {[0.25, 0.5, 0.75, 1.0].map((level, i) => {
            const yPos = paddingTop + graphHeight - level * graphHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingX - 10}
                  y1={yPos}
                  x2={width - paddingX + 10}
                  y2={yPos}
                  stroke="#EAE3D6"
                  strokeWidth="1"
                />
                <text
                  x={width - paddingX + 16}
                  y={yPos + 3}
                  fill="#756F68"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  {Math.round(level * 100)}%
                </text>
              </g>
            );
          })}

          {/* Filled Area Under Curve */}
          {areaPath && <path d={areaPath} fill="url(#curveGradient)" />}

          {/* Main Tension Curve Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#C05638"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#arcGlow)"
            />
          )}

          {/* Timeline Nodes / Event Markers */}
          {positionedEvents.map((node) => {
            const isSelected = selectedEventId === node.event.id;
            const isHovered = hoveredEventId === node.event.id;
            const isClimax = node.event.eventType === 'ذروة';
            const isTurningPoint = node.event.eventType === 'نقطة_تحول';

            let nodeColor = '#F59E0B';
            if (isClimax) nodeColor = '#F43F5E';
            else if (isTurningPoint) nodeColor = '#38BDF8';
            else if (node.event.eventType === 'بداية') nodeColor = '#10B981';
            else if (node.event.eventType === 'نهاية') nodeColor = '#14B8A6';

            return (
              <g
                key={node.event.id}
                className="cursor-pointer transition-transform"
                onClick={() => setSelectedEventId(node.event.id)}
                onMouseEnter={() => setHoveredEventId(node.event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                {/* Vertical drop pin to base */}
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={node.x}
                  y2={height - paddingBottom}
                  stroke={isSelected ? nodeColor : '#3f3f46'}
                  strokeDasharray="2,3"
                  strokeWidth={isSelected ? 1.5 : 1}
                  opacity={isSelected || isHovered ? 0.9 : 0.4}
                />

                {/* Outer Ring when selected/hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isClimax ? 18 : 14}
                    fill={nodeColor}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? (isClimax ? 12 : 9) : (isClimax ? 9 : 7)}
                  fill={nodeColor}
                  stroke="#18181B"
                  strokeWidth="2.5"
                />

                {/* Inner White core for peak points */}
                {(isClimax || isSelected) && (
                  <circle cx={node.x} cy={node.y} r="3" fill="#FFFFFF" />
                )}

                {/* Label below axis */}
                <text
                  x={node.x}
                  y={height - paddingBottom + 20}
                  fill={isSelected ? '#FBBF24' : '#A1A1AA'}
                  fontSize={isSelected ? '11' : '10'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {node.event.title.length > 12
                    ? `${node.event.title.slice(0, 11)}..`
                    : node.event.title}
                </text>

                {/* Chapter or sequence index indicator */}
                <text
                  x={node.x}
                  y={node.y - (isSelected ? 16 : 12)}
                  fill={isSelected ? '#F59E0B' : '#71717A'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none font-bold"
                >
                  #{node.index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Event Inspection HUD / Details Panel */}
      {selectedEvent ? (
        <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  selectedEvent.eventType === 'ذروة'
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : selectedEvent.eventType === 'نقطة_تحول'
                    ? 'text-sky-700 bg-sky-50 border-sky-200'
                    : 'text-[#C05638] bg-[#C05638]/10 border-[#C05638]/30'
                }`}
              >
                {selectedEvent.eventType === 'ذروة' ? 'ذروة الرواية' : selectedEvent.eventType}
              </span>

              <span className="text-xs text-[#756F68] font-mono">
                {selectedEvent.timeOrDate || 'زمن غير محدد'}
              </span>

              {linkedChapter && (
                <div className="flex items-center gap-1 text-xs text-[#C05638] bg-[#C05638]/10 px-2 py-0.5 rounded-md border border-[#C05638]/20 font-medium">
                  <BookOpen className="w-3 h-3" />
                  <span>مرتبط بـ: {linkedChapter.title}</span>
                </div>
              )}

              {selectedEvent.locationName && (
                <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedEvent.locationName}</span>
                </div>
              )}
            </div>

            <h4 className="text-lg font-bold font-serif text-[#1C1E21] hover:text-[#C05638] transition-colors">
              {selectedEvent.title}
            </h4>

            <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed line-clamp-2">
              {selectedEvent.description || 'لا يوجد وصف تفصيلي مسجل لهذا الحدث.'}
            </p>

            {selectedEvent.charactersInvolved && selectedEvent.charactersInvolved.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[#756F68] pt-1">
                <Users className="w-3.5 h-3.5 text-[#C05638] shrink-0" />
                <span className="text-[#1C1E21]">الشخصيات المشتركة: {selectedEvent.charactersInvolved.join('، ')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#EAE3D6]">
            <button
              onClick={() => onSelectEvent(selectedEvent)}
              className="px-4 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>تعديل تفاصيل الحدث</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-[#756F68] text-xs">
          لا توجد أحداث زمنية مسجلة بعد. أضف أحداث الرواية لترسم منحنى التوتر الدرامي تلقائياً.
        </div>
      )}
    </div>
  );
};
