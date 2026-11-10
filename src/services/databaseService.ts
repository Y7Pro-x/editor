import {
  Chapter,
  Scene,
  Character,
  WritingSession,
  WritingGoal,
  BookMetadata,
  CustomFont,
  AppSettings,
  TimelineEvent,
  FantasyWorldMap,
  Bookmark
} from '../types';
import { FantasyMapGenerator } from './fantasyMapGenerator';

const STORAGE_KEYS = {
  CHAPTERS: 'al_mirqam_chapters',
  SCENES: 'al_mirqam_scenes',
  TIMELINE_EVENTS: 'al_mirqam_timeline_events',
  CHARACTERS: 'al_mirqam_characters',
  SESSIONS: 'al_mirqam_sessions',
  GOALS: 'al_mirqam_goals',
  BOOK_META: 'al_mirqam_book_meta',
  FONTS: 'al_mirqam_custom_fonts',
  SETTINGS: 'al_mirqam_app_settings',
  WORLD_MAPS: 'al_mirqam_world_maps',
  ACTIVE_MAP_ID: 'al_mirqam_active_map_id',
  BOOKMARKS: 'al_mirqam_bookmarks',
};

// Seed sample data for first-time author experience
const SEED_CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    title: 'الفصل الأول: رياح الصحراء والظلال',
    documentJson: `كانَتِ الرِّياحُ تَعْصِفُ في أَرْجاءِ الصَّحْراءِ القاحِلَةِ كَأَنَّها تَبْحَثُ عَنْ أَثَرٍ لِقَدَمٍ غارِقَةٍ فِي الرِّمالِ. وَقَفَ طارِقٌ عِنْدَ حافَّةِ الكَثيبِ المُمْتَدِّ، يُشَدِّدُ قَبْضَتَهُ عَلى حِزامِ جِرابِهِ العَتيقِ، وَعَيْناهُ تَتَفَحَّصانِ الأُفُقَ البَعيدَ حَيْثُ تَلْتَقِي السَّماءُ الياقوتِيَّةُ بِبَياضِ المِلْحِ.

لَمْ يَكُنْ فِي قَلْبِهِ مَكانٌ لِلْخَوْفِ؛ فَقَدْ أَلِفَ وَحْشَةَ الطَّريقِ وَصَمْتَ اللَّيالِي الطِّوالِ. تَنَفَّسَ عَميقاً، ثُمَّ أَنْشَدَ بَيْتَ شِعْرٍ قَديمٍ كانَ جَدُّهُ يُرَدِّدُهُ كُلَّما حَلَّ الظَّلامُ: "وَإِذا صَحِبْتَ الرِّيحَ لا تَرْكَنْ إِلى سَكَنٍ، فَالرِّيحُ عَهْدُ العاشِقِ الجَوّالِ".

تَناهى إِلى سَمْعِهِ صَوْتُ وَقْعِ حَوافِرَ قادِمَةٍ مِنْ جِهَةِ الوادِي. تَوارى خَلْفَ صَخْرَةٍ رَمادِيَّةٍ شامِخَةٍ، وَحَبَسَ أَنْفاسَهُ وَهُوَ يُراقِبُ فارِساً مَلَثَّماً يَتَقَدَّمُ بِبُطْءٍ شَديدٍ، يَحْمِلُ في يَدِهِ شُعْلَةً كَأَنَّها نَجْمٌ هَبَطَ مِنَ السَّماءِ.`,
    wordCount: 122,
    status: 'مراجعة',
    lastModified: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ch-2',
    title: 'الفصل الثاني: المخطوط السري',
    documentJson: `في غُرْفَةِ المَكْتَبَةِ السِّرِّيَّةِ أَسْفَلَ حُصْنِ الوادِي، أَوْقَدَ الحَكيمُ قِنْديلَ الزَّيْتِ. كانَتِ الرَّائِحَةُ مَمْزوجَةً بِعَبَقِ الجِلْدِ القَديمِ وَالبَخورِ المُعَتَّقِ.

فَتَحَ الصُّنْدوقَ الخَشَبِيَّ المَنْقوشَ بِزَخارِفَ أَنْدَلُسِيَّةٍ دَقيقَةٍ، وَاسْتَخْرَجَ رَقْعَةً جِلْدِيَّةً قَدْ تَآكَلَتْ أَطْرافُها، مَكْتوبَةً بِمِدادٍ ذَهَبِيٍّ لا يَزولُ رَغْمَ تَعاقُبِ القُرونِ. هَمَسَ لِنَفْسِهِ: "هٰذا هُوَ السِّرُّ الَّذي ماتَ مِنْ أَجْلِهِ الجَميعُ، وَها هُوَ بَيْنَ يَدَيَّ الآنَ".`,
    wordCount: 68,
    status: 'مسودة',
    lastModified: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ch-3',
    title: 'الفصل الثالث: مفترق الدروب',
    documentJson: `حينَ انْبَلَجَ خَيْطُ الفَجْرِ الصّادِقِ، تَجَمَّعَ رِفاقُ الرِّحْلَةِ عِنْدَ بِئْرِ المُرادِ. كانَ كُلُّ واحِدٍ مِنْهُمْ يُخْفِي وَراءَ صَمْتِهِ حِكايَةً لَمْ تُحْكَ بَعْدُ.`,
    wordCount: 26,
    status: 'فكرة',
    lastModified: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

