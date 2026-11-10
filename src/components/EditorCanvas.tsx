import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowRight,
  Lock,
  Unlock,
  SpellCheck,
  EyeOff,
  Eye,
  BarChart2,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  Sliders,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Palette,
  Bell,
  X,
  StickyNote,
  MessageSquare,
  Plus,
  Trash2,
  CheckCheck,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  HelpCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { Chapter, ChapterStatus, AppSettings, ReadingMode, ChapterNote } from '../types';
import { ArabicProseAnalyzer, ProseIssueResult } from '../services/proseAnalyzer';
import { ArabicSpellChecker, SpellCheckIssue } from '../services/spellChecker';
import { READING_THEMES } from '../services/readingThemes';

interface EditorCanvasProps {
  chapter: Chapter;
  settings?: AppSettings;
  onSave: (updatedChapter: Chapter, wordsWrittenDelta: number) => void;
  onBack: () => void;
  onOpenStats: () => void;
  onOpenSettings?: () => void;
  onUpdateReadingMode?: (mode: ReadingMode) => void;
  onOpenReaderMode?: () => void;
}

const ARABIC_PUNCTUATION = ['،', '؛', '؟', '«', '»', 'ـ'];
const STATUS_OPTIONS: ChapterStatus[] = ['فكرة', 'مسودة', 'مراجعة', 'مكتمل'];

