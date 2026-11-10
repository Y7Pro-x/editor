import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  Trash2,
  Type,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomFont, AppSettings, ReadingMode } from '../types';
import { FontManager } from '../services/fontManager';
import { READING_THEMES } from '../services/readingThemes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  customFonts: CustomFont[];
  onSaveSettings: (settings: AppSettings) => void;
  onUploadFont: (font: CustomFont) => void;
  onDeleteFont: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  customFonts,
  onSaveSettings,
  onUploadFont,
  onDeleteFont,
}) => {
  const [activeFontFamily, setActiveFontFamily] = useState(settings.activeFontFamily);
  const [applyFontToUI, setApplyFontToUI] = useState(settings.applyFontToUI);
  const [fontSize, setFontSize] = useState(settings.fontSize || 22);
  const [lineHeight, setLineHeight] = useState(settings.lineHeight || 1.8);
  const [readingMode, setReadingMode] = useState<ReadingMode>(settings.readingMode || 'dark');
  const [pomodoroDurationMinutes, setPomodoroDurationMinutes] = useState(settings.pomodoroDurationMinutes || 25);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(settings.pomodoroBreakMinutes || 5);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      setErrorMsg('يرجى اختيار ملف خط بصيغة TrueType (.ttf) فقط');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('حجم ملف الخط يتجاوز 8 ميجابايت. يرجى اختيار ملف أصغر حجماً');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const base64Data = await FontManager.readFileAsBase64(file);
      const cleanFontName = file.name.replace(/\.ttf$/i, '').trim();
      const cssFamily = `CustomFont_${Date.now()}`;

      const newFont: CustomFont = {
        id: `font-${Date.now()}`,
        name: cleanFontName,
        fontFamily: cssFamily,
        fileName: file.name,
        dataBase64: base64Data,
        fileSizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
      };

      const loaded = await FontManager.getInstance().loadFont(newFont);
      if (!loaded) {
        throw new Error('فشل تسجيل ملف الخط في متصفحك');
      }

      onUploadFont(newFont);
      setActiveFontFamily(newFont.fontFamily);
      setSuccessMsg(`تم رفع الخط "${newFont.name}" بنجاح وتفعيله!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء قراءة ملف الخط. يرجى التأكد من سلامة ملف الـ .ttf');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveAndApply = () => {
    let displayName = 'الخط الأميري (افتراضي)';
    if (activeFontFamily !== 'Amiri') {
      const found = customFonts.find((f) => f.fontFamily === activeFontFamily);
      if (found) displayName = found.name;
    }

    const updated: AppSettings = {
      activeFontFamily,
      activeFontDisplayName: displayName,
      applyFontToUI,
      fontSize,
      lineHeight,
      readingMode,
      pomodoroDurationMinutes,
      pomodoroBreakMinutes,
    };
    onSaveSettings(updated);
    onClose();
  };

  const activeTheme = READING_THEMES[readingMode] || READING_THEMES.dark;

  const previewStyle: React.CSSProperties = {
    fontFamily: activeFontFamily === 'Amiri' ? "'Amiri', serif" : `"${activeFontFamily}", 'Amiri', serif`,
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    backgroundColor: activeTheme.previewBg,
    color: activeTheme.previewText,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white text-[#1C1E21] border border-[#EAE3D6] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EAE1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FBECE7] text-[#C05638] flex items-center justify-center">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#8C827A] uppercase font-sans font-bold block">
                SETTINGS
              </span>
              <h2 className="text-xl font-serif font-bold text-[#1C1E21]">إعدادات الخطوط والطباعة</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#756F68] hover:text-[#1C1E21] hover:bg-black/5 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Upload Custom Font (.ttf) */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#1C1E21] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#C05638]" />
                  رفع وتثبيت خط عربي (.ttf)
                </h3>
                <p className="text-xs text-[#756F68] font-serif mt-0.5">
                  أضف خطوط الرواية المفضلة لديك أو خطوط النسخ والديواني والكوفي
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,font/ttf,application/x-font-ttf"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C05638] hover:bg-[#A8492E] text-white font-serif font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'جاري الرفع...' : 'رفع خط جديد (.ttf)'}</span>
              </button>
            </div>

            {/* List of Custom Fonts */}
            <div className="space-y-2 pt-2">
              <div
                onClick={() => setActiveFontFamily('Amiri')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  activeFontFamily === 'Amiri'
                    ? 'bg-white border-[#C05638] ring-2 ring-[#C05638]/20 shadow-xs'
                    : 'bg-white/60 border-[#EAE3D6] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FBECE7] text-[#C05638] font-serif font-bold text-xs flex items-center justify-center">
                    أ
                  </span>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#1C1E21]">الخط الأميري (افتراضي)</h4>
                    <p className="text-[11px] text-[#756F68] font-serif">خط نسخ تراثي كلاسيكي للمطالعة</p>
                  </div>
                </div>
                {activeFontFamily === 'Amiri' && <Check className="w-4 h-4 text-[#C05638]" />}
              </div>

              {customFonts.map((font) => {
                const isSelected = activeFontFamily === font.fontFamily;
                return (
                  <div
                    key={font.id}
                    onClick={() => setActiveFontFamily(font.fontFamily)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-[#C05638] ring-2 ring-[#C05638]/20 shadow-xs'
                        : 'bg-white/60 border-[#EAE3D6] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#EAF0F6] text-[#2B4C6F] font-serif font-bold text-xs flex items-center justify-center">
                        ف
                      </span>
                      <div>
                        <h4 className="text-sm font-serif font-bold text-[#1C1E21]">{font.name}</h4>
                        <p className="text-[11px] text-[#756F68] font-serif">خط مخصص محفوظ محلياً</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 text-[#C05638]" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFont(font.id);
                          if (activeFontFamily === font.fontFamily) {
                            setActiveFontFamily('Amiri');
                          }
                        }}
                        className="p-1.5 text-[#8C827A] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="حذف هذا الخط"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Global UI Application & Typography Size */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#1C1E21] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C05638]" />
              أبعاد وحجم النصوص
            </h3>

            {/* Toggle UI application */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EAE3D6] cursor-pointer">
              <div>
                <p className="text-xs font-bold text-[#1C1E21] font-serif">تطبيق الخط على واجهات التطبيق بالكامل</p>
                <p className="text-[11px] text-[#756F68] font-serif">
                  استخدام الخط المختار في القوائم والعناوين بالإضافة إلى مساحة الكتابة
                </p>
              </div>
              <input
                type="checkbox"
                checked={applyFontToUI}
                onChange={(e) => setApplyFontToUI(e.target.checked)}
                className="w-5 h-5 rounded text-[#C05638] focus:ring-[#C05638] accent-[#C05638]"
              />
            </label>

            {/* Font size slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-serif">
                <span className="text-[#756F68]">حجم الخط:</span>
                <span className="text-[#C05638] font-mono font-bold tabular-nums">{fontSize} بكسل</span>
              </div>
              <input
                type="range"
                min="16"
                max="32"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#C05638] h-1.5 bg-[#EAE3D6] rounded-lg cursor-pointer"
              />
            </div>

            {/* Line height slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-serif">
                <span className="text-[#756F68]">ارتفاع وتباعد الأسطر:</span>
                <span className="text-[#C05638] font-mono font-bold tabular-nums">{lineHeight}</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="2.4"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-[#C05638] h-1.5 bg-[#EAE3D6] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Pomodoro Focus Session Timer Settings */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-3xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#1C1E21] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C05638]" />
                مؤقت جلسات الكتابة المركزة (Pomodoro)
              </h3>
              <p className="text-xs text-[#756F68] font-serif mt-0.5">
                تحديد مدة جلسة الكتابة وفترات الاستراحة لتشجيع الإنتاجية والتركيز
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] space-y-2">
                <div className="flex items-center justify-between text-xs font-serif">
                  <span className="text-[#756F68]">جلسة التركيز:</span>
                  <span className="text-[#C05638] font-mono font-bold tabular-nums">
                    {pomodoroDurationMinutes} دقيقة
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={pomodoroDurationMinutes}
                  onChange={(e) => setPomodoroDurationMinutes(Number(e.target.value))}
                  className="w-full accent-[#C05638] h-1.5 bg-[#EAE3D6] rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] space-y-2">
                <div className="flex items-center justify-between text-xs font-serif">
                  <span className="text-[#756F68]">استراحة الاسترخاء:</span>
                  <span className="text-[#2D5A43] font-mono font-bold tabular-nums">
                    {pomodoroBreakMinutes} دقائق
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={pomodoroBreakMinutes}
                  onChange={(e) => setPomodoroBreakMinutes(Number(e.target.value))}
                  className="w-full accent-[#2D5A43] h-1.5 bg-[#EAE3D6] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#756F68] font-serif">
              <span className="font-bold text-[#1C1E21] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C05638]" />
                معاينة حية للمخطوطة:
              </span>
              <span>{activeFontFamily === 'Amiri' ? 'الخط الأميري' : 'خط مخصص'}</span>
            </div>

            <div
              className="p-5 rounded-2xl border border-[#EAE3D6] shadow-xs select-none transition-all leading-relaxed"
              style={previewStyle}
            >
              «كانَتِ الرِّياحُ تَعْصِفُ في أَرْجاءِ الوادِي القَديمِ؛ وَوَقَفَ طارِقٌ يُلْقِي نَظْرَةَ الوَداعِ عَلى مَسْقَطِ رَأْسِهِ، قَبْلَ أَنْ يَمْضِيَ فِي دَرْبٍ لَمْ يَطَأْهُ قَبْلَهُ أَحَدٌ.»
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#F0EAE1] flex items-center justify-between gap-3 bg-[#FAF7F2]">
          <p className="text-xs text-[#8C827A] font-serif hidden sm:block">
            يتم تخزين الخطوط محلياً لتعمل دون اتصال بالإنترنت
          </p>
          <div className="flex items-center gap-3 ms-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-[#756F68] hover:text-[#1C1E21] hover:bg-black/5 transition-colors text-xs font-serif font-bold"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C05638] hover:bg-[#A8492E] text-white font-serif font-bold text-xs transition-transform active:scale-95 shadow-md shadow-[#C05638]/20"
            >
              <Check className="w-4 h-4" />
              تطبيق الإعدادات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
