import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Sliders,
  List,
  Edit3,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Check,
  Sparkles
} from 'lucide-react';
import { Chapter, AppSettings, ReadingMode, Bookmark } from '../types';
import { READING_THEMES } from '../services/readingThemes';

interface ReadingModeViewProps {
  chapters: Chapter[];
  initialChapterId: string;
  settings?: AppSettings;
  bookmarks: Bookmark[];
  onToggleBookmark: (
    chapterId: string,
    chapterTitle: string,
    scrollProgress: number,
    note?: string,
    snippet?: string
  ) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onUpdateReadingMode?: (mode: ReadingMode) => void;
  onBack: () => void;
  onEditChapter?: (chapterId: string) => void;
}

type ReaderFontFamily = 'amiri' | 'tajawal' | 'cairo' | 'jakarta';

interface ReaderFontOption {
  id: ReaderFontFamily;
  label: string;
  subLabel: string;
  fontFamily: string;
}

const FONT_OPTIONS: ReaderFontOption[] = [
  { id: 'amiri', label: 'New York', subLabel: 'أميري كلاسيكي', fontFamily: "'Amiri', serif" },
  { id: 'tajawal', label: 'Helvetica', subLabel: 'تجوال سلس', fontFamily: "'Tajawal', sans-serif" },
  { id: 'cairo', label: 'Nobel', subLabel: 'قاهرة هندسي', fontFamily: "'Cairo', sans-serif" },
  { id: 'jakarta', label: 'Gothic', subLabel: 'حديث وواضح', fontFamily: "'Plus Jakarta Sans', sans-serif" },
];

