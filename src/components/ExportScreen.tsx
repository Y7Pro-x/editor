import React, { useState } from 'react';
import {
  FileText,
  FileDown,
  Book,
  FolderArchive,
  CheckCircle2,
  Settings2,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { Chapter, Character, Scene, BookMetadata } from '../types';
import { ExportService } from '../services/exportService';

interface ExportScreenProps {
  chapters: Chapter[];
  scenes: Scene[];
  characters: Character[];
  bookMeta: BookMetadata;
  onUpdateBookMeta: (meta: BookMetadata) => void;
  onBack: () => void;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({
  chapters,
  scenes,
  characters,
  bookMeta,
  onUpdateBookMeta,
  onBack,
}) => {
  const [title, setTitle] = useState(bookMeta.title);
  const [author, setAuthor] = useState(bookMeta.author);
  const [synopsis, setSynopsis] = useState(bookMeta.synopsis);
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [includeScenes, setIncludeScenes] = useState(true);

  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveMeta = () => {
    onUpdateBookMeta({
      title: title.trim() || 'روايتي الجديدة',
      author: author.trim() || 'المؤلف',
      synopsis: synopsis.trim(),
    });
  };

  const notifySuccess = (message: string) => {
    setExportSuccessMsg(message);
    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 4500);
  };

  const handleExportMarkdown = () => {
    handleSaveMeta();
    setIsProcessing(true);
    try {
      const currentMeta = { title, author, synopsis };
      ExportService.getInstance().exportMarkdown(
        currentMeta,
        chapters,
        characters,
        includeCharacters
      );
      notifySuccess('تم إنشاء وتحميل ملف Markdown (.md) بنجاح!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPdf = () => {
    handleSaveMeta();
    setIsProcessing(true);
    try {
      const currentMeta = { title, author, synopsis };
      ExportService.getInstance().exportPdf(currentMeta, chapters);
      notifySuccess('تم إنشاء وتحميل ملف PDF القياسي بنجاح!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportEpub = async () => {
    handleSaveMeta();
    setIsProcessing(true);
    try {
      const currentMeta = { title, author, synopsis };
      await ExportService.getInstance().exportEpub(currentMeta, chapters);
      notifySuccess('تم إنشاء وتحميل كتاب EPUB 3 الإلكتروني بنجاح!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportObsidian = async () => {
    handleSaveMeta();
    setIsProcessing(true);
    try {
      const currentMeta = { title, author, synopsis };
      await ExportService.getInstance().exportObsidianVault(
        currentMeta,
        chapters,
        scenes,
        characters,
        includeCharacters,
        includeScenes
      );
      notifySuccess('تم إنشاء وتحميل أرشيف Obsidian Vault (.zip) بنجاح!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1E21] flex flex-col font-sans selection:bg-[#C05638]/20 selection:text-[#C05638]" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE3D6] px-5 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/5 hover:bg-black/10 active:scale-95"
            title="رجوع للمكتبة"
          >
            <ArrowRight className="w-5 h-5 text-[#1C1E21]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-[0.2em] text-[#8C827A] uppercase">
                CHAPTER <span className="text-[#C05638]">/</span> ONE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1E21]">
              تصدير ونشر الرواية
            </h1>
          </div>
        </div>

        <div className="text-xs text-[#8C827A] font-serif hidden sm:block">
          {chapters.length} فصول · {totalWords.toLocaleString()} كلمة
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-8 space-y-8 pb-20">
        {exportSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{exportSuccessMsg}</span>
          </div>
        )}

        {/* Book Info Section */}
        <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FBECE7] text-[#C05638] flex items-center justify-center">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-serif font-bold text-[#1C1E21]">بيانات المخطوطة والغلاف</h2>
            </div>
            <span className="text-xs text-[#8C827A] font-serif">تُحفظ تلقائياً في صفحة العنوان الأولى</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#756F68] uppercase tracking-wider mb-2 font-sans">
                عنوان الرواية <span className="text-[#C05638]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveMeta}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl px-4 py-3 text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] font-serif text-base"
                placeholder="اسم الرواية"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#756F68] uppercase tracking-wider mb-2 font-sans">
                اسم الكاتب / المؤلف <span className="text-[#C05638]">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                onBlur={handleSaveMeta}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl px-4 py-3 text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] font-serif text-base"
                placeholder="اسم الكاتب"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#756F68] uppercase tracking-wider mb-2 font-sans">
              نبذة الرواية (Synopsis)
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              onBlur={handleSaveMeta}
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl px-4 py-3 text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] font-serif text-sm leading-relaxed"
              placeholder="ملخص مختصر للقصة يظهر في صفحة الغلاف والمقدمة..."
            />
          </div>

          {/* Export Toggles */}
          <div className="pt-2 flex flex-wrap gap-6 text-xs text-[#756F68] border-t border-[#F0EAE1]">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCharacters}
                onChange={(e) => setIncludeCharacters(e.target.checked)}
                className="w-4 h-4 rounded text-[#C05638] focus:ring-[#C05638] accent-[#C05638]"
              />
              <span className="font-serif">تضمين موسوعة الكودكس ({characters.length} شخصية وموقع)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeScenes}
                onChange={(e) => setIncludeScenes(e.target.checked)}
                className="w-4 h-4 rounded text-[#C05638] focus:ring-[#C05638] accent-[#C05638]"
              />
              <span className="font-serif">تضمين بطاقات المشاهد ({scenes.length} مشهد)</span>
            </label>
          </div>
        </div>

        {/* Export Formats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Markdown */}
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-5">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FBECE7] text-[#C05638] flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1C1E21] mb-1.5">مستند Markdown (.md)</h3>
              <p className="text-xs text-[#756F68] leading-relaxed font-serif">
                ملف نصي موحد مع ترويسة متقدمة لكل فصل، يدعم محركات النشر والمنصات الحديثة وGit.
              </p>
            </div>
            <button
              onClick={handleExportMarkdown}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#C05638] text-[#1C1E21] hover:text-white font-serif font-bold text-sm transition-all shadow-xs active:scale-98 border border-[#EAE3D6] hover:border-[#C05638]"
            >
              <FileDown className="w-4 h-4" />
              <span>تصدير بصيغة Markdown</span>
            </button>
          </div>

          {/* 2. PDF */}
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-5">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FBECE7] text-[#C05638] flex items-center justify-center mb-4">
                <FileDown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1C1E21] mb-1.5">مستند PDF قياسي للطباعة</h3>
              <p className="text-xs text-[#756F68] leading-relaxed font-serif">
                مقاس A4، محاذاة اتجاه اليمين لليسار (RTL)، صفحة غلاف مخصصة وتنسيق فصول احترافي.
              </p>
            </div>
            <button
              onClick={handleExportPdf}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#C05638] hover:bg-[#A8492E] text-white font-serif font-bold text-sm transition-all shadow-md shadow-[#C05638]/20 active:scale-98"
            >
              <FileDown className="w-4 h-4" />
              <span>تصدير بصيغة PDF</span>
            </button>
          </div>

          {/* 3. EPUB */}
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-5">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0F6] text-[#2B4C6F] flex items-center justify-center mb-4">
                <Book className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1C1E21] mb-1.5">كتاب إلكتروني EPUB 3</h3>
              <p className="text-xs text-[#756F68] leading-relaxed font-serif">
                هيكل EPUB رسمي مع جدول محتويات تفاعلي، ودعم كامل للخطوط وتشكيل الحروف العربية.
              </p>
            </div>
            <button
              onClick={handleExportEpub}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#2B4C6F] text-[#1C1E21] hover:text-white font-serif font-bold text-sm transition-all shadow-xs active:scale-98 border border-[#EAE3D6] hover:border-[#2B4C6F]"
            >
              <FileDown className="w-4 h-4" />
              <span>تصدير كتاب EPUB 3</span>
            </button>
          </div>

          {/* 4. Obsidian Folder */}
          <div className="bg-white border border-[#EAE3D6] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-5">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F7F2E8] text-[#946222] flex items-center justify-center mb-4">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1C1E21] mb-1.5">أرشيف أوبسيديان (Vault .zip)</h3>
              <p className="text-xs text-[#756F68] leading-relaxed font-serif">
                حزمة أرشيف منظمة تشمل مجلد الفصول، والمشاهد، والكودكس مع روابط ويكي تفاعلية.
              </p>
            </div>
            <button
              onClick={handleExportObsidian}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#946222] text-[#1C1E21] hover:text-white font-serif font-bold text-sm transition-all shadow-xs active:scale-98 border border-[#EAE3D6] hover:border-[#946222]"
            >
              <FileDown className="w-4 h-4" />
              <span>تصدير حزمة Obsidian</span>
            </button>
          </div>
        </div>

        {/* Local-first Info Note */}
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-start gap-3.5 text-xs text-[#756F68] font-serif">
          <Info className="w-4 h-4 text-[#C05638] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            يتم تجهيز كافة ملفات التصدير محلياً بنسبة 100% داخل المتصفح بأعلى دقة ومعايير طباعية دور النشر ودون إرسال نصوصك لأي جهة خارجية.
          </p>
        </div>
      </main>
    </div>
  );
};
