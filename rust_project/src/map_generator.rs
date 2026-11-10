use crate::models::{
    FantasyWorldMap, MapRealm, MapRiver, MapRoad, MapSettlement, RealmDiplomacy, TerrainBiome,
};
use rand::{rngs::StdRng, Rng, SeedableRng};

pub struct MapGenerator;

impl MapGenerator {
    pub fn generate_world(
        seed: u64,
        landform: &str,
        width: usize,
        height: usize,
    ) -> FantasyWorldMap {
        let mut rng = StdRng::seed_from_u64(seed);
        let mut elevation = vec![vec![0.0f32; width]; height];

        let cx = width as f32 / 2.0;
        let cy = height as f32 / 2.0;
        let max_r = (cx * cx + cy * cy).sqrt();

        for y in 0..height {
            for x in 0..width {
                let dx = x as f32 - cx;
                let dy = y as f32 - cy;
                let dist = (dx * dx + dy * dy).sqrt() / max_r;

                let mut mask = match landform {
                    "archipelago" => {
                        let f1 = (x as f32 * 0.35).sin() * (y as f32 * 0.35).cos();
                        let f2 = (x as f32 * 0.18 + 1.2).cos() * (y as f32 * 0.18).sin();
                        (f1 + f2) * 0.45 + (1.0 - dist) * 0.35
                    }
                    "twin_continents" => {
                        let c1_dist = ((x as f32 - width as f32 * 0.28).powi(2)
                            + (y as f32 - cy).powi(2))
                        .sqrt()
                            / (width as f32 * 0.4);
                        let c2_dist = ((x as f32 - width as f32 * 0.72).powi(2)
                            + (y as f32 - cy).powi(2))
                        .sqrt()
                            / (width as f32 * 0.4);
                        let m1 = (1.0 - c1_dist).max(0.0);
                        let m2 = (1.0 - c2_dist).max(0.0);
                        m1.max(m2)
                    }
                    "islands_ring" => {
                        let ring_r = max_r * 0.48;
                        let ring_dist = ((dx * dx + dy * dy).sqrt() - ring_r).abs() / (max_r * 0.25);
                        (1.0 - ring_dist).max(0.0) * 0.85
                    }
                    "mediterranean" => {
                        let ring_dist = dist * 0.95;
                        (ring_dist - 0.22).clamp(0.0, 1.0)
                    }
                    "pangaea" => (1.0 - dist * 0.8).clamp(0.0, 1.0),
                    "oasis_desert" => {
                        let center_basin = (0.2 - dist).max(0.0) * 1.5;
                        (1.0 - dist * 0.6) + center_basin
                    }
                    _ => (1.0 - dist * 1.25).clamp(0.0, 1.0),
                };

                let n1 = ((x as f32 * 0.12).sin() + (y as f32 * 0.14).cos()) * 0.2;
                let n2 = ((x as f32 * 0.24 + 2.1).cos() + (y as f32 * 0.21 - 1.4).sin()) * 0.12;
                let n3 = ((x as f32 * 0.48).sin() * (y as f32 * 0.48).cos()) * 0.06;

                mask = (mask + n1 + n2 + n3).clamp(0.0, 1.0);
                elevation[y][x] = mask;
            }
        }

        // Biome categorization
        let mut grid = vec![vec![TerrainBiome::DeepOcean; width]; height];
        for y in 0..height {
            for x in 0..width {
                let e = elevation[y][x];
                let lat = (y as f32 / height as f32 - 0.5).abs() * 2.0;

                grid[y][x] = if e < 0.22 {
                    TerrainBiome::DeepOcean
                } else if e < 0.32 {
                    TerrainBiome::CoastalWater
                } else if e < 0.35 {
                    TerrainBiome::Beach
                } else if e > 0.86 {
                    if rng.gen_bool(0.12) {
                        TerrainBiome::Volcano
                    } else {
                        TerrainBiome::SnowMountains
                    }
                } else if e > 0.72 {
                    TerrainBiome::Mountains
                } else if e > 0.60 {
                    TerrainBiome::Hills
                } else if lat > 0.85 {
                    TerrainBiome::Tundra
                } else if lat < 0.25 && e < 0.48 {
                    if rng.gen_bool(0.65) {
                        TerrainBiome::Desert
                    } else {
                        TerrainBiome::Grassland
                    }
                } else if e < 0.42 && rng.gen_bool(0.2) {
                    TerrainBiome::Swamp
                } else if e > 0.48 && e < 0.62 && rng.gen_bool(0.4) {
                    TerrainBiome::Forest
                } else {
                    TerrainBiome::Grassland
                };
            }
        }

        // Generate Realms with Diplomacy Matrix
        let realm_names = [
            ("مملكة النور الذهبيه", "#D97706", "مملكة وراثية", "عربية أرستقراطية", "الحرير والذهب"),
            ("سلطنة الرمال الكبرى", "#B45309", "سلطنة صحراوية", "بدوية صحراوية", "التوابل والجياد"),
            ("إمارة المرافئ الفيروزية", "#0284C7", "إمارة بحرية", "ملاحية فينيقية", "اللؤلؤ والسفن"),
            ("حلف حراس الشمال", "#059669", "حلف قبائل", "قبلية جبلية", "المعادن والأخشاب"),
        ];

        let mut realms = Vec::new();
        for (i, (name, col, gov, cult, exp)) in realm_names.iter().enumerate() {
            realms.push(MapRealm {
                id: format!("realm-{}", i + 1),
                name: name.to_string(),
                ruler: Some(format!("الحاكم {}", i + 1)),
                color: col.to_string(),
                government_type: gov.to_string(),
                culture: cult.to_string(),
                primary_export: exp.to_string(),
                diplomacy: Vec::new(),
            });
        }

        // Create bilateral diplomacy
        let statuses = ["حلف", "هدنة", "حياد", "حرب"];
        for i in 0..realms.len() {
            let mut diplo_list = Vec::new();
            for j in 0..realms.len() {
                if i != j {
                    let status = statuses[(i + j) % statuses.len()];
                    diplo_list.push(RealmDiplomacy {
                        target_realm_id: realms[j].id.clone(),
                        target_realm_name: realms[j].name.clone(),
                        status: status.to_string(),
                    });
                }
            }
            realms[i].diplomacy = diplo_list;
        }

        // Generate Settlements
        let mut settlements = Vec::new();
        let settlement_types = [
            ("دار السلام", "capital", "آمن", 120_000),
            ("حصن الصخرة", "castle", "حذر", 25_000),
            ("ميناء الزفير", "port", "آمن", 65_000),
            ("ممر الرياح العاتية", "pass", "شديد الخطورة", 1_200),
            ("كهف التنين الأسود", "cave", "شديد الخطورة", 50),
        ];

        for (i, (name, stype, danger, pop)) in settlement_types.iter().enumerate() {
            let sx = (width / 5) * (i + 1).min(width - 2);
            let sy = (height / 6) * (i + 1).min(height - 2);

            settlements.push(MapSettlement {
                id: format!("settlement-{}", i + 1),
                name: name.to_string(),
                settlement_type: stype.to_string(),
                x: sx,
                y: sy,
                realm_id: Some(realms[i % realms.len()].id.clone()),
                population: Some(format!("{} نسمة", pop)),
                danger_level: danger.to_string(),
                description: Some(format!("موقع استراتيجي هام في إقليم {}", realms[i % realms.len()].name)),
            });
        }

        FantasyWorldMap {
            id: format!("world-map-{}", seed),
            title: "خريطة القارات السبع الفانتازية".to_string(),
            width,
            height,
            landform: landform.to_string(),
            season: "الربيع المعتدل".to_string(),
            prevailing_winds: "شمالية شرقية تجارية".to_string(),
            terrain_grid: grid,
            realms,
            settlements,
            rivers: Vec::new(),
            roads: Vec::new(),
        }
    }

