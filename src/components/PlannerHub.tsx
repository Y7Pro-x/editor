import React, { useState } from 'react';
import {
  Kanban,
  GitCommit,
  BookMarked,
  BarChart3,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  User,
  Package,
  Wand2,
  Search,
  Compass,
  Zap,
  Flame,
  ShieldAlert,
  Award,
  Layers,
  Crown,
  Calendar,
  BookOpen,
  Network,
  Share2,
  MoveUp,
  MoveDown,
  Tag,
  Flag,
  Users,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  Columns
} from 'lucide-react';
import {
  Scene,
  Character,
  WritingSession,
  WritingGoal,
  Chapter,
  SceneStatus,
  CodexCategory,
  PersonItem,
  LocationItem,
  InventoryItem,
  MagicSystemItem,
  TimelineEvent,
  TimelineEventType
} from '../types';
import { SceneModal } from './SceneModal';
import { CharacterModal, MAIN_CODEX_SUBSECTIONS } from './CharacterModal';
import { TimelineEventModal } from './TimelineEventModal';
import { CharacterRelationshipMap } from './CharacterRelationshipMap';
import { WorldAtlasMap } from './WorldAtlasMap';
import { StoryArcVisualMap } from './StoryArcVisualMap';

interface PlannerHubProps {
  initialTab?: number;
  scenes: Scene[];
  characters: Character[];
  chapters: Chapter[];
  sessions: WritingSession[];
  goal: WritingGoal;
  timelineEvents: TimelineEvent[];
  onSaveScene: (scene: Scene) => void;
  onDeleteScene: (id: string) => void;
  onSaveCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onSaveTimelineEvent: (event: TimelineEvent) => void;
  onDeleteTimelineEvent: (id: string) => void;
  onReorderTimelineEvents: (events: TimelineEvent[]) => void;
  onSaveGoal: (goal: WritingGoal) => void;
  onBack: () => void;
  onOpenMapStudio?: () => void;
}

const STATUS_LIST: SceneStatus[] = ['فكرة', 'مسودة', 'مراجعة', 'مكتمل'];

// 4 Core Subsections requested by user: 'الأشخاص' | 'الأماكن' | 'الأغراض' | 'نظام السحر'
export type CodexSubsection = 'الأشخاص' | 'الأماكن' | 'الأغراض' | 'نظام السحر';

interface SubsectionMeta {
  id: CodexSubsection;
  categoryKey: CodexCategory;
  label: string;
  icon: React.ElementType;
  badge: string;
  color: string;
  desc: string;
  emptyText: string;
  addBtnText: string;
}

export const CODEX_SECTIONS_CONFIG: SubsectionMeta[] = [
  {
    id: 'الأشخاص',
    categoryKey: 'شخصية',
    label: 'الأشخاص',
    icon: User,
    badge: 'شخصية',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    desc: 'الأبطال، الخصوم، والشخصيات المؤثرة في الحبكة',
    emptyText: 'لا توجد شخوص مسجلة بعد في روايتك.',
    addBtnText: 'إضافة شخصية جديدة',
  },
  {
    id: 'الأماكن',
    categoryKey: 'مكان',
    label: 'الأماكن',
    icon: MapPin,
    badge: 'مكان',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    desc: 'المدن، القلاع، الواحات، والتضاريس والمواقع',
    emptyText: 'لا توجد أماكن أو معالم مسجلة بعد في عالم الرواية.',
    addBtnText: 'إضافة موقع أو معلم',
  },
  {
    id: 'الأغراض',
    categoryKey: 'غرض',
    label: 'الأغراض',
    icon: Package,
    badge: 'غرض/أثر',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    desc: 'المخطوطات، الأسلحة الأثرية، والعتاد والأدوات',
    emptyText: 'لا توجد أغراض، أسلحة، أو مخطوطات مسجلة بعد.',
    addBtnText: 'إضافة غرض أو أثر',
  },
  {
    id: 'نظام السحر',
    categoryKey: 'نظام_سحر',
    label: 'نظام السحر',
    icon: Wand2,
    badge: 'سحر/قدرة',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    desc: 'القدرات الخارقة، قواعد السحر، والمحددات والتكلفة',
    emptyText: 'لم تقم بتسجيل قواعد نظام السحر أو القدرات بعد.',
    addBtnText: 'إضافة مدرسة سحر أو قدرة',
  },
];

