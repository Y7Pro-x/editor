use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ChapterStatus {
    #[serde(rename = "فكرة")]
    Idea,
    #[serde(rename = "مسودة")]
    Draft,
    #[serde(rename = "مراجعة")]
    Review,
    #[serde(rename = "مكتمل")]
    Completed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterNote {
    pub id: String,
    pub selected_text: Option<String>,
    pub text: String,
    pub created_at: String,
    pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bookmark {
    pub id: String,
    pub chapter_id: String,
    pub chapter_title: String,
    pub scroll_progress: f32, // 0.0 to 100.0
    pub snippet: Option<String>,
    pub note: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,
    pub title: String,
    pub content: String,
    pub word_count: usize,
    pub status: ChapterStatus,
    pub last_modified: String,
    pub is_archived: bool,
    pub notes: Vec<ChapterNote>,
    pub is_bookmarked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scene {
    pub id: String,
    pub chapter_id: Option<String>,
    pub title: String,
    pub content: String,
    pub status: ChapterStatus,
    pub sort_order: i32,
    pub pov_character: Option<String>,
    pub location_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimelineEventType {
    #[serde(rename = "رئيسي")]
    Major,
    #[serde(rename = "فرعي")]
    Minor,
    #[serde(rename = "نقطة_تحول")]
    TurningPoint,
    #[serde(rename = "ذروة")]
    Climax,
    #[serde(rename = "بداية")]
    Beginning,
    #[serde(rename = "نهاية")]
    Ending,
    #[serde(rename = "خلفية_تاريخية")]
    Backstory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub title: String,
    pub description: String,
    pub chapter_id: Option<String>,
    pub chapter_title: Option<String>,
    pub time_or_date: String,
    pub sort_order: i32,
    pub event_type: TimelineEventType,
    pub characters_involved: Vec<String>,
    pub location_name: Option<String>,
    pub importance: Option<String>,
}

// ----------------------------------------
// Codex Models
// ----------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CodexCategory {
    #[serde(rename = "شخصية")]
    Character,
    #[serde(rename = "مكان")]
    Location,
    #[serde(rename = "غرض")]
    Item,
    #[serde(rename = "نظام_سحر")]
    MagicSystem,
    #[serde(rename = "فصيل")]
    Faction,
    #[serde(rename = "تاريخ_وعالم")]
    Lore,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharacterRelationship {
    pub id: String,
    pub target_id: String,
    pub target_name: String,
    pub relation_type: String, // حليف, عدو, عائلة, إلخ
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexItem {
    pub id: String,
    pub name: String,
    pub category: CodexCategory,
    pub description: String,
    pub role: Option<String>, // بطل, خصم, ثانوي
    pub personality: Option<String>,
    pub backstory: Option<String>,
    pub goal: Option<String>,
    pub location_region: Option<String>,
    pub hazards: Option<String>,
    pub relationships: Vec<CharacterRelationship>,
    pub tags: Vec<String>,
}

// ----------------------------------------
// Fantasy Map Models
// ----------------------------------------

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum TerrainBiome {
    #[serde(rename = "deep_ocean")]
    DeepOcean,
    #[serde(rename = "coastal_water")]
    CoastalWater,
    #[serde(rename = "lake")]
    Lake,
    #[serde(rename = "beach")]
    Beach,
    #[serde(rename = "grassland")]
    Grassland,
    #[serde(rename = "forest")]
    Forest,
    #[serde(rename = "hills")]
    Hills,
    #[serde(rename = "mountains")]
    Mountains,
    #[serde(rename = "snow_mountains")]
    SnowMountains,
    #[serde(rename = "volcano")]
    Volcano,
    #[serde(rename = "desert")]
    Desert,
    #[serde(rename = "swamp")]
    Swamp,
    #[serde(rename = "tundra")]
    Tundra,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapSettlement {
    pub id: String,
    pub name: String,
    pub settlement_type: String, // capital, city, town, castle, port, cave, pass, etc.
    pub x: usize,
    pub y: usize,
    pub realm_id: Option<String>,
    pub population: Option<String>,
    pub danger_level: String, // آمن, حذر, شديد الخطورة
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealmDiplomacy {
    pub target_realm_id: String,
    pub target_realm_name: String,
    pub status: String, // حلف, حرب, هدنة, حياد
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapRealm {
    pub id: String,
    pub name: String,
    pub ruler: Option<String>,
    pub color: String,
    pub government_type: String,
    pub culture: String,
    pub primary_export: String,
    pub diplomacy: Vec<RealmDiplomacy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapRiver {
    pub id: String,
    pub name: String,
    pub points: Vec<(usize, usize)>,
    pub width: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapRoad {
    pub id: String,
    pub name: String,
    pub road_type: String, // highway, trail, sea_route
    pub points: Vec<(usize, usize)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FantasyWorldMap {
    pub id: String,
    pub title: String,
    pub width: usize,
    pub height: usize,
    pub landform: String,
    pub season: String,
    pub prevailing_winds: String,
    pub terrain_grid: Vec<Vec<TerrainBiome>>,
    pub realms: Vec<MapRealm>,
    pub settlements: Vec<MapSettlement>,
    pub rivers: Vec<MapRiver>,
    pub roads: Vec<MapRoad>,
}
