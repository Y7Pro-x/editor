import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Users,
  Sparkles,
  AlertCircle,
  Flag,
  Tag
} from 'lucide-react';
import { TimelineEvent, TimelineEventType, Chapter } from '../types';

interface TimelineEventModalProps {
  isOpen: boolean;
  event: TimelineEvent | null;
  chapters: Chapter[];
  nextOrder: number;
  onClose: () => void;
  onSave: (event: TimelineEvent) => void;
  onDelete?: (id: string) => void;
}

const EVENT_TYPE_OPTIONS: { id: TimelineEventType; label: string; desc: string; color: string }[] = [
  { id: 'بداية', label: 'حدث استهلالي / بداية', desc: 'الحدث المحفز لبداية المغامرة أو الرحلة', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'رئيسي', label: 'حدث حبكة رئيسي', desc: 'حدث محوري يدفع وتيرة الرواية للأمام', color: 'text-[#C05638] bg-[#C05638]/10 border-[#C05638]/30' },
  { id: 'نقطة_تحول', label: 'نقطة تحول (Plot Twist)', desc: 'انقلاب في الموازين أو اكتشاف سر كبير', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { id: 'ذروة', label: 'ذروة الأحداث (Climax)', desc: 'أعلى مراحل التوتر والمواجهة الكبرى', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'فرعي', label: 'حدث فرعي / موازي', desc: 'أحداث جانبية للشخصيات المساعدة', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'خلفية_تاريخية', label: 'فلاش باك / خلفية تاريخية', desc: 'أحداث وقعت في الماضي تفسر الحاضر', color: 'text-stone-700 bg-stone-100 border-stone-200' },
  { id: 'نهاية', label: 'انفراجة ونهاية', desc: 'تسوية الصراع وعواقب الذروة', color: 'text-teal-700 bg-teal-50 border-teal-200' },
];

export const TimelineEventModal: React.FC<TimelineEventModalProps> = ({
  isOpen,
  event,
  chapters,
  nextOrder,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeOrDate, setTimeOrDate] = useState('');
  const [chapterId, setChapterId] = useState<string>('');
  const [eventType, setEventType] = useState<TimelineEventType>('رئيسي');
  const [importance, setImportance] = useState<'عالي' | 'متوسط' | 'عادي'>('عالي');
  const [locationName, setLocationName] = useState('');
  const [charactersInvolvedInput, setCharactersInvolvedInput] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setTimeOrDate(event.timeOrDate || '');
      setChapterId(event.chapterId || '');
      setEventType(event.eventType || 'رئيسي');
      setImportance(event.importance || 'عالي');
      setLocationName(event.locationName || '');
      setCharactersInvolvedInput(
        event.charactersInvolved ? event.charactersInvolved.join('، ') : ''
      );
      setNotes(event.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setTimeOrDate('');
      setChapterId(chapters[0]?.id || '');
      setEventType('رئيسي');
      setImportance('عالي');
      setLocationName('');
      setCharactersInvolvedInput('');
      setNotes('');
    }
    setErrorMsg(null);
  }, [event, isOpen, chapters]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان للحدث الزمني');
      return;
    }

    const selectedChapter = chapters.find((c) => c.id === chapterId);
    const charactersArray = charactersInvolvedInput
      .split(/[،,]/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const savedEvent: TimelineEvent = {
      id: event ? event.id : `ev-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      timeOrDate: timeOrDate.trim() || 'غير محدد بالزمن',
      chapterId: chapterId || undefined,
      chapterTitle: selectedChapter ? selectedChapter.title : undefined,
      sortOrder: event ? event.sortOrder : nextOrder,
      eventType,
      importance,
      locationName: locationName.trim() || undefined,
      charactersInvolved: charactersArray.length > 0 ? charactersArray : undefined,
      notes: notes.trim() || undefined,
      lastModified: new Date().toISOString(),
    };

    onSave(savedEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white border border-[#EAE3D6] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE3D6] bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-[#1C1E21]">
                {event ? 'تعديل الحدث الزمني' : 'إضافة حدث زمني جديد'}
              </h2>
              <p className="text-xs text-[#756F68]">
                توثيق أحداث الرواية وترتيبها زمنياً وربطها بالفصل المقابل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#756F68] hover:text-[#1C1E21] rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
              عنوان الحدث الزمني <span className="text-[#C05638]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ليلة اقتحام حصن الوادي، أو لقاء البئر السري"
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-sm text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] font-serif"
              autoFocus
            />
          </div>

          {/* Time & Associated Chapter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chronological Time / Date */}
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 flex items-center gap-1.5 font-serif">
                <Clock className="w-3.5 h-3.5 text-[#C05638]" />
                <span>الزمن / التوقيت الروائي</span>
              </label>
              <input
                type="text"
                value={timeOrDate}
                onChange={(e) => setTimeOrDate(e.target.value)}
                placeholder="مثال: فجر اليوم الثالث، سنة 845 هـ"
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638]"
              />
            </div>

            {/* Linked Chapter */}
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 flex items-center gap-1.5 font-serif">
                <BookOpen className="w-3.5 h-3.5 text-[#C05638]" />
                <span>الفصل المرتبط بهذا الحدث</span>
              </label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] cursor-pointer"
              >
                <option value="">-- غير مرتبط بفصل محدد (حدث عام/خلفية) --</option>
                {chapters.map((ch, idx) => (
                  <option key={ch.id} value={ch.id}>
                    الفصل {idx + 1}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Type & Importance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 flex items-center gap-1.5 font-serif">
                <Tag className="w-3.5 h-3.5 text-[#C05638]" />
                <span>طبيعة الحدث في مسار الرواية</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as TimelineEventType)}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] cursor-pointer"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 flex items-center gap-1.5 font-serif">
                <Flag className="w-3.5 h-3.5 text-[#C05638]" />
                <span>درجة الأهمية والتأثير</span>
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value as 'عالي' | 'متوسط' | 'عادي')}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] cursor-pointer"
              >
                <option value="عالي">أهمية عالية (محوري ومؤثر في المصير)</option>
                <option value="متوسط">أهمية متوسطة (تطوير للشخصيات والحبكة)</option>
                <option value="عادي">أهمية عادية (حدث تأسيسي / وصفي)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
              تفاصيل ومجريات الحدث
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="صف باختصار ماذا حدث بالتحديد، الدوافع، والنتائج المترتبة على هذا الحدث..."
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-3 text-xs text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] leading-relaxed font-serif resize-none"
            />
          </div>

          {/* Location & Characters Involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 flex items-center gap-1.5 font-serif">
                <MapPin className="w-3.5 h-3.5 text-[#C05638]" />
                <span>مكان وقوع الحدث</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="مثال: واحة النخيل، برج الحراسة الشمالي"
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 flex items-center gap-1.5 font-serif">
                <Users className="w-3.5 h-3.5 text-[#C05638]" />
                <span>الشخصيات الحاضرة / المشاركة</span>
              </label>
              <input
                type="text"
                value={charactersInvolvedInput}
                onChange={(e) => setCharactersInvolvedInput(e.target.value)}
                placeholder="افصل بفاصلة: طارق، فاطمة، قائد الحرس"
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-xs text-[#1C1E21] focus:outline-hidden focus:border-[#C05638]"
              />
            </div>
          </div>

          {/* Author Notes */}
          <div>
            <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
              ملاحظات المؤلف وأسرار الحبكة (اختياري)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تنبيهات للمراجعة، أدلة مخفية يجب أن يلاحظها القارئ لاحقاً..."
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-3 text-xs text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] resize-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#EAE3D6] bg-[#FAF7F2] flex items-center justify-between gap-3">
          {event && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحدث من الجدول الزمني؟')) {
                  onDelete(event.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف الحدث</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ms-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#756F68] hover:text-[#1C1E21] hover:bg-stone-100 transition-colors text-xs font-medium"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold transition-transform active:scale-95 shadow-sm text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{event ? 'حفظ التعديلات' : 'إضافة الحدث'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TimelineEventModal;
