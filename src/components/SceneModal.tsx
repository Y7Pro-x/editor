import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, MapPin, User, Bookmark } from 'lucide-react';
import { Scene, SceneStatus, Chapter } from '../types';

interface SceneModalProps {
  scene: Scene | null;
  chapters: Chapter[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  onDelete?: (id: string) => void;
}

export const SceneModal: React.FC<SceneModalProps> = ({
  scene,
  chapters,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<SceneStatus>('فكرة');
  const [plotline, setPlotline] = useState('');
  const [povCharacter, setPovCharacter] = useState('');
  const [locationName, setLocationName] = useState('');
  const [chapterId, setChapterId] = useState<string>('');

  useEffect(() => {
    if (scene) {
      setTitle(scene.title || '');
      setContent(scene.content || '');
      setStatus(scene.status || 'فكرة');
      setPlotline(scene.plotline || '');
      setPovCharacter(scene.povCharacter || '');
      setLocationName(scene.locationName || '');
      setChapterId(scene.chapterId || '');
    } else {
      setTitle('');
      setContent('');
      setStatus('فكرة');
      setPlotline('');
      setPovCharacter('');
      setLocationName('');
      setChapterId(chapters[0]?.id || '');
    }
  }, [scene, chapters, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Scene = {
      id: scene ? scene.id : `sc-${Date.now()}`,
      title: title.trim() || 'مشهد بدون عنوان',
      content: content.trim(),
      status,
      sortOrder: scene ? scene.sortOrder : Date.now(),
      plotline: plotline.trim() || undefined,
      povCharacter: povCharacter.trim() || undefined,
      locationName: locationName.trim() || undefined,
      chapterId: chapterId || undefined,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white border border-[#EAE3D6] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE3D6] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C05638]/10 border border-[#C05638]/20 flex items-center justify-center text-[#C05638]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#1C1E21]">
                {scene ? 'تعديل تفاصيل المشهد' : 'إضافة مشهد روائي جديد'}
              </h2>
              <p className="text-xs text-[#756F68]">حدد تفاصيل المشهد وخط الحبكة والشخصية الراوية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#756F68] hover:text-[#1C1E21] rounded-xl hover:bg-stone-100 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
              عنوان المشهد <span className="text-[#C05638]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: لقاء عند بوابات الوادي"
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] focus:ring-1 focus:ring-[#C05638] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">حالة المشهد</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SceneStatus)}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] text-sm cursor-pointer"
              >
                <option value="فكرة">فكرة</option>
                <option value="مسودة">مسودة</option>
                <option value="مراجعة">مراجعة</option>
                <option value="مكتمل">مكتمل</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">مرتبط بالفصل</label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-2.5 text-[#1C1E21] focus:outline-hidden focus:border-[#C05638] text-sm cursor-pointer"
              >
                <option value="">بدون فصل محدد</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
                <Bookmark className="w-3.5 h-3.5 text-[#C05638]" />
                خط الحبكة
              </label>
              <input
                type="text"
                value={plotline}
                onChange={(e) => setPlotline(e.target.value)}
                placeholder="الحبكة الأساسية أو الفرعية"
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
                <User className="w-3.5 h-3.5 text-[#C05638]" />
                وجهة النظر (POV)
              </label>
              <input
                type="text"
                value={povCharacter}
                onChange={(e) => setPovCharacter(e.target.value)}
                placeholder="اسم راوي المشهد"
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] text-xs"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
                <MapPin className="w-3.5 h-3.5 text-[#C05638]" />
                الموقع / المكان
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="المكان الجغرافي"
                className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-3 py-2 text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1E21] mb-1.5 font-serif">
              محتوى ومسودة المشهد والملاحظات
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تفاصيل المشهد، الحوارات المقترحة، أو الصراع الداخلي..."
              className="w-full bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl px-4 py-3 text-[#1C1E21] placeholder-stone-400 focus:outline-hidden focus:border-[#C05638] leading-relaxed text-sm font-serif resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
            {scene && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من حذف هذا المشهد نهائياً؟')) {
                    onDelete(scene.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف المشهد</span>
              </button>
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
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#C05638] hover:bg-[#A8452B] text-white font-bold transition-transform active:scale-95 shadow-sm text-xs"
              >
                <Save className="w-4 h-4" />
                <span>حفظ المشهد</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
