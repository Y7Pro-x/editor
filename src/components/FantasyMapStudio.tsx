import React, { useState, useRef, useMemo } from 'react';
import {
  Compass,
  Layers,
  MapPin,
  Sparkles,
  Crown,
  Castle,
  Anchor,
  Trees,
  Mountain,
  Sun,
  Flame,
  Plus,
  Trash2,
  Edit3,
  Save,
  Download,
  Upload,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Eye,
  EyeOff,
  Palette,
  Ruler,
  Footprints,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Search,
  BookOpen,
  Info,
  Sliders,
  Move,
  Dices,
  Shield,
  ShieldAlert,
  Wind,
  Globe2,
  Route,
  Tent,
  Skull
} from 'lucide-react';
import {
  FantasyWorldMap,
  TerrainBiome,
  MapSettlement,
  MapSettlementType,
  MapRealm,
  MapRiver,
  MapRoad,
  MapLabel,
  MapVisualTheme,
  MapLandform,
  Character
} from '../types';
import { FantasyMapGenerator, DEFAULT_LAYERS_CONFIG } from '../services/fantasyMapGenerator';

interface FantasyMapStudioProps {
  initialMap: FantasyWorldMap;
  characters: Character[]; // Codex characters/locations to link with
  onSaveMap: (map: FantasyWorldMap) => void;
  onBack: () => void;
}

// Biome Colors and Visual Styling based on 5 Themes
const BIOME_STYLES: Record<
  MapVisualTheme,
  Record<TerrainBiome, { fill: string; stroke: string; label: string; icon?: string }>
> = {
  parchment: {
    deep_ocean: { fill: '#B5A07F', stroke: '#9C8768', label: 'أعماق المحيط' },
    coastal_water: { fill: '#C9B695', stroke: '#B3A07F', label: 'مياه ساحلية' },
    lake: { fill: '#A8C0D8', stroke: '#8DA5BC', label: 'بحيرة عذبة', icon: '≈' },
    beach: { fill: '#E6D7B8', stroke: '#D4C4A3', label: 'شواطئ رملية' },
    grassland: { fill: '#DDD0AE', stroke: '#C8BA97', label: 'سهول ومروج' },
    forest: { fill: '#C3BA96', stroke: '#ABA280', label: 'غابات وأحراش', icon: '🌲' },
    hills: { fill: '#D1BE98', stroke: '#BBA883', label: 'تلال ومرتفعات', icon: '◬' },
    mountains: { fill: '#B8A584', stroke: '#9F8C6C', label: 'سلاسل جبلية', icon: '▲' },
    snow_mountains: { fill: '#ECE4D4', stroke: '#A69578', label: 'قمم ثلجية', icon: '▲' },
    volcano: { fill: '#8C6856', stroke: '#704E3E', label: 'جبل بركاني', icon: '🌋' },
    desert: { fill: '#EBDCB9', stroke: '#D9C8A4', label: 'صحراء وكثبان', icon: '░' },
    swamp: { fill: '#B8B595', stroke: '#A29E7F', label: 'مستنقعات', icon: '≈' },
    tundra: { fill: '#DDD8CB', stroke: '#C4BFB2', label: 'تندرا وجليد', icon: '❄' },
  },
  dark: {
    deep_ocean: { fill: '#0B1320', stroke: '#111D30', label: 'أعماق المحيط' },
    coastal_water: { fill: '#142238', stroke: '#1D3252', label: 'مياه ساحلية' },
    lake: { fill: '#14314A', stroke: '#1D4566', label: 'بحيرة عذبة', icon: '≈' },
    beach: { fill: '#1E2D3D', stroke: '#2B3F54', label: 'شواطئ رملية' },
    grassland: { fill: '#162E2A', stroke: '#1E403A', label: 'سهول ومروج' },
    forest: { fill: '#0E241E', stroke: '#15382F', label: 'غابات وأحراش', icon: '🌲' },
    hills: { fill: '#2A2A1E', stroke: '#3D3D2B', label: 'تلال ومرتفعات', icon: '◬' },
    mountains: { fill: '#2C2B36', stroke: '#3E3C4D', label: 'سلاسل جبلية', icon: '▲' },
    snow_mountains: { fill: '#3E4959', stroke: '#56667D', label: 'قمم ثلجية', icon: '▲' },
    volcano: { fill: '#451A18', stroke: '#662724', label: 'جبل بركاني', icon: '🌋' },
    desert: { fill: '#332918', stroke: '#473A23', label: 'صحراء وكثبان', icon: '░' },
    swamp: { fill: '#1A2E20', stroke: '#24402D', label: 'مستنقعات', icon: '≈' },
    tundra: { fill: '#263445', stroke: '#374B63', label: 'تندرا وجليد', icon: '❄' },
  },
  topographic: {
    deep_ocean: { fill: '#0A3B66', stroke: '#072E52', label: 'أعماق المحيط' },
    coastal_water: { fill: '#1E6F9F', stroke: '#17577D', label: 'مياه ساحلية' },
    lake: { fill: '#2582BA', stroke: '#1C6996', label: 'بحيرة عذبة', icon: '≈' },
    beach: { fill: '#EED99E', stroke: '#D9C285', label: 'شواطئ رملية' },
    grassland: { fill: '#7DAA52', stroke: '#6B9445', label: 'سهول ومروج' },
    forest: { fill: '#457C36', stroke: '#38662B', label: 'غابات وأحراش', icon: '🌲' },
    hills: { fill: '#C6A767', stroke: '#A88D53', label: 'تلال ومرتفعات', icon: '◬' },
    mountains: { fill: '#8F7B6B', stroke: '#756354', label: 'سلاسل جبلية', icon: '▲' },
    snow_mountains: { fill: '#E8EDF2', stroke: '#BAC6D4', label: 'قمم ثلجية', icon: '▲' },
    volcano: { fill: '#7A3828', stroke: '#612C1F', label: 'جبل بركاني', icon: '🌋' },
    desert: { fill: '#DFB567', stroke: '#C29A4D', label: 'صحراء وكثبان', icon: '░' },
    swamp: { fill: '#4F735F', stroke: '#3E5C4B', label: 'مستنقعات', icon: '≈' },
    tundra: { fill: '#B5CAD4', stroke: '#95AFBA', label: 'تندرا وجليد', icon: '❄' },
  },
  political: {
    deep_ocean: { fill: '#212A37', stroke: '#1C2430', label: 'أعماق المحيط' },
    coastal_water: { fill: '#2B3747', stroke: '#242F3D', label: 'مياه ساحلية' },
    lake: { fill: '#2A465C', stroke: '#21394B', label: 'بحيرة عذبة', icon: '≈' },
    beach: { fill: '#3E4452', stroke: '#333845', label: 'شواطئ رملية' },
    grassland: { fill: '#3B4842', stroke: '#303B36', label: 'سهول ومروج' },
    forest: { fill: '#2D4036', stroke: '#23332A', label: 'غابات وأحراش', icon: '🌲' },
    hills: { fill: '#423B33', stroke: '#332E27', label: 'تلال ومرتفعات', icon: '◬' },
    mountains: { fill: '#4D474C', stroke: '#3D383C', label: 'سلاسل جبلية', icon: '▲' },
    snow_mountains: { fill: '#6C7280', stroke: '#565B66', label: 'قمم ثلجية', icon: '▲' },
    volcano: { fill: '#4D2422', stroke: '#3D1B19', label: 'جبل بركاني', icon: '🌋' },
    desert: { fill: '#4F4733', stroke: '#3D3727', label: 'صحراء وكثبان', icon: '░' },
    swamp: { fill: '#323E3A', stroke: '#26302D', label: 'مستنقعات', icon: '≈' },
    tundra: { fill: '#4F5866', stroke: '#3E4652', label: 'تندرا وجليد', icon: '❄' },
  },
  atlas_gold: {
    deep_ocean: { fill: '#16332E', stroke: '#0F2622', label: 'أعماق المحيط' },
    coastal_water: { fill: '#234D45', stroke: '#1B3D36', label: 'مياه ساحلية' },
    lake: { fill: '#326E63', stroke: '#26574E', label: 'بحيرة عذبة', icon: '≈' },
    beach: { fill: '#E0CB95', stroke: '#C7B079', label: 'شواطئ رملية' },
    grassland: { fill: '#D1BD82', stroke: '#BAA368', label: 'سهول ومروج' },
    forest: { fill: '#557551', stroke: '#435C40', label: 'غابات وأحراش', icon: '🌲' },
    hills: { fill: '#C2A36B', stroke: '#A68853', label: 'تلال ومرتفعات', icon: '◬' },
    mountains: { fill: '#947A57', stroke: '#755F42', label: 'سلاسل جبلية', icon: '▲' },
    snow_mountains: { fill: '#F2EBD9', stroke: '#D6C8AC', label: 'قمم ثلجية', icon: '▲' },
    volcano: { fill: '#733F24', stroke: '#572E18', label: 'جبل بركاني', icon: '🌋' },
    desert: { fill: '#E5C479', stroke: '#CAA657', label: 'صحراء وكثبان', icon: '░' },
    swamp: { fill: '#61735E', stroke: '#4C5C4A', label: 'مستنقعات', icon: '≈' },
    tundra: { fill: '#C9C5B5', stroke: '#ABA796', label: 'تندرا وجليد', icon: '❄' },
  },
};

