import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  User,
  MapPin,
  Package,
  Wand2,
  Sparkles,
  Target,
  ShieldAlert,
  BookOpen,
  Compass,
  Scroll,
  Flame,
  Award,
  Layers,
  Building,
  KeyRound,
  Zap,
  Info,
  Users
} from 'lucide-react';
import {
  Character,
  CharacterRole,
  CodexCategory,
  PersonItem,
  LocationItem,
  InventoryItem,
  MagicSystemItem,
  CharacterRelationship,
  CharacterRelationType
} from '../types';

interface CharacterModalProps {
  character: Character | null;
  allCharacters?: Character[];
  defaultCategory?: CodexCategory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete?: (id: string) => void;
}

export const MAIN_CODEX_SUBSECTIONS: {
  id: CodexCategory;
  label: string;
  icon: React.ElementType;
  badgeText: string;
  desc: string;
}[] = [
  { id: 'شخصية', label: 'الأشخاص', icon: User, badgeText: 'شخصية', desc: 'الأبطال، الخصوم، والشخصيات المؤثرة' },
  { id: 'مكان', label: 'الأماكن', icon: MapPin, badgeText: 'مكان', desc: 'المدن، القلاع، الواحات، والتضاريس' },
  { id: 'غرض', label: 'الأغراض', icon: Package, badgeText: 'غرض/أثر', desc: 'المخطوطات، الأسلحة الأثرية، والعتاد' },
  { id: 'نظام_سحر', label: 'نظام السحر', icon: Wand2, badgeText: 'سحر/قدرة', desc: 'القدرات الخارقة، قوانين السحر، والمحددات' },
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  allCharacters = [],
  defaultCategory = 'شخصية',
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [category, setCategory] = useState<CodexCategory>(defaultCategory);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // 1. الأشخاص (Person fields)
  const [role, setRole] = useState<CharacterRole>('بطل');
  const [personality, setPersonality] = useState('');
  const [backstory, setBackstory] = useState('');
  const [goal, setGoal] = useState('');
  const [conflict, setConflict] = useState('');
  const [aliases, setAliases] = useState('');
  const [occupationOrTitle, setOccupationOrTitle] = useState('');
  const [factionAffiliation, setFactionAffiliation] = useState('');
  const [relationships, setRelationships] = useState<CharacterRelationship[]>([]);

  // Relationship adder temporary state
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState<CharacterRelationType>('حليف');
  const [relDesc, setRelDesc] = useState('');

  // 2. الأماكن (Location fields)
  const [locationRegion, setLocationRegion] = useState('');
  const [climateOrAtmosphere, setClimateOrAtmosphere] = useState('');
  const [strategicSignificance, setStrategicSignificance] = useState('');
  const [hazardsOrDefenses, setHazardsOrDefenses] = useState('');
  const [landmarks, setLandmarks] = useState('');
  const [controllingFaction, setControllingFaction] = useState('');

  // 3. الأغراض (Inventory fields)
  const [originOrCreator, setOriginOrCreator] = useState('');
  const [powersOrProperties, setPowersOrProperties] = useState('');
  const [rarityOrValue, setRarityOrValue] = useState('أثري نادراً');
  const [currentOwnerOrBearer, setCurrentOwnerOrBearer] = useState('');
  const [riskOrDrawback, setRiskOrDrawback] = useState('');

  // 4. نظام السحر (Magic System fields)
  const [powersOrRules, setPowersOrRules] = useState('');
  const [limitationsOrCost, setLimitationsOrCost] = useState('');
  const [sourceOfPower, setSourceOfPower] = useState('روحي وتأملي');
  const [rarityOrPractitioners, setRarityOrPractitioners] = useState('نادر وسري');
  const [forbiddenArts, setForbiddenArts] = useState('');

  useEffect(() => {
    if (character) {
      setName(character.name || '');
      const itemCat = character.category || 'شخصية';
      setCategory(itemCat);
      setDescription(character.description || '');

      // Person
      setRole(character.role || 'بطل');
      setPersonality(character.personality || '');
      setBackstory(character.backstory || '');
      setGoal(character.goal || '');
      setConflict(character.conflict || '');
      setAliases((character as PersonItem).aliases || '');
      setOccupationOrTitle((character as PersonItem).occupationOrTitle || '');
      setFactionAffiliation((character as PersonItem).factionAffiliation || '');
      setRelationships(character.relationships || []);

      // Location
      setLocationRegion(character.locationRegion || '');
      setClimateOrAtmosphere(character.climateOrAtmosphere || '');
      setStrategicSignificance(character.strategicSignificance || character.goal || '');
      setHazardsOrDefenses(character.hazardsOrDefenses || character.conflict || '');
      setLandmarks((character as LocationItem).landmarks || '');
      setControllingFaction((character as LocationItem).controllingFaction || '');

      // Inventory
      setOriginOrCreator(character.originOrCreator || '');
      setPowersOrProperties((character as InventoryItem).powersOrProperties || character.powersOrRules || '');
      setRarityOrValue((character as InventoryItem).rarityOrValue || 'أثري نادراً');
      setCurrentOwnerOrBearer((character as InventoryItem).currentOwnerOrBearer || '');
      setRiskOrDrawback((character as InventoryItem).riskOrDrawback || character.conflict || '');

      // Magic
      setPowersOrRules(character.powersOrRules || '');
      setLimitationsOrCost(character.limitationsOrCost || '');
      setSourceOfPower((character as MagicSystemItem).sourceOfPower || 'روحي وتأملي');
      setRarityOrPractitioners((character as MagicSystemItem).rarityOrPractitioners || 'نادر وسري');
      setForbiddenArts((character as MagicSystemItem).forbiddenArts || character.conflict || '');
    } else {
      setName('');
      setCategory(defaultCategory);
      setDescription('');

      // Person defaults
      setRole('بطل');
      setPersonality('');
      setBackstory('');
      setGoal('');
      setConflict('');
      setAliases('');
      setOccupationOrTitle('');
      setFactionAffiliation('');

      // Location defaults
      setLocationRegion('');
      setClimateOrAtmosphere('');
      setStrategicSignificance('');
      setHazardsOrDefenses('');
      setLandmarks('');
      setControllingFaction('');

      // Inventory defaults
      setOriginOrCreator('');
      setPowersOrProperties('');
      setRarityOrValue('أثري نادراً');
      setCurrentOwnerOrBearer('');
      setRiskOrDrawback('');

      // Magic defaults
      setPowersOrRules('');
      setLimitationsOrCost('');
      setSourceOfPower('روحي وتأملي');
      setRarityOrPractitioners('نادر وسري');
      setForbiddenArts('');
    }
  }, [character, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemId = character ? character.id : `codex-${category}-${Date.now()}`;
    const cleanName = name.trim() || 'عنصر بلا عنوان';

    let updated: Character;

    if (category === 'شخصية') {
      const person: PersonItem = {
        id: itemId,
        name: cleanName,
        category: 'شخصية',
        role,
        description: description.trim(),
        personality: personality.trim(),
        backstory: backstory.trim(),
        goal: goal.trim(),
        conflict: conflict.trim(),
        aliases: aliases.trim() || undefined,
        occupationOrTitle: occupationOrTitle.trim() || undefined,
        factionAffiliation: factionAffiliation.trim() || undefined,
        relationships: relationships.length > 0 ? relationships : undefined,
        lastModified: new Date().toISOString(),
      };
      updated = person;
    } else if (category === 'مكان') {
      const location: LocationItem = {
        id: itemId,
        name: cleanName,
        category: 'مكان',
        description: description.trim(),
        locationRegion: locationRegion.trim(),
        climateOrAtmosphere: climateOrAtmosphere.trim(),
        strategicSignificance: strategicSignificance.trim(),
        hazardsOrDefenses: hazardsOrDefenses.trim(),
        landmarks: landmarks.trim() || undefined,
        controllingFaction: controllingFaction.trim() || undefined,
        notes: backstory.trim() || undefined,
        lastModified: new Date().toISOString(),
      };
      // Map properties for backward compatibility
      updated = {
        ...location,
        role: 'ثانوي',
        personality: climateOrAtmosphere.trim(),
        backstory: backstory.trim(),
        goal: strategicSignificance.trim(),
        conflict: hazardsOrDefenses.trim(),
      };
    } else if (category === 'غرض') {
      const item: InventoryItem = {
        id: itemId,
        name: cleanName,
        category: 'غرض',
        description: description.trim(),
        originOrCreator: originOrCreator.trim(),
        powersOrProperties: powersOrProperties.trim(),
        rarityOrValue: rarityOrValue.trim(),
        currentOwnerOrBearer: currentOwnerOrBearer.trim() || undefined,
        riskOrDrawback: riskOrDrawback.trim() || undefined,
        notes: backstory.trim() || undefined,
        lastModified: new Date().toISOString(),
      };
      updated = {
        ...item,
        role: 'ثانوي',
        personality: rarityOrValue.trim(),
        backstory: backstory.trim(),
        goal: powersOrProperties.trim(),
        conflict: riskOrDrawback.trim(),
        powersOrRules: powersOrProperties.trim(),
      };
    } else {
      // نظام سحر
      const magic: MagicSystemItem = {
        id: itemId,
        name: cleanName,
        category: 'نظام_سحر',
        description: description.trim(),
        powersOrRules: powersOrRules.trim(),
        limitationsOrCost: limitationsOrCost.trim(),
        sourceOfPower: sourceOfPower.trim(),
        rarityOrPractitioners: rarityOrPractitioners.trim(),
        forbiddenArts: forbiddenArts.trim() || undefined,
        notes: backstory.trim() || undefined,
        lastModified: new Date().toISOString(),
      };
      updated = {
        ...magic,
        role: 'ثانوي',
        personality: sourceOfPower.trim(),
        backstory: backstory.trim(),
        goal: powersOrRules.trim(),
        conflict: limitationsOrCost.trim(),
      };
    }

    onSave(updated);
    onClose();
  };

  const currentSection = MAIN_CODEX_SUBSECTIONS.find((s) => s.id === category) || MAIN_CODEX_SUBSECTIONS[0];
  const IconComponent = currentSection.icon;

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
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-[#1C1E21]">
                {character ? `تعديل في الكودكس: ${character.name}` : `إضافة عنصر جديد: ${currentSection.label}`}
              </h2>
              <p className="text-xs text-[#756F68]">{currentSection.desc}</p>
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

        {/* Section Tabs Switcher (الأشخاص | الأماكن | الأغراض | نظام السحر) */}
        <div className="px-6 pt-3 pb-2 bg-[#FAF7F2] border-b border-[#EAE3D6] flex items-center gap-2 overflow-x-auto">
          {MAIN_CODEX_SUBSECTIONS.map((sec) => {
            const isSel = category === sec.id;
            const SecIcon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setCategory(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSel
                    ? 'bg-[#C05638] text-white shadow-xs'
                    : 'text-[#756F68] hover:text-[#1C1E21] hover:bg-stone-200/60'
                }`}
              >
                <SecIcon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 1. الأشخاص (PERSON FORM) */}
          {category === 'شخصية' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-300 mb-1">
                    اسم الشخصية <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: طارق بن زيان"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-base font-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">الدور في الرواية</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as CharacterRole)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-[#C05638] text-sm font-medium"
                  >
                    <option value="بطل">بطل (Protagonist)</option>
                    <option value="خصم">خصم (Antagonist)</option>
                    <option value="ثانوي">شخصية ثانوية (Supporting)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">الألقاب والكنى</label>
                  <input
                    type="text"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                    placeholder="مثال: صقر الصحراء"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">المهنة أو الرتبة</label>
                  <input
                    type="text"
                    value={occupationOrTitle}
                    onChange={(e) => setOccupationOrTitle(e.target.value)}
                    placeholder="مثال: قائد فرسان، ناسخ مخطوطات"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">الفصيل أو القبيلة</label>
                  <input
                    type="text"
                    value={factionAffiliation}
                    onChange={(e) => setFactionAffiliation(e.target.value)}
                    placeholder="مثال: قبيلة بني هلال، الذئاب السوداء"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  الوصف الظاهري والعمر والملامح
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="الملامح، الطول، الهيئة، نبرة الصوت، الملابس المميزة..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">السمات والطباع الشخصية</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="مثال: ذكي، هادئ تحت الضغط، شجاع لكنه متشكك..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-amber-400 mb-1">
                    <Target className="w-3.5 h-3.5" />
                    الهدف والرغبة الأساسية
                  </label>
                  <textarea
                    rows={2}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="ما الذي يقاتل من أجله طوال القصة؟"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-rose-400 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    الصراع والعقبة والضعف
                  </label>
                  <textarea
                    rows={2}
                    value={conflict}
                    onChange={(e) => setConflict(e.target.value)}
                    placeholder="ما هو صراعه الداخلي أو العائق أمامه؟"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">الخلفية والماضي (Backstory)</label>
                <textarea
                  rows={3}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="أسرار النشأة، ذكريات الطفولة، وأحداث الماضي التي صنعت شخصيته..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>

              {/* Character Relationships Section */}
              <div className="pt-3 border-t border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>علاقات الشخصية مع الشخوص الأخرى ({relationships.length})</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    تظهر مباشرة في خريطة العلاقات المرئية
                  </span>
                </div>

                {/* Add new relationship box */}
                <div className="p-3 bg-[#171717] rounded-xl border border-stone-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">الشخصية المقابلة:</label>
                      <select
                        value={relTargetId}
                        onChange={(e) => setRelTargetId(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C05638]"
                      >
                        <option value="">-- اختر شخصية من الرواية --</option>
                        {allCharacters
                          .filter((c) => (c.category || 'شخصية') === 'شخصية' && (!character || c.id !== character.id))
                          .map((other) => (
                            <option key={other.id} value={other.id}>
                              {other.name} ({other.role || 'شخصية'})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">نوع العلاقة:</label>
                      <select
                        value={relType}
                        onChange={(e) => setRelType(e.target.value as CharacterRelationType)}
                        className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C05638]"
                      >
                        <option value="حليف">حليف</option>
                        <option value="صديق">صديق</option>
                        <option value="عدو">عدو / خصم</option>
                        <option value="منافس">منافس</option>
                        <option value="معلم">معلم / مرشد</option>
                        <option value="تلميذ">تلميذ</option>
                        <option value="عائلة">قرابة / عائلة</option>
                        <option value="حب">حب / مودة</option>
                        <option value="ولاء">ولاء وعهد</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={relDesc}
                      onChange={(e) => setRelDesc(e.target.value)}
                      placeholder="وصف مختصر لطبيعة الرابط (مثال: نذر حمايته، أو خصم يطلب ثأراً قديماً)"
                      className="flex-1 bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-lg px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638]"
                    />

                    <button
                      type="button"
                      disabled={!relTargetId}
                      onClick={() => {
                        const targetChar = allCharacters.find((c) => c.id === relTargetId);
                        if (!targetChar) return;
                        const newRel: CharacterRelationship = {
                          id: `rel-${Date.now()}`,
                          targetCharacterId: targetChar.id,
                          targetCharacterName: targetChar.name,
                          relationType: relType,
                          description: relDesc.trim() || undefined,
                        };
                        setRelationships([...relationships, newRel]);
                        setRelTargetId('');
                        setRelDesc('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs transition-colors shrink-0"
                    >
                      ربط
                    </button>
                  </div>
                </div>

                {/* Existing relationships badges list */}
                {relationships.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {relationships.map((rel, rIdx) => (
                      <div
                        key={rel.id || `rel-${rIdx}`}
                        className="p-2 rounded-lg bg-[#141414] border border-stone-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-white font-serif">{rel.targetCharacterName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 border border-stone-700 font-bold">
                            {rel.relationType}
                          </span>
                          {rel.description && (
                            <span className="text-[11px] text-stone-400 truncate">({rel.description})</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setRelationships(relationships.filter((_, idx) => idx !== rIdx))}
                          className="p-1 text-stone-500 hover:text-rose-400 rounded transition-colors"
                          title="حذف هذا الرابط"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 2. الأماكن (LOCATION FORM) */}
          {category === 'مكان' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-300 mb-1">
                    اسم المكان أو المعلم <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: قلعة وادي الصمت"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-base font-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">الإقليم الجغرافي</label>
                  <input
                    type="text"
                    value={locationRegion}
                    onChange={(e) => setLocationRegion(e.target.value)}
                    placeholder="مثال: الصحراء الشرقية"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">المناخ والطقس والأجواء</label>
                  <input
                    type="text"
                    value={climateOrAtmosphere}
                    onChange={(e) => setClimateOrAtmosphere(e.target.value)}
                    placeholder="مثال: شديد الحرارة نهاراً، عواصف رملية ليلاً"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">الجهة الحاكمة أو المسيطرة</label>
                  <input
                    type="text"
                    value={controllingFaction}
                    onChange={(e) => setControllingFaction(e.target.value)}
                    placeholder="مثال: قبيلة الطوارق، فرقة الذئاب"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  الوصف المعماري والتضاريس العامة
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="شكل المباني، الممرات، المواد المشيدة منها، والمشهد البصري..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-amber-400 mb-1">
                    <Compass className="w-3.5 h-3.5" />
                    الأهمية الاستراتيجية في الحبكة
                  </label>
                  <textarea
                    rows={2}
                    value={strategicSignificance}
                    onChange={(e) => setStrategicSignificance(e.target.value)}
                    placeholder="لماذا يقصد الأبطال هذا المكان وما سر أهميته؟"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-rose-400 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    التهديدات والمخاطر والدفاعات
                  </label>
                  <textarea
                    rows={2}
                    value={hazardsOrDefenses}
                    onChange={(e) => setHazardsOrDefenses(e.target.value)}
                    placeholder="الأفخاخ، الحراسة، قطاع الطرق، أو الوحوش المحيطة..."
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">تاريخ المكان والأساطير المتوارثة</label>
                <textarea
                  rows={3}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="من بنى هذا المكان ومتى؟ وما هي الحكايات الشعبية المرتبطة به؟"
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>
            </>
          )}

          {/* 3. الأغراض والعتاد (INVENTORY ITEM FORM) */}
          {category === 'غرض' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-300 mb-1">
                    اسم الغرض أو الأثر <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: المخطوط الذهبي المفقود"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-base font-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">الندرة والقيمة</label>
                  <select
                    value={rarityOrValue}
                    onChange={(e) => setRarityOrValue(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-[#C05638] text-sm font-medium"
                  >
                    <option value="فريد ولا مثيل له">فريد لا مثيل له (Unique)</option>
                    <option value="أثري نادراً">أثري نادر (Legendary)</option>
                    <option value="عتاد مميز">عتاد مميز (Rare)</option>
                    <option value="متداول وشائع">متداول (Common)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">المنشأ أو الصانع</label>
                  <input
                    type="text"
                    value={originOrCreator}
                    onChange={(e) => setOriginOrCreator(e.target.value)}
                    placeholder="مثال: حكماء قرطبة، حداد الربع الخالي"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">المالك أو الحامل الحالي</label>
                  <input
                    type="text"
                    value={currentOwnerOrBearer}
                    onChange={(e) => setCurrentOwnerOrBearer(e.target.value)}
                    placeholder="مثال: طارق بن زيان"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  المظهر والمادة المصنوع منها
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="جلد غزال عتيق، نصل دمشقي، مقبض عاج مطعم بالياقوت..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-amber-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    الخواص والقدرات الخارقة
                  </label>
                  <textarea
                    rows={2}
                    value={powersOrProperties}
                    onChange={(e) => setPowersOrProperties(e.target.value)}
                    placeholder="مثال: يكشف خريطة ضوئية عند اكتمال البدر..."
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-rose-400 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    المخاطر والعيوب وموانع الاستعمال
                  </label>
                  <textarea
                    rows={2}
                    value={riskOrDrawback}
                    onChange={(e) => setRiskOrDrawback(e.target.value)}
                    placeholder="مثال: يستنزف طاقة الحامل، يتلف بالرطوبة..."
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">تاريخ الغرض في الرواية</label>
                <textarea
                  rows={3}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="كيف تم العثور عليه؟ وما الصراعات التي دارت حوله عبر القرون؟"
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>
            </>
          )}

          {/* 4. نظام السحر والقدرات (MAGIC SYSTEM FORM) */}
          {category === 'نظام_سحر' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-300 mb-1">
                    اسم القدرة أو مدرسة السحر <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علم أثر الرمال وسماع الرياح"
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-base font-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">مدى الانتشار والندرة</label>
                  <select
                    value={rarityOrPractitioners}
                    onChange={(e) => setRarityOrPractitioners(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-[#C05638] text-sm font-medium"
                  >
                    <option value="نادر وسري">نادر وسري للغاية</option>
                    <option value="مقتصر على قبيلة معينة">مقتصر على سلالة/قبيلة</option>
                    <option value="يتطلب تعلماً شاقاً">مكتسب بتعلم شاق</option>
                    <option value="سحر عام">معروف وشائع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">مصدر طاقة السحر</label>
                <input
                  type="text"
                  value={sourceOfPower}
                  onChange={(e) => setSourceOfPower(e.target.value)}
                  placeholder="مثال: التأمل الصوفي، حرارة الشمس، دم الأسلاف، تعاويذ الحبر الذهبي"
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-[#C05638]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  مفهوم السحر وطبيعة تأثيره
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اشرح كيف يبدو هذا السحر حواسياً وما أثره في العالم..."
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-amber-400 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    قواعد وطريقة تفعيل القدرة
                  </label>
                  <textarea
                    rows={2}
                    value={powersOrRules}
                    onChange={(e) => setPowersOrRules(e.target.value)}
                    placeholder="وضع اليد على الرمل، ترديد بيت شعر، تركيز النظر..."
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-rose-400 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    المحددات والتكلفة (Limitations & Cost)
                  </label>
                  <textarea
                    rows={2}
                    value={limitationsOrCost}
                    onChange={(e) => setLimitationsOrCost(e.target.value)}
                    placeholder="فقدان السمع المؤقت، العجز عند نزول المطر..."
                    className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">
                  المحرمات والعواقب الكارثية أو الطقوس الممنوعة
                </label>
                <textarea
                  rows={2}
                  value={forbiddenArts}
                  onChange={(e) => setForbiddenArts(e.target.value)}
                  placeholder="ما الذي يحدث لو تجاوز الساحر حدوده المسموحة؟"
                  className="w-full bg-[#FAF7F2] border border-[#EAE3D6] text-[#1C1E21] rounded-xl px-4 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-[#C05638] text-sm"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
            {character && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من حذف "${character.name}" من الكودكس؟`)) {
                    onDelete(character.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف العنصر</span>
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
                <span>حفظ في الكودكس</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
