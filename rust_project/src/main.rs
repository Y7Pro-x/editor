mod codex_manager;
mod map_generator;
mod models;
mod novel_manager;

use map_generator::MapGenerator;
use models::{Chapter, ChapterStatus, CodexCategory, CodexItem};
use novel_manager::NovelManager;
use std::fs;

fn main() {
    println!("=======================================================");
    println!("     استوديو الراوي الفانتازي - تطبيق لغة Rust         ");
    println!("        Rawi Studio Core - High-Performance Edition    ");
    println!("=======================================================");

    // 1. Novel & Chapter Management Demo
    println!("\n[1] إدارة الرواية والفصول:");
    let sample_text = "في أعماق الصحراء الكبرى، تحت سماء ملبدة بغيوم العواصف الذهبية، وقف الفارس ينظر نحو أطلال المملكة القديمة...";
    let word_count = NovelManager::count_words(sample_text);
    let reading_time = NovelManager::estimate_reading_time_minutes(word_count);

    let ch1 = Chapter {
        id: "ch-1".to_string(),
        title: "الفصل الأول: عاصفة الرمال الذهبية".to_string(),
        content: sample_text.to_string(),
        word_count,
        status: ChapterStatus::Draft,
        last_modified: "2026-11-10".to_string(),
        is_archived: false,
        notes: Vec::new(),
        is_bookmarked: true,
    };

    let ch2 = Chapter {
        id: "ch-2".to_string(),
        title: "الفصل الثاني: أسرار المعبد العتيق".to_string(),
        content: "دخل الكهف الحجري مسترشداً بمشعل خافت النور...".to_string(),
        word_count: 850,
        status: ChapterStatus::Review,
        last_modified: "2026-11-10".to_string(),
        is_archived: false,
        notes: Vec::new(),
        is_bookmarked: false,
    };

    println!("- الفصل: {}", ch1.title);
    println!("- عدد الكلمات: {} كلمة", ch1.word_count);
    println!("- زمن القراءة المقدر: {} دقيقة", reading_time);

    let comparison = NovelManager::compare_chapters(&ch1, &ch2);
    println!("- مقارنة الفصول: فارق الكلمات بين الفصلين = {} كلمة", comparison.word_difference);

    // 2. Codex & Character Network Demo
    println!("\n[2] الكودكس وشبكة الشخصيات:");
    let mut codex = codex_manager::CodexManager::new();
    codex.add_item(CodexItem {
        id: "char-1".to_string(),
        name: "الفارس طارق".to_string(),
        category: CodexCategory::Character,
        description: "فارس من قبيلة الصقور يحمل سيف الشمس القديم.".to_string(),
        role: Some("بطل".to_string()),
        personality: Some("شجاع، وفيّ، صامت غالباً".to_string()),
        backstory: Some("فقد عائلته في غارة التنانين الأولى".to_string()),
        goal: Some("استعادة عرش والده".to_string()),
        location_region: Some("صحراء الذهب".to_string()),
        hazards: None,
        relationships: Vec::new(),
        tags: vec!["بطل".to_string(), "فارس".to_string()],
    });

    let characters = codex.get_characters();
    println!("- عدد الشخصيات المسجلة في الذاكرة: {}", characters.len());

    // 3. Fantasy Map Generator Demo
    println!("\n[3] توليد الخريطة الفانتازية:");
    let seed = 42875;
    let world_map = MapGenerator::generate_world(seed, "twin_continents", 50, 35);
    println!("- تم توليد عالم: {}", world_map.title);
    println!("- الأبعاد: {}x{}", world_map.width, world_map.height);
    println!("- الفصل المناخي: {}", world_map.season);
    println!("- اتجاه الرياح السائدة: {}", world_map.prevailing_winds);
    println!("- عدد الممالك: {}", world_map.realms.len());
    for r in &world_map.realms {
        println!("  * {} ({}) - الصادرات: {}", r.name, r.government_type, r.primary_export);
    }
    println!("- عدد المستوطنات والحصون: {}", world_map.settlements.len());

    // Export SVG
    let svg_content = MapGenerator::to_svg(&world_map, 16);
    let _ = fs::write("world_map_output.svg", &svg_content);
    println!("- تم حفظ خريطة العالم في: world_map_output.svg");

    println!("\n=======================================================");
    println!("  اكتمل تنفيذ نواة استوديو الراوي بنجاح فائق السرعة!     ");
    println!("=======================================================");
}
