import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  LayoutGrid,
  FileUp,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArchiveRestore,
  FolderArchive,
  Layers,
  Sliders,
  Type,
  Compass,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Columns2,
  ArrowLeftRight,
  ChevronRight,
  Home,
  Library,
  BookMarked,
  Grid,
  User,
  Quote,
  Flame,
  ArrowRight,
  Check,
  Edit3
} from 'lucide-react';
import {
  Chapter,
  Scene,
  Character,
  WritingSession,
  WritingGoal,
  BookMetadata,
  ChapterStatus,
  AppSettings,
  CustomFont,
  TimelineEvent,
  FantasyWorldMap,
  Bookmark,
  ChapterNote
} from './types';
import { DatabaseService } from './services/databaseService';
import { FontManager } from './services/fontManager';
import { EditorCanvas } from './components/EditorCanvas';
import { PlannerHub } from './components/PlannerHub';
import { ExportScreen } from './components/ExportScreen';
import { SettingsModal } from './components/SettingsModal';
import { FantasyMapStudio } from './components/FantasyMapStudio';
import { ReadingModeView } from './components/ReadingModeView';
import { ChapterCompareModal } from './components/ChapterCompareModal';
import { BookCoverArt, CoverTheme } from './components/BookCoverArt';

export const App: React.FC = () => {
  const db = DatabaseService.getInstance();

  // App navigation state
  // Screens: 'home' | 'editor' | 'planner' | 'worldmap' | 'export' | 'reader'
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'editor' | 'planner' | 'worldmap' | 'export' | 'reader'
  >('home');

  // Core navigation tabs matching Image 2 bottom bar: 'home' | 'library' | 'notes' | 'studio'
  const [mainTab, setMainTab] = useState<'home' | 'library' | 'notes' | 'studio'>('home');

  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [readingChapterId, setReadingChapterId] = useState<string | null>(null);
  const [plannerInitialTab, setPlannerInitialTab] = useState<number>(0);
  const [activeWorldMap, setActiveWorldMap] = useState<FantasyWorldMap>(() => db.getActiveWorldMap());

  // Database entities
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [goal, setGoal] = useState<WritingGoal>(db.getGoal());
  const [bookMeta, setBookMeta] = useState<BookMetadata>(db.getBookMeta());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(db.getBookmarks());

  // App Settings & Custom Fonts
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [customFonts, setCustomFonts] = useState<CustomFont[]>(db.getCustomFonts());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Library Filter tab: 'all' | 'reading' | 'to_read' | 'finished' | 'archived'
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'reading' | 'to_read' | 'finished' | 'archived'>('all');

  // Notes Filter tab: 'all' | 'highlights' | 'reflections' | 'quotes'
  const [notesFilter, setNotesFilter] = useState<'all' | 'highlights' | 'reflections' | 'quotes'>('all');

  // Chapter comparison state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const reloadData = () => {
    setChapters(db.getChapters());
    setScenes(db.getScenes());
    setCharacters(db.getCharacters());
    setTimelineEvents(db.getTimelineEvents());
    setSessions(db.getSessions());
    setGoal(db.getGoal());
    setBookMeta(db.getBookMeta());
    setSettings(db.getSettings());
    setCustomFonts(db.getCustomFonts());
    setActiveWorldMap(db.getActiveWorldMap());
    setBookmarks(db.getBookmarks());
  };

  useEffect(() => {
    reloadData();
    const loadedFonts = db.getCustomFonts();
    FontManager.getInstance().loadAllFonts(loadedFonts);
  }, []);

  // Dynamically apply selected font to root UI if enabled
  useEffect(() => {
    if (settings.applyFontToUI && settings.activeFontFamily && settings.activeFontFamily !== 'Amiri') {
      document.documentElement.style.setProperty(
        '--font-amiri',
        `"${settings.activeFontFamily}", 'Amiri', serif`
      );
    } else {
      document.documentElement.style.setProperty('--font-amiri', "'Amiri', serif");
    }
  }, [settings.applyFontToUI, settings.activeFontFamily]);

  // Chapter operations
  const handleCreateNewChapter = () => {
    const activeCount = chapters.filter((c) => !c.isArchived).length;
    const nextNum = activeCount + 1;
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: `الفصل ${nextNum}: فصل جديد`,
      documentJson: '',
      wordCount: 0,
      status: 'مسودة',
      lastModified: new Date().toISOString(),
      isArchived: false,
    };
    db.saveChapter(newChapter);
    reloadData();
    setActiveChapterId(newChapter.id);
    setCurrentScreen('editor');
    showToast(`تم إنشاء "${newChapter.title}"`);
  };

  const handleArchiveChapter = (id: string, title: string) => {
    db.archiveChapter(id);
    reloadData();
    showToast(`تم نقل "${title}" إلى قسم الأرشيف`);
  };

  const handleRestoreChapter = (id: string, title: string) => {
    db.restoreChapter(id);
    reloadData();
    showToast(`تم استعادة "${title}" إلى قائمة الفصول النشطة`);
  };

  const handlePermanentDeleteChapter = (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف "${title}" نهائياً؟`)) {
      db.deleteChapter(id);
      reloadData();
      showToast('تم حذف الفصل نهائياً');
    }
  };

  const handleSaveChapterFromEditor = (updatedChapter: Chapter, wordsDelta: number) => {
    db.saveChapter(updatedChapter);
    if (wordsDelta > 0) {
      const now = new Date();
      const session: WritingSession = {
        id: `sess-${Date.now()}`,
        chapterId: updatedChapter.id,
        startTime: new Date(now.getTime() - 900000).toISOString(),
        endTime: now.toISOString(),
        wordsWritten: wordsDelta,
      };
      db.recordSession(session);
    }
    reloadData();
    showToast('تم حفظ التعديلات تلقائياً');
  };

  // Scene operations
  const handleSaveScene = (scene: Scene) => {
    db.saveScene(scene);
    reloadData();
    showToast('تم حفظ المشهد بنجاح');
  };

  const handleDeleteScene = (id: string) => {
    db.deleteScene(id);
    reloadData();
    showToast('تم حذف المشهد');
  };

  // Character operations
  const handleSaveCharacter = (character: Character) => {
    db.saveCharacter(character);
    reloadData();
    showToast('تم حفظ الشخصية في الكودكس');
  };

  const handleDeleteCharacter = (id: string) => {
    db.deleteCharacter(id);
    reloadData();
    showToast('تم حذف الشخصية');
  };

  // Timeline Event operations
  const handleSaveTimelineEvent = (event: TimelineEvent) => {
    db.saveTimelineEvent(event);
    reloadData();
    showToast('تم حفظ الحدث في الجدول الزمني');
  };

  const handleDeleteTimelineEvent = (id: string) => {
    db.deleteTimelineEvent(id);
    reloadData();
    showToast('تم حذف الحدث من الجدول الزمني');
  };

  const handleReorderTimelineEvents = (reordered: TimelineEvent[]) => {
    db.reorderTimelineEvents(reordered);
    setTimelineEvents(reordered);
    showToast('تم تحديث الترتيب الزمني للأحداث');
  };

  // Goal & Book Meta operations
  const handleSaveGoal = (updatedGoal: WritingGoal) => {
    db.saveGoal(updatedGoal);
    reloadData();
    showToast('تم تحديث أهداف الكتابة');
  };

  const handleUpdateBookMeta = (meta: BookMetadata) => {
    db.saveBookMeta(meta);
    reloadData();
    showToast('تم حفظ بيانات الكتاب');
  };

  // Settings & Font operations
  const handleSaveSettings = (newSettings: AppSettings) => {
    db.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('تم حفظ إعدادات الخط والتنسيق');
  };

  const handleUploadFont = (font: CustomFont) => {
    db.saveCustomFont(font);
    setCustomFonts(db.getCustomFonts());
    showToast(`تم حفظ وتفعيل الخط "${font.name}"`);
  };

  const handleDeleteFont = (id: string) => {
    db.deleteCustomFont(id);
    setCustomFonts(db.getCustomFonts());
    showToast('تم حذف الخط من مكتبتك');
  };

  // Bookmark operations
  const handleToggleBookmark = (
    chapterId: string,
    chapterTitle: string,
    scrollProgress: number,
    note?: string,
    snippet?: string
  ) => {
    const existing = bookmarks.find((b) => b.chapterId === chapterId);
    if (existing && !note) {
      db.deleteBookmark(existing.id);
      showToast('تمت إزالة الإشارة المرجعية');
    } else {
      const newBookmark: Bookmark = {
        id: existing ? existing.id : `bm-${Date.now()}`,
        chapterId,
        chapterTitle,
        scrollProgress,
        note,
        snippet,
        createdAt: new Date().toISOString(),
      };
      db.saveBookmark(newBookmark);
      showToast('تم حفظ الإشارة المرجعية للفصل');
    }
    setBookmarks(db.getBookmarks());
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    db.deleteBookmark(bookmarkId);
    setBookmarks(db.getBookmarks());
    showToast('تم حذف الإشارة المرجعية');
  };

  // Chapter comparison
  const handleToggleSelectForCompare = (chapterId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(chapterId)) {
        const next = prev.filter((id) => id !== chapterId);
        showToast('تم إلغاء تحديد الفصل');
        return next;
      }
      if (prev.length === 0) {
        showToast('تم تحديد الفصل الأول (أ). اختر فصلاً ثانياً (ب) للمقارنة المباشرة');
        return [chapterId];
      }
      if (prev.length === 1) {
        const next = [prev[0], chapterId];
        showToast('تم اختيار فصلين! جارٍ فتح المقارنة...');
        setIsCompareModalOpen(true);
        return next;
      }
      return [chapterId];
    });
  };

  const handleOpenComparisonModal = (chAId?: string, chBId?: string) => {
    const activeChs = chapters.filter((c) => !c.isArchived);
    if (activeChs.length < 2) {
      showToast('تحتاج إلى فصلين نشطين على الأقل لإجراء المقارنة الجانبية');
      return;
    }
    if (chAId && chBId) {
      setSelectedForCompare([chAId, chBId]);
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([activeChs[0].id, activeChs[1].id]);
    }
    setIsCompareModalOpen(true);
  };

  // Active vs Archived separation
  const activeChapters = useMemo(() => chapters.filter((c) => !c.isArchived), [chapters]);
  const archivedChapters = useMemo(() => chapters.filter((c) => !!c.isArchived), [chapters]);

  // Overall reading progress calculation
  const totalNovelWords = useMemo(
    () => activeChapters.reduce((sum, c) => sum + (c.wordCount || 0), 0),
    [activeChapters]
  );

  // Featured chapter to continue reading (first with bookmark, or first active)
  const featuredChapter = useMemo(() => {
    if (activeChapters.length === 0) return null;
    const bookmarkedCh = activeChapters.find((c) => bookmarks.some((b) => b.chapterId === c.id));
    return bookmarkedCh || activeChapters[0];
  }, [activeChapters, bookmarks]);

  const featuredBookmark = useMemo(() => {
    if (!featuredChapter) return null;
    return bookmarks.find((b) => b.chapterId === featuredChapter.id);
  }, [featuredChapter, bookmarks]);

  // Estimated reading progress for featured chapter
  const featuredProgressPct = useMemo(() => {
    if (featuredBookmark) return Math.round(featuredBookmark.scrollProgress);
    if (!featuredChapter) return 0;
    if (featuredChapter.status === 'مكتمل') return 100;
    if (featuredChapter.status === 'مراجعة') return 75;
    if (featuredChapter.status === 'مسودة') return 40;
    return 20;
  }, [featuredBookmark, featuredChapter]);

  // Filtered library chapters
  const filteredLibraryChapters = useMemo(() => {
    let list = libraryFilter === 'archived' ? archivedChapters : activeChapters;

    if (libraryFilter === 'reading') {
      list = list.filter((c) => c.status === 'مسودة' || bookmarks.some((b) => b.chapterId === c.id));
    } else if (libraryFilter === 'to_read') {
      list = list.filter((c) => c.status === 'فكرة');
    } else if (libraryFilter === 'finished') {
      list = list.filter((c) => c.status === 'مكتمل' || c.status === 'مراجعة');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }

    return list;
  }, [activeChapters, archivedChapters, libraryFilter, searchQuery, bookmarks]);

  // Notes collection for Reading Notes tab matching Image 2
  const allReadingNotes = useMemo(() => {
    const list: {
      id: string;
      title: string;
      snippet: string;
      source: string;
      date: string;
      type: 'quote' | 'reflection' | 'highlight';
      thumbnailTheme: CoverTheme;
    }[] = [];

    // Add Bookmarks as Quotes & Highlights
    bookmarks.forEach((bm, idx) => {
      list.push({
        id: bm.id,
        title: bm.note || 'اقتباس مميز من القراءة',
        snippet: bm.snippet || '“ لا توجد حرية أعظم من عدم معرفة ما سيحدث تالياً في ثنايا القصة. ”',
        source: `${bm.chapterTitle} · إشارة مرجعية`,
        date: new Date(bm.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        type: bm.note ? 'reflection' : 'quote',
        thumbnailTheme: idx % 2 === 0 ? 'quiet_sea' : 'brighter_day',
      });
    });

    // Add Marginal Notes from Chapters
    chapters.forEach((ch, chIdx) => {
      ch.notes?.forEach((n, nIdx) => {
        list.push({
          id: n.id,
          title: n.selectedText ? `حول: "${n.selectedText.slice(0, 30)}..."` : `ملاحظة هامشية في ${ch.title}`,
          snippet: n.text,
          source: `${ch.title} · حاشية`,
          date: new Date(n.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
          type: 'reflection',
          thumbnailTheme: (chIdx + nIdx) % 3 === 0 ? 'quiet_sea' : (chIdx + nIdx) % 3 === 1 ? 'last_horizon' : 'small_departures',
        });
      });
    });

    // Sample evocative literary quotes if list is light (matching Image 2)
    if (list.length < 3) {
      list.push({
        id: 'sample-quote-1',
        title: 'عن الحرية والمجهول',
        snippet: '“ هناك نوع من الحرية الخالصة في عدم معرفة ما سيأتي تالياً. ”',
        source: `${bookMeta.title || 'بحر السكينة'} · الفصل 8`,
        date: '12 مايو',
        type: 'quote',
        thumbnailTheme: 'quiet_sea',
      });
      list.push({
        id: 'sample-quote-2',
        title: 'إيقاع أهدأ للحياة',
        snippet: 'البحر ليس فارغاً، بل ممتلئ بالاحتمالات. تذكير دائم بإفساح المجال للسكينة حتى في خضم الشكوك.',
        source: `${bookMeta.title || 'بحر السكينة'} · الفصل 11`,
        date: '9 مايو',
        type: 'reflection',
        thumbnailTheme: 'last_horizon',
      });
      list.push({
        id: 'sample-quote-3',
        title: 'عن الدهشة والجمال',
        snippet: 'ليس كل شيء بحاجة إلى تفسير منطقي. بعض المشاعر خُلقت لتُحس وتُعاش لا لتُحل كمعادلة.',
        source: `${bookMeta.title || 'بحر السكينة'} · الفصل 6`,
        date: '4 مايو',
        type: 'reflection',
        thumbnailTheme: 'brighter_day',
      });
    }

    return list;
  }, [bookmarks, chapters, bookMeta.title]);

  // Filtered reading notes
  const filteredReadingNotes = useMemo(() => {
    if (notesFilter === 'all') return allReadingNotes;
    if (notesFilter === 'quotes') return allReadingNotes.filter((n) => n.type === 'quote');
    if (notesFilter === 'highlights') return allReadingNotes.filter((n) => n.source.includes('إشارة'));
    if (notesFilter === 'reflections') return allReadingNotes.filter((n) => n.type === 'reflection');
    return allReadingNotes;
  }, [allReadingNotes, notesFilter]);

  // Screen routing
  if (currentScreen === 'reader' && readingChapterId) {
    return (
      <ReadingModeView
        chapters={activeChapters}
        initialChapterId={readingChapterId}
        settings={settings}
        bookmarks={bookmarks}
        onToggleBookmark={handleToggleBookmark}
        onDeleteBookmark={handleDeleteBookmark}
        onUpdateReadingMode={(mode) => {
          const updated = { ...settings, readingMode: mode };
          db.saveSettings(updated);
          setSettings(updated);
        }}
        onBack={() => {
          setCurrentScreen('home');
          setReadingChapterId(null);
        }}
        onEditChapter={(chapterId) => {
          setActiveChapterId(chapterId);
          setCurrentScreen('editor');
        }}
      />
    );
  }

  if (currentScreen === 'editor' && activeChapterId) {
    const activeChapter = chapters.find((c) => c.id === activeChapterId);
    if (activeChapter) {
      return (
        <EditorCanvas
          chapter={activeChapter}
          settings={settings}
          onSave={handleSaveChapterFromEditor}
          onBack={() => {
            setCurrentScreen('home');
            setActiveChapterId(null);
          }}
          onOpenStats={() => {
            setPlannerInitialTab(3);
            setCurrentScreen('planner');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenReaderMode={() => {
            setReadingChapterId(activeChapterId);
            setCurrentScreen('reader');
          }}
          onUpdateReadingMode={(mode) => {
            const updated = { ...settings, readingMode: mode };
            db.saveSettings(updated);
            setSettings(updated);
          }}
        />
      );
    }
  }

  if (currentScreen === 'planner') {
    return (
      <PlannerHub
        initialTab={plannerInitialTab}
        scenes={scenes}
        characters={characters}
        chapters={activeChapters}
        sessions={sessions}
        goal={goal}
        timelineEvents={timelineEvents}
        onSaveScene={handleSaveScene}
        onDeleteScene={handleDeleteScene}
        onSaveCharacter={handleSaveCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onSaveTimelineEvent={handleSaveTimelineEvent}
        onDeleteTimelineEvent={handleDeleteTimelineEvent}
        onReorderTimelineEvents={handleReorderTimelineEvents}
        onSaveGoal={handleSaveGoal}
        onBack={() => setCurrentScreen('home')}
        onOpenMapStudio={() => setCurrentScreen('worldmap')}
      />
    );
  }

  if (currentScreen === 'worldmap') {
    return (
      <FantasyMapStudio
        initialMap={activeWorldMap}
        characters={characters}
        onSaveMap={(updatedMap) => {
          db.saveWorldMap(updatedMap);
          setActiveWorldMap(updatedMap);
          showToast('تم حفظ تعديلات خريطة العالم');
        }}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'export') {
    return (
      <ExportScreen
        chapters={activeChapters}
        scenes={scenes}
        characters={characters}
        bookMeta={bookMeta}
        onUpdateBookMeta={handleUpdateBookMeta}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  // Cover theme selector helper for chapter cards
  const getChapterCoverTheme = (index: number): CoverTheme => {
    const themes: CoverTheme[] = ['quiet_sea', 'brighter_day', 'last_horizon', 'small_departures'];
    return themes[index % themes.length];
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1E21] flex flex-col font-sans selection:bg-[#C05638]/20 selection:text-[#C05638]" dir="rtl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1C1E21] text-white px-5 py-2.5 rounded-full shadow-xl text-xs sm:text-sm font-medium animate-in fade-in flex items-center gap-2 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#C05638]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar matching "CHAPTER / ONE" contract in reference image 2 */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE3D6] px-5 sm:px-10 py-4 flex items-center justify-between">
        {/* Zone 1: Spaced Brand Wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-lg sm:text-xl tracking-[0.25em] text-[#1C1E21] select-none">
            CHAPTER <span className="text-[#C05638]">/</span> ONE
          </span>
          <span className="text-[11px] text-[#8C827A] font-serif hidden md:inline-block pr-2 border-r border-[#D9D1C5]">
            رفيق الكتابة والقراءة الفانتازية
          </span>
        </div>

        {/* Zone 2: Navigation Links for Desktop (Home, Library, Notes, Studio) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#756F68]">
          <button
            onClick={() => setMainTab('home')}
            className={`transition-colors relative py-1 ${
              mainTab === 'home' ? 'text-[#C05638] font-bold' : 'hover:text-[#1C1E21]'
            }`}
          >
            الرئيسية
            {mainTab === 'home' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C05638] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setMainTab('library')}
            className={`transition-colors relative py-1 ${
              mainTab === 'library' ? 'text-[#C05638] font-bold' : 'hover:text-[#1C1E21]'
            }`}
          >
            المكتبة والفصول
            {mainTab === 'library' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C05638] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setMainTab('notes')}
            className={`transition-colors relative py-1 ${
              mainTab === 'notes' ? 'text-[#C05638] font-bold' : 'hover:text-[#1C1E21]'
            }`}
          >
            الملاحظات والهوامش
            {mainTab === 'notes' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C05638] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setMainTab('studio')}
            className={`transition-colors relative py-1 ${
              mainTab === 'studio' ? 'text-[#C05638] font-bold' : 'hover:text-[#1C1E21]'
            }`}
          >
            الاستوديو والخرائط
            {mainTab === 'studio' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C05638] rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions (Search & Settings User Avatar) */}
        <div className="flex items-center gap-3">
          {/* Quick Chapter Compare shortcut */}
          {activeChapters.length >= 2 && (
            <button
              onClick={() => handleOpenComparisonModal()}
              className="p-2 rounded-full hover:bg-black/5 text-[#756F68] hover:text-[#1C1E21] transition-colors hidden sm:block"
              title="مقارنة فصلين جنباً إلى جنب"
            >
              <Columns2 className="w-5 h-5" />
            </button>
          )}

          {/* User Settings Avatar matching Image 2 */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-9 h-9 rounded-full bg-[#EAE3D6] hover:bg-[#DFD7C9] text-[#1C1E21] flex items-center justify-center transition-all border border-[#DDD4C5]"
            title="إعدادات الاستوديو والخطوط"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Body Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-28">
        {/* ========================================================= */}
        {/* TAB 1: HOME (Continue reading + Editorial Hero)           */}
        {/* ========================================================= */}
        {mainTab === 'home' && (
          <div className="space-y-12">
            {/* Top Split Layout matching Image 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column (Editorial Headline & Japanese/Nordic Sea Illustration) */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs tracking-[0.25em] text-[#8C827A] uppercase font-sans font-semibold block mb-2">
                    CHAPTER <span className="text-[#C05638]">/</span> ONE
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1C1E21] leading-tight text-balance">
                    جرعة أكبر من الدهشة والجمال.
                  </h1>
                </div>

                <div className="space-y-1 pt-2">
                  <p className="text-xs tracking-[0.2em] font-sans font-bold text-[#8C827A] uppercase">
                    GOOD BOOKS · A BRIGHTER YOU
                  </p>
                  <div className="w-10 h-0.5 bg-[#C05638]" />
                  <p className="text-sm sm:text-base text-[#756F68] font-serif pt-2 leading-relaxed">
                    رفيق الكتابة والتأليف الهادئ لحياة أكثر إبداعاً وفضولاً، حيث تنبثق الحكايات من السكينة.
                  </p>
                </div>

                {/* Minimalist Japanese/Nordic Landscape Illustration Banner */}
                <div className="pt-2">
                  <div className="relative rounded-3xl overflow-hidden bg-[#F0EAE1] border border-[#E2D8CC] p-6 shadow-sm">
                    <svg viewBox="0 0 500 160" className="w-full h-28 object-cover" preserveAspectRatio="none">
                      {/* Terracotta Sun */}
                      <circle cx="420" cy="50" r="28" fill="#C05638" />
                      {/* Mountain peaks */}
                      <path d="M 280 160 L 340 70 L 400 160 Z" fill="#243444" />
                      <path d="M 360 160 L 420 85 L 480 160 Z" fill="#1C2836" />
                      <path d="M 220 160 L 270 95 L 320 160 Z" fill="#36495C" />
                      {/* Gentle Sea Waves */}
                      <path d="M 0 160 Q 60 145, 120 160 T 240 160 T 360 160 T 480 160 T 500 160" stroke="#7E96AC" strokeWidth="2" fill="none" opacity="0.6" />
                      <path d="M 0 148 Q 50 140, 100 148 T 200 148 T 300 148" stroke="#7E96AC" strokeWidth="1.5" fill="none" opacity="0.4" />
                    </svg>
                    <div className="flex items-center justify-between text-xs text-[#8C827A] font-serif pt-3 border-t border-[#E5DDD2]">
                      <span>SAME STORIES. A CALMER YOU.</span>
                      <span>إجمالي رصيد الرواية: {totalNovelWords.toLocaleString()} كلمة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: "Continue reading" Feature Card matching Image 2 */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(40,30,20,0.04)] border border-[#EAE3D6] space-y-6">
                  {/* Card Section Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1E21]">
                      متابعة القراءة
                    </h2>
                    <span className="text-xs font-mono font-bold text-[#C05638] bg-[#FBECE7] px-3 py-1 rounded-full">
                      {featuredProgressPct}% مكتمل
                    </span>
                  </div>

                  {/* Book Cover Showcase */}
                  <div className="relative">
                    <BookCoverArt
                      theme="quiet_sea"
                      title={bookMeta.title || 'بحر السكينة'}
                      subtitle={featuredChapter ? featuredChapter.title : 'رواية ملحمية'}
                      aspectRatio="portrait"
                      className="max-w-[280px] mx-auto shadow-lg shadow-black/10"
                    />

                    {/* Editorial Kicker beside or overlapping */}
                    <div className="text-center mt-4">
                      <span className="text-[11px] tracking-[0.2em] font-sans font-bold text-[#8C827A] uppercase block">
                        QUIETER PEOPLE SEE A BRIGHTER WORLD.
                      </span>
                    </div>
                  </div>

                  {/* Progress & Chapter Status */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-serif font-bold text-[#1C1E21] text-lg">
                        {bookMeta.title || 'بحر السكينة'}
                      </span>
                      <span className="font-mono font-bold text-[#C05638] text-base">
                        {featuredProgressPct}%
                      </span>
                    </div>

                    {/* Terracotta Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#F0EAE1] overflow-hidden">
                      <div
                        className="h-full bg-[#C05638] rounded-full transition-all duration-300"
                        style={{ width: `${featuredProgressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#756F68] font-serif">
                      <span>
                        فصل {featuredChapter ? activeChapters.indexOf(featuredChapter) + 1 : 1} من {activeChapters.length}
                      </span>
                      <span>ساعتان متبقيتان تقريباً</span>
                    </div>
                  </div>

                  {/* Primary "Continue reading >" Action Button in Terracotta */}
                  <button
                    onClick={() => {
                      if (featuredChapter) {
                        setReadingChapterId(featuredChapter.id);
                        setCurrentScreen('reader');
                      } else {
                        handleCreateNewChapter();
                      }
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-[#C05638] hover:bg-[#A8492E] text-white font-serif font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-[#C05638]/25 transition-all active:scale-[0.99]"
                  >
                    <span>متابعة القراءة</span>
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Novel Overview KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#EAE3D6] shadow-xs">
                <span className="text-xs text-[#8C827A] font-serif block mb-1">الفصول النشطة</span>
                <span className="text-2xl font-bold font-serif text-[#1C1E21] tabular-nums">
                  {activeChapters.length}
                </span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#EAE3D6] shadow-xs">
                <span className="text-xs text-[#8C827A] font-serif block mb-1">إجمالي الكلمات</span>
                <span className="text-2xl font-bold font-serif text-[#C05638] tabular-nums">
                  {totalNovelWords.toLocaleString()}
                </span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#EAE3D6] shadow-xs">
                <span className="text-xs text-[#8C827A] font-serif block mb-1">الشخصيات المسجلة</span>
                <span className="text-2xl font-bold font-serif text-[#1C1E21] tabular-nums">
                  {characters.length}
                </span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-[#EAE3D6] shadow-xs">
                <span className="text-xs text-[#8C827A] font-serif block mb-1">الإشارات المرجعية</span>
                <span className="text-2xl font-bold font-serif text-[#1C1E21] tabular-nums">
                  {bookmarks.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LIBRARY (Your library with artistic cover cards)   */}
        {/* ========================================================= */}
        {mainTab === 'library' && (
          <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#8C827A] uppercase font-sans font-semibold block mb-1">
                  CHAPTER <span className="text-[#C05638]">/</span> ONE
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1E21]">
                  مكتبتك الروائية
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {activeChapters.length >= 2 && (
                  <button
                    onClick={() => handleOpenComparisonModal()}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-semibold transition-all ${
                      selectedForCompare.length > 0
                        ? 'bg-[#C05638] text-white border-[#C05638] shadow-md shadow-[#C05638]/20'
                        : 'bg-white hover:bg-[#F2ECE1] text-[#1C1E21] border-[#EAE3D6]'
                    }`}
                  >
                    <Columns2 className="w-4 h-4 text-[#C05638]" />
                    <span>مقارنة فصلين</span>
                    {selectedForCompare.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white text-[#C05638] font-bold text-[10px] flex items-center justify-center mr-1">
                        {selectedForCompare.length}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={handleCreateNewChapter}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C05638] hover:bg-[#A8492E] text-white font-serif font-bold text-xs sm:text-sm shadow-md shadow-[#C05638]/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>فصل جديد</span>
                </button>
              </div>
            </div>

            {/* Segmented Filter Pills matching Image 2 ("All", "Reading", "To Read", "Finished") */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setLibraryFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  libraryFilter === 'all'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                الكل ({chapters.length})
              </button>
              <button
                onClick={() => setLibraryFilter('reading')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  libraryFilter === 'reading'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                قيد القراءة والكتابة
              </button>
              <button
                onClick={() => setLibraryFilter('to_read')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  libraryFilter === 'to_read'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                أفكار ومسودات
              </button>
              <button
                onClick={() => setLibraryFilter('finished')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  libraryFilter === 'finished'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                مكتملة ومراجعة
              </button>
              <button
                onClick={() => setLibraryFilter('archived')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  libraryFilter === 'archived'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                الأرشيف ({archivedChapters.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-[#8C827A] absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين الفصول..."
                className="w-full bg-white border border-[#EAE3D6] rounded-full pr-11 pl-4 py-2.5 text-xs sm:text-sm text-[#1C1E21] placeholder-[#8C827A] focus:outline-hidden focus:border-[#C05638]"
              />
            </div>

            {/* Chapter List matching Image 2 ("Your library") */}
            {filteredLibraryChapters.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#DDD4C5] space-y-3">
                <BookOpen className="w-10 h-10 text-[#8C827A] mx-auto" />
                <h3 className="font-serif font-bold text-lg text-[#1C1E21]">لا توجد فصول مطابقة</h3>
                <p className="text-xs text-[#756F68]">ابدأ بإضافة فصل جديد لتبدأ رحلة التأليف الفانتازي</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLibraryChapters.map((chapter, idx) => {
                  const theme = getChapterCoverTheme(idx);
                  const isSelectedForCompare = selectedForCompare.includes(chapter.id);
                  const hasBookmark = bookmarks.some((b) => b.chapterId === chapter.id);
                  const progressPct = chapter.status === 'مكتمل' ? 100 : chapter.status === 'مراجعة' ? 75 : 45;

                  return (
                    <div
                      key={chapter.id}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex items-center justify-between gap-4 group shadow-xs hover:shadow-md ${
                        isSelectedForCompare
                          ? 'border-[#C05638] ring-2 ring-[#C05638]/20 bg-[#FDFBF7]'
                          : 'border-[#EAE3D6] hover:border-[#D9CFBF]'
                      }`}
                    >
                      {/* Left: Thumbnail & Chapter Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Thumbnail Cover Art */}
                        <div className="w-14 h-18 sm:w-16 sm:h-20 shrink-0 rounded-xl overflow-hidden shadow-xs border border-[#E0D7C9]">
                          <BookCoverArt
                            theme={theme}
                            aspectRatio="portrait"
                            className="w-full h-full"
                          />
                        </div>

                        {/* Title & Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1E21] truncate group-hover:text-[#C05638] transition-colors">
                              {chapter.title}
                            </h3>
                            {hasBookmark && (
                              <BookmarkIcon className="w-4 h-4 text-[#C05638] fill-[#C05638] shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#756F68] font-serif mt-1">
                            <span>
                              {chapter.status === 'مكتمل'
                                ? 'مكتمل'
                                : chapter.status === 'مراجعة'
                                ? 'قيد المراجعة'
                                : 'مسودة'}
                            </span>
                            <span>·</span>
                            <span className="tabular-nums font-mono">{chapter.wordCount} كلمة</span>
                          </div>

                          {/* Progress Track for Active Chapters */}
                          {!chapter.isArchived && (
                            <div className="w-28 sm:w-44 h-1.5 rounded-full bg-[#F0EAE1] overflow-hidden mt-2">
                              <div
                                className="h-full bg-[#C05638] rounded-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Compare toggle button */}
                        <button
                          onClick={() => handleToggleSelectForCompare(chapter.id)}
                          className={`p-2 rounded-xl text-xs transition-colors hidden sm:block ${
                            isSelectedForCompare
                              ? 'bg-[#C05638] text-white'
                              : 'hover:bg-[#F0EAE1] text-[#756F68]'
                          }`}
                          title="تحديد للمقارنة الجانبية"
                        >
                          <Columns2 className="w-4 h-4" />
                        </button>

                        {/* Read Button */}
                        <button
                          onClick={() => {
                            setReadingChapterId(chapter.id);
                            setCurrentScreen('reader');
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#F5EFE6] hover:bg-[#C05638] text-[#1C1E21] hover:text-white font-serif text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">قراءة</span>
                        </button>

                        {/* Edit in Editor Button */}
                        <button
                          onClick={() => {
                            setActiveChapterId(chapter.id);
                            setCurrentScreen('editor');
                          }}
                          className="p-2 rounded-full hover:bg-[#F5EFE6] text-[#756F68] hover:text-[#C05638] transition-colors"
                          title="تعديل في المحرر"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Archive / Restore Button */}
                        {chapter.isArchived ? (
                          <button
                            onClick={() => handleRestoreChapter(chapter.id, chapter.title)}
                            className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="استعادة من الأرشيف"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchiveChapter(chapter.id, chapter.title)}
                            className="p-2 rounded-full hover:bg-stone-100 text-[#8C827A] hover:text-[#C05638] transition-colors"
                            title="أرشفة الفصل"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <ChevronRight className="w-4 h-4 text-[#8C827A] rtl:rotate-180" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: NOTES (Reading notes matching Image 2)             */}
        {/* ========================================================= */}
        {mainTab === 'notes' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs tracking-[0.2em] text-[#8C827A] uppercase font-sans font-semibold block mb-1">
                  CHAPTER <span className="text-[#C05638]">/</span> ONE
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1E21]">
                  ملاحظات وهوامش الرواية
                </h1>
              </div>

              <span className="text-xs text-[#8C827A] font-serif">
                {allReadingNotes.length} اقتباس وملاحظة محفوظة
              </span>
            </div>

            {/* Filter Pills matching Image 2 ("All", "Highlights", "Reflections", "Quotes") */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setNotesFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  notesFilter === 'all'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setNotesFilter('highlights')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  notesFilter === 'highlights'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                إشارات مرجعية (Highlights)
              </button>
              <button
                onClick={() => setNotesFilter('reflections')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  notesFilter === 'reflections'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                حواشي وتأملات (Reflections)
              </button>
              <button
                onClick={() => setNotesFilter('quotes')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  notesFilter === 'quotes'
                    ? 'bg-[#C05638] text-white shadow-sm'
                    : 'bg-white hover:bg-[#F0EAE1] text-[#756F68] border border-[#EAE3D6]'
                }`}
              >
                اقتباسات (Quotes)
              </button>
            </div>

            {/* Notes Cards Stream matching Image 2 */}
            <div className="space-y-4">
              {filteredReadingNotes.map((note) => {
                if (note.type === 'quote') {
                  // Quote Card Style matching Image 2 (top note)
                  return (
                    <div
                      key={note.id}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE3D6] shadow-xs hover:shadow-md transition-all space-y-4 relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-serif text-lg sm:text-xl text-[#1C1E21] leading-relaxed select-text">
                          {note.snippet}
                        </p>
                        <BookmarkIcon className="w-5 h-5 text-[#C05638] fill-[#C05638] shrink-0" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#8C827A] font-serif pt-2 border-t border-[#F2ECE1]">
                        <span>{note.source}</span>
                        <span>{note.date}</span>
                      </div>
                    </div>
                  );
                }

                // Reflection Note Card Style with Thumbnail matching Image 2
                return (
                  <div
                    key={note.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE3D6] shadow-xs hover:shadow-md transition-all flex items-start gap-5 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-xs border border-[#E0D7C9]">
                      <BookCoverArt
                        theme={note.thumbnailTheme}
                        aspectRatio="portrait"
                        className="w-full h-full"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1E21] truncate">
                          {note.title}
                        </h3>
                        <span className="text-[11px] text-[#8C827A] font-serif shrink-0">
                          {note.date}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed line-clamp-3 select-text">
                        {note.snippet}
                      </p>

                      <div className="text-[11px] text-[#8C827A] font-serif pt-1">
                        {note.source}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STUDIO & MORE (World map, Timeline, Codex, Export) */}
        {/* ========================================================= */}
        {mainTab === 'studio' && (
          <div className="space-y-8">
            <div>
              <span className="text-xs tracking-[0.2em] text-[#8C827A] uppercase font-sans font-semibold block mb-1">
                CHAPTER <span className="text-[#C05638]">/</span> ONE
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1E21]">
                أستوديو العوالم الفانتازية
              </h1>
              <p className="text-sm text-[#756F68] font-serif mt-1">
                أدوات التخطيط الشامل، بناء الخرائط الجغرافية الإجرائية، وسجلات الكودكس
              </p>
            </div>

            {/* Studio Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tool 1: Fantasy World Map */}
              <div
                onClick={() => setCurrentScreen('worldmap')}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D6] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBECE7] text-[#C05638] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1E21] group-hover:text-[#C05638] transition-colors">
                    خريطة العالم الفانتازية
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed">
                    مولد واستوديو متقدم مع 8 نماذج قارية، محاكاة الممالك والدبلوماسية، وشبكات القوافل وحاسبة السفر.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#C05638] pt-2 border-t border-[#F2ECE1]">
                  <span>فتح الاستوديو الجغرافي</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>

              {/* Tool 2: Timeline of Events */}
              <div
                onClick={() => {
                  setPlannerInitialTab(0);
                  setCurrentScreen('planner');
                }}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D6] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F0EA] text-[#2D5A43] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1E21] group-hover:text-[#C05638] transition-colors">
                    الجدول الزمني للأحداث
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed">
                    ترتيب الأحداث والحبكات تسلسلياً مع ربط كل واقعة بالفصول والشخصيات المقابلة لها.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#2D5A43] pt-2 border-t border-[#F2ECE1]">
                  <span>عرض الخط الزمني</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>

              {/* Tool 3: Character & Codex Graph */}
              <div
                onClick={() => {
                  setPlannerInitialTab(1);
                  setCurrentScreen('planner');
                }}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D6] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF0F6] text-[#2B4C6F] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookMarked className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1E21] group-hover:text-[#C05638] transition-colors">
                    الكودكس وشبكة الشخصيات
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed">
                    موسوعة الشخصيات، الأماكن، الأغراض الفانتازية، وخريطة العلاقات البصرية التفاعلية.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#2B4C6F] pt-2 border-t border-[#F2ECE1]">
                  <span>فتح شبكة الكودكس</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>

              {/* Tool 4: Export Screen */}
              <div
                onClick={() => setCurrentScreen('export')}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D6] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F2E8] text-[#946222] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1E21] group-hover:text-[#C05638] transition-colors">
                    تصدير الرواية
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed">
                    تصدير المخطوطة الكاملة بصيغ PDF جاهزة للطباعة، Word Docx، وMarkdown للأجهزة اللوحية.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#946222] pt-2 border-t border-[#F2ECE1]">
                  <span>تصدير المخطوطة</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>

              {/* Tool 5: Typography & Settings */}
              <div
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white rounded-3xl p-6 border border-[#EAE3D6] shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5EFE6] text-[#756F68] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1E21] group-hover:text-[#C05638] transition-colors">
                    الخطوط وإعدادات الاستوديو
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756F68] font-serif leading-relaxed">
                    إدارة الخطوط العربية المخصصة (.ttf)، أهداف عدد الكلمات، ومؤقت بومودورو للتركيز.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#756F68] pt-2 border-t border-[#F2ECE1]">
                  <span>تعديل الإعدادات</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pinned Bottom Navigation Bar matching Image 2 with 100% Fidelity */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE3D6] py-2 px-6 flex items-center justify-around shadow-lg"
        dir="rtl"
      >
        <button
          onClick={() => setMainTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            mainTab === 'home' ? 'text-[#C05638] font-bold' : 'text-[#8C827A] hover:text-[#1C1E21]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-sans">الرئيسية</span>
        </button>

        <button
          onClick={() => setMainTab('library')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            mainTab === 'library' ? 'text-[#C05638] font-bold' : 'text-[#8C827A] hover:text-[#1C1E21]'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] font-sans">المكتبة</span>
        </button>

        <button
          onClick={() => setMainTab('notes')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            mainTab === 'notes' ? 'text-[#C05638] font-bold' : 'text-[#8C827A] hover:text-[#1C1E21]'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px] font-sans">الملاحظات</span>
        </button>

        <button
          onClick={() => setMainTab('studio')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            mainTab === 'studio' ? 'text-[#C05638] font-bold' : 'text-[#8C827A] hover:text-[#1C1E21]'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-sans">الاستوديو</span>
        </button>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          customFonts={customFonts}
          onSaveSettings={handleSaveSettings}
          onUploadFont={handleUploadFont}
          onDeleteFont={handleDeleteFont}
        />
      )}

      {/* Chapter Comparison Modal */}
      {isCompareModalOpen && (
        <ChapterCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          chapters={activeChapters}
          initialChapterAId={selectedForCompare[0]}
          initialChapterBId={selectedForCompare[1]}
          totalNovelWords={totalNovelWords}
          onOpenEditor={(chId) => {
            setIsCompareModalOpen(false);
            setActiveChapterId(chId);
            setCurrentScreen('editor');
          }}
          onOpenReader={(chId) => {
            setIsCompareModalOpen(false);
            setReadingChapterId(chId);
            setCurrentScreen('reader');
          }}
        />
      )}
    </div>
  );
};

export default App;