export const ReadingModeView: React.FC<ReadingModeViewProps> = ({
  chapters,
  initialChapterId,
  settings,
  bookmarks,
  onToggleBookmark,
  onDeleteBookmark,
  onUpdateReadingMode,
  onBack,
  onEditChapter,
}) => {
  const [currentChapterId, setCurrentChapterId] = useState<string>(initialChapterId);
  const [currentReadingMode, setCurrentReadingMode] = useState<ReadingMode>(
    settings?.readingMode || 'dark'
  );

  // Typography controls matching Image 1
  const [fontSize, setFontSize] = useState<number>(settings?.fontSize || 22);
  const [activeFont, setActiveFont] = useState<ReaderFontFamily>('amiri');

  // UI Drawers & Sheets
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState(false);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Audio speech / ambient player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Scroll & Progress Tracking
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Current active chapter
  const currentChapterIndex = useMemo(() => {
    const idx = chapters.findIndex((c) => c.id === currentChapterId);
    return idx >= 0 ? idx : 0;
  }, [chapters, currentChapterId]);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  // Active theme
  const activeTheme = READING_THEMES[currentReadingMode] || READING_THEMES.dark;

  // Selected font object
  const currentFontObj = FONT_OPTIONS.find((f) => f.id === activeFont) || FONT_OPTIONS[0];

  // Calculate read metrics
  const totalNovelWords = useMemo(
    () => chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
    [chapters]
  );

  const wordsBeforeCurrentChapter = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < currentChapterIndex; i++) {
      sum += chapters[i].wordCount || 0;
    }
    return sum;
  }, [chapters, currentChapterIndex]);

  const currentChapterWords = currentChapter?.wordCount || 0;
  const currentChapterReadWords = Math.round((currentChapterWords * scrollProgress) / 100);
  const totalWordsReadSoFar = wordsBeforeCurrentChapter + currentChapterReadWords;

  const overallNovelProgressPct = useMemo(() => {
    if (totalNovelWords === 0) return 0;
    return Math.min(100, Math.round((totalWordsReadSoFar / totalNovelWords) * 100));
  }, [totalWordsReadSoFar, totalNovelWords]);

  const remainingChapterWords = Math.max(0, currentChapterWords - currentChapterReadWords);
  const remainingReadingTimeMin = Math.max(1, Math.ceil(remainingChapterWords / 180));

  const currentChapterBookmark = useMemo(() => {
    return bookmarks.find((b) => b.chapterId === currentChapterId);
  }, [bookmarks, currentChapterId]);

  // Track scroll position
  const handleScroll = () => {
    if (!contentContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentContainerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setScrollProgress(100);
    } else {
      const pct = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setScrollProgress(Math.round(pct));
    }
  };

  const scrollToPercentage = (pct: number) => {
    if (!contentContainerRef.current) return;
    const { scrollHeight, clientHeight } = contentContainerRef.current;
    const targetScroll = ((scrollHeight - clientHeight) * pct) / 100;
    contentContainerRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
      setScrollProgress(0);
    }
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [currentChapterId]);

  // Text-to-Speech audio reading toggle
  const toggleAudioSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('ميزة القراءة الصوتية غير مدعومة في هذا المتصفح');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToRead = currentChapter?.documentJson || currentChapter?.title || '';
      if (!textToRead.trim()) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Navigation
  const canGoPrevious = currentChapterIndex > 0;
  const canGoNext = currentChapterIndex < chapters.length - 1;

  const goToPreviousChapter = () => {
    if (canGoPrevious) setCurrentChapterId(chapters[currentChapterIndex - 1].id);
  };

  const goToNextChapter = () => {
    if (canGoNext) setCurrentChapterId(chapters[currentChapterIndex + 1].id);
  };

  // Quick Bookmark
  const handleQuickBookmark = () => {
    onToggleBookmark(
      currentChapter.id,
      currentChapter.title,
      scrollProgress,
      undefined,
      currentChapter.documentJson?.slice(0, 100) || ''
    );
  };

  // Extract clean text paragraphs & drop-cap
  const paragraphs = useMemo(() => {
    const raw = currentChapter?.documentJson || '';
    if (!raw.trim()) {
      return ['لا يوجد محتوى في هذا الفصل حتى الآن. يمكنك النقر على زر التعديل لكتابة أولى سطور الرواية.'];
    }
    return raw.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  }, [currentChapter?.documentJson]);

  // First paragraph and initial drop cap
  const firstParagraph = paragraphs[0] || '';
  const firstLetter = firstParagraph.trim().charAt(0);
  const remainingFirstParagraph = firstParagraph.trim().slice(1);
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <div
      className={`min-h-screen h-screen flex flex-col select-none transition-colors duration-300 relative overflow-hidden ${activeTheme.bgClass} ${activeTheme.textClass}`}
      dir="rtl"
    >
      {/* Top Header Bar matching Image 1: Close X, Play Pill, Bookmark Ribbon */}
      <header className="h-16 shrink-0 px-5 sm:px-8 flex items-center justify-between z-30 transition-colors">
        {/* Left (or Right in RTL): Close X button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95"
            title="إغلاق وضع القراءة"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Table of contents shortcut */}
          <button
            onClick={() => setIsTocDrawerOpen(!isTocDrawerOpen)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-xs font-serif opacity-75 hover:opacity-100 transition-opacity hidden sm:flex items-center gap-1.5"
            title="فهرس الفصول"
          >
            <List className="w-4 h-4" />
            <span>فصل {currentChapterIndex + 1} من {chapters.length}</span>
          </button>
        </div>

        {/* Center: Play / Pause Pill Action Button matching Image 1 */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={toggleAudioSpeech}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all shadow-sm active:scale-95 ${
              isPlayingAudio
                ? 'bg-[#C05638] text-white shadow-md shadow-[#C05638]/30 animate-pulse'
                : 'bg-black/10 dark:bg-white/15 hover:bg-black/15 dark:hover:bg-white/20 border border-black/10 dark:border-white/20'
            }`}
            title={isPlayingAudio ? 'إيقاف القراءة الصوتية' : 'بدء القراءة الصوتية للنص'}
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>play</span>
              </>
            )}
          </button>
        </div>

        {/* Right (or Left in RTL): Hanging Bookmark Ribbon Tag matching Image 1 */}
        <div className="flex items-center gap-2">
          {onEditChapter && (
            <button
              onClick={() => onEditChapter(currentChapter.id)}
              className="p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity hidden sm:block"
              title="تعديل هذا الفصل في المحرر"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleQuickBookmark}
            className={`p-2 transition-transform active:scale-90 ${
              currentChapterBookmark
                ? 'text-[#C05638] scale-110 drop-shadow-sm'
                : 'opacity-40 hover:opacity-80'
            }`}
            title={currentChapterBookmark ? 'هذا الفصل مُعلم بإشارة (انقر للإلغاء)' : 'إضافة إشارة مرجعية'}
          >
            <BookmarkIcon
              className={`w-6 h-6 ${currentChapterBookmark ? 'fill-[#C05638]' : ''}`}
            />
          </button>
        </div>
      </header>

      {/* Main Reading Flow Layout */}
      <main
        ref={contentContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 lg:px-32 py-8 transition-all scroll-smooth"
        style={{
          fontFamily: currentFontObj.fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '2.1',
        }}
      >
        <div className="max-w-2xl mx-auto pb-32">
          {/* Chapter Title matching Image 1 ("Chapter Two") */}
          <div className="text-center my-10 sm:my-14 select-text">
            <span className="text-xs uppercase tracking-[0.2em] opacity-60 font-sans block mb-2">
              الفصل {currentChapterIndex + 1}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
              {currentChapter?.title || `الفصل ${currentChapterIndex + 1}`}
            </h1>
            <div className="w-12 h-0.5 bg-[#C05638] mx-auto mt-4 rounded-full opacity-70" />
          </div>

          {/* Reading Prose Body with Drop Cap matching Image 1 */}
          <article className="select-text space-y-6 leading-relaxed text-justify">
            {firstParagraph && (
              <div className="relative">
                {/* Large Drop Cap Initial Letter */}
                <span
                  className="float-right text-6xl sm:text-7xl font-bold leading-none ml-4 mt-1 font-serif text-[#C05638] select-none"
                  style={{ lineHeight: 0.8 }}
                >
                  {firstLetter}
                </span>
                <p>{remainingFirstParagraph}</p>
              </div>
            )}

            {remainingParagraphs.map((para, idx) => (
              <p key={idx} className="indent-6 sm:indent-8">
                {para}
              </p>
            ))}
          </article>
        </div>
      </main>

      {/* Floating Bottom Bar: Progress & Settings Trigger */}
      <footer className="shrink-0 h-16 border-t border-black/5 dark:border-white/10 px-6 sm:px-12 flex items-center justify-between z-20 backdrop-blur-md bg-transparent">
        {/* Previous Chapter */}
        <button
          onClick={goToPreviousChapter}
          disabled={!canGoPrevious}
          className={`flex items-center gap-1.5 text-xs font-serif transition-opacity ${
            canGoPrevious ? 'opacity-80 hover:opacity-100 hover:text-[#C05638]' : 'opacity-20 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          <span className="hidden sm:inline">الفصل السابق</span>
        </button>

        {/* Center: Novel Progress & Chapter Indicator */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-xs font-mono opacity-70">
            <span>{scrollProgress}% من الفصل</span>
            <span>·</span>
            <span>{overallNovelProgressPct}% من الرواية</span>
          </div>
          <div className="w-40 sm:w-56 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#C05638] transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* Next Chapter & Settings Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsSheetOpen(!isSettingsSheetOpen)}
            className={`p-2.5 rounded-full border transition-all ${
              isSettingsSheetOpen
                ? 'bg-[#C05638] text-white border-[#C05638] shadow-md shadow-[#C05638]/20'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border-black/10 dark:border-white/15'
            }`}
            title="إعدادات مظهر القراءة والخط"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={goToNextChapter}
            disabled={!canGoNext}
            className={`flex items-center gap-1.5 text-xs font-serif transition-opacity ${
              canGoNext ? 'opacity-80 hover:opacity-100 hover:text-[#C05638]' : 'opacity-20 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">الفصل التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Floating Settings Sheet matching Image 1 with 100% Precision */}
      {isSettingsSheetOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-6 animate-in slide-in-from-bottom duration-200"
          dir="rtl"
        >
          {/* Backdrop click to dismiss */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] -z-10"
            onClick={() => setIsSettingsSheetOpen(false)}
          />

          <div className="w-full max-w-md bg-white text-[#1C1E21] rounded-3xl shadow-2xl p-6 sm:p-7 border border-[#EBE4D8] relative">
            {/* Header: "SETTINGS" */}
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#8C827A] uppercase font-sans">
                SETTINGS
              </span>
            </div>

            {/* 1. Font Size Slider: Small Aa — Track — Large Aa */}
            <div className="flex items-center gap-4 mb-8 px-2">
              <span className="text-xs font-serif text-[#1C1E21] select-none">Aa</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="16"
                  max="36"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#E8E2D8] rounded-lg appearance-none cursor-pointer accent-[#C05638]"
                />
              </div>
              <span className="text-xl font-serif font-bold text-[#1C1E21] select-none">Aa</span>
            </div>

            {/* 2. Font Choices: 4 Columns (New York, Helvetica, Nobel, Gothic) */}
            <div className="grid grid-cols-4 gap-2 text-center mb-8">
              {FONT_OPTIONS.map((f) => {
                const isSelected = activeFont === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFont(f.id)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl transition-all group"
                  >
                    <span
                      className={`text-xl sm:text-2xl transition-colors ${
                        isSelected ? 'text-[#C05638] font-bold scale-110' : 'text-[#2D3136] opacity-80 group-hover:opacity-100'
                      }`}
                      style={{ fontFamily: f.fontFamily }}
                    >
                      Aa
                    </span>
                    <span
                      className={`text-[11px] mt-1.5 font-sans transition-colors ${
                        isSelected ? 'text-[#C05638] font-bold' : 'text-[#756F68]'
                      }`}
                    >
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Theme Color Swatches: 4 Circles (White/Paper, Dark/Night, Deep Forest, Warm Rose) */}
            <div className="flex items-center justify-center gap-5 sm:gap-6 pt-2 border-t border-[#F0EAE1]">
              {/* Swatch 1: Day White / Paper */}
              <button
                type="button"
                onClick={() => {
                  setCurrentReadingMode('paper');
                  if (onUpdateReadingMode) onUpdateReadingMode('paper');
                }}
                className={`w-12 h-12 rounded-full border-2 transition-transform shadow-sm relative flex items-center justify-center ${
                  currentReadingMode === 'paper'
                    ? 'border-[#C05638] ring-2 ring-[#C05638]/40 scale-105'
                    : 'border-[#DDD7C8] hover:scale-105'
                }`}
                style={{ backgroundColor: '#FAF7F2' }}
                title="أوراق دافئة (Day Cream)"
              />

              {/* Swatch 2: Dark Night Slate (Active in reference image 1) */}
              <button
                type="button"
                onClick={() => {
                  setCurrentReadingMode('dark');
                  if (onUpdateReadingMode) onUpdateReadingMode('dark');
                }}
                className={`w-12 h-12 rounded-full border-2 transition-transform shadow-sm relative flex items-center justify-center ${
                  currentReadingMode === 'dark'
                    ? 'border-[#C05638] ring-4 ring-[#C05638]/40 scale-105'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: '#191C22' }}
                title="الوضع الليلي (Night Slate)"
              >
                {currentReadingMode === 'dark' && (
                  <div className="w-10 h-10 rounded-full border-2 border-[#191C22]" />
                )}
              </button>

              {/* Swatch 3: Deep Forest Green */}
              <button
                type="button"
                onClick={() => {
                  setCurrentReadingMode('forest');
                  if (onUpdateReadingMode) onUpdateReadingMode('forest');
                }}
                className={`w-12 h-12 rounded-full border-2 transition-transform shadow-sm relative flex items-center justify-center ${
                  currentReadingMode === 'forest'
                    ? 'border-[#C05638] ring-2 ring-[#C05638]/40 scale-105'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: '#14382F' }}
                title="غابة هادئة (Deep Forest)"
              />

              {/* Swatch 4: Warm Peach Rose */}
              <button
                type="button"
                onClick={() => {
                  setCurrentReadingMode('rose');
                  if (onUpdateReadingMode) onUpdateReadingMode('rose');
                }}
                className={`w-12 h-12 rounded-full border-2 transition-transform shadow-sm relative flex items-center justify-center ${
                  currentReadingMode === 'rose'
                    ? 'border-[#C05638] ring-2 ring-[#C05638]/40 scale-105'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: '#E8C5B8' }}
                title="شفق وردي (Warm Rose)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Drawer */}
      {isTocDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-80 max-w-full bg-[#1C1E24] text-stone-100 h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <h3 className="font-serif font-bold text-lg">فهرس الفصول</h3>
                <button
                  onClick={() => setIsTocDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 mt-4">
                {chapters.map((ch, idx) => {
                  const isCurrent = ch.id === currentChapterId;
                  const hasBookmark = bookmarks.some((b) => b.chapterId === ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setCurrentChapterId(ch.id);
                        setIsTocDrawerOpen(false);
                      }}
                      className={`w-full text-right p-3 rounded-xl text-xs font-serif flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-[#C05638] text-white font-bold shadow-md'
                          : 'text-stone-300 hover:bg-stone-800/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="opacity-60 text-[10px] block font-sans">فصل {idx + 1}</span>
                        <span className="truncate block">{ch.title}</span>
                      </div>
                      {hasBookmark && <BookmarkIcon className="w-4 h-4 fill-current text-amber-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 text-center text-[11px] text-stone-400">
              إجمالي كلمات الرواية: {totalNovelWords.toLocaleString()} كلمة
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
