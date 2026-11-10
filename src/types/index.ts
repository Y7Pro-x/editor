export type ChapterStatus = 'فكرة' | 'مسودة' | 'مراجعة' | 'مكتمل';
export type SceneStatus = 'فكرة' | 'مسودة' | 'مراجعة' | 'مكتمل';
export type CharacterRole = 'بطل' | 'خصم' | 'ثانوي';

export interface ChapterNote {
  id: string;
  selectedText?: string;
  text: string;
  createdAt: string;
  color?: 'amber' | 'emerald' | 'sky' | 'rose' | 'purple';
}

export interface Bookmark {
  id: string;
  chapterId: string;
  chapterTitle: string;
  scrollProgress: number; // 0 to 100 percentage
  snippet?: string; // Preview of text where bookmark was placed
  note?: string; // Optional user note on bookmark
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  documentJson: string; // The formatted rich text content
  wordCount: number;
  status: ChapterStatus;
  lastModified: string;
  isArchived?: boolean;
  archivedAt?: string;
  notes?: ChapterNote[]; // Marginal notes / حواشي وملاحظات هامشية
  isBookmarked?: boolean; // Fast bookmark indicator
}

export interface Scene {
  id: string;
  chapterId?: string;
  title: string;
  content: string;
  status: SceneStatus;
  sortOrder: number;
  plotline?: string;
  povCharacter?: string;
  locationName?: string;
}

export type TimelineEventType = 'رئيسي' | 'فرعي' | 'نقطة_تحول' | 'ذروة' | 'بداية' | 'نهاية' | 'خلفية_تاريخية';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  chapterId?: string; // Chapter ID to link event with chapter
  chapterTitle?: string; // Cached or display chapter title
  timeOrDate: string; // E.g. "اليوم الثالث بعد الغروب", "سنة 845 هـ", "في طفولة البطل"
  sortOrder: number;
  eventType: TimelineEventType;
  charactersInvolved?: string[]; // Names of involved characters
  locationName?: string;
  importance?: 'عالي' | 'متوسط' | 'عادي';
  notes?: string;
  lastModified?: string;
}

export type CodexCategory = 'شخصية' | 'مكان' | 'غرض' | 'نظام_سحر' | 'فصيل' | 'تاريخ_وعالم';

// Base Codex Item interface
export interface BaseCodexItem {
  id: string;
  name: string;
  category: CodexCategory;
  description: string;
  notes?: string;
  tags?: string[];
  lastModified?: string;
}

export type CharacterRelationType = 'حليف' | 'عدو' | 'معلم' | 'تلميذ' | 'عائلة' | 'حب' | 'ولاء' | 'منافس' | 'صديق';

export interface CharacterRelationship {
  id: string;
  targetCharacterId: string;
  targetCharacterName: string;
  relationType: CharacterRelationType;
  description?: string; // E.g. "حليف قديم نذر الدفاع عنه" or "عدو لدود يسعى للثأر"
}

// 1. الأشخاص (Characters / People)
export interface PersonItem extends BaseCodexItem {
  category: 'شخصية';
  role: CharacterRole;
  personality: string;
  backstory: string;
  goal: string;
  conflict: string;
  aliases?: string;
  occupationOrTitle?: string;
  factionAffiliation?: string;
  relationships?: CharacterRelationship[]; // Relationships between characters
}

// 2. الأماكن (Locations / Places)
export interface LocationItem extends BaseCodexItem {
  category: 'مكان';
  locationRegion: string;
  climateOrAtmosphere: string;
  strategicSignificance: string; // الأهمية الاستراتيجية في الحبكة
  hazardsOrDefenses: string; // التهديدات، الحراسة، أو الأخطار
  landmarks?: string; // المعالم البارزة والمباني
  controllingFaction?: string; // الجهة الحاكمة
}

// 3. الأغراض (Items / Relics / Artifacts)
export interface InventoryItem extends BaseCodexItem {
  category: 'غرض';
  originOrCreator: string; // المنشأ أو الصانع
  powersOrProperties: string; // الخواص والقدرات
  rarityOrValue: string; // الندرة أو القيمة (فريد، أثري، أسطوري، متداول)
  currentOwnerOrBearer?: string; // المالك أو الحامل الحالي
  riskOrDrawback?: string; // المخاطر أو الآثار الجانبية للاستخدام
}

// 4. نظام السحر (Magic System / Abilities)
export interface MagicSystemItem extends BaseCodexItem {
  category: 'نظام_سحر';
  powersOrRules: string; // القواعد وطريقة الاستخدام والتفعيل
  limitationsOrCost: string; // المحددات وتكلفة الطاقة / العواقب
  sourceOfPower: string; // مصدر القوة (روحي، عناصر الطبيعة، تعاويذ، دم، تأمل)
  rarityOrPractitioners: string; // مدى الانتشار والندرة (سري، كهنة، عام)
  forbiddenArts?: string; // المحرمات والعواقب الكارثية
}

// Unified Codex Entry union type for strict typing
export type CodexEntry = PersonItem | LocationItem | InventoryItem | MagicSystemItem;

// Backward-compatible Character type containing all fields optionally
export interface Character extends BaseCodexItem {
  // Person fields
  role?: CharacterRole;
  personality?: string;
  backstory?: string;
  goal?: string;
  conflict?: string;
  aliases?: string;
  occupationOrTitle?: string;
  factionAffiliation?: string;
  relationships?: CharacterRelationship[];