    pub fn to_svg(map: &FantasyWorldMap, cell_size: usize) -> String {
        let svg_w = map.width * cell_size;
        let svg_h = map.height * cell_size;

        let mut svg = format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {} {}" width="{}" height="{}">"#,
            svg_w, svg_h, svg_w, svg_h
        );
        svg.push_str(r#"<rect width="100%" height="100%" fill="#0F172A"/>"#);

        for y in 0..map.height {
            for x in 0..map.width {
                let biome = map.terrain_grid[y][x];
                let color = match biome {
                    TerrainBiome::DeepOcean => "#0B1320",
                    TerrainBiome::CoastalWater => "#142238",
                    TerrainBiome::Lake => "#14314A",
                    TerrainBiome::Beach => "#E0CB95",
                    TerrainBiome::Grassland => "#1E403A",
                    TerrainBiome::Forest => "#0E241E",
                    TerrainBiome::Hills => "#3D3D2B",
                    TerrainBiome::Mountains => "#3E3C4D",
                    TerrainBiome::SnowMountains => "#BAC6D4",
                    TerrainBiome::Volcano => "#662724",
                    TerrainBiome::Desert => "#D97706",
                    TerrainBiome::Swamp => "#24402D",
                    TerrainBiome::Tundra => "#374B63",
                };

                svg.push_str(&format!(
                    r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}" />"#,
                    x * cell_size,
                    y * cell_size,
                    cell_size,
                    cell_size,
                    color
                ));
            }
        }

        // Draw Settlements
        for s in &map.settlements {
            let cx = s.x * cell_size + cell_size / 2;
            let cy = s.y * cell_size + cell_size / 2;
            svg.push_str(&format!(
                r#"<circle cx="{}" cy="{}" r="6" fill="#F59E0B" stroke="#000" stroke-width="2"/>"#,
                cx, cy
            ));
            svg.push_str(&format!(
                r#"<text x="{}" y="{}" fill="#FFFFFF" font-size="12" font-family="Amiri, serif" text-anchor="middle">{}</text>"#,
                cx,
                cy.saturating_sub(8),
                s.name
            ));
        }

        svg.push_str("</svg>");
        svg
    }
}