// Web Audio synthesizer beep function for offline notification
const playTimerAlertSound = (type: 'focusComplete' | 'breakComplete') => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'focusComplete') {
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
      });
    } else {
      const notes = [880.0, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.5);
      });
    }
  } catch (e) {
    console.warn('AudioContext notification skipped:', e);
  }
};

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  chapter,
  settings,
  onSave,
  onBack,
  onOpenStats,
  onOpenSettings,
  onUpdateReadingMode,
  onOpenReaderMode,
}) => {
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.documentJson || '');
  const [status, setStatus] = useState<ChapterStatus>(chapter.status || 'مسودة');

  // Marginal Notes state
  const [notes, setNotes] = useState<ChapterNote[]>(chapter.notes || []);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [selectedQuoteText, setSelectedQuoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'amber' | 'emerald' | 'sky' | 'rose' | 'purple'>('amber');

  // Reading Mode State
  const [currentReadingMode, setCurrentReadingMode] = useState<ReadingMode>(
    settings?.readingMode || 'dark'
  );
  const [isReadingModeMenuOpen, setIsReadingModeMenuOpen] = useState(false);

  useEffect(() => {
    if (settings?.readingMode) {
      setCurrentReadingMode(settings.readingMode);
    }
  }, [settings?.readingMode]);

  const activeTheme = READING_THEMES[currentReadingMode] || READING_THEMES.dark;

  // Editor Modes
  const [isHemingwayMode, setIsHemingwayMode] = useState(false);
  const [isProseCheckEnabled, setIsProseCheckEnabled] = useState(true);
  const [isSpellCheckEnabled, setIsSpellCheckEnabled] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  // Stats & Analysis
  const initialWordCount = useMemo(() => ArabicProseAnalyzer.countWords(chapter.documentJson || ''), []);
  const [currentWordCount, setCurrentWordCount] = useState(initialWordCount);
  const [proseIssues, setProseIssues] = useState<ProseIssueResult>({
    weakWordCount: 0,
    passiveCount: 0,
    repetitionCount: 0,
    fillerCount: 0,
    totalIssues: 0,
    details: {
      weakMatches: [],
      passiveMatches: [],
      repetitionMatches: [],
      fillerMatches: [],
    },
  });

  // Spell Checker State
  const [spellIssues, setSpellIssues] = useState<SpellCheckIssue[]>([]);
  const [isSpellDrawerOpen, setIsSpellDrawerOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analyzerRef = useRef<ArabicProseAnalyzer>(new ArabicProseAnalyzer());

  // Pomodoro timer state
  const focusMinutesSetting = settings?.pomodoroDurationMinutes || 25;
  const breakMinutesSetting = settings?.pomodoroBreakMinutes || 5;

  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'break'>('focus');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(focusMinutesSetting * 60);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [isPomodoroSettingsOpen, setIsPomodoroSettingsOpen] = useState(false);
  const [customFocusDurationInput, setCustomFocusDurationInput] = useState(focusMinutesSetting);
  const [timerAlertBanner, setTimerAlertBanner] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!isTimerRunning && pomodoroMode === 'focus') {
      setSecondsRemaining(focusMinutesSetting * 60);
      setCustomFocusDurationInput(focusMinutesSetting);
    }
  }, [focusMinutesSetting, isTimerRunning, pomodoroMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (pomodoroMode === 'focus') {
              playTimerAlertSound('focusComplete');
              setCompletedSessionsCount((c) => c + 1);
              setTimerAlertBanner({
                title: 'اكتملت جلسة التركيز! 🎉',
                message: `رائع! أتممت جلسة كتابة لمدة ${customFocusDurationInput} دقيقة. خذ استراحة لمدة ${breakMinutesSetting} دقائق لتصفية ذهنك.`,
              });
              setPomodoroMode('break');
              return breakMinutesSetting * 60;
            } else {
              playTimerAlertSound('breakComplete');
              setTimerAlertBanner({
                title: 'انتهت الاستراحة! ☕',
                message: 'حان وقت العودة إلى مسودة روايتك ومتابعة السرد بشغف.',
              });
              setPomodoroMode('focus');
              return customFocusDurationInput * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, pomodoroMode, breakMinutesSetting, customFocusDurationInput]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = (newDurationMinutes?: number) => {
    setIsTimerRunning(false);
    const duration = newDurationMinutes || (pomodoroMode === 'focus' ? customFocusDurationInput : breakMinutesSetting);
    setSecondsRemaining(duration * 60);
  };

  const switchPomodoroMode = (mode: 'focus' | 'break') => {
    setIsTimerRunning(false);
    setPomodoroMode(mode);
    setSecondsRemaining(mode === 'focus' ? customFocusDurationInput * 60 : breakMinutesSetting * 60);
  };

  const formatTimerDigits = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Word Count, Prose Analysis & Spell Checking
  useEffect(() => {
    const words = ArabicProseAnalyzer.countWords(content);
    setCurrentWordCount(words);

    if (isProseCheckEnabled) {
      analyzerRef.current.analyzeDebounced(content, (result) => {
        setProseIssues(result);
      }, 1500);
    } else {
      setProseIssues({
        weakWordCount: 0,
        passiveCount: 0,
        repetitionCount: 0,
        fillerCount: 0,
        totalIssues: 0,
        details: { weakMatches: [], passiveMatches: [], repetitionMatches: [], fillerMatches: [] },
      });
    }

    if (isSpellCheckEnabled) {
      const spellResults = ArabicSpellChecker.check(content);
      setSpellIssues(spellResults);
    } else {
      setSpellIssues([]);
    }

    return () => {
      analyzerRef.current.cancelDebounce();
    };
  }, [content, isProseCheckEnabled, isSpellCheckEnabled]);

  // Handle Hemingway Mode: Block deletion and backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isHemingwayMode) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
      }
    }
  };

  // Capture text selection for marginal notes
  const handleSelectText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end && end - start > 0) {
      const selected = content.substring(start, end).trim();
      if (selected.length > 0 && selected.length < 200) {
        setSelectedQuoteText(selected);
      }
    }
  };

  // Insert Arabic punctuation symbol at current cursor position
  const insertPunctuation = (symbol: string) => {
    if (isHemingwayMode) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = content.substring(0, start) + symbol + content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  // Apply spelling correction automatically to content
  const handleApplySpellCorrection = (issue: SpellCheckIssue) => {
    if (issue.startIndex !== undefined && issue.endIndex !== undefined) {
      const before = content.substring(0, issue.startIndex);
      const after = content.substring(issue.endIndex);
      const newText = before + issue.suggestion + after;
      setContent(newText);
    } else {
      // Fallback replace first occurrence of word
      setContent((prev) => prev.replace(issue.word, issue.suggestion));
    }
  };

  // Apply all high-confidence spelling corrections at once
  const handleApplyAllSpellCorrections = () => {
    if (spellIssues.length === 0) return;
    let updatedText = content;
    // Sort in reverse order of startIndex so index offsets do not shift earlier matches
    const sorted = [...spellIssues].sort((a, b) => (b.startIndex ?? 0) - (a.startIndex ?? 0));
    for (const issue of sorted) {
      if (issue.startIndex !== undefined && issue.endIndex !== undefined) {
        const before = updatedText.substring(0, issue.startIndex);
        const after = updatedText.substring(issue.endIndex);
        updatedText = before + issue.suggestion + after;
      } else {
        updatedText = updatedText.replace(issue.word, issue.suggestion);
      }
    }
    setContent(updatedText);
  };

  // Marginal Notes Management
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;

    const newNote: ChapterNote = {
      id: `note-${Date.now()}`,
      text: newNoteInput.trim(),
      selectedText: selectedQuoteText.trim() || undefined,
      color: newNoteColor,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteInput('');
    setSelectedQuoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Auto-save on exit or back navigation
  const performSave = () => {
    const finalWords = ArabicProseAnalyzer.countWords(content);
    const delta = Math.max(0, finalWords - initialWordCount);
    const updated: Chapter = {
      ...chapter,
      title: title.trim() || 'فصل بدون عنوان',
      documentJson: content,
      wordCount: finalWords,
      status,
      lastModified: new Date().toISOString(),
      notes,
    };
    onSave(updated, delta);
  };

  const handleBack = () => {
    performSave();
    onBack();
  };

  const sessionDelta = currentWordCount - initialWordCount;
  const estimatedReadingTimeMin = Math.max(1, Math.ceil(currentWordCount / 180));

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative ${
        isZenMode ? 'bg-[#000000] text-stone-200' : `${activeTheme.bgClass} ${activeTheme.textClass}`
      }`}
      dir="rtl"
    >
      {/* Pomodoro Completion Notification Banner */}
      {timerAlertBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto bg-stone-900 border border-amber-500 text-stone-100 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-amber-400 text-sm mb-0.5">{timerAlertBanner.title}</h4>
            <p className="text-xs text-stone-300 leading-relaxed">{timerAlertBanner.message}</p>
          </div>
          <button
            onClick={() => setTimerAlertBanner(null)}
            className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header - hidden in Zen Mode */}
      {!isZenMode && (
        <header
          className={`sticky top-0 z-30 ${activeTheme.headerBgClass} backdrop-blur-md border-b ${activeTheme.borderClass} px-3 sm:px-8 py-2.5 flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={handleBack}
              className={`p-2 rounded-xl transition-colors hover:bg-black/10 ${activeTheme.mutedTextClass} hover:${activeTheme.textClass}`}
              title="رجوع وحفظ تلقائي"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Editable Chapter Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الفصل..."
              className={`bg-transparent text-lg sm:text-xl font-bold font-serif ${activeTheme.textClass} focus:outline-hidden focus:ring-1 focus:ring-amber-400 rounded-lg px-2 py-1 flex-1 min-w-0 border-b border-transparent hover:border-black/20 focus:border-amber-400`}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reading Mode Switcher Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReadingModeMenuOpen(!isReadingModeMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isReadingModeMenuOpen
                    ? `${activeTheme.cardBgClass} ${activeTheme.accentClass} ${activeTheme.accentBorderClass}`
                    : `${activeTheme.cardBgClass} ${activeTheme.borderClass} ${activeTheme.textClass} hover:border-amber-500/40`
                }`}
                title="تغيير وضعية القراءة والمظهر"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{activeTheme.name.split(' ')[0]}</span>
              </button>

              {isReadingModeMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white border border-[#EAE3D6] rounded-2xl shadow-xl p-2 z-50 text-right animate-in fade-in"
                  dir="rtl"
                >
                  <div className="px-3 py-1.5 border-b border-[#EAE3D6] text-[11px] font-bold text-[#756F68]">
                    اختر وضعية القراءة والمظهر
                  </div>
                  <div className="space-y-1 mt-1">
                    {(Object.keys(READING_THEMES) as ReadingMode[]).map((mode) => {
                      const th = READING_THEMES[mode];
                      const isSelected = currentReadingMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => {
                            setCurrentReadingMode(mode);
                            if (onUpdateReadingMode) onUpdateReadingMode(mode);
                            setIsReadingModeMenuOpen(false);
                          }}
                          className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors ${
                            isSelected
                              ? 'bg-[#FAF7F2] text-[#C05638] font-bold border border-[#EAE3D6]'
                              : 'text-[#1C1E21] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-4 h-4 rounded-full border border-[#EAE3D6] shrink-0"
                              style={{ backgroundColor: th.previewBg }}
                            />
                            <span className="truncate">{th.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C05638] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Marginal Notes Button (الملاحظات الهامشية) */}
            <button
              onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isNotesDrawerOpen || notes.length > 0
                  ? 'bg-[#C05638]/10 border-[#C05638]/30 text-[#C05638]'
                  : `${activeTheme.cardBgClass} ${activeTheme.borderClass} ${activeTheme.textClass} hover:border-[#C05638]/40`
              }`}
              title="فتح لوحة الملاحظات الهامشية والحواشي"
            >
              <StickyNote className="w-3.5 h-3.5 text-[#C05638]" />
              <span className="hidden sm:inline">الهوامش</span>
              {notes.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#C05638] text-white font-bold rounded-full text-[10px]">
                  {notes.length}
                </span>
              )}
            </button>

            {/* Zen Mode Button in Header */}
            <button
              onClick={() => setIsZenMode(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#1C1E21] text-xs font-semibold transition-colors border border-[#EAE3D6] shadow-2xs"
              title="تفعيل وضع التركيز الخالص (Zen Mode)"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#C05638]" />
              <span className="hidden sm:inline">وضع التركيز (Zen)</span>
            </button>

            {/* Reading Mode Button in Header */}
            {onOpenReaderMode && (
              <button
                onClick={onOpenReaderMode}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#C05638]/10 hover:bg-[#C05638]/20 text-[#C05638] text-xs font-semibold transition-colors border border-[#C05638]/30"
                title="الانتقال إلى وضع القراءة المريح مع شريط التقدم المرئي والإشارات المرجعية"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">وضع القراءة</span>
              </button>
            )}

            {/* Settings shortcut */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`p-2 rounded-xl transition-colors ${activeTheme.mutedTextClass} hover:${activeTheme.textClass} hover:bg-black/10`}
                title="إعدادات الخطوط، وضعيات القراءة، ومؤقت بومودورو"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Stats shortcut */}
            <button
              onClick={onOpenStats}
              className={`p-2 rounded-xl transition-colors ${activeTheme.mutedTextClass} hover:${activeTheme.textClass} hover:bg-black/10`}
              title="إحصائيات الرواية"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            {/* Manual Save / Done */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span className="hidden md:inline">حفظ وخروج</span>
            </button>
          </div>
        </header>
      )}

      {/* Spell Checker & Prose Issues Warning Bar */}
      {!isZenMode && (
        <div className="space-y-0">
          {/* 1. Spell Check Warning Bar (Red/Rose) */}
          {isSpellCheckEnabled && spellIssues.length > 0 && (
            <div className="bg-rose-950/40 border-b border-rose-800/50 px-4 sm:px-8 py-2 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold text-rose-300">
                  التدقيق الإملائي: {spellIssues.length} تنبيه لغوي
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-rose-200/90 hidden sm:inline">
                  أخطاء همزات وتاء مربوطة وقواعد ترقيم شائعة
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleApplyAllSpellCorrections}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-colors"
                  title="تصحيح جميع الكلمات المقترحة بنقرة واحدة"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تصحيح الكل تلقائياً</span>
                </button>

                <button
                  onClick={() => setIsSpellDrawerOpen(!isSpellDrawerOpen)}
                  className="px-2 py-1 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-[11px] font-medium border border-stone-700 transition-colors"
                >
                  {isSpellDrawerOpen ? 'إخفاء التفاصيل' : 'عرض المقترحات'}
                </button>
              </div>
            </div>
          )}

          {/* Spell check expandable drawer */}
          {isSpellDrawerOpen && isSpellCheckEnabled && spellIssues.length > 0 && (
            <div className="bg-stone-900/95 border-b border-rose-900/40 px-4 sm:px-8 py-3 max-h-56 overflow-y-auto space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {spellIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold line-through text-rose-400">{issue.word}</span>
                        <span className="text-stone-500">←</span>
                        <span className="font-bold text-emerald-400">{issue.suggestion}</span>
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">{issue.explanation}</p>
                    </div>
                    <button
                      onClick={() => handleApplySpellCorrection(issue)}
                      className="px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] shrink-0 border border-emerald-500/30 transition-colors"
                      title="تطبيق هذا التصحيح"
                    >
                      استبدال
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Prose Issues Warning Bar (Orange) */}
          {isProseCheckEnabled && proseIssues.totalIssues > 0 && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-8 py-2 text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">فاحص الأسلوب الأدبي: {proseIssues.totalIssues} ملاحظة</span>
                <span className="text-stone-400">·</span>
                {proseIssues.weakWordCount > 0 && (
                  <span className="bg-amber-950/40 px-2 py-0.5 rounded text-amber-200">
                    {proseIssues.weakWordCount} كلمات ضعيفة
                  </span>
                )}
                {proseIssues.passiveCount > 0 && (
                  <span className="bg-amber-950/40 px-2 py-0.5 rounded text-amber-200">
                    {proseIssues.passiveCount} مبني للمجهول
                  </span>
                )}
                {proseIssues.repetitionCount > 0 && (
                  <span className="bg-amber-950/40 px-2 py-0.5 rounded text-amber-200">
                    {proseIssues.repetitionCount} تكرار متتالي
                  </span>
                )}
                {proseIssues.fillerCount > 0 && (
                  <span className="bg-amber-950/40 px-2 py-0.5 rounded text-amber-200">
                    {proseIssues.fillerCount} كلمات حشو
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace Layout (Editor + Optional Marginal Notes Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Writing Canvas Body */}
        <main
          className={`flex-1 flex flex-col w-full mx-auto p-4 sm:p-8 relative transition-all ${
            isNotesDrawerOpen ? 'max-w-3xl' : 'max-w-4xl'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={handleSelectText}
            onMouseUp={handleSelectText}
            placeholder="ابدأ بكتابة مسودتك الروائية هنا مع التشكيل العربي الكامل..."
            style={{
              fontFamily:
                settings?.activeFontFamily && settings.activeFontFamily !== 'Amiri'
                  ? `"${settings.activeFontFamily}", 'Amiri', serif`
                  : "'Amiri', serif",
              fontSize: `${settings?.fontSize || 22}px`,
              lineHeight: settings?.lineHeight || 1.8,
            }}
            className={`flex-1 w-full bg-transparent resize-none focus:outline-hidden p-2 transition-colors ${
              isZenMode
                ? 'text-white/80 placeholder-stone-800'
                : `${activeTheme.textareaColorClass} ${activeTheme.placeholderColorClass}`
            }`}
            autoFocus
          />
        </main>

        {/* Marginal Notes Sidebar (الملاحظات الهامشية وحواشي الفصل) */}
        {!isZenMode && isNotesDrawerOpen && (
          <aside className="w-80 sm:w-96 bg-white border-r border-[#EAE3D6] flex flex-col p-4 shadow-xl z-20 animate-in slide-in-from-left duration-200 text-[#1C1E21]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6] mb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-[#C05638]" />
                <h3 className="font-bold text-sm text-[#1C1E21] font-serif">الملاحظات والحواشي الهامشية</h3>
                <span className="text-[11px] px-2 py-0.5 bg-[#FAF7F2] border border-[#EAE3D6] text-[#756F68] rounded-full">
                  {notes.length}
                </span>
              </div>
              <button
                onClick={() => setIsNotesDrawerOpen(false)}
                className="p-1 text-[#756F68] hover:text-[#1C1E21] rounded-lg hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form to add a new note */}
            <form onSubmit={handleAddNote} className="space-y-2 mb-4 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE3D6]">
              {selectedQuoteText && (
                <div className="p-2.5 rounded-xl bg-white border border-[#C05638]/30 text-[11px] text-[#C05638]">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[#C05638] font-bold">النص المحدد من المسودة:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedQuoteText('')}
                      className="text-[#756F68] hover:text-[#1C1E21]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="line-clamp-2 italic font-serif">«{selectedQuoteText}»</p>
                </div>
              )}

              <textarea
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="اكتب ملاحظة، فكرة جانبية، حاشية للمراجعة..."
                rows={2}
                className="w-full bg-white border border-[#EAE3D6] rounded-xl p-2.5 text-xs text-[#1C1E21] placeholder-[#756F68]/70 focus:outline-hidden focus:border-[#C05638] font-serif"
              />

              <div className="flex items-center justify-between pt-1">
                {/* Note color picker */}
                <div className="flex items-center gap-1.5">
                  {(['amber', 'emerald', 'sky', 'rose', 'purple'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewNoteColor(color)}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        newNoteColor === color ? 'scale-125 border-[#1C1E21] ring-2 ring-black/10' : 'border-transparent opacity-70 hover:opacity-100'
                      } ${
                        color === 'amber'
                          ? 'bg-[#C05638]'
                          : color === 'emerald'
                          ? 'bg-[#2D5A43]'
                          : color === 'sky'
                          ? 'bg-sky-500'
                          : color === 'rose'
                          ? 'bg-rose-500'
                          : 'bg-purple-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newNoteInput.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C05638] hover:bg-[#A8452B] disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة هامش</span>
                </button>
              </div>
            </form>

            {/* List of notes */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-[#756F68] text-xs">
                  <StickyNote className="w-8 h-8 text-[#756F68]/60 mx-auto mb-2" />
                  <p>لا توجد ملاحظات هامشية لهذا الفصل.</p>
                  <p className="text-[11px] text-[#756F68]/80 mt-1">
                    حدد أي جملة في المحرر أو اكتب ملاحظتك مباشرة هنا.
                  </p>
                </div>
              ) : (
                notes.map((note) => {
                  const dateStr = new Date(note.createdAt).toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const borderClass =
                    note.color === 'emerald'
                      ? 'border-[#2D5A43]/30 bg-[#2D5A43]/5'
                      : note.color === 'sky'
                      ? 'border-sky-300 bg-sky-50/50'
                      : note.color === 'rose'
                      ? 'border-rose-300 bg-rose-50/50'
                      : note.color === 'purple'
                      ? 'border-purple-300 bg-purple-50/50'
                      : 'border-[#EAE3D6] bg-[#FAF7F2]';

                  return (
                    <div
                      key={note.id}
                      className={`p-3 rounded-2xl border ${borderClass} relative group transition-all shadow-2xs`}
                    >
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-2 left-2 p-1 text-stone-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {note.selectedText && (
                        <div className="mb-1.5 pb-1 border-b border-stone-800/60">
                          <span className="text-[10px] text-stone-400 block font-medium">النص المرجعي:</span>
                          <p className="text-xs text-stone-300 italic font-serif">«{note.selectedText}»</p>
                        </div>
                      )}

                      <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{note.text}</p>
                      <span className="text-[10px] text-stone-500 block mt-2 font-mono">{dateStr}</span>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Zen Mode Exit Overlay Floating Button & Indicator */}
      {isZenMode && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white rounded-full border border-stone-800 shadow-2xl backdrop-blur-md transition-all active:scale-95 text-xs font-semibold"
            title="الخروج من وضع التركيز (Zen Mode)"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>إنهاء وضع التركيز (Zen)</span>
          </button>
        </div>
      )}

      {/* Custom Arabic Keyboard Toolbar above OS Keyboard - hidden in Zen Mode */}
      {!isZenMode && (
        <div
          className={`sticky bottom-9 z-20 ${activeTheme.toolbarBgClass} border-t ${activeTheme.borderClass} px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-lg`}
        >
          {/* Arabic Punctuation Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {ARABIC_PUNCTUATION.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insertPunctuation(symbol)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg ${activeTheme.cardBgClass} hover:bg-black/20 active:scale-95 ${activeTheme.accentClass} font-bold text-lg font-serif transition-transform border ${activeTheme.borderClass}`}
                title={`إدراج ${symbol}`}
              >
                {symbol}
              </button>
            ))}
          </div>

          {/* Action Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Reading Mode toggle pill */}
            <button
              type="button"
              onClick={() => {
                const modeList: ReadingMode[] = ['dark', 'sepia', 'paper', 'oled', 'midnight'];
                const nextIndex = (modeList.indexOf(currentReadingMode) + 1) % modeList.length;
                const nextMode = modeList[nextIndex];
                setCurrentReadingMode(nextMode);
                if (onUpdateReadingMode) onUpdateReadingMode(nextMode);
              }}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${activeTheme.cardBgClass} border ${activeTheme.borderClass} hover:border-amber-400`}
              title="التبديل السريع بين وضعيات القراءة الخمس"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">{activeTheme.name.split(' ')[0]}</span>
            </button>

            {/* Spell Check Toggle */}
            <button
              type="button"
              onClick={() => setIsSpellCheckEnabled(!isSpellCheckEnabled)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                isSpellCheckEnabled
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : `${activeTheme.cardBgClass} ${activeTheme.mutedTextClass} border ${activeTheme.borderClass} hover:${activeTheme.textClass}`
              }`}
              title={isSpellCheckEnabled ? 'التدقيق الإملائي مفعل' : 'تفعيل التدقيق الإملائي'}
            >
              <SpellCheck className="w-4 h-4" />
              <span className="hidden md:inline">تدقيق إملائي</span>
            </button>

            {/* Hemingway Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsHemingwayMode(!isHemingwayMode)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                isHemingwayMode
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : `${activeTheme.cardBgClass} ${activeTheme.mutedTextClass} border ${activeTheme.borderClass} hover:${activeTheme.textClass}`
              }`}
              title={
                isHemingwayMode
                  ? 'وضع همنغواي مفعل: تم حظر زر الحذف والتراجع لمنع التردد'
                  : 'تفعيل وضع همنغواي (الكتابة للأمام فقط ومنع الحذف)'
              }
            >
              {isHemingwayMode ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4" />}
              <span className="hidden md:inline">همنغواي</span>
            </button>

            {/* Marginal Notes Quick Toggle */}
            <button
              type="button"
              onClick={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                isNotesDrawerOpen
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : `${activeTheme.cardBgClass} ${activeTheme.mutedTextClass} border ${activeTheme.borderClass} hover:${activeTheme.textClass}`
              }`}
              title="فتح/إغلاق الملاحظات الهامشية"
            >
              <StickyNote className="w-4 h-4" />
              <span className="hidden md:inline">الهوامش</span>
            </button>

            {/* Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              className={`p-2 rounded-lg ${activeTheme.cardBgClass} ${activeTheme.mutedTextClass} border ${activeTheme.borderClass} hover:${activeTheme.textClass} transition-colors flex items-center gap-1 text-xs font-semibold`}
              title="تفعيل وضع التركيز التام (Zen Mode)"
            >
              <EyeOff className="w-4 h-4" />
              <span className="hidden md:inline">تركيز (Zen)</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Bar at Bottom with Pomodoro Countdown Widget - hidden in Zen Mode */}
      {!isZenMode && (
        <footer
          className={`sticky bottom-0 z-10 ${activeTheme.footerBgClass} border-t ${activeTheme.borderClass} px-3 sm:px-6 py-2 text-xs ${activeTheme.mutedTextClass} flex flex-wrap items-center justify-between gap-2`}
        >
          {/* Left Zone: Word stats */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className={`font-semibold ${activeTheme.textClass}`}>
              الكلمات:{' '}
              <span className="text-amber-400 font-bold tabular-nums">{currentWordCount}</span>
            </span>

            <span className="flex items-center gap-1">
              جلسة اليوم:{' '}
              <span
                className={`font-bold tabular-nums ${
                  sessionDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {sessionDelta >= 0 ? `+${sessionDelta}` : sessionDelta}
              </span>
            </span>

            <span className="hidden md:inline text-stone-500">·</span>

            <span className="hidden md:inline">
              قراءة: ~{estimatedReadingTimeMin} دقيقة
            </span>

            {notes.length > 0 && (
              <>
                <span className="hidden md:inline text-stone-500">·</span>
                <span className="text-amber-400/90 font-medium hidden sm:inline">
                  {notes.length} ملاحظات هامشية
                </span>
              </>
            )}
          </div>

          {/* Center / Right Zone: POMODORO COUNTDOWN WIDGET */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative">
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all ${
                  pomodoroMode === 'focus'
                    ? isTimerRunning
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-stone-800/80 border-stone-700/80 text-stone-300'
                    : isTimerRunning
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsPomodoroSettingsOpen(!isPomodoroSettingsOpen)}
                  className="flex items-center gap-1 text-[11px] font-bold hover:underline"
                  title="إعدادات جلسة بومودورو"
                >
                  {pomodoroMode === 'focus' ? (
                    <Timer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Coffee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>{pomodoroMode === 'focus' ? 'تركيز' : 'استراحة'}:</span>
                </button>

                <span className="font-mono font-bold text-xs tabular-nums tracking-wider">
                  {formatTimerDigits(secondsRemaining)}
                </span>

                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`p-1 rounded-md transition-colors ${
                    isTimerRunning
                      ? 'text-amber-400 hover:bg-amber-500/20'
                      : 'text-stone-300 hover:bg-stone-700'
                  }`}
                  title={isTimerRunning ? 'إيقاف المؤقت مؤقتاً' : 'بدء جلسة الكتابة (Pomodoro)'}
                >
                  {isTimerRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => resetTimer()}
                  className="p-1 text-stone-400 hover:text-stone-200 rounded-md hover:bg-stone-700 transition-colors"
                  title="إعادة ضبط المؤقت"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                {completedSessionsCount > 0 && (
                  <span
                    className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                    title={`أتممت ${completedSessionsCount} جلسات كتابة اليوم`}
                  >
                    ✓{completedSessionsCount}
                  </span>
                )}
              </div>

              {isPomodoroSettingsOpen && (
                <div
                  className="absolute bottom-10 left-0 sm:left-auto sm:right-0 w-72 bg-white border border-[#EAE3D6] rounded-2xl shadow-xl p-4 z-50 text-right animate-in fade-in text-[#1C1E21]"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D6] mb-3">
                    <h5 className="font-bold text-xs text-[#1C1E21] flex items-center gap-1.5 font-serif">
                      <Timer className="w-4 h-4 text-[#C05638]" />
                      إعداد مؤقت الكتابة (بومودورو)
                    </h5>
                    <button
                      onClick={() => setIsPomodoroSettingsOpen(false)}
                      className="text-[#756F68] hover:text-[#1C1E21] p-1 rounded-lg hover:bg-[#FAF7F2]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => switchPomodoroMode('focus')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        pomodoroMode === 'focus'
                          ? 'bg-[#C05638] text-white shadow-xs'
                          : 'bg-[#FAF7F2] text-[#756F68] hover:text-[#1C1E21] border border-[#EAE3D6]'
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      جلسة تركيز
                    </button>
                    <button
                      onClick={() => switchPomodoroMode('break')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        pomodoroMode === 'break'
                          ? 'bg-[#2D5A43] text-white shadow-xs'
                          : 'bg-[#FAF7F2] text-[#756F68] hover:text-[#1C1E21] border border-[#EAE3D6]'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      استراحة
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-[#756F68] block font-serif">
                      خيارات المدة السريعة:
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[15, 25, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => {
                            setCustomFocusDurationInput(mins);
                            setPomodoroMode('focus');
                            resetTimer(mins);
                            setIsPomodoroSettingsOpen(false);
                          }}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            customFocusDurationInput === mins && pomodoroMode === 'focus'
                              ? 'bg-[#FAF7F2] border-[#C05638] text-[#C05638]'
                              : 'bg-white border-[#EAE3D6] text-[#1C1E21] hover:border-[#C05638]/60'
                          }`}
                        >
                          {mins} د
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#756F68] mt-3 pt-2 border-t border-[#EAE3D6] flex items-center gap-1 font-serif">
                    <Bell className="w-3 h-3 text-[#C05638] shrink-0" />
                    يتم إصدار نغمة صوتية هادئة تلقائياً عند انتهاء الوقت.
                  </p>
                </div>
              )}
            </div>

            {isHemingwayMode && (
              <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px] bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/60">
                <Lock className="w-3 h-3" />
                همنغواي
              </span>
            )}
            <span className="text-stone-500 text-[11px] font-mono hidden sm:inline">حفظ تلقائي</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default EditorCanvas;