  // Location fields
  locationRegion?: string;
  climateOrAtmosphere?: string;
  strategicSignificance?: string;
  hazardsOrDefenses?: string;
  landmarks?: string;
  controllingFaction?: string;

  // Inventory fields
  originOrCreator?: string;
  powersOrProperties?: string;
  rarityOrValue?: string;
  currentOwnerOrBearer?: string;
  riskOrDrawback?: string;

  // Magic system fields
  powersOrRules?: string;
  limitationsOrCost?: string;
  sourceOfPower?: string;
  rarityOrPractitioners?: string;
  forbiddenArts?: string;
}

export interface WritingSession {
  id: string;
  chapterId?: string;
  startTime: string;
  endTime: string;
  wordsWritten: number;
}

export interface WritingGoal {
  id: string;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
}

export interface BookMetadata {
  title: string;
  author: string;
  synopsis: string;
}

export type ReadingMode = 'dark' | 'sepia' | 'paper' | 'oled' | 'midnight' | 'forest' | 'rose';

export interface CustomFont {
  id: string;
  name: string; // Display name e.g. "خط ديواني مخصص"
  fontFamily: string; // CSS family name e.g. "CustomFont_1730000000"
  fileName: string;
  dataBase64: string; // Base64 encoded TTF binary
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface AppSettings {
  activeFontFamily: string; // 'Amiri' or custom font family name
  activeFontDisplayName: string;
  applyFontToUI: boolean; // whether custom font applies globally to UI or only writing canvas
  fontSize: number; // default 22px
  lineHeight: number; // default 1.8
  readingMode: ReadingMode; // 'dark' | 'sepia' | 'paper' | 'oled' | 'midnight'
  pomodoroDurationMinutes: number; // default 25 minutes
  pomodoroBreakMinutes: number; // default 5 minutes
}

// ==========================================
// FANTASY WORLD MAP GENERATOR & BUILDER
// Inspired by Azgaar's Fantasy Map Generator
// ==========================================

export type TerrainBiome =
  | 'deep_ocean'
  | 'coastal_water'
  | 'lake'
  | 'beach'
  | 'grassland'
  | 'forest'
  | 'hills'
  | 'mountains'
  | 'snow_mountains'
  | 'volcano'
  | 'desert'
  | 'swamp'
  | 'tundra';

export type MapSettlementType =
  | 'capital'
  | 'city'
  | 'town'
  | 'castle'
  | 'port'
  | 'temple'
  | 'oasis'
  | 'tower'
  | 'ruins'
  | 'cave'
  | 'pass';

export interface MapSettlement {
  id: string;
  name: string;
  type: MapSettlementType;
  x: number; // grid coordinate X
  y: number; // grid coordinate Y
  realmId?: string;
  population?: string;
  description?: string;
  linkedCodexId?: string; // Links to Character/Location in story
  dangerLevel?: 'آمن' | 'حذر' | 'شديد الخطورة';
  loreNotes?: string;
}

export type RealmGovernmentType =
  | 'مملكة وراثية'
  | 'سلطنة صحراوية'
  | 'إمارة بحرية'
  | 'حلف قبائل'
  | 'إمبراطورية قديمة'
  | 'دولة فرسان';

export interface RealmDiplomacy {
  targetRealmId: string;
  targetRealmName: string;
  status: 'حلف' | 'حرب' | 'هدنة' | 'حياد';
}

export interface MapRealm {
  id: string;
  name: string;
  ruler?: string;
  color: string;
  emblem?: string;
  description?: string;
  capitalSettlementId?: string;
  governmentType?: RealmGovernmentType;
  culture?: string;
  primaryExport?: string;
  diplomacy?: RealmDiplomacy[];
}

export interface MapRiver {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  width: number;
}

export interface MapRoad {
  id: string;
  name: string;
  type: 'highway' | 'trail' | 'sea_route';
  points: { x: number; y: number }[];
}

export interface MapLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  type: 'sea' | 'mountain' | 'realm' | 'region';
  rotation?: number;
}

export type MapVisualTheme = 'parchment' | 'dark' | 'topographic' | 'political' | 'atlas_gold';

export type MapLandform =
  | 'single_continent'
  | 'archipelago'
  | 'twin_continents'
  | 'mediterranean'
  | 'pangaea'
  | 'islands_ring'
  | 'shattered_coasts'
  | 'oasis_desert';

export interface MapLayersConfig {
  showHeightmap: boolean;
  showRealms: boolean;
  showSettlements: boolean;
  showRivers: boolean;
  showRoads: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showCompass: boolean;
  showCodexMarkers: boolean;
  showBorders?: boolean;
  showWeather?: boolean;
  showCoordinates?: boolean;
}

export interface FantasyWorldMap {
  id: string;
  name: string;
  description?: string;
  seed: number;
  width: number; // grid cols (e.g. 54)
  height: number; // grid rows (e.g. 36)
  theme: MapVisualTheme;
  landform: MapLandform;
  terrainGrid: TerrainBiome[][];
  realms: MapRealm[];
  settlements: MapSettlement[];
  rivers: MapRiver[];
  roads: MapRoad[];
  labels: MapLabel[];
  layersConfig: MapLayersConfig;
  scaleKmPerUnit?: number; // e.g. 25 km per grid unit
  season?: 'ربيع' | 'صيف' | 'خريف' | 'شتاء';
  prevailingWinds?: string;
  lastModified: string;
  createdAt: string;
}