const SETTLEMENT_ICONS: Record<MapSettlementType, { label: string; icon: string; color: string }> = {
  capital: { label: 'عاصمة كبرى', icon: '👑', color: '#F59E0B' },
  city: { label: 'مدينة رئيسية', icon: '🏛️', color: '#38BDF8' },
  town: { label: 'بلدة تجارية', icon: '🏘️', color: '#10B981' },
  castle: { label: 'قلعة وحصن', icon: '🏰', color: '#F43F5E' },
  port: { label: 'ميناء بحري', icon: '⚓', color: '#0EA5E9' },
  temple: { label: 'معبد / مزار', icon: '⛩️', color: '#A855F7' },
  oasis: { label: 'واحة مائية', icon: '🌴', color: '#34D399' },
  tower: { label: 'برج سحر', icon: '🗼', color: '#818CF8' },
  ruins: { label: 'أطلال قديمة', icon: '🏛️', color: '#9CA3AF' },
  cave: { label: 'مغارة / كهف', icon: '🕳️', color: '#64748B' },
  pass: { label: 'ممر جبلي', icon: '⛰️', color: '#D97706' },
};

type EditorTool =
  | 'inspect'
  | 'brush'
  | 'settlement'
  | 'measure'
  | 'road';

export const FantasyMapStudio: React.FC<FantasyMapStudioProps> = ({
  initialMap,
  characters,
  onSaveMap,
  onBack,
}) => {
  const [map, setMap] = useState<FantasyWorldMap>(initialMap);
  const [activeTool, setActiveTool] = useState<EditorTool>('inspect');
  const [selectedBiome, setSelectedBiome] = useState<TerrainBiome>('mountains');
  const [brushSize, setBrushSize] = useState<1 | 3 | 5>(1);

  // Viewport Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inspection & Side panel
  const [rightPanelTab, setRightPanelTab] = useState<'inspector' | 'realms' | 'climate'>('inspector');
  const [inspectedSettlement, setInspectedSettlement] = useState<MapSettlement | null>(
    map.settlements[0] || null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLayersModalOpen, setIsLayersModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  // Measurement Tool State
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number; name?: string }[]>([]);

  // Road Drawing Tool State
  const [roadStartPoint, setRoadStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Generator settings state
  const [genSeed, setGenSeed] = useState<number>(map.seed || 123456);
  const [genLandform, setGenLandform] = useState<MapLandform>(map.landform || 'single_continent');
  const [genTheme, setGenTheme] = useState<MapVisualTheme>(map.theme || 'parchment');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Codex Locations for dropdown
  const codexLocations = characters.filter((c) => (c.category || 'شخصية') === 'مكان');

  // Canvas Geometry
  const tileSize = 24;
  const canvasWidth = map.width * tileSize;
  const canvasHeight = map.height * tileSize;

  // Handle Map Tile Click
  const handleTileClick = (gridX: number, gridY: number) => {
    if (activeTool === 'brush') {
      // Paint Terrain
      const newGrid = map.terrainGrid.map((row) => [...row]);
      const radius = Math.floor(brushSize / 2);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const targetY = gridY + dy;
          const targetX = gridX + dx;
          if (
            targetY >= 0 &&
            targetY < map.height &&
            targetX >= 0 &&
            targetX < map.width
          ) {
            newGrid[targetY][targetX] = selectedBiome;
          }
        }
      }

      const updated = { ...map, terrainGrid: newGrid };
      setMap(updated);
      onSaveMap(updated);
    } else if (activeTool === 'settlement') {
      // Drop new settlement
      const newSettlement: MapSettlement = {
        id: `settlement-${Date.now()}`,
        name: FantasyMapGenerator.generateRandomName('settlement'),
        type: 'town',
        x: gridX,
        y: gridY,
        realmId: map.realms[0]?.id,
        population: '8,000 نسمة',
        description: 'موقع جديد أضافه المؤلف على خريطة عالم الرواية.',
        dangerLevel: 'آمن',
        loreNotes: 'منطقة عامرة بأهلها ومسارات القوافل.',
      };
      const updated = {
        ...map,
        settlements: [...map.settlements, newSettlement],
      };
      setMap(updated);
      onSaveMap(updated);
      setInspectedSettlement(newSettlement);
      setRightPanelTab('inspector');
      setIsEditModalOpen(true);
    } else if (activeTool === 'measure') {
      // Add measurement point
      const clickedSettlement = map.settlements.find((s) => s.x === gridX && s.y === gridY);
      const ptName = clickedSettlement ? clickedSettlement.name : `نقطة (${gridX}, ${gridY})`;
      if (measurePoints.length >= 2) {
        setMeasurePoints([{ x: gridX, y: gridY, name: ptName }]);
      } else {
        setMeasurePoints([...measurePoints, { x: gridX, y: gridY, name: ptName }]);
      }
    } else if (activeTool === 'road') {
      if (!roadStartPoint) {
        setRoadStartPoint({ x: gridX, y: gridY });
      } else {
        const midX = Math.round((roadStartPoint.x + gridX) / 2);
        const midY = Math.round((roadStartPoint.y + gridY) / 2);
        const newRoad: MapRoad = {
          id: `road-${Date.now()}`,
          name: `طريق تجاري جديد`,
          type: 'trail',
          points: [
            { x: roadStartPoint.x, y: roadStartPoint.y },
            { x: midX, y: midY },
            { x: gridX, y: gridY },
          ],
        };
        const updated = { ...map, roads: [...map.roads, newRoad] };
        setMap(updated);
        onSaveMap(updated);
        setRoadStartPoint(null);
      }
    }
  };

  // Measurement Distance & Travel Days calculation
  const measurementResult = useMemo(() => {
    if (measurePoints.length < 2) return null;
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    const gridDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const scaleKm = map.scaleKmPerUnit || 25;
    const totalKm = Math.round(gridDist * scaleKm);
    const leagues = Math.round(totalKm / 4.8); // 1 league ≈ 4.8 km

    // Travel days estimations
    const onFootDays = Math.max(1, Math.round(totalKm / 24));
    const horseDays = Math.max(1, Math.round(totalKm / 48));
    const caravanDays = Math.max(1, Math.round(totalKm / 20));
    const shipDays = Math.max(1, Math.round(totalKm / 120));

    return {
      distanceKm: totalKm,
      distanceLeagues: leagues,
      onFootDays,
      horseDays,
      caravanDays,
      shipDays,
    };
  }, [measurePoints, map.scaleKmPerUnit]);

  // Regenerate world handler
  const handleRegenerate = () => {
    const newSeed = genSeed || Math.floor(Math.random() * 999999);
    setGenSeed(newSeed);
    const newWorld = FantasyMapGenerator.generateWorld(
      newSeed,
      genLandform,
      map.width,
      map.height,
      genTheme
    );
    newWorld.name = map.name;
    setMap(newWorld);
    onSaveMap(newWorld);
    setIsGeneratorModalOpen(false);
  };

  // Export Map to SVG string download
  const handleExportSVG = () => {
    const svgEl = document.getElementById('fantasy-world-map-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${map.name || 'خريطة_العالم'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Map to JSON file
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(map, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.name || 'world_map'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Map from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loaded: FantasyWorldMap = JSON.parse(event.target?.result as string);
        if (loaded && loaded.terrainGrid && loaded.settlements) {
          setMap(loaded);
          onSaveMap(loaded);
        }
      } catch (err) {
        console.error('Failed to parse map JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'inspect' || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const themeStyles = BIOME_STYLES[map.theme] || BIOME_STYLES.parchment;

  return (
    <div className="flex flex-col h-screen bg-[#111111] text-white select-none overflow-hidden" dir="rtl">
      {/* Hidden File Input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />

      {/* Top Header Bar */}
      <header className="h-14 bg-[#1A1A1A] border-b border-stone-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="رجوع للمنظم الرئيسي"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={map.name}
                  onChange={(e) => {
                    const u = { ...map, name: e.target.value };
                    setMap(u);
                    onSaveMap(u);
                  }}
                  className="bg-transparent font-serif font-bold text-sm text-white hover:border-b hover:border-amber-500/40 focus:border-b focus:border-amber-400 focus:outline-hidden w-44 sm:w-60"
                  placeholder="اسم خريطة العالم..."
                />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono hidden sm:inline">
                  #{map.seed}
                </span>
                {map.season && (
                  <span
                    onClick={() => {
                      const seasons: ('ربيع' | 'صيف' | 'خريف' | 'شتاء')[] = ['ربيع', 'صيف', 'خريف', 'شتاء'];
                      const next = seasons[(seasons.indexOf(map.season || 'ربيع') + 1) % seasons.length];
                      const u = { ...map, season: next };
                      setMap(u);
                      onSaveMap(u);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors hidden md:inline-flex items-center gap-1"
                    title="انقر لتغيير فصل السنة في عالم الرواية"
                  >
                    <span>{map.season === 'ربيع' ? '🌿' : map.season === 'صيف' ? '☀️' : map.season === 'خريف' ? '🍂' : '❄️'}</span>
                    <span>فصل {map.season}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Layers Toggle */}
          <button
            onClick={() => setIsLayersModalOpen(!isLayersModalOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isLayersModalOpen
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
            }`}
            title="التحكم في طبقات الخريطة"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">الطبقات</span>
          </button>

          {/* Generator Modal */}
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/25 hover:from-amber-500/30 hover:to-amber-600/35 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors shadow-xs"
            title="توليد خريطة جديدة بأنماط وتضاريس متقدمة"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">مولد إجرائي</span>
          </button>

          {/* Theme Selector */}
          <div className="relative">
            <select
              value={map.theme}
              onChange={(e) => {
                const u = { ...map, theme: e.target.value as MapVisualTheme };
                setMap(u);
                onSaveMap(u);
              }}
              className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-hidden focus:border-amber-400 cursor-pointer"
            >
              <option value="parchment">📜 مخطوطة عتيقة</option>
              <option value="dark">🌌 أطلس داكن فضي</option>
              <option value="topographic">🌿 طبوغرافي ملون</option>
              <option value="political">👑 نفوذ الممالك</option>
              <option value="atlas_gold">✨ الخلافة المذهب</option>
            </select>
          </div>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="استيراد خريطة من ملف JSON"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="حفظ نسخة احتياطية من الخريطة بصيغة JSON"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Export SVG */}
          <button
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-xs"
            title="تصدير الخريطة كملف SVG شعاعي مستقل"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصدير SVG</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Tools Sidebar + SVG Map Canvas + Inspector) */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Toolbar (Floating Tools Bar inspired by Azgaar) */}
        <aside className="w-14 sm:w-16 bg-[#161616] border-l border-stone-800 flex flex-col items-center py-3 gap-2 shrink-0 z-20">
          {/* Inspect / Pan Tool */}
          <button
            onClick={() => setActiveTool('inspect')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'inspect'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="وضع الاستعراض والتفحص (Inspect & Pan)"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Terrain Brush Tool */}
          <button
            onClick={() => setActiveTool('brush')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'brush'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="فرشاة رسم وتعديل التضاريس والبحيرات والبراكين (Terrain Brush)"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Add Settlement Tool */}
          <button
            onClick={() => setActiveTool('settlement')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'settlement'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="إضافة مدينة، قلعة، ميناء، واحة، ممر أو كهف (Add Settlement)"
          >
            <Castle className="w-4 h-4" />
          </button>

          {/* Draw Road / Caravan Route Tool */}
          <button
            onClick={() => {
              setActiveTool('road');
              setRoadStartPoint(null);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'road'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="رسم مسار قوافل أو طريق تجاري بين نقطتين (Draw Trade Route)"
          >
            <Route className="w-4 h-4" />
          </button>

          {/* Distance & Travel Time Measure Tool */}
          <button
            onClick={() => {
              setActiveTool('measure');
              setMeasurePoints([]);
            }}
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'measure'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="حاسبة المسافات وأيام السفر بين المدن (Measure Distance & Travel Days)"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <div className="w-8 h-[1px] bg-stone-800 my-1" />

          {/* Zoom Controls */}
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            title="تكبير الخريطة"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            title="تصغير الخريطة"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            title="إعادة ضبط الرؤية"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </aside>

        {/* Sub-toolbar when Brush tool is active */}
        {activeTool === 'brush' && (
          <div className="absolute top-3 right-20 bg-[#1C1C1C]/95 backdrop-blur-md border border-stone-800 rounded-2xl p-2.5 flex items-center gap-3 z-20 shadow-xl max-w-2xl flex-wrap">
            <span className="text-xs text-stone-400 font-serif">نوع التضاريس:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(themeStyles) as TerrainBiome[]).map((biomeKey) => (
                <button
                  key={biomeKey}
                  type="button"
                  onClick={() => setSelectedBiome(biomeKey)}
                  className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 border transition-colors ${
                    selectedBiome === biomeKey
                      ? 'border-amber-400 text-white font-bold bg-amber-500/20'
                      : 'border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                  style={{
                    backgroundColor: selectedBiome === biomeKey ? undefined : themeStyles[biomeKey]?.fill,
                  }}
                >
                  <span className="text-[11px]">{themeStyles[biomeKey]?.icon || '■'}</span>
                  <span>{themeStyles[biomeKey]?.label}</span>
                </button>
              ))}
            </div>

            <div className="h-5 w-[1px] bg-stone-700" />

            <div className="flex items-center gap-1">
              <span className="text-xs text-stone-400">الحجم:</span>
              {[1, 3, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setBrushSize(s as 1 | 3 | 5)}
                  className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center ${
                    brushSize === s
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-toolbar when Road tool is active */}
        {activeTool === 'road' && (
          <div className="absolute top-3 right-20 bg-[#1C1C1C]/95 backdrop-blur-md border border-stone-800 rounded-2xl p-3 z-20 shadow-xl flex items-center gap-3 text-xs">
            <Route className="w-4 h-4 text-amber-400" />
            <span className="text-stone-300">
              {!roadStartPoint
                ? 'انقر على الموقع الأول لبداية المسار التجاري'
                : 'انقر على الموقع الثاني لمد الطريق وحفظه'}
            </span>
            {roadStartPoint && (
              <button
                onClick={() => setRoadStartPoint(null)}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline"
              >
                إلغاء النقطة
              </button>
            )}
          </div>
        )}

        {/* Sub-toolbar when Distance Measurement is active */}
        {activeTool === 'measure' && (
          <div className="absolute top-3 right-20 bg-[#1C1C1C]/95 backdrop-blur-md border border-stone-800 rounded-2xl p-3 z-20 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">حاسبة المسافات وزمن الرحلات</p>
                <p className="text-stone-400">انقر على مدينتين أو موقعين على الخريطة لحساب المسافة وأيام السفر</p>
              </div>
            </div>

            {measurementResult ? (
              <div className="flex flex-wrap items-center gap-3 bg-stone-900 border border-stone-800/80 px-3 py-1.5 rounded-xl text-xs">
                <div>
                  <span className="text-stone-400">المسافة: </span>
                  <strong className="text-amber-400 font-mono">{measurementResult.distanceKm} كم</strong>
                  <span className="text-stone-500 text-[10px]"> ({measurementResult.distanceLeagues} فرسخ)</span>
                </div>

                <div className="h-4 w-[1px] bg-stone-800" />

                <div className="flex items-center gap-3 text-[11px] text-stone-300">
                  <span title="سيراً على الأقدام (24 كم/يوم)">🚶 {measurementResult.onFootDays} يوم</span>
                  <span title="على صهوة جواد (48 كم/يوم)">🐎 {measurementResult.horseDays} يوم</span>
                  <span title="قافلة تجارية (20 كم/يوم)">🐪 {measurementResult.caravanDays} يوم</span>
                  <span title="سفينة شراعية (120 كم/يوم)">⛵ {measurementResult.shipDays} يوم</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                {measurePoints.length === 0 ? 'اختر نقطة البداية' : 'اختر نقطة الوصول'}
              </span>
            )}

            {measurePoints.length > 0 && (
              <button
                type="button"
                onClick={() => setMeasurePoints([])}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline ms-auto"
              >
                مسح القياس
              </button>
            )}
          </div>
        )}

        {/* Central Map Canvas Area */}
        <main
          className="flex-1 relative bg-[#0D0D0D] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className="relative shadow-2xl rounded-sm"
          >
            <svg
              id="fantasy-world-map-svg"
              width={canvasWidth}
              height={canvasHeight}
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              className="block select-none"
              style={{
                backgroundColor: themeStyles.deep_ocean?.fill || '#0F1E2A',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              }}
            >
              <defs>
                {/* Parchment texture filter */}
                <filter id="parchmentTexture" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                  <feDiffuseLighting in="noise" lightingColor="#F4EDE2" surfaceScale="1.2" result="light">
                    <feDistantLight azimuth="60" elevation="50" />
                  </feDiffuseLighting>
                  <feBlend mode="multiply" in="SourceGraphic" in2="light" />
                </filter>
              </defs>

              {/* LAYER 1: Heightmap & Terrain Biomes Grid */}
              {map.layersConfig.showHeightmap && (
                <g id="layer-terrain">
                  {map.terrainGrid.map((row, y) =>
                    row.map((biome, x) => {
                      const style = themeStyles[biome] || themeStyles.grassland;
                      const pixelX = x * tileSize;
                      const pixelY = y * tileSize;

                      return (
                        <g
                          key={`tile-${x}-${y}`}
                          onClick={() => handleTileClick(x, y)}
                          className="cursor-pointer"
                        >
                          <rect
                            x={pixelX}
                            y={pixelY}
                            width={tileSize}
                            height={tileSize}
                            fill={style?.fill || '#DDD0AE'}
                            stroke={style?.stroke || '#C8BA97'}
                            strokeWidth="0.4"
                            opacity={0.96}
                          />

                          {/* Decorative Cartography Symbols */}
                          {style?.icon && (
                            <text
                              x={pixelX + tileSize / 2}
                              y={pixelY + tileSize * 0.7}
                              fontSize="11"
                              fill={map.theme === 'parchment' || map.theme === 'atlas_gold' ? '#4A3B28' : '#FFFFFF'}
                              opacity={map.theme === 'parchment' || map.theme === 'atlas_gold' ? 0.65 : 0.8}
                              textAnchor="middle"
                              fontFamily="serif"
                              className="pointer-events-none select-none"
                            >
                              {style.icon}
                            </text>
                          )}
                        </g>
                      );
                    })
                  )}
                </g>
              )}

              {/* LAYER 2: Coordinate Latitude/Longitude Grid */}
              {map.layersConfig.showGrid && (
                <g id="layer-grid" opacity={map.theme === 'parchment' ? 0.18 : 0.12} pointerEvents="none">
                  {Array.from({ length: Math.floor(map.width / 5) }).map((_, i) => {
                    const x = (i + 1) * 5 * tileSize;
                    return (
                      <line
                        key={`grid-x-${i}`}
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={canvasHeight}
                        stroke="#000000"
                        strokeDasharray="4 6"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {Array.from({ length: Math.floor(map.height / 5) }).map((_, i) => {
                    const y = (i + 1) * 5 * tileSize;
                    return (
                      <line
                        key={`grid-y-${i}`}
                        x1={0}
                        y1={y}
                        x2={canvasWidth}
                        y2={y}
                        stroke="#000000"
                        strokeDasharray="4 6"
                        strokeWidth="1"
                      />
                    );
                  })}
                </g>
              )}

              {/* LAYER 3: Rivers */}
              {map.layersConfig.showRivers && (
                <g id="layer-rivers" pointerEvents="none">
                  {map.rivers.map((river) => {
                    if (river.points.length < 2) return null;
                    let d = `M ${river.points[0].x * tileSize + tileSize / 2} ${
                      river.points[0].y * tileSize + tileSize / 2
                    }`;
                    for (let i = 1; i < river.points.length; i++) {
                      d += ` L ${river.points[i].x * tileSize + tileSize / 2} ${
                        river.points[i].y * tileSize + tileSize / 2
                      }`;
                    }
                    return (
                      <path
                        key={river.id}
                        d={d}
                        fill="none"
                        stroke={map.theme === 'parchment' || map.theme === 'atlas_gold' ? '#3E7369' : '#38BDF8'}
                        strokeWidth={river.width * 1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.85}
                      />
                    );
                  })}
                </g>
              )}

              {/* LAYER 4: Roads & Caravan Routes */}
              {map.layersConfig.showRoads && (
                <g id="layer-roads" pointerEvents="none">
                  {map.roads.map((road) => {
                    if (road.points.length < 2) return null;
                    let d = `M ${road.points[0].x * tileSize + tileSize / 2} ${
                      road.points[0].y * tileSize + tileSize / 2
                    }`;
                    for (let i = 1; i < road.points.length; i++) {
                      d += ` L ${road.points[i].x * tileSize + tileSize / 2} ${
                        road.points[i].y * tileSize + tileSize / 2
                      }`;
                    }
                    const isSea = road.type === 'sea_route';
                    return (
                      <path
                        key={road.id}
                        d={d}
                        fill="none"
                        stroke={
                          isSea
                            ? '#0284C7'
                            : map.theme === 'parchment' || map.theme === 'atlas_gold'
                            ? '#7A4D2E'
                            : '#EAB308'
                        }
                        strokeWidth={road.type === 'highway' ? 2 : 1.3}
                        strokeDasharray={isSea ? '4 4' : road.type === 'highway' ? '6 3' : '3 3'}
                        opacity={isSea ? 0.65 : 0.8}
                      />
                    );
                  })}
                </g>
              )}

              {/* LAYER 5: Measurement Line Overlay */}
              {activeTool === 'measure' && measurePoints.length >= 2 && (
                <g id="layer-measurement" pointerEvents="none">
                  <line
                    x1={measurePoints[0].x * tileSize + tileSize / 2}
                    y1={measurePoints[0].y * tileSize + tileSize / 2}
                    x2={measurePoints[1].x * tileSize + tileSize / 2}
                    y2={measurePoints[1].y * tileSize + tileSize / 2}
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  {measurePoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x * tileSize + tileSize / 2}
                      cy={pt.y * tileSize + tileSize / 2}
                      r="6"
                      fill="#F59E0B"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              )}

              {/* LAYER 6: Settlements, Burgs & Capitals */}
              {map.layersConfig.showSettlements && (
                <g id="layer-settlements">
                  {map.settlements.map((s) => {
                    const px = s.x * tileSize + tileSize / 2;
                    const py = s.y * tileSize + tileSize / 2;
                    const isCapital = s.type === 'capital';
                    const iconMeta = SETTLEMENT_ICONS[s.type] || SETTLEMENT_ICONS.town;
                    const isSelected = inspectedSettlement?.id === s.id;
                    const realm = map.realms.find((r) => r.id === s.realmId);

                    return (
                      <g
                        key={s.id}
                        transform={`translate(${px}, ${py})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedSettlement(s);
                          setRightPanelTab('inspector');
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Selected Ring */}
                        {isSelected && (
                          <circle
                            cx="0"
                            cy="0"
                            r={isCapital ? 15 : 12}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                            className="animate-spin"
                          />
                        )}

                        {/* Settlement Base Marker */}
                        <circle
                          cx="0"
                          cy="0"
                          r={isCapital ? 8 : 6}
                          fill={realm ? realm.color : iconMeta.color}
                          stroke={map.theme === 'parchment' || map.theme === 'atlas_gold' ? '#292015' : '#FFFFFF'}
                          strokeWidth="1.8"
                        />

                        {/* Center Dot for precision */}
                        <circle cx="0" cy="0" r="2" fill="#FFFFFF" />

                        {/* Settlement Name Label */}
                        <text
                          x="0"
                          y={isCapital ? 17 : 14}
                          textAnchor="middle"
                          fill={map.theme === 'parchment' || map.theme === 'atlas_gold' ? '#2A1E11' : '#FFFFFF'}
                          stroke={map.theme === 'parchment' || map.theme === 'atlas_gold' ? '#F7F1E5' : '#111111'}
                          strokeWidth={map.theme === 'parchment' || map.theme === 'atlas_gold' ? '3' : '2'}
                          paintOrder="stroke"
                          fontSize={isCapital ? '12' : '10'}
                          fontWeight={isCapital ? 'bold' : '600'}
                          fontFamily="'Amiri', serif"
                          className="pointer-events-none select-none"
                        >
                          {s.name}
                        </text>

                        {/* Linked Codex Star Badge */}
                        {s.linkedCodexId && (
                          <text
                            x="7"
                            y="-6"
                            fontSize="9"
                            fill="#F59E0B"
                            className="pointer-events-none"
                          >
                            ✦
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* LAYER 7: Geographic Labels */}
              {map.layersConfig.showLabels && (
                <g id="layer-labels" pointerEvents="none">
                  {map.labels.map((label) => {
                    const lx = label.x * tileSize;
                    const ly = label.y * tileSize;
                    return (
                      <text
                        key={label.id}
                        x={lx}
                        y={ly}
                        transform={`rotate(${label.rotation || 0}, ${lx}, ${ly})`}
                        fontSize={label.size}
                        fill={
                          label.type === 'sea'
                            ? map.theme === 'parchment' || map.theme === 'atlas_gold'
                              ? '#3A5A6D'
                              : '#60A5FA'
                            : map.theme === 'parchment' || map.theme === 'atlas_gold'
                            ? '#4A3B2B'
                            : '#D1D5DB'
                        }
                        fontFamily="'Amiri', serif"
                        fontWeight="bold"
                        letterSpacing="1px"
                        opacity={0.88}
                        textAnchor="middle"
                      >
                        {label.text}
                      </text>
                    );
                  })}
                </g>
              )}

              {/* LAYER 8: Compass Rose / Windrose */}
              {map.layersConfig.showCompass && (
                <g
                  id="layer-compass"
                  transform={`translate(${canvasWidth - 70}, 70)`}
                  opacity={map.theme === 'parchment' || map.theme === 'atlas_gold' ? 0.8 : 0.65}
                  pointerEvents="none"
                >
                  <circle cx="0" cy="0" r="38" fill="none" stroke="#88755C" strokeWidth="1.2" strokeDasharray="3 3" />
                  <circle cx="0" cy="0" r="32" fill="none" stroke="#88755C" strokeWidth="0.8" />
                  {/* North Pointer */}
                  <polygon points="0,-36 6,-8 0,-14" fill="#8B0000" />
                  <polygon points="0,-36 -6,-8 0,-14" fill="#C2410C" />
                  {/* South Pointer */}
                  <polygon points="0,36 6,8 0,14" fill="#44403C" />
                  <polygon points="0,36 -6,8 0,14" fill="#78716C" />
                  {/* East / West pointers */}
                  <polygon points="36,0 8,6 14,0" fill="#44403C" />
                  <polygon points="36,0 8,-6 14,0" fill="#78716C" />
                  <polygon points="-36,0 -8,6 -14,0" fill="#44403C" />
                  <polygon points="-36,0 -8,-6 -14,0" fill="#78716C" />
                  {/* North Letter 'ش' */}
                  <text x="0" y="-40" textAnchor="middle" fill="#8B0000" fontSize="13" fontWeight="bold" fontFamily="'Amiri', serif">
                    ش
                  </text>
                </g>
              )}

              {/* Scale Bar */}
              <g transform={`translate(24, ${canvasHeight - 24})`} opacity={0.8} pointerEvents="none">
                <rect x="0" y="0" width="100" height="4" fill="#1C1C1C" stroke="#78716C" strokeWidth="0.8" />
                <rect x="50" y="0" width="50" height="4" fill="#F59E0B" />
                <text x="0" y="-5" fontSize="9" fill="#A8A29E" fontFamily="monospace">0</text>
                <text x="50" y="-5" fontSize="9" fill="#A8A29E" fontFamily="monospace">{Math.round((map.scaleKmPerUnit || 25) * 2)}</text>
                <text x="100" y="-5" fontSize="9" fill="#A8A29E" fontFamily="monospace">{Math.round((map.scaleKmPerUnit || 25) * 4)} كم</text>
              </g>
            </svg>
          </div>
        </main>

        {/* Right Inspector & Realm Side Panel with Tabs */}
        <aside className="w-80 bg-[#161616] border-r border-stone-800 flex flex-col justify-between shrink-0 z-20 overflow-hidden">
          {/* Top Panel Tabs */}
          <div className="flex items-center bg-[#1F1F1F] border-b border-stone-800 p-1 shrink-0">
            <button
              onClick={() => setRightPanelTab('inspector')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'inspector'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>الموقع</span>
            </button>
            <button
              onClick={() => setRightPanelTab('realms')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'realms'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>الممالك ({map.realms.length})</span>
            </button>
            <button
              onClick={() => setRightPanelTab('climate')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'climate'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>المناخ</span>
            </button>
          </div>

          {/* Panel Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rightPanelTab === 'inspector' && inspectedSettlement && (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {SETTLEMENT_ICONS[inspectedSettlement.type]?.icon || '🏛️'}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base font-serif">
                        {inspectedSettlement.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400">
                          {SETTLEMENT_ICONS[inspectedSettlement.type]?.label}
                        </span>
                        {inspectedSettlement.dangerLevel && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                              inspectedSettlement.dangerLevel === 'آمن'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : inspectedSettlement.dangerLevel === 'حذر'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {inspectedSettlement.dangerLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                    title="تعديل تفاصيل الموقع"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Linked Realm */}
                {inspectedSettlement.realmId && (
                  <div className="bg-[#1F1F1F] border border-stone-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span>السيادة والنفوذ:</span>
                      <span className="text-[11px] font-mono">
                        {map.realms.find((r) => r.id === inspectedSettlement.realmId)?.ruler || 'الحاكم'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            map.realms.find((r) => r.id === inspectedSettlement.realmId)?.color ||
                            '#F59E0B',
                        }}
                      />
                      <strong className="text-sm font-serif text-white truncate">
                        {map.realms.find((r) => r.id === inspectedSettlement.realmId)?.name || 'مملكة مستقلة'}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Population & Coordinates */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1F1F1F] p-2.5 rounded-xl border border-stone-800/80">
                    <span className="text-stone-400 block text-[11px]">السكان المقدرين:</span>
                    <span className="font-mono text-white font-bold">{inspectedSettlement.population || 'غير محدد'}</span>
                  </div>
                  <div className="bg-[#1F1F1F] p-2.5 rounded-xl border border-stone-800/80">
                    <span className="text-stone-400 block text-[11px]">الإحداثيات:</span>
                    <span className="font-mono text-white font-bold">X: {inspectedSettlement.x}, Y: {inspectedSettlement.y}</span>
                  </div>
                </div>

                {/* Description & Lore */}
                <div className="space-y-1">
                  <span className="text-xs text-stone-400 font-serif">السجل الجغرافي والوصف:</span>
                  <p className="text-xs text-stone-300 font-serif leading-relaxed bg-[#121212] p-3 rounded-xl border border-stone-800/80">
                    {inspectedSettlement.description || 'لا يوجد وصف مسجل لهذا الموقع بعد.'}
                  </p>
                </div>

                {inspectedSettlement.loreNotes && (
                  <div className="space-y-1">
                    <span className="text-xs text-stone-400 font-serif">ملاحظات روائية:</span>
                    <p className="text-xs text-amber-300/90 font-serif leading-relaxed bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                      {inspectedSettlement.loreNotes}
                    </p>
                  </div>
                )}

                {/* Delete settlement */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const updated = {
                        ...map,
                        settlements: map.settlements.filter((s) => s.id !== inspectedSettlement.id),
                      };
                      setMap(updated);
                      onSaveMap(updated);
                      setInspectedSettlement(updated.settlements[0] || null);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs transition-colors border border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف هذا الموقع من الخريطة</span>
                  </button>
                </div>
              </>
            )}

            {rightPanelTab === 'realms' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 font-serif">الممالك والقوى الجيوسياسية</h4>
                  <span className="text-[11px] text-stone-400">{map.realms.length} ممالك</span>
                </div>

                {map.realms.map((realm) => (
                  <div key={realm.id} className="bg-[#1F1F1F] border border-stone-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{realm.emblem || '👑'}</span>
                        <div>
                          <h5 className="font-bold text-sm text-white font-serif">{realm.name}</h5>
                          <span className="text-[11px] text-stone-400 font-serif">{realm.governmentType || 'مملكة وراثية'}</span>
                        </div>
                      </div>
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: realm.color }} />
                    </div>

                    {realm.ruler && (
                      <p className="text-xs text-stone-300">
                        <span className="text-stone-500">الحاكم: </span>
                        <strong>{realm.ruler}</strong>
                      </p>
                    )}

                    {realm.primaryExport && (
                      <p className="text-xs text-stone-300">
                        <span className="text-stone-500">السلعة الرئيسية: </span>
                        <span className="text-amber-300">{realm.primaryExport}</span>
                      </p>
                    )}

                    {/* Diplomacy Matrix */}
                    {realm.diplomacy && realm.diplomacy.length > 0 && (
                      <div className="pt-1.5 border-t border-stone-800 space-y-1">
                        <span className="text-[10px] text-stone-400 block font-semibold">العلاقات الدبلوماسية:</span>
                        <div className="flex flex-wrap gap-1">
                          {realm.diplomacy.slice(0, 3).map((d, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${
                                d.status === 'حلف'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : d.status === 'حرب'
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                  : d.status === 'هدنة'
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                  : 'bg-stone-800 border-stone-700 text-stone-400'
                              }`}
                            >
                              {d.status === 'حلف' ? '🤝' : d.status === 'حرب' ? '⚔️' : d.status === 'هدنة' ? '🕊️' : '⚖️'}{' '}
                              {d.targetRealmName}: {d.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {rightPanelTab === 'climate' && (
              <div className="space-y-3 text-xs">
                <div className="bg-[#1F1F1F] border border-stone-800 rounded-xl p-3 space-y-2">
                  <span className="text-stone-400 font-serif block">فصل السنة الحالي في العالم:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['ربيع', 'صيف', 'خريف', 'شتاء'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          const updated = { ...map, season: s };
                          setMap(updated);
                          onSaveMap(updated);
                        }}
                        className={`py-1.5 rounded-lg font-semibold text-center transition-colors ${
                          map.season === s
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {map.prevailingWinds && (
                  <div className="bg-[#1F1F1F] border border-stone-800 rounded-xl p-3 space-y-1">
                    <span className="text-stone-400 font-serif flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-amber-400" />
                      <span>الرياح والظواهر المناخية:</span>
                    </span>
                    <p className="text-stone-200 font-serif leading-relaxed text-xs">
                      {map.prevailingWinds}
                    </p>
                  </div>
                )}

                <div className="bg-[#1F1F1F] border border-stone-800 rounded-xl p-3 space-y-2">
                  <span className="text-stone-400 font-serif block font-bold text-amber-400">إحصاءات الجغرافيا:</span>
                  <div className="space-y-1.5 text-stone-300 text-xs">
                    <div className="flex justify-between">
                      <span>إجمالي المدن والمعالم:</span>
                      <strong className="font-mono">{map.settlements.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>الأنهار والمسطحات المائية:</span>
                      <strong className="font-mono">{map.rivers.length} أنهار</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>المسارات والطرق التجارية:</span>
                      <strong className="font-mono">{map.roads.length} دروب</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>المقياس الخرائطي:</span>
                      <strong className="font-mono">{map.scaleKmPerUnit || 25} كم/خلية</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODAL 1: Layers Management */}
      {isLayersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-stone-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>طبقات الخريطة البصرية</span>
              </h3>
              <button
                onClick={() => setIsLayersModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'showHeightmap', label: 'التضاريس والمحيطات (Heightmap)' },
                { key: 'showRealms', label: 'الممالك والحدود السياسية' },
                { key: 'showSettlements', label: 'المدن والمستوطنات والقلاع' },
                { key: 'showRivers', label: 'الأنهار والمسطحات المائية' },
                { key: 'showRoads', label: 'الطرق البرية والمسارات البحرية' },
                { key: 'showGrid', label: 'شبكة خطوط الطول والعرض' },
                { key: 'showLabels', label: 'التسميات الجغرافية والبحار' },
                { key: 'showCompass', label: 'وردة الرياح والبوصلة' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#222222] hover:bg-[#282828] cursor-pointer transition-colors"
                >
                  <span className="text-stone-200">{label}</span>
                  <input
                    type="checkbox"
                    checked={(map.layersConfig as any)[key]}
                    onChange={(e) => {
                      const updated = {
                        ...map,
                        layersConfig: {
                          ...map.layersConfig,
                          [key]: e.target.checked,
                        },
                      };
                      setMap(updated);
                      onSaveMap(updated);
                    }}
                    className="rounded-sm border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsLayersModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Generator & Landform Settings */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-stone-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>المولد الإجرائي المتقدم لعالم الرواية</span>
              </h3>
              <button
                onClick={() => setIsGeneratorModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-serif mb-1.5 font-bold">
                  النمط والتكوين التضاريسي (Landform Template):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'single_continent', label: '🏝️ قارة كبرى' },
                    { id: 'pangaea', label: '🌍 بانجيا العظمى' },
                    { id: 'twin_continents', label: '🌐 قارتان ومضيق' },
                    { id: 'archipelago', label: '🏝️ أرخبيل جزر' },
                    { id: 'islands_ring', label: '🌋 حلقة بركانية' },
                    { id: 'mediterranean', label: '🌊 بحر متوسط' },
                    { id: 'shattered_coasts', label: '⛵ سواحل متكسرة' },
                    { id: 'oasis_desert', label: '🏜️ عالم الواحات' },
                  ].map((lf) => (
                    <button
                      key={lf.id}
                      type="button"
                      onClick={() => setGenLandform(lf.id as MapLandform)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        genLandform === lf.id
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                          : 'border-stone-800 bg-[#141414] text-stone-400 hover:text-white'
                      }`}
                    >
                      {lf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-serif mb-1.5 font-bold">
                  بذرة التوليد العشوائي (Seed):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={genSeed}
                    onChange={(e) => setGenSeed(Number(e.target.value))}
                    className="flex-1 bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setGenSeed(Math.floor(Math.random() * 999999))}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1"
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-400" />
                    <span>عشوائي</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-serif mb-1.5 font-bold">
                  النمط اللوني والخريطي:
                </label>
                <select
                  value={genTheme}
                  onChange={(e) => setGenTheme(e.target.value as MapVisualTheme)}
                  className="w-full bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-serif focus:outline-hidden focus:border-amber-400"
                >
                  <option value="parchment">📜 مخطوطة جلدية عتيقة</option>
                  <option value="dark">🌌 أطلس داكن فضي</option>
                  <option value="topographic">🌿 طبوغرافي ملون</option>
                  <option value="political">👑 نفوذ الممالك</option>
                  <option value="atlas_gold">✨ الخلافة المذهب</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsGeneratorModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد العالم الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Settlement Details */}
      {isEditModalOpen && inspectedSettlement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-stone-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base font-serif">
                تعديل بيانات الموقع: {inspectedSettlement.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-serif mb-1">اسم الموقع أو المدينة:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inspectedSettlement.name}
                    onChange={(e) =>
                      setInspectedSettlement({ ...inspectedSettlement, name: e.target.value })
                    }
                    className="flex-1 bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-serif focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = FantasyMapGenerator.generateRandomName('settlement');
                      setInspectedSettlement({ ...inspectedSettlement, name: rand });
                    }}
                    className="px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs flex items-center gap-1"
                    title="توليد اسم أسطوري عشوائي"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>اسم</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-serif mb-1">تصنيف الموقع:</label>
                  <select
                    value={inspectedSettlement.type}
                    onChange={(e) =>
                      setInspectedSettlement({
                        ...inspectedSettlement,
                        type: e.target.value as MapSettlementType,
                      })
                    }
                    className="w-full bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-serif focus:outline-hidden focus:border-amber-400"
                  >
                    {Object.keys(SETTLEMENT_ICONS).map((tKey) => (
                      <option key={tKey} value={tKey}>
                        {SETTLEMENT_ICONS[tKey as MapSettlementType].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-serif mb-1">مستوى الخطورة:</label>
                  <select
                    value={inspectedSettlement.dangerLevel || 'آمن'}
                    onChange={(e) =>
                      setInspectedSettlement({
                        ...inspectedSettlement,
                        dangerLevel: e.target.value as 'آمن' | 'حذر' | 'شديد الخطورة',
                      })
                    }
                    className="w-full bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-serif focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="آمن">🟢 آمن ومستقر</option>
                    <option value="حذر">🟡 حذر ومنطقة توتر</option>
                    <option value="شديد الخطورة">🔴 شديد الخطورة / مهلك</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-serif mb-1">عدد السكان المقدر:</label>
                <input
                  type="text"
                  value={inspectedSettlement.population || ''}
                  onChange={(e) =>
                    setInspectedSettlement({
                      ...inspectedSettlement,
                      population: e.target.value,
                    })
                  }
                  placeholder="مثال: 45,000 نسمة"
                  className="w-full bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-serif focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-serif mb-1">الربط بموقع في الكودكس:</label>
                <select
                  value={inspectedSettlement.linkedCodexId || ''}
                  onChange={(e) =>
                    setInspectedSettlement({
                      ...inspectedSettlement,
                      linkedCodexId: e.target.value || undefined,
                    })
                  }
                  className="w-full bg-[#121212] border border-stone-800 rounded-xl px-3 py-2 text-white font-serif focus:outline-hidden focus:border-amber-400"
                >
                  <option value="">بدون ربط (موقع خريطة مستقل)</option>
                  {codexLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.locationRegion ? `(${loc.locationRegion})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-serif mb-1">الوصف والتفاصيل التاريخية:</label>
                <textarea
                  rows={2}
                  value={inspectedSettlement.description || ''}
                  onChange={(e) =>
                    setInspectedSettlement({
                      ...inspectedSettlement,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-[#121212] border border-stone-800 rounded-xl p-3 text-white font-serif focus:outline-hidden focus:border-amber-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-serif mb-1">ملاحظات روائية وحكائية:</label>
                <textarea
                  rows={2}
                  value={inspectedSettlement.loreNotes || ''}
                  onChange={(e) =>
                    setInspectedSettlement({
                      ...inspectedSettlement,
                      loreNotes: e.target.value,
                    })
                  }
                  placeholder="تفاصيل تخدم حبكة الرواية أو أسرار المكان..."
                  className="w-full bg-[#121212] border border-stone-800 rounded-xl p-3 text-white font-serif focus:outline-hidden focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => {
                  const updatedSettlements = map.settlements.map((s) =>
                    s.id === inspectedSettlement.id ? inspectedSettlement : s
                  );
                  const updatedMap = { ...map, settlements: updatedSettlements };
                  setMap(updatedMap);
                  onSaveMap(updatedMap);
                  setIsEditModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