const SEED_SCENES: Scene[] = [
  {
    id: 'sc-1',
    chapterId: 'ch-1',
    title: 'مراقبة الفارس الملثم',
    content: 'طارق يترقب حركة الغريب القادم من وادي الموت عبر كثبان الرمل الذهبية ويتحقق من نصل خنجره.',
    status: 'مراجعة',
    sortOrder: 1,
    plotline: 'الحبكة الرئيسية: مواجهة الظلال',
    povCharacter: 'طارق بن زيان',
    locationName: 'كثبان وادي الصمت',
  },
  {
    id: 'sc-2',
    chapterId: 'ch-2',
    title: 'فك شيفرة الرقعة الأندلسية',
    content: 'الحكيم يكتشف الخريطة المخفية أسفل نص المخطوط الذهبي.',
    status: 'مسودة',
    sortOrder: 2,
    plotline: 'الحبكة الفرعية: لغز المخطوط',
    povCharacter: 'الحكيم إدريس',
    locationName: 'خزانة المخطوطات السفلية',
  },
  {
    id: 'sc-3',
    chapterId: 'ch-3',
    title: 'عهد البئر فجراً',
    content: 'اتفاق الرفاق على خوض الدرب الشمالي الوعر وتوزيع المؤن بالتساوي.',
    status: 'فكرة',
    sortOrder: 3,
    plotline: 'الحبكة الرئيسية',
    povCharacter: 'فاطمة الزهراء',
    locationName: 'بئر المراد',
  },
  {
    id: 'sc-4',
    title: 'المعركة الحاسمة عند بوابات القلعة',
    content: 'اقتحام الحصن واستعادة الراية المسلوبة قبل هبوط الليل.',
    status: 'مكتمل',
    sortOrder: 4,
    plotline: 'ذروة الرواية (Climax)',
    povCharacter: 'طارق بن زيان',
    locationName: 'بوابة الحصن العتيق',
  },
];

