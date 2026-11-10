import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  ArrowLeftRight,
  BookOpen,
  Edit3,
  BarChart2,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronDown,
  StickyNote,
  Columns2,
  AlignRight
} from 'lucide-react';
import { Chapter, ChapterStatus } from '../types';
import {
  compareChapters,
  STATUS_PROGRESS_MAP,
  STATUS_ORDER,
  ChapterComparisonResult
} from '../services/chapterComparison';

interface ChapterCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  initialChapterAId?: string | null;
  initialChapterBId?: string | null;
  totalNovelWords?: number;
  onOpenEditor?: (chapterId: string) => void;
  onOpenReader?: (chapterId: string) => void;
}

export const ChapterCompareModal: React.FC<ChapterCompareModalProps> = ({
  isOpen,
  onClose,
  chapters,
  initialChapterAId,
  initialChapterBId,
  totalNovelWords = 0,
  onOpenEditor,
  onOpenReader,
}) => {
  // Available active chapters to select
  const activeChapters = useMemo(() => chapters.filter((c) => !c.isArchived), [chapters]);

  // Selected chapters state
  const [chapterAId, setChapterAId] = useState<string>(() => {
    if (initialChapterAId && activeChapters.some((c) => c.id === initialChapterAId)) {
      return initialChapterAId;
    }
    return activeChapters[0]?.id || '';
  });

  const [chapterBId, setChapterBId] = useState<string>(() => {
    if (initialChapterBId && activeChapters.some((c) => c.id === initialChapterBId)) {
      return initialChapterBId;
    }
    return activeChapters[1]?.id || activeChapters[0]?.id || '';
  });

  // Active view tab: 'metrics' (المؤشرات والتقدم) | 'prose' (المعاينة النصية الجانبية)
  const [activeTab, setActiveTab] = useState<'metrics' | 'prose'>('metrics');
  const [syncScroll, setSyncScroll] = useState<boolean>(true);

  // References for synchronized scrolling
  const colARef = useRef<HTMLDivElement>(null);
  const colBRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef<boolean>(false);

  // Keep state synced if props change on open
  React.useEffect(() => {
    if (initialChapterAId && activeChapters.some((c) => c.id === initialChapterAId)) {
      setChapterAId(initialChapterAId);
    }
    if (initialChapterBId && activeChapters.some((c) => c.id === initialChapterBId)) {
      setChapterBId(initialChapterBId);
    } else if (!initialChapterBId && activeChapters.length > 1) {
      // Pick second chapter if different from A
      const other = activeChapters.find((c) => c.id !== (initialChapterAId || activeChapters[0]?.id));
      if (other) setChapterBId(other.id);
    }
  }, [initialChapterAId, initialChapterBId, activeChapters]);

  const selectedChapterA = useMemo(
    () => activeChapters.find((c) => c.id === chapterAId) || activeChapters[0],
    [activeChapters, chapterAId]
  );

  const selectedChapterB = useMemo(
    () => activeChapters.find((c) => c.id === chapterBId) || activeChapters[1] || activeChapters[0],
    [activeChapters, chapterBId]
  );

  const comparison: ChapterComparisonResult | null = useMemo(() => {
    if (!selectedChapterA || !selectedChapterB) return null;
    return compareChapters(selectedChapterA, selectedChapterB, totalNovelWords);
  }, [selectedChapterA, selectedChapterB, totalNovelWords]);

  if (!isOpen) return null;

  // Swap chapters A and B
  const handleSwap = () => {
    const temp = chapterAId;
    setChapterAId(chapterBId);
    setChapterBId(temp);
  };

  // Synchronized scrolling handlers
  const handleScrollA = () => {
    if (!syncScroll || isSyncing.current || !colARef.current || !colBRef.current) return;
    isSyncing.current = true;
    const ratio =
      colARef.current.scrollTop /
      (colARef.current.scrollHeight - colARef.current.clientHeight || 1);
    colBRef.current.scrollTop =
      ratio * (colBRef.current.scrollHeight - colBRef.current.clientHeight);
    setTimeout(() => {
      isSyncing.current = false;
    }, 20);
  };

  const handleScrollB = () => {
    if (!syncScroll || isSyncing.current || !colARef.current || !colBRef.current) return;
    isSyncing.current = true;
    const ratio =
      colBRef.current.scrollTop /
      (colBRef.current.scrollHeight - colBRef.current.clientHeight || 1);
    colARef.current.scrollTop =
      ratio * (colARef.current.scrollHeight - colARef.current.clientHeight);
    setTimeout(() => {
      isSyncing.current = false;
    }, 20);
  };

  // Helper for status styling
  const getStatusBadge = (status: ChapterStatus) => {
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

  // Convert rich content or html into plain readable text for comparison
  const formatPlainText = (rawText: string | undefined) => {
    if (!rawText) return 'لا يوجد نص مكتوب في هذا الفصل حتى الآن.';
    const textWithoutHtml = rawText.replace(/<[^>]+>/g, '\n');
    return textWithoutHtml.trim();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-white border border-[#EAE3D6] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1C1E21] font-sans">
        {/* Top Header */}
        <div className="px-5 sm:px-8 py-4 bg-[#FAF7F2] border-b border-[#EAE3D6] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FBECE7] text-[#C05638] flex items-center justify-center">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#1C1E21]">
                  المقارنة الجانبية بين فصلين
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FBECE7] text-[#C05638] font-bold font-mono">
                  تحليل الكلمات والتقدم
                </span>
              </div>
              <p className="text-xs text-[#756F68] font-serif">
                قارن بين عدد الكلمات ومراحل التقدم واستعرض النص جنباً إلى جنب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher tabs */}
            <div className="flex items-center bg-[#FAF7F2] border border-[#EAE3D6] p-1 rounded-full">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'metrics'
                    ? 'bg-[#C05638] text-white shadow-xs font-bold'
                    : 'text-[#756F68] hover:text-[#1C1E21]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>المؤشرات والتقدم</span>
              </button>
              <button
                onClick={() => setActiveTab('prose')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'prose'
                    ? 'bg-[#C05638] text-white shadow-xs font-bold'
                    : 'text-[#756F68] hover:text-[#1C1E21]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>المعاينة النصية</span>
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#756F68] hover:text-[#1C1E21] hover:bg-black/5 transition-colors"
              title="إغلاق نافذة المقارنة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chapter Selection Bar */}
        <div className="px-5 sm:px-8 py-3.5 bg-[#FAF7F2]/60 border-b border-[#EAE3D6] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0">
          {/* Chapter A Selector */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#FBECE7] text-[#C05638] shrink-0 font-sans">
              الطرف (أ)
            </span>
            <div className="relative flex-1">
              <select
                value={chapterAId}
                onChange={(e) => setChapterAId(e.target.value)}
                className="w-full bg-white border border-[#EAE3D6] hover:border-[#C05638]/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1C1E21] font-medium focus:outline-hidden focus:border-[#C05638] transition-colors appearance-none pr-3 pl-8 cursor-pointer font-serif shadow-xs"
              >
                {activeChapters.map((ch, idx) => (
                  <option key={ch.id} value={ch.id} disabled={ch.id === chapterBId}>
                    {idx + 1}. {ch.title} ({ch.wordCount} كلمة · {ch.status})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#8C827A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="p-2.5 rounded-full bg-white hover:bg-[#FAF7F2] text-[#C05638] border border-[#EAE3D6] transition-all hover:scale-105 active:scale-95 shrink-0 shadow-xs"
            title="تبديل طرفي المقارنة (أ ⇆ ب)"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Chapter B Selector */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#E8F0EA] text-[#2D5A43] shrink-0 font-sans">
              الطرف (ب)
            </span>
            <div className="relative flex-1">
              <select
                value={chapterBId}
                onChange={(e) => setChapterBId(e.target.value)}
                className="w-full bg-white border border-[#EAE3D6] hover:border-[#2D5A43]/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1C1E21] font-medium focus:outline-hidden focus:border-[#2D5A43] transition-colors appearance-none pr-3 pl-8 cursor-pointer font-serif shadow-xs"
              >
                {activeChapters.map((ch, idx) => (
                  <option key={ch.id} value={ch.id} disabled={ch.id === chapterAId}>
                    {idx + 1}. {ch.title} ({ch.wordCount} كلمة · {ch.status})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#8C827A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Body */}
        {comparison && selectedChapterA && selectedChapterB ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {activeTab === 'metrics' ? (
              <>
                {/* 1. Side-by-Side Hero Cards with Status & Word Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card A */}
                  <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#C05638]" />
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FBECE7] text-[#C05638] font-sans">
                            الطرف (أ)
                          </span>
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(
                              comparison.statusA
                            )}`}
                          >
                            {comparison.statusA}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-[#1C1E21] truncate max-w-[280px]">
                          {selectedChapterA.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onOpenEditor && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenEditor(selectedChapterA.id);
                            }}
                            className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#756F68] hover:text-[#1C1E21] transition-colors"
                            title="تحرير الفصل في المحرر"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {onOpenReader && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenReader(selectedChapterA.id);
                            }}
                            className="p-2 rounded-full bg-[#FBECE7] hover:bg-[#C05638] text-[#C05638] hover:text-white transition-colors"
                            title="قراءة في وضع القراءة المريح"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Word Metric */}
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EAE3D6] mb-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs text-[#756F68] font-serif">إجمالي الكلمات</span>
                        <div className="text-left">
                          <span className="text-2xl font-bold font-serif text-[#C05638] tabular-nums">
                            {comparison.wordCountA.toLocaleString('ar-EG')}
                          </span>
                          <span className="text-xs text-[#756F68] mr-1">كلمة</span>
                        </div>
                      </div>

                      {/* Progress to novel */}
                      <div className="w-full bg-[#EAE3D6] h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#C05638] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, comparison.shareOfNovelA)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#756F68] font-serif">
                        <span>يشكل {comparison.shareOfNovelA}% من إجمالي الرواية</span>
                        <span className="tabular-nums">~{comparison.readingTimeMinutesA} دقيقة قراءة</span>
                      </div>
                    </div>

                    {/* Stage Ladder */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#756F68] block mb-1 font-serif">مرحلة التقدم:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {STATUS_ORDER.map((s) => {
                          const isCurrent = comparison.statusA === s;
                          const isDone = STATUS_PROGRESS_MAP[comparison.statusA] >= STATUS_PROGRESS_MAP[s];
                          return (
                            <div
                              key={s}
                              className={`text-center py-1.5 px-1 rounded-xl text-[10px] font-semibold border transition-colors ${
                                isCurrent
                                  ? 'bg-[#C05638] text-white border-[#C05638] shadow-xs font-bold'
                                  : isDone
                                  ? 'bg-[#FBECE7] text-[#C05638] border-[#EAE3D6]'
                                  : 'bg-[#FAF7F2] text-[#8C827A] border-[#EAE3D6]'
                              }`}
                            >
                              {s}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card B */}
                  <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 relative overflow-hidden shadow-xs hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#2D5A43]" />
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F0EA] text-[#2D5A43] font-sans">
                            الفصل الثاني (ب)
                          </span>
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(
                              comparison.statusB
                            )}`}
                          >
                            {comparison.statusB}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold font-serif text-[#1C1E21] truncate max-w-[280px]">
                          {selectedChapterB.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onOpenEditor && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenEditor(selectedChapterB.id);
                            }}
                            className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#756F68] hover:text-[#1C1E21] transition-colors"
                            title="تحرير الفصل في المحرر"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {onOpenReader && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenReader(selectedChapterB.id);
                            }}
                            className="p-2 rounded-full bg-[#E8F0EA] hover:bg-[#2D5A43] text-[#2D5A43] hover:text-white transition-colors"
                            title="قراءة في وضع القراءة المريح"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Word Metric */}
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EAE3D6] mb-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs text-[#756F68] font-serif">إجمالي الكلمات</span>
                        <div className="text-left">
                          <span className="text-2xl font-bold font-serif text-[#2D5A43] tabular-nums">
                            {comparison.wordCountB.toLocaleString('ar-EG')}
                          </span>
                          <span className="text-xs text-[#756F68] mr-1">كلمة</span>
                        </div>
                      </div>

                      {/* Progress to novel */}
                      <div className="w-full bg-[#EAE3D6] h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#2D5A43] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, comparison.shareOfNovelB)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#756F68] font-serif">
                        <span>يشكل {comparison.shareOfNovelB}% من إجمالي الرواية</span>
                        <span className="tabular-nums">~{comparison.readingTimeMinutesB} دقيقة قراءة</span>
                      </div>
                    </div>

                    {/* Stage Ladder */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#756F68] block mb-1 font-serif">مرحلة التقدم:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {STATUS_ORDER.map((s) => {
                          const isCurrent = comparison.statusB === s;
                          const isDone = STATUS_PROGRESS_MAP[comparison.statusB] >= STATUS_PROGRESS_MAP[s];
                          return (
                            <div
                              key={s}
                              className={`text-center py-1.5 px-1 rounded-xl text-[10px] font-semibold border transition-colors ${
                                isCurrent
                                  ? 'bg-[#2D5A43] text-white border-[#2D5A43] shadow-xs font-bold'
                                  : isDone
                                  ? 'bg-[#E8F0EA] text-[#2D5A43] border-[#EAE3D6]'
                                  : 'bg-[#FAF7F2] text-[#8C827A] border-[#EAE3D6]'
                              }`}
                            >
                              {s}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Balance Bar for Words */}
                <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#C05638]" />
                      <h4 className="text-base font-bold text-[#1C1E21] font-serif">
                        ميزان الكلمات المقارن (توزيع الحجم بين الفصلين)
                      </h4>
                    </div>
                    <span className="text-xs text-[#756F68] font-medium tabular-nums font-serif">
                      إجمالي الفصلين:{' '}
                      <strong className="text-[#1C1E21]">
                        {(comparison.wordCountA + comparison.wordCountB).toLocaleString('ar-EG')}
                      </strong>{' '}
                      كلمة
                    </span>
                  </div>

                  {/* Dual Segmented Bar */}
                  <div className="space-y-2.5">
                    <div className="h-3.5 w-full bg-[#FAF7F2] rounded-full overflow-hidden flex p-0.5 border border-[#EAE3D6]">
                      <div
                        className="bg-[#C05638] h-full rounded-r-full transition-all duration-500"
                        style={{ width: `${comparison.wordRatioA}%` }}
                        title={`الطرف (أ): ${comparison.wordCountA} كلمة (${comparison.wordRatioA}%)`}
                      />
                      <div
                        className="bg-[#2D5A43] h-full rounded-l-full transition-all duration-500"
                        style={{ width: `${comparison.wordRatioB}%` }}
                        title={`الطرف (ب): ${comparison.wordCountB} كلمة (${comparison.wordRatioB}%)`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-serif">
                      <div className="flex items-center gap-2 text-[#C05638] font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C05638] inline-block" />
                        <span>
                          (أ) {selectedChapterA.title}: {comparison.wordRatioA}% ({comparison.wordCountA} كلمة)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#2D5A43] font-semibold">
                        <span>
                          (ب) {selectedChapterB.title}: {comparison.wordRatioB}% ({comparison.wordCountB} كلمة)
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A43] inline-block" />
                      </div>
                    </div>
                  </div>

                  {/* Diff indicator banner */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-between gap-4 text-xs font-serif">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C05638] shrink-0" />
                      <span className="text-[#1C1E21]">{comparison.pacingSummary}</span>
                    </div>
                    <div className="shrink-0 text-left font-semibold">
                      {comparison.wordDiff === 0 ? (
                        <span className="text-[#756F68]">تطابق تام</span>
                      ) : comparison.wordDiff > 0 ? (
                        <span className="text-[#2D5A43] tabular-nums font-bold">
                          + {comparison.absoluteWordDiff.toLocaleString('ar-EG')} كلمة لـ (ب)
                        </span>
                      ) : (
                        <span className="text-[#C05638] tabular-nums font-bold">
                          + {comparison.absoluteWordDiff.toLocaleString('ar-EG')} كلمة لـ (أ)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Detailed Side-by-Side Narrative & Technical Metrics */}
                <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 space-y-4 shadow-xs">
                  <h4 className="text-base font-bold text-[#1C1E21] font-serif flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C05638]" />
                    <span>جدول القياسات التفصيلية</span>
                  </h4>

                  <div className="divide-y divide-[#EAE3D6] text-xs font-serif">
                    {/* Row: Status & Progress */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C05638]" />
                        <span>حالة التقدم المنجزة</span>
                      </div>
                      <div className="col-span-4 text-center font-bold text-[#C05638]">
                        {comparison.statusA} ({comparison.progressPercentA}%)
                      </div>
                      <div className="col-span-4 text-center font-bold text-[#2D5A43]">
                        {comparison.statusB} ({comparison.progressPercentB}%)
                      </div>
                    </div>

                    {/* Row: Estimated Reading Time */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#756F68]" />
                        <span>وقت القراءة المتوقع</span>
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        ~{comparison.readingTimeMinutesA} دقيقة
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        ~{comparison.readingTimeMinutesB} دقيقة
                      </div>
                    </div>

                    {/* Row: Paragraphs Count */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#756F68]" />
                        <span>عدد الفقرات</span>
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        {comparison.paragraphsA} فقرة
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        {comparison.paragraphsB} فقرة
                      </div>
                    </div>

                    {/* Row: Avg Words per Paragraph */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <AlignRight className="w-3.5 h-3.5 text-[#756F68]" />
                        <span>متوسط كلمات الفقرة (كثافة السرد)</span>
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        ~{comparison.avgWordsPerParagraphA} كلمة/فقرة
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        ~{comparison.avgWordsPerParagraphB} كلمة/فقرة
                      </div>
                    </div>

                    {/* Row: Notes & Revisions */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 text-[#756F68]" />
                        <span>الملاحظات والهوامش المسجلة</span>
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        {comparison.notesCountA} ملاحظة
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        {comparison.notesCountB} ملاحظة
                      </div>
                    </div>

                    {/* Row: Characters count */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#756F68]" />
                        <span>عدد الأحرف (دون مسافات)</span>
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        {comparison.characterCountA.toLocaleString('ar-EG')} حرف
                      </div>
                      <div className="col-span-4 text-center tabular-nums text-[#1C1E21]">
                        {comparison.characterCountB.toLocaleString('ar-EG')} حرف
                      </div>
                    </div>

                    {/* Row: Last modified */}
                    <div className="grid grid-cols-12 py-3 items-center">
                      <div className="col-span-4 text-[#756F68] font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#756F68]" />
                        <span>آخر تحديث وحفظ</span>
                      </div>
                      <div className="col-span-4 text-center text-[#756F68] text-[11px]">
                        {new Date(selectedChapterA.lastModified).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="col-span-4 text-center text-[#756F68] text-[11px]">
                        {new Date(selectedChapterB.lastModified).toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Prose View: Side-by-Side Text Reading */
              <div className="space-y-4">
                {/* Control bar */}
                <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[#1C1E21] font-semibold">المعاينة المقارنة للنص:</span>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[#756F68] hover:text-[#1C1E21]">
                      <input
                        type="checkbox"
                        checked={syncScroll}
                        onChange={(e) => setSyncScroll(e.target.checked)}
                        className="rounded border-[#EAE3D6] text-[#C05638] focus:ring-[#C05638] cursor-pointer"
                      />
                      <span>تفعيل التمرير المتزامن بين العمودين</span>
                    </label>
                  </div>

                  <span className="text-[#756F68] text-[11px]">
                    يمكنك قراءة الفصلين جنباً إلى جنب لمراجعة الترابط والتسلسل السردي
                  </span>
                </div>

                {/* 2-Column Text Pane */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[55vh]">
                  {/* Column A */}
                  <div className="bg-white border border-[#EAE3D6] rounded-2xl flex flex-col overflow-hidden shadow-xs">
                    <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#EAE3D6] flex items-center justify-between shrink-0">
                      <span className="text-xs font-bold text-[#C05638] font-serif truncate">
                        (أ) {selectedChapterA.title}
                      </span>
                      <span className="text-[11px] text-[#756F68] tabular-nums">
                        {comparison.wordCountA} كلمة
                      </span>
                    </div>
                    <div
                      ref={colARef}
                      onScroll={handleScrollA}
                      className="p-5 overflow-y-auto flex-1 font-serif text-base leading-relaxed text-[#1C1E21] whitespace-pre-wrap selection:bg-[#FBECE7]"
                    >
                      {formatPlainText(selectedChapterA.documentJson)}
                    </div>
                  </div>

                  {/* Column B */}
                  <div className="bg-white border border-[#EAE3D6] rounded-2xl flex flex-col overflow-hidden shadow-xs">
                    <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#EAE3D6] flex items-center justify-between shrink-0">
                      <span className="text-xs font-bold text-[#2D5A43] font-serif truncate">
                        (ب) {selectedChapterB.title}
                      </span>
                      <span className="text-[11px] text-[#756F68] tabular-nums">
                        {comparison.wordCountB} كلمة
                      </span>
                    </div>
                    <div
                      ref={colBRef}
                      onScroll={handleScrollB}
                      className="p-5 overflow-y-auto flex-1 font-serif text-base leading-relaxed text-[#1C1E21] whitespace-pre-wrap selection:bg-[#E8F0EA]"
                    >
                      {formatPlainText(selectedChapterB.documentJson)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#756F68]">
            <AlertCircle className="w-10 h-10 text-[#C05638] mb-2" />
            <p className="text-sm">يجب توفر فصلين على الأقل لإجراء المقارنة الجانبية.</p>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-3.5 bg-[#FAF7F2] border-t border-[#EAE3D6] flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-[#756F68] hidden sm:block">
            {comparison ? comparison.statusSummary : ''}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#EAE3D6] hover:bg-[#FAF7F2] text-[#1C1E21] text-xs font-semibold transition-colors shadow-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