const EVENT_TYPE_BADGES: Record<TimelineEventType, { label: string; color: string }> = {
  بداية: { label: 'حدث استهلالي', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' },
  رئيسي: { label: 'حدث رئيسي', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' },
  نقطة_تحول: { label: 'نقطة تحول', color: 'text-sky-400 bg-sky-500/15 border-sky-500/40' },
  ذروة: { label: 'ذروة الرواية', color: 'text-rose-400 bg-rose-500/15 border-rose-500/40' },
  فرعي: { label: 'حدث فرعي', color: 'text-purple-400 bg-purple-500/15 border-purple-500/40' },
  خلفية_تاريخية: { label: 'فلاش باك', color: 'text-stone-400 bg-stone-500/15 border-stone-500/40' },
  نهاية: { label: 'خاتمة وانفراج', color: 'text-teal-400 bg-teal-500/15 border-teal-500/40' },
};

export const PlannerHub: React.FC<PlannerHubProps> = ({
  initialTab = 0,
  scenes,
  characters,
  chapters,
  sessions,
  goal,
  timelineEvents,
  onSaveScene,
  onDeleteScene,
  onSaveCharacter,
  onDeleteCharacter,
  onSaveTimelineEvent,
  onDeleteTimelineEvent,
  onReorderTimelineEvents,
  onSaveGoal,
  onBack,
  onOpenMapStudio,
}) => {
  // Tabs:
  // 0: اللوحة (Board)
  // 1: الجدول الزمني للأحداث (Timeline)
  // 2: الكودكس (Codex)
  // 3: الإحصاءات (Stats)
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [selectedKanbanStatus, setSelectedKanbanStatus] = useState<SceneStatus>('فكرة');
  const [boardViewMode, setBoardViewMode] = useState<'pipeline' | 'single'>('pipeline');

  // Subsections in Codex: 'الأشخاص' | 'الأماكن' | 'الأغراض' | 'نظام السحر'
  const [activeCodexSubsection, setActiveCodexSubsection] = useState<CodexSubsection>('الأشخاص');
  const [codexSearch, setCodexSearch] = useState<string>('');
  const [personViewMode, setPersonViewMode] = useState<'grid' | 'network'>('grid');
  const [placesViewMode, setPlacesViewMode] = useState<'atlas' | 'grid'>('atlas');

  // Timeline: 'curve' (خريطة المنحنى الدرامي) vs 'list' (قائمة الأحداث)
  const [timelineViewMode, setTimelineViewMode] = useState<'curve' | 'list'>('curve');
  const [timelineSearch, setTimelineSearch] = useState<string>('');
  const [timelineChapterFilter, setTimelineChapterFilter] = useState<string>('all');
  const [timelineTypeFilter, setTimelineTypeFilter] = useState<string>('all');

  // Modals state
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  const [charModalOpen, setCharModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<CodexCategory>('شخصية');

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Status color badge helpers
  const getStatusColor = (status: SceneStatus) => {
    switch (status) {
      case 'فكرة':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'مسودة':
        return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'مراجعة':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'مكتمل':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  // Calculate statistics
  const today = new Date().toDateString();
  const todayWords = sessions
    .filter((s) => new Date(s.startTime).toDateString() === today)
    .reduce((sum, s) => sum + s.wordsWritten, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekWords = sessions
    .filter((s) => new Date(s.startTime) >= sevenDaysAgo)
    .reduce((sum, s) => sum + s.wordsWritten, 0);

  const dailyProgress = Math.min(100, Math.round((todayWords / (goal.dailyTarget || 500)) * 100));
  const weeklyProgress = Math.min(100, Math.round((weekWords / (goal.weeklyTarget || 3500)) * 100));

  // Get current active subsection config
  const currentSubConfig =
    CODEX_SECTIONS_CONFIG.find((s) => s.id === activeCodexSubsection) || CODEX_SECTIONS_CONFIG[0];

  // Helper to open modal with targeted category
  const openNewItemModal = (sub: CodexSubsection) => {
    const config = CODEX_SECTIONS_CONFIG.find((s) => s.id === sub) || CODEX_SECTIONS_CONFIG[0];
    setEditingChar(null);
    setModalDefaultCategory(config.categoryKey);
    setCharModalOpen(true);
  };

  // Reordering Timeline Events (Move Up/Down)
  const handleMoveEvent = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= timelineEvents.length) return;

    const reordered = [...timelineEvents];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onReorderTimelineEvents(reordered);
  };

  // Advance or regress scene along status pipeline
  const handleAdvanceScene = (scene: Scene, direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = STATUS_LIST.indexOf(scene.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < STATUS_LIST.length) {
      onSaveScene({
        ...scene,
        status: STATUS_LIST[newIndex],
      });
    }
  };

  // Quick add scene in specific column status
  const handleAddSceneWithStatus = (status: SceneStatus) => {
    setEditingScene({
      id: '',
      title: '',
      content: '',
      status,
      plotline: '',
      povCharacter: '',
      locationName: '',
      sortOrder: scenes.length,
    });
    setSceneModalOpen(true);
  };

  // =========================================================================
  // TAB 1: KANBAN BOARD (لوحة المشاهد ومسار الإنتاج المرئي)
  // =========================================================================
  const renderBoardTab = () => {
    return (
      <div className="space-y-5">
        {/* Top Controls: View Mode Switcher + Add Scene */}
        <div className="bg-white border border-[#EAE3D6] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638] shrink-0">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif text-[#1C1E21]">لوحة مسار المشاهد (Visual Kanban)</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68] font-mono">
                  {scenes.length} مشهد
                </span>
              </div>
              <p className="text-xs text-[#756F68]">
                خريطة مرئية لمسار كتابة المشاهد وتنقلها عبر مراحل الإبداع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Pipeline columns vs Single Status */}
            <div className="flex items-center bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setBoardViewMode('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  boardViewMode === 'pipeline'
                    ? 'bg-[#C05638] text-white font-bold shadow-xs'
                    : 'text-[#756F68] hover:text-[#1C1E21]'
                }`}
                title="عرض الأعمدة المتعددة لمسار المشاهد"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>أعمدة المسار</span>
              </button>

              <button
                type="button"
                onClick={() => setBoardViewMode('single')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  boardViewMode === 'single'
                    ? 'bg-[#C05638] text-white font-bold shadow-xs'
                    : 'text-[#756F68] hover:text-[#1C1E21]'
                }`}
                title="عرض مرحلة واحدة مخصصة"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>تصفية مرحلة</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditingScene(null);
                setSceneModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مشهد جديد</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Visual Multi-Column Pipeline */}
        {boardViewMode === 'pipeline' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {STATUS_LIST.map((st) => {
              const columnScenes = scenes.filter((s) => s.status === st);

              return (
                <div
                  key={st}
                  className="bg-white border border-[#EAE3D6] rounded-2xl p-3.5 flex flex-col min-h-[420px] shadow-xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EAE3D6]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        st === 'فكرة' ? 'bg-purple-500' :
                        st === 'مسودة' ? 'bg-sky-500' :
                        st === 'مراجعة' ? 'bg-amber-500' : 'bg-emerald-600'
                      }`} />
                      <h3 className="font-bold text-[#1C1E21] text-sm font-serif">{st}</h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68]">
                        {columnScenes.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddSceneWithStatus(st)}
                      className="p-1 rounded-lg text-[#756F68] hover:text-[#1C1E21] hover:bg-stone-100 transition-colors"
                      title={`إضافة مشهد في مرحلة ${st}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scenes list in column */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[640px] pr-1">
                    {columnScenes.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-center border border-dashed border-[#EAE3D6] rounded-xl p-4 bg-[#FAF7F2]/60">
                        <p className="text-[#756F68] text-xs mb-2">لا توجد مشاهد هنا</p>
                        <button
                          onClick={() => handleAddSceneWithStatus(st)}
                          className="text-[11px] text-[#C05638] hover:underline font-semibold"
                        >
                          + إضافة أول مشهد
                        </button>
                      </div>
                    ) : (
                      columnScenes.map((scene) => {
                        const statusIdx = STATUS_LIST.indexOf(scene.status);
                        const canAdvance = statusIdx < STATUS_LIST.length - 1;
                        const canRegress = statusIdx > 0;

                        return (
                          <div
                            key={scene.id}
                            onClick={() => {
                              setEditingScene(scene);
                              setSceneModalOpen(true);
                            }}
                            className="bg-[#FAF7F2] hover:bg-stone-100/90 border border-[#EAE3D6] hover:border-[#C05638]/40 rounded-xl p-3 cursor-pointer transition-all shadow-xs group"
                          >
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              <h4 className="font-bold text-[#1C1E21] text-xs sm:text-sm font-serif group-hover:text-[#C05638] transition-colors line-clamp-2">
                                {scene.title}
                              </h4>
                            </div>

                            {scene.content && (
                              <p className="text-[11px] text-[#756F68] line-clamp-2 mb-2 leading-relaxed font-serif">
                                {scene.content}
                              </p>
                            )}

                            {/* Meta Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#756F68] mb-2.5">
                              {scene.plotline && (
                                <span className="flex items-center gap-1 bg-white text-[#C05638] border border-[#EAE3D6] px-1.5 py-0.5 rounded-md truncate max-w-[120px] font-medium">
                                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{scene.plotline}</span>
                                </span>
                              )}
                              {scene.povCharacter && (
                                <span className="flex items-center gap-0.5 bg-white border border-[#EAE3D6] text-[#1C1E21] px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
                                  <User className="w-2.5 h-2.5 shrink-0 text-[#C05638]" />
                                  <span className="truncate">{scene.povCharacter}</span>
                                </span>
                              )}
                            </div>

                            {/* Advance / Regress Pipeline Control Buttons */}
                            <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between text-[10px]">
                              {canRegress ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleAdvanceScene(scene, 'prev', e)}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white hover:bg-stone-100 border border-[#EAE3D6] text-[#756F68] hover:text-[#1C1E21] transition-colors"
                                  title={`إرجاع إلى ${STATUS_LIST[statusIdx - 1]}`}
                                >
                                  <span>→</span>
                                  <span>{STATUS_LIST[statusIdx - 1]}</span>
                                </button>
                              ) : <span />}

                              {canAdvance && (
                                <button
                                  type="button"
                                  onClick={(e) => handleAdvanceScene(scene, 'next', e)}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#C05638]/10 hover:bg-[#C05638]/20 border border-[#C05638]/30 text-[#C05638] transition-colors font-semibold ms-auto"
                                  title={`نقل إلى ${STATUS_LIST[statusIdx + 1]}`}
                                >
                                  <span>{STATUS_LIST[statusIdx + 1]}</span>
                                  <span>←</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: Single Status Filter */
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[#EAE3D6] overflow-x-auto shadow-xs">
              {STATUS_LIST.map((st) => {
                const isSelected = selectedKanbanStatus === st;
                const count = scenes.filter((s) => s.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedKanbanStatus(st)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#C05638] text-white font-bold shadow-xs'
                        : 'text-[#756F68] hover:text-[#1C1E21] hover:bg-stone-100'
                    }`}
                  >
                    <span>{st}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {scenes.filter((s) => s.status === selectedKanbanStatus).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#EAE3D6] p-8">
                  <p className="text-[#756F68] text-sm mb-3">
                    لا توجد مشاهد مسجلة في مرحلة "{selectedKanbanStatus}"
                  </p>
                  <button
                    onClick={() => handleAddSceneWithStatus(selectedKanbanStatus)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C05638]/10 border border-[#C05638]/30 text-[#C05638] hover:bg-[#C05638]/20 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مشهد جديد</span>
                  </button>
                </div>
              ) : (
                scenes
                  .filter((s) => s.status === selectedKanbanStatus)
                  .map((scene) => (
                    <div
                      key={scene.id}
                      onClick={() => {
                        setEditingScene(scene);
                        setSceneModalOpen(true);
                      }}
                      className="bg-white border border-[#EAE3D6] hover:border-[#C05638]/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="font-bold text-[#1C1E21] text-base font-serif group-hover:text-[#C05638] transition-colors">
                            {scene.title}
                          </h3>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusColor(
                              scene.status
                            )}`}
                          >
                            {scene.status}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#756F68] line-clamp-2 leading-relaxed mb-3 font-serif">
                          {scene.content || 'لا توجد مسودة أو تفاصيل مسجلة لهذا المشهد.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#756F68] pt-3 border-t border-[#EAE3D6]">
                        {scene.plotline && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#C05638]" />
                            <span className="text-[#1C1E21] font-medium">{scene.plotline}</span>
                          </span>
                        )}

                        {scene.povCharacter && (
                          <span className="flex items-center gap-1">
                            <span>الراوي:</span>
                            <strong className="text-[#1C1E21]">{scene.povCharacter}</strong>
                          </span>
                        )}

                        {scene.locationName && (
                          <span className="flex items-center gap-1 text-[#756F68]">
                            <MapPin className="w-3 h-3 text-[#C05638]" />
                            <span>{scene.locationName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // TAB 2: TIMELINE (الجدول الزمني للأحداث وربطها بالفصول)
  // =========================================================================
  const renderTimelineTab = () => {
    // Filter events by chapter and type and search query
    const filteredEvents = timelineEvents.filter((ev) => {
      if (timelineChapterFilter !== 'all' && ev.chapterId !== timelineChapterFilter) {
        return false;
      }
      if (timelineTypeFilter !== 'all' && ev.eventType !== timelineTypeFilter) {
        return false;
      }
      if (timelineSearch.trim()) {
        const q = timelineSearch.trim().toLowerCase();
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.timeOrDate.toLowerCase().includes(q) ||
          (ev.locationName && ev.locationName.toLowerCase().includes(q)) ||
          (ev.charactersInvolved && ev.charactersInvolved.some((c) => c.toLowerCase().includes(q)))
        );
      }
      return true;
    });

    return (
      <div className="space-y-5">
        {/* Header & Controls Bar */}
        <div className="bg-white border border-[#EAE3D6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#1C1E21]">
                  الجدول الزمني للأحداث (Timeline)
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68] font-mono">
                  {timelineEvents.length} أحداث
                </span>
              </div>
              <p className="text-xs text-[#756F68]">
                تسلسل زمني لأحداث الرواية وربط كل حدث بالفصل المقابل له
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Story Arc Tension Map vs Timeline Events List */}
            <div className="flex items-center bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setTimelineViewMode('curve')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timelineViewMode === 'curve'
                    ? 'bg-[#C05638] text-white font-bold shadow-xs'
                    : 'text-[#756F68] hover:text-[#1C1E21]'
                }`}
                title="عرض خريطة المنحنى الدرامي وتصاعد التوتر"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>المنحنى الدرامي</span>
              </button>

              <button
                type="button"
                onClick={() => setTimelineViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timelineViewMode === 'list'
                    ? 'bg-[#C05638] text-white font-bold shadow-xs'
                    : 'text-[#756F68] hover:text-[#1C1E21]'
                }`}
                title="عرض قائمة الأحداث المتسلسلة"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>قائمة الأحداث</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setEventModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حدث زمني جديد</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Story Arc Narrative Tension Curve Map */}
        {timelineViewMode === 'curve' ? (
          <StoryArcVisualMap
            events={filteredEvents}
            chapters={chapters}
            onSelectEvent={(ev) => {
              setEditingEvent(ev);
              setEventModalOpen(true);
            }}
            onAddEvent={() => {
              setEditingEvent(null);
              setEventModalOpen(true);
            }}
          />
        ) : null}

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-2xl border border-[#EAE3D6] shadow-xs">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#756F68] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={timelineSearch}
              onChange={(e) => setTimelineSearch(e.target.value)}
              placeholder="بحث في أحداث الجدول الزمني..."
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl pr-9 pl-3 py-2 text-xs text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638]"
            />
          </div>

          {/* Chapter Filter */}
          <div className="relative">
            <select
              value={timelineChapterFilter}
              onChange={(e) => setTimelineChapterFilter(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] cursor-pointer"
            >
              <option value="all">كل الفصول ({chapters.length} فصل)</option>
              {chapters.map((ch, idx) => (
                <option key={ch.id} value={ch.id}>
                  الفصل {idx + 1}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="relative">
            <select
              value={timelineTypeFilter}
              onChange={(e) => setTimelineTypeFilter(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] cursor-pointer"
            >
              <option value="all">كل أنواع الأحداث</option>
              {Object.keys(EVENT_TYPE_BADGES).map((typeKey) => (
                <option key={typeKey} value={typeKey}>
                  {EVENT_TYPE_BADGES[typeKey as TimelineEventType].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Events Vertical Sequence */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#EAE3D6] p-8 shadow-xs">
            <Calendar className="w-12 h-12 text-[#756F68]/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1C1E21] mb-1 font-serif">
              {timelineSearch || timelineChapterFilter !== 'all' || timelineTypeFilter !== 'all'
                ? 'لا توجد أحداث زمنية تطابق التصفية الحالية'
                : 'الجدول الزمني للأحداث فارغ حالياً'}
            </h3>
            <p className="text-xs text-[#756F68] mb-4">
              أضف أحداث روايتك وحدد توقيتها الروائي واربطها بالفصول لضبط الإيقاع الزمني للحبكة
            </p>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول حدث في الجدول الزمني</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-2 pr-6 sm:pr-8 space-y-6 before:content-[''] before:absolute before:top-4 before:bottom-4 before:right-[15px] sm:before:right-[19px] before:w-[2px] before:bg-[#EAE3D6]">
            {filteredEvents.map((ev, idx) => {
              const typeInfo = EVENT_TYPE_BADGES[ev.eventType] || EVENT_TYPE_BADGES.رئيسي;
              const linkedChapter = chapters.find((c) => c.id === ev.chapterId);
              const isFirst = idx === 0;
              const isLast = idx === filteredEvents.length - 1;

              return (
                <div key={ev.id} className="relative flex items-start gap-4 group">
                  {/* Timeline Node Icon/Dot */}
                  <div
                    className={`absolute -right-[24px] sm:-right-[28px] top-2 w-5 h-5 rounded-full border-2 border-[#FAF7F2] flex items-center justify-center font-bold text-[10px] ${
                      ev.eventType === 'ذروة'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : ev.eventType === 'بداية'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : ev.eventType === 'نقطة_تحول'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-[#C05638] text-white shadow-xs'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Event Card Container */}
                  <div
                    onClick={() => {
                      setEditingEvent(ev);
                      setEventModalOpen(true);
                    }}
                    className="flex-1 bg-white border border-[#EAE3D6] hover:border-[#C05638]/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                  >
                    <div>
                      {/* Top Meta Line: Time + Type + Linked Chapter */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#EAE3D6]">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Chronological Time / Date */}
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] text-[#C05638] font-mono text-xs font-bold">
                            <Clock className="w-3.5 h-3.5 text-[#C05638]" />
                            <span>{ev.timeOrDate}</span>
                          </span>

                          {/* Event Type Badge */}
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>

                          {/* Importance badge */}
                          {ev.importance === 'عالي' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                              أهمية قصوى
                            </span>
                          )}
                        </div>

                        {/* Linked Chapter indicator */}
                        {linkedChapter ? (
                          <div
                            className="flex items-center gap-1.5 text-xs text-[#C05638] font-serif bg-[#C05638]/10 border border-[#C05638]/20 px-2.5 py-1 rounded-lg font-medium"
                            title={`مرتبط بـ: ${linkedChapter.title}`}
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#C05638]" />
                            <span className="truncate max-w-[180px]">{linkedChapter.title}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#756F68]">حدث عام</span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3 className="font-bold text-[#1C1E21] text-base sm:text-lg font-serif mb-1.5 group-hover:text-[#C05638] transition-colors">
                        {ev.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-[#756F68] line-clamp-3 leading-relaxed mb-3 font-serif">
                        {ev.description || 'لا يوجد وصف مفصل لهذا الحدث.'}
                      </p>
                    </div>

                    {/* Footer Row: Location + Characters + Reordering Controls */}
                    <div className="pt-3 border-t border-[#EAE3D6] flex flex-wrap items-center justify-between gap-3 text-xs text-[#756F68]">
                      <div className="flex flex-wrap items-center gap-3">
                        {ev.locationName && (
                          <span className="flex items-center gap-1 text-[#1C1E21]">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ev.locationName}</span>
                          </span>
                        )}

                        {ev.charactersInvolved && ev.charactersInvolved.length > 0 && (
                          <span className="flex items-center gap-1 text-[#1C1E21]">
                            <Users className="w-3.5 h-3.5 text-[#C05638]" />
                            <span className="truncate max-w-[200px]">
                              {ev.charactersInvolved.join('، ')}
                            </span>
                          </span>
                        )}

                        {ev.notes && (
                          <span className="text-[#756F68] text-[11px] italic hidden md:inline">
                            ملاحظة: {ev.notes}
                          </span>
                        )}
                      </div>

                      {/* Reorder Up / Down buttons */}
                      <div
                        className="flex items-center gap-1 ms-auto opacity-80 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(idx, 'up')}
                          disabled={isFirst}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68] hover:text-[#1C1E21] disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-200/60 transition-colors"
                          title="تحريك لأعلى في الترتيب الزمني"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(idx, 'down')}
                          disabled={isLast}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68] hover:text-[#1C1E21] disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-200/60 transition-colors"
                          title="تحريك لأسفل في الترتيب الزمني"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // TAB 3: CODEX (موسوعة الكودكس)
  // =========================================================================
  const renderCodexTab = () => {
    const currentTargetCategory = currentSubConfig.categoryKey;

    const subsectionItems = characters.filter((c) => {
      const itemCat = c.category || 'شخصية';
      return itemCat === currentTargetCategory;
    });

    const filteredItems = subsectionItems.filter((item) => {
      const q = codexSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.personality && item.personality.toLowerCase().includes(q)) ||
        (item.backstory && item.backstory.toLowerCase().includes(q)) ||
        (item.locationRegion && item.locationRegion.toLowerCase().includes(q)) ||
        (item.powersOrRules && item.powersOrRules.toLowerCase().includes(q))
      );
    });

    const SubIcon = currentSubConfig.icon;

    return (
      <div className="space-y-5">
        {/* Subsections Segmented Control (الأشخاص · الأماكن · الأغراض · نظام السحر) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-white rounded-2xl border border-[#EAE3D6] shadow-xs">
          {CODEX_SECTIONS_CONFIG.map((sec) => {
            const isSelected = activeCodexSubsection === sec.id;
            const SecIcon = sec.icon;
            const count = characters.filter((c) => (c.category || 'شخصية') === sec.categoryKey).length;

            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveCodexSubsection(sec.id);
                  setCodexSearch('');
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#C05638] text-white shadow-xs font-bold'
                    : 'text-[#756F68] hover:text-[#1C1E21] hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <SecIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono tabular-nums ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Header & Search / Add Bar / Network Map Toggle */}
        <div className="bg-white border border-[#EAE3D6] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentSubConfig.color}`}>
              <SubIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif text-[#1C1E21]">
                  قسم {currentSubConfig.label}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68]">
                  {subsectionItems.length} عنصر
                </span>
              </div>
              <p className="text-xs text-[#756F68]">{currentSubConfig.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* View Mode Toggle for Persons (Cards vs Relationship Map) */}
            {activeCodexSubsection === 'الأشخاص' && (
              <div className="flex items-center bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPersonViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    personViewMode === 'grid'
                      ? 'bg-[#C05638] text-white font-bold shadow-xs'
                      : 'text-[#756F68] hover:text-[#1C1E21]'
                  }`}
                  title="عرض بطاقات الشخصيات"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">البطاقات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPersonViewMode('network')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    personViewMode === 'network'
                      ? 'bg-[#C05638] text-white font-bold shadow-xs'
                      : 'text-[#756F68] hover:text-[#1C1E21]'
                  }`}
                  title="عرض خريطة شبكة العلاقات المرئية"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>خريطة العلاقات</span>
                </button>
              </div>
            )}

            {/* View Mode Toggle for Places (Atlas Map vs Cards) */}
            {activeCodexSubsection === 'الأماكن' && (
              <div className="flex items-center bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPlacesViewMode('atlas')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    placesViewMode === 'atlas'
                      ? 'bg-[#C05638] text-white font-bold shadow-xs'
                      : 'text-[#756F68] hover:text-[#1C1E21]'
                  }`}
                  title="عرض خريطة الأطلس الجغرافية"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>خريطة الأطلس</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacesViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    placesViewMode === 'grid'
                      ? 'bg-[#C05638] text-white font-bold shadow-xs'
                      : 'text-[#756F68] hover:text-[#1C1E21]'
                  }`}
                  title="عرض بطاقات الأماكن"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">البطاقات</span>
                </button>

                {onOpenMapStudio && (
                  <button
                    type="button"
                    onClick={onOpenMapStudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#C05638] hover:bg-[#C05638]/10 transition-colors"
                    title="فتح استوديو بناء وتعديل خرائط العالم الإجرائية (Azgaar Style)"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#C05638]" />
                    <span>محرر الخرائط</span>
                  </button>
                )}
              </div>
            )}

            {/* Search Input when in grid view */}
            {((activeCodexSubsection === 'الأشخاص' && personViewMode === 'grid') ||
              (activeCodexSubsection === 'الأماكن' && placesViewMode === 'grid') ||
              (activeCodexSubsection !== 'الأشخاص' && activeCodexSubsection !== 'الأماكن')) && (
              <div className="relative flex-1 sm:w-52">
                <Search className="w-4 h-4 text-[#756F68] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={codexSearch}
                  onChange={(e) => setCodexSearch(e.target.value)}
                  placeholder={`بحث في ${currentSubConfig.label}...`}
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl pr-9 pl-3 py-2 text-xs text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638]"
                />
              </div>
            )}

            <button
              onClick={() => openNewItemModal(activeCodexSubsection)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{currentSubConfig.addBtnText}</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Places World Atlas Map */}
        {activeCodexSubsection === 'الأماكن' && placesViewMode === 'atlas' ? (
          <WorldAtlasMap
            locations={subsectionItems}
            onSelectLocation={(loc) => {
              setEditingChar(loc);
              setModalDefaultCategory('مكان');
              setCharModalOpen(true);
            }}
            onAddLocation={() => openNewItemModal('الأماكن')}
            onOpenMapStudio={onOpenMapStudio}
          />
        ) : activeCodexSubsection === 'الأشخاص' && personViewMode === 'network' ? (
          /* View Mode 2: Character Relationship Network Map */
          <CharacterRelationshipMap
            characters={characters}
            onSelectCharacter={(char) => {
              setEditingChar(char);
              setModalDefaultCategory('شخصية');
              setCharModalOpen(true);
            }}
          />
        ) : (
          /* View Mode 2: Items Cards Grid */
          filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#EAE3D6] p-8 shadow-xs">
              <SubIcon className="w-12 h-12 text-[#756F68]/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#1C1E21] mb-1 font-serif">
                {codexSearch ? 'لا توجد نتائج تطابق بحثك' : currentSubConfig.emptyText}
              </h3>
              <p className="text-xs text-[#756F68] mb-4">
                يمكنك تنظيم جميع تفاصيل {currentSubConfig.label} وربطها بأحداث وفصول الرواية
              </p>
              <button
                onClick={() => openNewItemModal(activeCodexSubsection)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{currentSubConfig.addBtnText}</span>
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setEditingChar(item);
                  setModalDefaultCategory(currentSubConfig.categoryKey);
                  setCharModalOpen(true);
                }}
                className="bg-white border border-[#EAE3D6] hover:border-[#C05638]/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${currentSubConfig.color}`}
                      >
                        <SubIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#1C1E21] text-base font-serif truncate group-hover:text-[#C05638] transition-colors">
                          {item.name}
                        </h3>
                        {activeCodexSubsection === 'الأشخاص' && (
                          <span className="text-[11px] text-[#756F68]">
                            الدور: <span className="text-[#C05638] font-semibold">{item.role}</span>
                          </span>
                        )}
                        {activeCodexSubsection === 'الأماكن' && item.locationRegion && (
                          <span className="text-[11px] text-emerald-700 truncate block font-medium">
                            {item.locationRegion}
                          </span>
                        )}
                        {activeCodexSubsection === 'الأغراض' && (
                          <span className="text-[11px] text-sky-700 truncate block font-medium">
                            {(item as InventoryItem).rarityOrValue || 'غرض أثري'}
                          </span>
                        )}
                        {activeCodexSubsection === 'نظام السحر' && (
                          <span className="text-[11px] text-purple-700 truncate block font-medium">
                            {(item as MagicSystemItem).rarityOrPractitioners || 'نادر'}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${currentSubConfig.color}`}
                    >
                      {currentSubConfig.badge}
                    </span>
                  </div>

                  <p className="text-xs text-[#756F68] line-clamp-2 leading-relaxed mb-3 font-serif">
                    {item.description || item.personality || 'لا يوجد وصف مضاف لهذا العنصر بعد.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE3D6] flex flex-wrap items-center gap-3 text-xs text-[#756F68]">
                  {activeCodexSubsection === 'الأشخاص' && (
                    <>
                      {item.goal && (
                        <span className="truncate max-w-[200px]">
                          الهدف: <strong className="text-[#1C1E21]">{item.goal}</strong>
                        </span>
                      )}
                      {item.conflict && (
                        <span className="truncate text-rose-700 font-medium">
                          الصراع: {item.conflict}
                        </span>
                      )}
                    </>
                  )}

                  {activeCodexSubsection === 'الأماكن' && (
                    <>
                      {item.climateOrAtmosphere && (
                        <span className="truncate">
                          المناخ: <span className="text-[#1C1E21]">{item.climateOrAtmosphere}</span>
                        </span>
                      )}
                      {(item as LocationItem).strategicSignificance && (
                        <span className="truncate text-[#C05638] font-medium">
                          الأهمية: {(item as LocationItem).strategicSignificance}
                        </span>
                      )}
                    </>
                  )}

                  {activeCodexSubsection === 'الأغراض' && (
                    <>
                      {item.originOrCreator && (
                        <span className="truncate">
                          الصانع: <span className="text-[#1C1E21]">{item.originOrCreator}</span>
                        </span>
                      )}
                      {(item as InventoryItem).powersOrProperties && (
                        <span className="truncate text-sky-700 font-medium">
                          الخواص: {(item as InventoryItem).powersOrProperties}
                        </span>
                      )}
                    </>
                  )}

                  {activeCodexSubsection === 'نظام السحر' && (
                    <>
                      {(item as MagicSystemItem).sourceOfPower && (
                        <span className="truncate">
                          المصدر: <span className="text-[#1C1E21]">{(item as MagicSystemItem).sourceOfPower}</span>
                        </span>
                      )}
                      {item.powersOrRules && (
                        <span className="truncate text-purple-700 font-medium">
                          القاعدة: {item.powersOrRules}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </div>
    );
  };

  // =========================================================================
  // TAB 4: STATS (الإحصاءات والرسوم البيانية البصرية)
  // =========================================================================
  const renderStatsTab = () => {
    // 7-day writing activity rhythm
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      const words = sessions
        .filter((s) => new Date(s.startTime).toDateString() === dayStr)
        .reduce((sum, s) => sum + s.wordsWritten, 0);
      const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      return { dayName, words, date: dayStr };
    });
    const maxBarWords = Math.max(200, ...last7Days.map((d) => d.words));

    // Pipeline scene counts
    const ideaCount = scenes.filter((s) => s.status === 'فكرة').length;
    const draftCount = scenes.filter((s) => s.status === 'مسودة').length;
    const reviewCount = scenes.filter((s) => s.status === 'مراجعة').length;
    const doneCount = scenes.filter((s) => s.status === 'مكتمل').length;
    const totalScenes = Math.max(1, scenes.length);

    // Circular gauge calculations
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const dailyDashoffset = circumference - (Math.min(100, dailyProgress) / 100) * circumference;
    const weeklyDashoffset = circumference - (Math.min(100, weeklyProgress) / 100) * circumference;

    return (
      <div className="space-y-6">
        {/* Visual Circular Radial Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Goal Gauge */}
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-5 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-[#C05638] font-bold font-serif">الإنجاز اليومي</span>
              <h3 className="text-xl font-bold font-serif text-[#1C1E21] tabular-nums">
                {todayWords}{' '}
                <span className="text-xs text-[#756F68] font-normal">/ {goal.dailyTarget || 500} كلمة</span>
              </h3>
              <p className="text-xs text-[#756F68]">
                {dailyProgress >= 100 ? 'تم إنجاز هدف اليوم بنجاح!' : `متبقي ${Math.max(0, (goal.dailyTarget || 500) - todayWords)} كلمة`}
              </p>
            </div>

            {/* SVG Radial Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke="#EAE3D6"
                  strokeWidth="8"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke="#C05638"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={dailyDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-mono font-bold text-sm text-[#1C1E21] tabular-nums">
                {dailyProgress}%
              </span>
            </div>
          </div>

          {/* Weekly Goal Gauge */}
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-5 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-[#2D5A43] font-bold font-serif">إجمالي الأسبوع</span>
              <h3 className="text-xl font-bold font-serif text-[#1C1E21] tabular-nums">
                {weekWords}{' '}
                <span className="text-xs text-[#756F68] font-normal">/ {goal.weeklyTarget || 3500} كلمة</span>
              </h3>
              <p className="text-xs text-[#756F68]">
                {weeklyProgress >= 100 ? 'أحسنت! تجاوزت هدف الأسبوع' : `متبقي ${Math.max(0, (goal.weeklyTarget || 3500) - weekWords)} كلمة`}
              </p>
            </div>

            {/* SVG Radial Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke="#EAE3D6"
                  strokeWidth="8"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke="#2D5A43"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={weeklyDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-mono font-bold text-sm text-[#1C1E21] tabular-nums">
                {weeklyProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Visual Activity Bar Chart */}
        <div className="bg-white border border-[#EAE3D6] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-[#1C1E21]">إيقاع الكتابة خلال آخر 7 أيام</h3>
              <p className="text-xs text-[#756F68]">توزيع الكلمات المكتوبة يومياً لقياس وتيرة الإنجاز</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 text-[#C05638] text-xs font-mono font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{weekWords} كلمة هذا الأسبوع</span>
            </div>
          </div>

          <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-48 border-b border-[#EAE3D6] pb-3">
            {last7Days.map((item, idx) => {
              const heightPct = Math.max(6, Math.min(100, Math.round((item.words / maxBarWords) * 100)));
              const isToday = idx === 6;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-[#756F68] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {item.words}
                  </span>
                  <div className="w-full max-w-[42px] bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-[#C05638] shadow-xs'
                          : item.words > 0
                          ? 'bg-[#2D5A43] hover:opacity-90'
                          : 'bg-stone-200'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-serif ${isToday ? 'text-[#C05638] font-bold' : 'text-[#756F68]'}`}>
                    {item.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story Production Pipeline Distribution */}
        <div className="bg-white border border-[#EAE3D6] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-[#1C1E21]">توزيع مشاهد الرواية في المسار</h3>
            <span className="text-xs text-[#756F68] font-mono">{scenes.length} مشهد إجمالي</span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="w-full h-3.5 bg-[#FAF7F2] border border-[#EAE3D6] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(ideaCount / totalScenes) * 100}%` }}
              className="bg-purple-500 h-full transition-all"
              title={`فكرة: ${ideaCount}`}
            />
            <div
              style={{ width: `${(draftCount / totalScenes) * 100}%` }}
              className="bg-sky-500 h-full transition-all"
              title={`مسودة: ${draftCount}`}
            />
            <div
              style={{ width: `${(reviewCount / totalScenes) * 100}%` }}
              className="bg-[#C05638] h-full transition-all"
              title={`مراجعة: ${reviewCount}`}
            />
            <div
              style={{ width: `${(doneCount / totalScenes) * 100}%` }}
              className="bg-emerald-600 h-full transition-all"
              title={`مكتمل: ${doneCount}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs text-[#1C1E21]">فكرة ({ideaCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-xs text-[#1C1E21]">مسودة ({draftCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C05638]" />
              <span className="text-xs text-[#1C1E21]">مراجعة ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs text-[#1C1E21]">مكتمل ({doneCount})</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white border border-[#EAE3D6] rounded-3xl p-5 space-y-3 shadow-xs">
          <h3 className="text-base font-bold font-serif text-[#1C1E21]">جلسات الكتابة الأخيرة</h3>
          {sessions.length === 0 ? (
            <p className="text-xs text-[#756F68] py-4 text-center">لم تسجل أي جلسات كتابة بعد.</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map((sess) => {
                const durationMin = Math.max(
                  1,
                  Math.round(
                    (new Date(sess.endTime).getTime() - new Date(sess.startTime).getTime()) / 60000
                  )
                );
                const dateStr = new Date(sess.startTime).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={sess.id}
                    className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1E21] tabular-nums">
                          +{sess.wordsWritten} كلمة
                        </p>
                        <p className="text-xs text-[#756F68]">{dateStr}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#756F68] bg-white border border-[#EAE3D6] px-2.5 py-1 rounded-lg">
                      المدة: {durationMin} دقيقة
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1E21] flex flex-col pb-24" dir="rtl">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE3D6] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-[#756F68] hover:text-[#1C1E21] rounded-xl hover:bg-stone-200/60 transition-colors"
            title="رجوع للمنظم"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-widest text-[#C05638] uppercase font-bold font-serif">
                CHAPTER / ONE
              </span>
              <span className="text-stone-300">·</span>
              <h1 className="text-base font-bold font-serif text-[#1C1E21]">مخطط الرواية (Planner Hub)</h1>
            </div>
            <p className="text-xs text-[#756F68]">
              {activeTab === 0
                ? 'لوحة المشاهد والبطاقات (Board)'
                : activeTab === 1
                ? 'الجدول الزمني للأحداث (Timeline) وتسلسل الفصول'
                : activeTab === 2
                ? 'موسوعة الكودكس: الأشخاص، الأماكن، الأغراض، ونظام السحر'
                : 'إحصاءات الإنتاجية وجلسات الكتابة'}
            </p>
          </div>
        </div>

        {/* Quick Add Action for current tab */}
        {activeTab === 0 && (
          <button
            onClick={() => {
              setEditingScene(null);
              setSceneModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>مشهد جديد</span>
          </button>
        )}
        {activeTab === 1 && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setEventModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>حدث زمني جديد</span>
          </button>
        )}
        {activeTab === 2 && (
          <button
            onClick={() => openNewItemModal(activeCodexSubsection)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{currentSubConfig.addBtnText}</span>
          </button>
        )}
      </header>

      {/* Main Tab Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 0 && renderBoardTab()}
        {activeTab === 1 && renderTimelineTab()}
        {activeTab === 2 && renderCodexTab()}
        {activeTab === 3 && renderStatsTab()}
      </main>

      {/* Fixed Bottom Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE3D6] max-w-4xl mx-auto shadow-lg">
        <div className="grid grid-cols-4 items-center h-16 px-2">
          {/* Tab 0: Board */}
          <button
            onClick={() => setActiveTab(0)}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 0 ? 'text-[#C05638] font-bold' : 'text-[#756F68] hover:text-[#1C1E21]'
            }`}
          >
            <Kanban className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium font-serif">لوحة المشاهد</span>
          </button>

          {/* Tab 1: Timeline (الجدول الزمني للأحداث) */}
          <button
            onClick={() => setActiveTab(1)}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 1 ? 'text-[#C05638] font-bold' : 'text-[#756F68] hover:text-[#1C1E21]'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium font-serif">الجدول الزمني</span>
          </button>

          {/* Tab 2: Codex */}
          <button
            onClick={() => setActiveTab(2)}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 2 ? 'text-[#C05638] font-bold' : 'text-[#756F68] hover:text-[#1C1E21]'
            }`}
          >
            <BookMarked className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium font-serif">الكودكس (Codex)</span>
          </button>

          {/* Tab 3: Stats */}
          <button
            onClick={() => setActiveTab(3)}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 3 ? 'text-[#C05638] font-bold' : 'text-[#756F68] hover:text-[#1C1E21]'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-[11px] font-medium font-serif">الإحصاءات</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <SceneModal
        isOpen={sceneModalOpen}
        scene={editingScene}
        chapters={chapters}
        onClose={() => setSceneModalOpen(false)}
        onSave={onSaveScene}
        onDelete={onDeleteScene}
      />

      <CharacterModal
        isOpen={charModalOpen}
        character={editingChar}
        allCharacters={characters}
        defaultCategory={modalDefaultCategory}
        onClose={() => setCharModalOpen(false)}
        onSave={onSaveCharacter}
        onDelete={onDeleteCharacter}
      />

      <TimelineEventModal
        isOpen={eventModalOpen}
        event={editingEvent}
        chapters={chapters}
        nextOrder={timelineEvents.length + 1}
        onClose={() => setEventModalOpen(false)}
        onSave={onSaveTimelineEvent}
        onDelete={onDeleteTimelineEvent}
      />
    </div>
  );
};

export default PlannerHub;