const SEED_CHARACTERS: Character[] = [
  // 1. شخوص (People)
  {
    id: 'char-1',
    name: 'طارق بن زيان',
    category: 'شخصية',
    role: 'بطل',
    description: 'فارس ثلاثيني حنطي البشرة، حاد النظرات، يرتدي عباءة صوفية رمادية وخاتماً فضياً موروثاً.',
    personality: 'شجاع، قليل الكلام، وفيّ لعهوده، يمتاز بسرعة البديهة في المخاطر.',
    backstory: 'نشأ يتيماً في كنف بدو الصحراء وتعلّم تتبع الأثر ورمي القوس من شيوخ القبيلة.',
    goal: 'حماية المخطوط واستعادة كرامة قبيلته الضائعة.',
    conflict: 'الصراع بين واجبه نحو قبيلته ورغبته في الاستقرار والسكينة بعيداً عن الحروب.',
    factionAffiliation: 'أبناء البادية الأحرار',
    relationships: [
      {
        id: 'rel-1',
        targetCharacterId: 'char-2',
        targetCharacterName: 'صخر بن عروة',
        relationType: 'عدو',
        description: 'عدو لدود ومطارد لفرقة الذئاب السوداء',
      },
      {
        id: 'rel-2',
        targetCharacterId: 'char-3',
        targetCharacterName: 'الحكيم إدريس',
        relationType: 'معلم',
        description: 'معلمه الروحي وحافظ أسرار المخطوط',
      },
    ],
  },
  {
    id: 'char-2',
    name: 'صخر بن عروة',
    category: 'شخصية',
    role: 'خصم',
    description: 'قائد مرتزقة مدجج بالسلاح، طويل القامة، يحمل ندبة بارزة عبر وجنته اليمنى.',
    personality: 'مكار، قاسي القلب، مهووس بالذهب والسيطرة، لا يؤمن بالعواطف.',
    backstory: 'كان قائداً عسكرياً أطيح به بعد خيانته للمملكة، فأسس فرقة الذئاب السوداء.',
    goal: 'الاستيلاء على خريطة المخطوط الذهبي لبلوغ كنز الوادي المخفي.',
    conflict: 'خوفه الدفين من نبوءة مقتله على يد أحد أبناء الصحراء الشرفاء.',
    factionAffiliation: 'فرقة الذئاب السوداء',
    relationships: [
      {
        id: 'rel-3',
        targetCharacterId: 'char-1',
        targetCharacterName: 'طارق بن زيان',
        relationType: 'عدو',
        description: 'خصمه الرئيسي الذي يقف عائقاً أمام سيطرته على الوادي',
      },
      {
        id: 'rel-4',
        targetCharacterId: 'char-3',
        targetCharacterName: 'الحكيم إدريس',
        relationType: 'منافس',
        description: 'يسعى لأسره وانتزاع مفتاح الشيفرة منه',
      },
    ],
  },
  {
    id: 'char-3',
    name: 'الحكيم إدريس',
    category: 'شخصية',
    role: 'ثانوي',
    description: 'شيخ طاعن في السن، ذو لحية بيضاء كالثلج، يمشي متوكئاً على عصا من خشب السنديان.',
    personality: 'حكيم، صبور، واسع الاطلاع بعلوم الفلك والتاريخ واللغات القديمة.',
    backstory: 'قضى أربعين عاماً في نسخ المخطوطات النادرة في كبرى حواضر الشرق.',
    goal: 'تمرير المعرفة السرية للأجيال القادمة قبل فوات الأوان.',
    conflict: 'ثقل أسرار المخطوط وملاحقة الجواسيس له في كل مكان.',
    factionAffiliation: 'حراس المخطوطات القديمة',
    relationships: [
      {
        id: 'rel-5',
        targetCharacterId: 'char-1',
        targetCharacterName: 'طارق بن زيان',
        relationType: 'تلميذ',
        description: 'يعتبره الأمل الأخير لحماية إرث الأجداد',
      },
    ],
  },

  // 2. أماكن (Locations)
  {
    id: 'loc-1',
    name: 'قلعة وادي الصمت',
    category: 'مكان',
    role: 'ثانوي',
    description: 'حصن أثري مشيد على هضبة جرداء تحيط به خوانق صخرية عميقة ورياح لا تهدأ.',
    personality: 'مكان منيع وموحش، يستعصي على الغزاة، وتفوح من جدرانه رائحة البارود والزمن.',
    backstory: 'بناها الأمير المفقود قبل قرنين لتكون ملاذاً للعلماء والمخطوطات إبان سقوط الحواضر.',
    goal: 'الصمود كآخر معقل لحفظ التراث الأندلسي والخرائط السرية.',
    conflict: 'محاصرة فرقة الذئاب السوداء للممرات السفلية المؤدية لآبار المياه.',
    locationRegion: 'الصحراء الشرقية - وادي الصمت',
    climateOrAtmosphere: 'شديد الجفاف نهاراً، قارس البرودة مع عواصف رملية ليلاً',
  },
  {
    id: 'loc-2',
    name: 'بئر المراد العتيق',
    category: 'مكان',
    role: 'ثانوي',
    description: 'واحة صغيرة مع بئر حجرية منقوشة تحيط بها ثلاث نخلات صامدة وسط بحر الرمال.',
    personality: 'نقطة تلاقٍ مقدسة تضع فيها القوافل المتنازعة أسلحتها هدنة للشرب.',
    backstory: 'حفرها رحالة متصوف نذر أن يسقي كل عابر سبيل دون مقابل.',
    goal: 'منح الحياة للمسافرين التائهين في بيداء الهلاك.',
    conflict: 'شح منسوب المياه واشتباه بوجود سموم دُست في مجراها السفلي.',
    locationRegion: 'مفترق طرق القوافل الجنوبية',
    climateOrAtmosphere: 'واحة معتدلة نسبياً مع نسيم رطب فجراً',
  },

  // 3. أغراض وعتاد (Items & Relics)
  {
    id: 'item-1',
    name: 'المخطوط الذهبي المفقود',
    category: 'غرض',
    role: 'بطل',
    description: 'رق جلد غزال عتيق مكتوب بحبر سائل من ماء الذهب ومحاط بإطار فضي مغلق بختم شمعي أحمر.',
    personality: 'أثر تاريخي مهيب، تلمع حروفه في الظلام إذا قُرئت في ليلة اكتمال البدر.',
    backstory: 'دُوّنت فيه إحداثيات خزائن الحكمة ومنابع المياه الجوفية السرية الممتدة تحت القفار.',
    goal: 'إيصاله إلى مجلس الحكماء قبل أن يقع في أيدي قطاع الطرق.',
    conflict: 'يتعرض للتلف عند تعرضه للرطوبة، ولا تفك طلاسمه إلا بتعويذة خاصة.',
    originOrCreator: 'الوزير ابن عبد ربه وخيرة علماء الفلك بقرطبة',
    powersOrRules: 'يكشف خريطة ضوئية ثلاثية الأبعاد عند تعريضه لضوء قنديل الزيت المعتق',
    limitationsOrCost: 'قراءته تستنزف طاقة القارئ الذهنية وتتطلب إتقان الخط الكوفي القديم',
  },
  {
    id: 'item-2',
    name: 'خنجر الشهاب اليماني',
    category: 'غرض',
    role: 'ثانوي',
    description: 'نصل دمشقي مقوس صُهر من حجر نيزكي هبط في الربع الخالي، مقبضه من عاج الفيل المطعم بالعقيق.',
    personality: 'سلاح فتاك بارد الملمس لا يصدأ ولا ينثلم، يُصدر أزيزاً خافتاً عند اقتراب الخطر.',
    backstory: 'ورثه طارق عن والده الفارس كعلامة شرف بين قبائل الطوارق.',
    goal: 'حماية صاحبه وقطع الدروع السميكة التي تعجز عنها السيوف العادية.',
    conflict: 'يبحث عنه صخر بن عروة كرمز للزعامة المسلوبة.',
    originOrCreator: 'شيخ الحدادين في حضرموت',
  },

  // 4. نظام السحر والقدرات (Magic System)
  {
    id: 'magic-1',
    name: 'علم أثر الرمال وسماع الرياح',
    category: 'نظام_سحر',
    role: 'ثانوي',
    description: 'قدرة فطرية وروحية يتوارثها قلة من أبناء البادية للتواصل مع حركة الكثبان والرياح.',
    personality: 'نظام سحر خفي (Soft/Hard Magic) يعتمد على التأمل والإنصات الحسي التام.',
    backstory: 'تطوّر عبر آلاف السنين كوسيلة للبقاء وتفادي العواصف الرملية المفاجئة.',
    goal: 'معرفة أماكن المياه، استشعار خطوات الغرباء على بعد فراسخ، وتوقع العواصف.',
    conflict: 'الاستخدام المفرط يسبب فقدان حاسة السمع المؤقت والارتباك الذهني.',
    powersOrRules: 'وضع راحة اليد على الرمال الساخنة للشعور باهتزازات حوافر الخيل على مسيرة يوم',
    limitationsOrCost: 'يتعطل تماماً عند هطول الأمطار أو على الأرض الصخرية الصلبة',
  },

  // 5. فصائل وجماعات (Factions)
  {
    id: 'fac-1',
    name: 'فرقة الذئاب السوداء',
    category: 'فصيل',
    role: 'خصم',
    description: 'تنظيم شبه عسكري من المرتزقة والمنفيين، يرتدون دروعاً جلدية سوداء ويلثمون وجوههم بوشاح قرمزي.',
    personality: 'تنظيم هرمي صارم، لا يرحمون الضعفاء، تحركهم المصلحة والذهب.',
    backstory: 'انشقوا عن الجيش النظامي بعد الهزيمة الكبرى وتحولوا إلى قوة غاشمة تسيطر على طرق التجارة.',
    goal: 'السيطرة على وادي الصمت وابتزاز القوافل والوصول إلى كنوز المخطوط.',
    conflict: 'خلافات داخلية بين قادة الفرق حول تقاسم الغنائم وولائهم لصخر بن عروة.',
  },
];

const SEED_GOALS: WritingGoal = {
  id: 'goal-main',
  dailyTarget: 500,
  weeklyTarget: 3500,
  monthlyTarget: 15000,
};

const SEED_BOOK_META: BookMetadata = {
  title: 'رمال الحقيقة',
  author: 'أحمد الروائي',
  synopsis: 'ملحمة روائية تاريخية تدور أحداثها في بوادي الأندلس والصحراء الكبرى حول مخطوط سرّي يحمل مفتاح السلام.',
};

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
      this.saveChapters(SEED_CHAPTERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCENES)) {
      this.saveScenes(SEED_SCENES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHARACTERS)) {
      this.saveCharacters(SEED_CHARACTERS);
    } else {
      // Check if existing data only has characters and lacks places/items/magic; if so, populate new seeds
      const existing = this.getCharacters();
      const hasCategories = existing.some((c) => c.category && c.category !== 'شخصية');
      if (!hasCategories && existing.length <= 3) {
        this.saveCharacters(SEED_CHARACTERS);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(SEED_GOALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOK_META)) {
      localStorage.setItem(STORAGE_KEYS.BOOK_META, JSON.stringify(SEED_BOOK_META));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      const now = Date.now();
      const initialSessions: WritingSession[] = [
        {
          id: 'sess-1',
          startTime: new Date(now - 86400000 * 2).toISOString(),
          endTime: new Date(now - 86400000 * 2 + 1800000).toISOString(),
          wordsWritten: 350,
          chapterId: 'ch-1',
        },
        {
          id: 'sess-2',
          startTime: new Date(now - 86400000).toISOString(),
          endTime: new Date(now - 86400000 + 2400000).toISOString(),
          wordsWritten: 420,
          chapterId: 'ch-1',
        },
        {
          id: 'sess-3',
          startTime: new Date(now - 3600000 * 3).toISOString(),
          endTime: new Date(now - 3600000 * 2.2).toISOString(),
          wordsWritten: 280,
          chapterId: 'ch-2',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
    }
  }

  // Chapters
  public getChapters(): Chapter[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getChapterById(id: string): Chapter | undefined {
    return this.getChapters().find((c) => c.id === id);
  }

  public saveChapter(chapter: Chapter): void {
    const chapters = this.getChapters();
    const idx = chapters.findIndex((c) => c.id === chapter.id);
    chapter.lastModified = new Date().toISOString();
    if (idx >= 0) {
      chapters[idx] = chapter;
    } else {
      chapters.unshift(chapter);
    }
    this.saveChapters(chapters);
  }

  public deleteChapter(id: string): void {
    const chapters = this.getChapters().filter((c) => c.id !== id);
    this.saveChapters(chapters);
  }

  public archiveChapter(id: string): void {
    const chapters = this.getChapters();
    const target = chapters.find((c) => c.id === id);
    if (target) {
      target.isArchived = true;
      target.archivedAt = new Date().toISOString();
      this.saveChapters(chapters);
    }
  }

  public restoreChapter(id: string): void {
    const chapters = this.getChapters();
    const target = chapters.find((c) => c.id === id);
    if (target) {
      target.isArchived = false;
      delete target.archivedAt;
      this.saveChapters(chapters);
    }
  }

  private saveChapters(chapters: Chapter[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  }

  // Scenes
  public getScenes(): Scene[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCENES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveScene(scene: Scene): void {
    const scenes = this.getScenes();
    const idx = scenes.findIndex((s) => s.id === scene.id);
    if (idx >= 0) {
      scenes[idx] = scene;
    } else {
      scenes.push(scene);
    }
    this.saveScenes(scenes);
  }

  public deleteScene(id: string): void {
    const scenes = this.getScenes().filter((s) => s.id !== id);
    this.saveScenes(scenes);
  }

  private saveScenes(scenes: Scene[]): void {
    localStorage.setItem(STORAGE_KEYS.SCENES, JSON.stringify(scenes));
  }

  // Timeline Events (الجدول الزمني للأحداث وربطها بالفصول)
  public getTimelineEvents(): TimelineEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMELINE_EVENTS);
    if (raw) {
      try {
        const events: TimelineEvent[] = JSON.parse(raw);
        return events.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      } catch {
        // fallback
      }
    }
    return this.getInitialTimelineEvents();
  }

  public saveTimelineEvent(event: TimelineEvent): void {
    const events = this.getTimelineEvents();
    event.lastModified = new Date().toISOString();
    const idx = events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      events[idx] = event;
    } else {
      events.push(event);
    }
    this.saveTimelineEvents(events);
  }

  public deleteTimelineEvent(id: string): void {
    const events = this.getTimelineEvents().filter((e) => e.id !== id);
    this.saveTimelineEvents(events);
  }

  public reorderTimelineEvents(events: TimelineEvent[]): void {
    const updated = events.map((ev, index) => ({
      ...ev,
      sortOrder: index + 1,
    }));
    this.saveTimelineEvents(updated);
  }

  private saveTimelineEvents(events: TimelineEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.TIMELINE_EVENTS, JSON.stringify(events));
  }

  private getInitialTimelineEvents(): TimelineEvent[] {
    const seedEvents: TimelineEvent[] = [
      {
        id: 'ev-1',
        title: 'ظهور الفارس الملثم في وادي الصمت',
        description: 'في ليلة مقمرة، يرصد طارق بن زيان فارساً غامضاً يحمل شعلة ياقوتية ويتجه نحو أطراف الصحراء.',
        timeOrDate: 'الليلة الأولى بعد الغروب',
        chapterId: 'ch-1',
        chapterTitle: 'الفصل الأول: رياح الصحراء والظلال',
        sortOrder: 1,
        eventType: 'بداية',
        importance: 'عالي',
        charactersInvolved: ['طارق بن زيان', 'الفارس الملثم'],
        locationName: 'كثبان وادي الصمت',
        notes: 'الحدث المحفز لبدء رحلة استكشاف لغز المخطوط.',
      },
      {
        id: 'ev-2',
        title: 'فك شيفرة الرقعة الأندلسية بخزانة القلعة',
        description: 'الحكيم إدريس ينجح في إظهار الحبر السري الذهبي الذي يكشف إحداثيات واحة النخيل الغائبة.',
        timeOrDate: 'صباح اليوم التالي، الساعة العاشرة',
        chapterId: 'ch-2',
        chapterTitle: 'الفصل الثاني: المخطوط السري',
        sortOrder: 2,
        eventType: 'نقطة_تحول',
        importance: 'عالي',
        charactersInvolved: ['الحكيم إدريس'],
        locationName: 'خزانة المخطوطات السفلية',
        notes: 'تكشف الرقعة عن خطر قادم من فرقة الذئاب السوداء.',
      },
      {
        id: 'ev-3',
        title: 'اللقاء الحاسم عند بئر المراد',
        description: 'اجتماع طارق وفاطمة الزهراء وعقد حلف المسير الشمالي وتوزيع عتاد الماء والسلاح.',
        timeOrDate: 'فجر اليوم الثالث',
        chapterId: 'ch-3',
        chapterTitle: 'الفصل الثالث: مفترق الدروب',
        sortOrder: 3,
        eventType: 'رئيسي',
        importance: 'متوسط',
        charactersInvolved: ['طارق بن زيان', 'فاطمة الزهراء', 'الحكيم إدريس'],
        locationName: 'بئر المراد',
        notes: 'بداية تحرك القافلة قبل هبوب العواصف الرملية.',
      },
      {
        id: 'ev-4',
        title: 'معركة استرداد الراية وكسر الحصار',
        description: 'اشتباك الرفاق مع مقاتلي فرقة الذئاب السوداء واستعادة السيف الدمشقي المذهب.',
        timeOrDate: 'يوم الكسوف الأعظم',
        sortOrder: 4,
        eventType: 'ذروة',
        importance: 'عالي',
        charactersInvolved: ['طارق بن زيان', 'صخر بن عروة'],
        locationName: 'بوابة الحصن العتيق',
        notes: 'ذروة الأحداث وتفكيك شوكة المرتزقة.',
      },
    ];
    this.saveTimelineEvents(seedEvents);
    return seedEvents;
  }

  // Characters
  public getCharacters(): Character[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (!raw) return [];
    try {
      const list: Character[] = JSON.parse(raw);
      // Migrate items if category is missing
      return list.map((item) => ({
        ...item,
        category: item.category || 'شخصية',
      }));
    } catch {
      return [];
    }
  }

  public saveCharacter(character: Character): void {
    const characters = this.getCharacters();
    const idx = characters.findIndex((c) => c.id === character.id);
    if (idx >= 0) {
      characters[idx] = character;
    } else {
      characters.push(character);
    }
    this.saveCharacters(characters);
  }

  public deleteCharacter(id: string): void {
    const characters = this.getCharacters().filter((c) => c.id !== id);
    this.saveCharacters(characters);
  }

  private saveCharacters(characters: Character[]): void {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  }

  // Sessions
  public getSessions(): WritingSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public recordSession(session: WritingSession): void {
    const sessions = this.getSessions();
    sessions.unshift(session);
    // Keep last 100 sessions
    if (sessions.length > 100) {
      sessions.pop();
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  // Goals
  public getGoal(): WritingGoal {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : SEED_GOALS;
  }

  public saveGoal(goal: WritingGoal): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goal));
  }

  // Book Metadata
  public getBookMeta(): BookMetadata {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOK_META);
    return raw ? JSON.parse(raw) : SEED_BOOK_META;
  }

  public saveBookMeta(meta: BookMetadata): void {
    localStorage.setItem(STORAGE_KEYS.BOOK_META, JSON.stringify(meta));
  }

  // Custom Fonts (.ttf)
  public getCustomFonts(): CustomFont[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FONTS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveCustomFont(font: CustomFont): void {
    const fonts = this.getCustomFonts();
    const idx = fonts.findIndex((f) => f.id === font.id);
    if (idx >= 0) {
      fonts[idx] = font;
    } else {
      fonts.push(font);
    }
    localStorage.setItem(STORAGE_KEYS.FONTS, JSON.stringify(fonts));
  }

  public deleteCustomFont(id: string): void {
    const fonts = this.getCustomFonts().filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FONTS, JSON.stringify(fonts));
  }

  // App Settings (Active Font & Typography)
  public getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return {
      activeFontFamily: 'Amiri',
      activeFontDisplayName: 'الخط الأميري (افتراضي)',
      applyFontToUI: false,
      fontSize: 22,
      lineHeight: 1.8,
      readingMode: 'dark',
      pomodoroDurationMinutes: 25,
      pomodoroBreakMinutes: 5,
    };
  }

  public saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // ==========================================
  // Fantasy World Maps Storage (Azgaar-inspired)
  // ==========================================
  private saveWorldMapsDirect(maps: FantasyWorldMap[]): void {
    localStorage.setItem(STORAGE_KEYS.WORLD_MAPS, JSON.stringify(maps));
  }

  public getWorldMaps(): FantasyWorldMap[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORLD_MAPS);
    if (raw) {
      try {
        const maps: FantasyWorldMap[] = JSON.parse(raw);
        if (Array.isArray(maps) && maps.length > 0) return maps;
      } catch {
        // Fallback to initial seed map
      }
    }

    // Seed initial default world map
    const defaultMap = FantasyMapGenerator.generateWorld(
      748291,
      'single_continent',
      54,
      36,
      'parchment'
    );
    defaultMap.name = 'خريطة عالم الرواية الأكبر';
    defaultMap.description = 'الخريطة الرئيسية لعالم الرواية متضمنة الممالك الكبرى، الواحات، والحصون والطرق التجارية.';

    // Connect some settlements to existing novel locations
    try {
      const codexLocations = this.getCharacters().filter((c) => (c.category || 'شخصية') === 'مكان');
      if (codexLocations.length > 0 && defaultMap.settlements.length > 0) {
        codexLocations.forEach((loc, idx) => {
          if (defaultMap.settlements[idx]) {
            defaultMap.settlements[idx].name = loc.name;
            defaultMap.settlements[idx].linkedCodexId = loc.id;
            if (loc.description) {
              defaultMap.settlements[idx].description = loc.description;
            }
          }
        });
      }
    } catch {
      // Continue safely if any issue
    }

    // Direct persistence without calling this.saveWorldMap to prevent infinite recursion
    this.saveWorldMapsDirect([defaultMap]);
    this.setActiveWorldMapId(defaultMap.id);
    return [defaultMap];
  }

  public getActiveWorldMap(): FantasyWorldMap {
    const maps = this.getWorldMaps();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MAP_ID);
    if (activeId) {
      const found = maps.find((m) => m.id === activeId);
      if (found) return found;
    }
    return maps[0];
  }

  public saveWorldMap(map: FantasyWorldMap): void {
    const raw = localStorage.getItem(STORAGE_KEYS.WORLD_MAPS);
    let maps: FantasyWorldMap[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) maps = parsed;
      } catch {
        maps = [];
      }
    }
    const idx = maps.findIndex((m) => m.id === map.id);
    if (idx >= 0) {
      maps[idx] = { ...map, lastModified: new Date().toISOString() };
    } else {
      maps.push({ ...map, lastModified: new Date().toISOString() });
    }
    this.saveWorldMapsDirect(maps);
  }

  public deleteWorldMap(id: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.WORLD_MAPS);
    let maps: FantasyWorldMap[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) maps = parsed;
      } catch {
        maps = [];
      }
    }
    maps = maps.filter((m) => m.id !== id);
    if (maps.length === 0) {
      // Keep at least one world map
      const fresh = FantasyMapGenerator.generateWorld();
      maps = [fresh];
    }
    this.saveWorldMapsDirect(maps);
    this.setActiveWorldMapId(maps[0].id);
  }

  public setActiveWorldMapId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MAP_ID, id);
  }

  // ==========================================
  // Reading Mode Bookmarks (الإشارات المرجعية)
  // ==========================================
  public getBookmarks(): Bookmark[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveBookmark(bookmark: Bookmark): void {
    const bookmarks = this.getBookmarks();
    const idx = bookmarks.findIndex((b) => b.id === bookmark.id || b.chapterId === bookmark.chapterId);
    if (idx >= 0) {
      bookmarks[idx] = bookmark;
    } else {
      bookmarks.unshift(bookmark);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  public deleteBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  public deleteBookmarkByChapterId(chapterId: string): void {
    const bookmarks = this.getBookmarks().filter((b) => b.chapterId !== chapterId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  public toggleChapterBookmark(
    chapterId: string,
    chapterTitle: string,
    scrollProgress: number,
    note?: string,
    snippet?: string
  ): Bookmark | null {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.chapterId === chapterId);

    if (existingIndex >= 0) {
      // Remove existing bookmark
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return null;
    } else {
      // Add new bookmark
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        chapterId,
        chapterTitle,
        scrollProgress: Math.min(100, Math.max(0, Math.round(scrollProgress))),
        snippet: snippet?.slice(0, 120),
        note: note?.trim(),
        createdAt: new Date().toISOString(),
      };
      bookmarks.unshift(newBookmark);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return newBookmark;
    }
  }
}

