import {
  FantasyWorldMap,
  TerrainBiome,
  MapSettlement,
  MapSettlementType,
  MapRealm,
  MapRiver,
  MapRoad,
  MapLabel,
  MapLayersConfig,
  MapLandform,
  MapVisualTheme,
  RealmGovernmentType,
  RealmDiplomacy
} from '../types';

// Deterministic Mulberry32 PRNG
export class SeededRandom {
  private s: number;

  constructor(seed: number) {
    this.s = seed | 0;
    if (this.s === 0) this.s = 1337;
  }

  // Returns float in [0, 1)
  next(): number {
    this.s |= 0;
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}

// 2D Multi-octave Perlin/Simplex gradient noise approximation
function createNoise2D(rng: SeededRandom) {
  const perm: number[] = [];
  for (let i = 0; i < 256; i++) perm.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = [...perm, ...perm];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  };

  return (x: number, y: number): number => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    const g1 = grad(aa, xf, yf);
    const g2 = grad(ba, xf - 1, yf);
    const g3 = grad(ab, xf, yf - 1);
    const g4 = grad(bb, xf - 1, yf - 1);

    const x1 = lerp(u, g1, g2);
    const x2 = lerp(u, g3, g4);
    return (lerp(v, x1, x2) + 1) / 2; // Normalized to [0, 1]
  };
}

// Arabic Fantasy Lexicon for Procedural Generation
const REALM_NAME_PREFIXES = ['مملكة', 'سلطنة', 'إمارة', 'حلف', 'خلافة', 'دويلة', 'ثغر', 'إمبراطورية'];
const REALM_NAME_SUFFIXES = [
  'الفرات العظمى',
  'الظلال والرمال',
  'قيدار الياقوتية',
  'واحات المشرق',
  'أوريون العتيقة',
  'الصقور الشمالية',
  'الفرسان الحمر',
  'الساحل الفيروزي',
  'جبال النحاس',
  'الوادي الأخضر',
  'عقيق الصحراء',
  'النهر الفضي',
];

const SETTLEMENT_NAME_PARTS = {
  prefixes: ['دار', 'حصن', 'بئر', 'ميناء', 'قلعة', 'واحة', 'مدينة', 'ثغر', 'برج', 'معبد', 'مغارة', 'ممر'],
  roots: [
    'الفيروز',
    'الشهاب',
    'المراد',
    'الياقوت',
    'السدرة',
    'النور',
    'إرم',
    'القمر',
    'النجوم',
    'الرمال',
    'المرجان',
    'النخيل',
    'الظفر',
    'الصخر',
    'الذهب',
    'العنبر',
    'النسيم',
    'الرياح',
    'الغروب',
    'البركان',
  ],
};

const GEOGRAPHIC_LABEL_NAMES = {
  seas: ['بحر الظلمات الأكبر', 'خليج المرجان الأزرق', 'بحر اللؤلؤ المفقود', 'مضيق الأمواج الهادرة', 'حوض الفيروز'],
  mountains: ['سلاسل جبال القوقاز الشامخة', 'قمم الصوان العتيقة', 'جبال النار الأزلية', 'سلسلة السحاب البيضاء', 'مرتفعات النسر'],
  deserts: ['صحراء التيه الكبرى', 'كثبان الرمال الحمراء', 'بادية الصمت والسراب', 'قفار العطش العظيمة'],
  regions: ['إقليم السهول الخضراء', 'غابات الأرز الأسطورية', 'حوض الواحات المباركة', 'أراضي الملوك القدامى'],
};

const REALM_COLORS = [
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#0EA5E9', // Sky Blue
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#EAB308', // Gold
  '#14B8A6', // Teal
  '#EC4899', // Pink
];

const REALM_EMBLEMS = ['🦅', '🦁', '⚔️', '🌙', '👑', '☀️', '🐎', '🛡️', '⚡', '🏹'];

const GOVERNMENTS: RealmGovernmentType[] = [
  'مملكة وراثية',
  'سلطنة صحراوية',
  'إمارة بحرية',
  'حلف قبائل',
  'إمبراطورية قديمة',
  'دولة فرسان',
];

const CULTURES = [
  'ثقافة بدوية فروسية تعتمد على الجياد الأصيلة وشعر الفخر',
  'حضارة تجارية بحرية تسير الأساطيل وتجوب موانئ البحار',
  'إمبراطورية عريقة تمجد البناء والعلوم والمكتبات الفلسفية',
  'حلف واحات محصن يسيطر على دروب القوافل والينابيع العذبة',
  'رهبانية جبلية تحرس الممرات وتصنع السيوف الدمشقية المنيعة',
];

const EXPORTS = [
  'خيول عربية أصيلة وعتاد فروسية',
  'حرير دمشقي وبخور وتوابل نادرة',
  'فولاذ دمشقي مقسى وسيوف حربية',
  'لؤلؤ وياقوت بحري وخزف ملون',
  'مخطوطات سحر وأجهزة فلك وزجاج ملون',
  'تمور مباركة وزيوت مكررة ومياه عذبة',
];

export const DEFAULT_LAYERS_CONFIG: MapLayersConfig = {
  showHeightmap: true,
  showRealms: true,
  showSettlements: true,
  showRivers: true,
  showRoads: true,
  showGrid: true,
  showLabels: true,
  showCompass: true,
  showCodexMarkers: true,
  showBorders: true,
  showWeather: true,
  showCoordinates: false,
};

export class FantasyMapGenerator {
  /**
   * Procedural Name Generator accessible to callers
   */
  public static generateRandomName(
    category: 'settlement' | 'realm' | 'river' | 'sea' | 'mountain' = 'settlement'
  ): string {
    const rng = new SeededRandom(Date.now() + Math.floor(Math.random() * 100000));
    if (category === 'realm') {
      const p = rng.choice(REALM_NAME_PREFIXES);
      const s = rng.choice(REALM_NAME_SUFFIXES);
      return `${p} ${s}`;
    }
    if (category === 'river') {
      return `نهر ${rng.choice(SETTLEMENT_NAME_PARTS.roots)}`;
    }
    if (category === 'sea') {
      return rng.choice(GEOGRAPHIC_LABEL_NAMES.seas);
    }
    if (category === 'mountain') {
      return rng.choice(GEOGRAPHIC_LABEL_NAMES.mountains);
    }
    // Settlement
    const pref = rng.choice(SETTLEMENT_NAME_PARTS.prefixes);
    const root = rng.choice(SETTLEMENT_NAME_PARTS.roots);
    return `${pref} ${root}`;
  }

  /**
   * Generates a complete procedural fantasy world map (Azgaar-inspired)
   */
  public static generateWorld(
    seed: number = Math.floor(Math.random() * 999999),
    landform: MapLandform = 'single_continent',
    width: number = 54,
    height: number = 36,
    theme: MapVisualTheme = 'parchment'
  ): FantasyWorldMap {
    const rng = new SeededRandom(seed);
    const noiseElevation = createNoise2D(rng);
    const noiseMoisture = createNoise2D(new SeededRandom(seed + 404));
    const noiseTectonic = createNoise2D(new SeededRandom(seed + 808));

    // 1. Generate Heightmap & Biome Grid
    const grid: TerrainBiome[][] = [];
    const elevationGrid: number[][] = [];

    for (let y = 0; y < height; y++) {
      const row: TerrainBiome[] = [];
      const elevRow: number[] = [];
      const ny = y / height;

      for (let x = 0; x < width; x++) {
        const nx = x / width;

        // Base Landform Shaping
        let mask = 1;
        const dx = nx - 0.5;
        const dy = ny - 0.5;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy) * 2;

        switch (landform) {
          case 'single_continent':
            // Centered landmass tapering off towards the map borders
            mask = Math.max(0, 1 - Math.pow(distFromCenter, 1.45));
            break;

          case 'pangaea':
            // Gigantic supercontinent filling most of the map
            mask = Math.max(0, 1.15 - Math.pow(distFromCenter, 1.9));
            break;

          case 'twin_continents': {
            // Two major continental landmasses with an ocean strait
            const dLeft = Math.sqrt(Math.pow(nx - 0.28, 2) + Math.pow(ny - 0.5, 2)) * 2;
            const dRight = Math.sqrt(Math.pow(nx - 0.72, 2) + Math.pow(ny - 0.5, 2)) * 2;
            mask = Math.max(0, 1 - Math.min(dLeft, dRight) * 1.35);
            break;
          }

          case 'archipelago': {
            // Island archipelago clusters
            const clusters = Math.sin(nx * 9) * Math.cos(ny * 9);
            mask = 0.52 + 0.48 * clusters;
            mask *= Math.max(0, 1 - distFromCenter * 0.75);
            break;
          }

          case 'islands_ring': {
            // Ring of volcanic islands around a central inland sea
            const ringDist = Math.abs(distFromCenter - 0.6);
            mask = Math.max(0, 1 - ringDist * 2.8);
            // Center island caldera
            if (distFromCenter < 0.2) mask = Math.max(mask, 0.75);
            break;
          }

          case 'mediterranean': {
            // Ring of continents enclosing an inland sea
            const inlandSeaRadius = Math.abs(distFromCenter - 0.58);
            mask = Math.max(0, 1 - inlandSeaRadius * 1.85);
            break;
          }

          case 'shattered_coasts': {
            // Deep fjords, rugged peninsulas, and inlets
            const coastFractal = Math.sin(nx * 14 + ny * 8) * 0.35;
            mask = Math.max(0, 1 - Math.pow(distFromCenter, 1.3) + coastFractal);
            break;
          }

          case 'oasis_desert':
            // Broad continent with high arid baseline
            mask = Math.max(0, 1.1 - Math.pow(distFromCenter, 1.5));
            break;

          default:
            mask = Math.max(0, 1 - Math.pow(distFromCenter, 1.45));
            break;
        }

        // Multi-frequency noise octaves for realistic geography
        const e1 = noiseElevation(nx * 3.2, ny * 3.2);
        const e2 = 0.5 * noiseElevation(nx * 6.8, ny * 6.8);
        const e3 = 0.25 * noiseElevation(nx * 13.5, ny * 13.5);
        const e4 = 0.125 * noiseElevation(nx * 27.0, ny * 27.0);
        const rawElevation = (e1 + e2 + e3 + e4) / 1.875;

        // Tectonic mountain ridge simulation
        const ridge = Math.abs(noiseTectonic(nx * 4.5, ny * 4.5) - 0.5) * 2;
        const mountainRidge = 1 - ridge; // Peak along tectonic seam

        // Combined shaped elevation
        let elevation = rawElevation * 0.55 + mask * 0.4 + (mountainRidge > 0.75 ? 0.25 : 0);

        // Moisture noise
        const m1 = noiseMoisture(nx * 3.8, ny * 3.8);
        let moisture = m1 * 0.75 + (1 - Math.abs(ny - 0.5)) * 0.25;

        // Oasis Desert override
        if (landform === 'oasis_desert') {
          moisture *= 0.45; // significantly drier
        }

        elevRow.push(elevation);

        // Assign Biome based on Elevation & Moisture
        let biome: TerrainBiome = 'deep_ocean';

        if (elevation < 0.30) {
          biome = 'deep_ocean';
        } else if (elevation < 0.39) {
          biome = 'coastal_water';
        } else if (elevation < 0.43) {
          biome = 'beach';
        } else if (elevation >= 0.90) {
          biome = 'snow_mountains';
        } else if (elevation >= 0.78) {
          // Chance of volcano in mountain chains
          if (rng.next() < 0.05 && elevation >= 0.84) {
            biome = 'volcano';
          } else {
            biome = 'mountains';
          }
        } else if (elevation >= 0.65) {
          biome = 'hills';
        } else {
          // Lowland & Plains: determine by moisture, latitude, and depressions
          // Check for inland freshwater lake in deep land depressions
          if (elevation > 0.45 && elevation < 0.48 && moisture > 0.65 && mask > 0.6) {
            biome = 'lake';
          } else if (ny < 0.14 || ny > 0.86) {
            biome = 'tundra';
          } else if (moisture < 0.32) {
            biome = 'desert';
          } else if (moisture > 0.66 && elevation < 0.52) {
            biome = 'swamp';
          } else if (moisture > 0.46) {
            biome = 'forest';
          } else {
            biome = 'grassland';
          }
        }

        row.push(biome);
      }
      grid.push(row);
      elevationGrid.push(elevRow);
    }

    // 2. Generate Political Realms & Diplomatic Relations
    const numRealms = rng.choice([3, 4, 5, 6]);
    const realms: MapRealm[] = [];

    for (let i = 0; i < numRealms; i++) {
      const p = REALM_NAME_PREFIXES[i % REALM_NAME_PREFIXES.length];
      const s = REALM_NAME_SUFFIXES[i % REALM_NAME_SUFFIXES.length];
      const rName = `${p} ${s}`;

      realms.push({
        id: `realm-${i + 1}`,
        name: rName,
        color: REALM_COLORS[i % REALM_COLORS.length],
        emblem: REALM_EMBLEMS[i % REALM_EMBLEMS.length],
        ruler: ['الملك الغازي', 'السلطان المنصور', 'الحاكم العادل', 'الخليفة المظفر', 'الأمير الفاتح', 'صاحب التاج'][i % 6],
        governmentType: GOVERNMENTS[i % GOVERNMENTS.length],
        culture: CULTURES[i % CULTURES.length],
        primaryExport: EXPORTS[i % EXPORTS.length],
        description: `إقليم خصب وذو تاريخ عريق يسيطر على أهم الطرق والواحات في عالم الرواية.`,
        diplomacy: [],
      });
    }

    // Generate Diplomacy Matrix between Realms
    realms.forEach((r1) => {
      const diploList: RealmDiplomacy[] = [];
      realms.forEach((r2) => {
        if (r1.id !== r2.id) {
          const statuses: ('حلف' | 'حرب' | 'هدنة' | 'حياد')[] = ['حلف', 'حرب', 'هدنة', 'حياد', 'حياد'];
          diploList.push({
            targetRealmId: r2.id,
            targetRealmName: r2.name,
            status: rng.choice(statuses),
          });
        }
      });
      r1.diplomacy = diploList;
    });

    // 3. Generate Settlements (Capitals, Towns, Ports, Oases, Shrines, Caves, Passes)
    const settlements: MapSettlement[] = [];
    const usedNames = new Set<string>();

    const findLandCoord = (preferredBiome?: TerrainBiome, allowCoastsOnly: boolean = false) => {
      for (let attempts = 0; attempts < 120; attempts++) {
        const x = Math.floor(rng.range(3, Math.max(4, width - 3)));
        const y = Math.floor(rng.range(3, Math.max(4, height - 3)));
        const b = grid[y]?.[x];
        if (!b) continue;

        const isWater = b === 'deep_ocean' || b === 'coastal_water';
        if (isWater) continue;

        // If coastal only (for ports)
        if (allowCoastsOnly) {
          const isNearWater =
            grid[y - 1]?.[x] === 'coastal_water' ||
            grid[y + 1]?.[x] === 'coastal_water' ||
            grid[y]?.[x - 1] === 'coastal_water' ||
            grid[y]?.[x + 1] === 'coastal_water';
          if (!isNearWater) continue;
        }

        // Avoid placing settlements too close to each other
        const tooClose = settlements.some((s) => Math.hypot(s.x - x, s.y - y) < 4);
        if (tooClose) continue;

        if (preferredBiome && b === preferredBiome) {
          return { x, y };
        }

        if (b !== 'snow_mountains') {
          return { x, y };
        }
      }
      return { x: Math.floor(width / 2), y: Math.floor(height / 2) };
    };

    // Capitals for each Realm
    realms.forEach((r, idx) => {
      const pos = findLandCoord('grassland');
      const pref = SETTLEMENT_NAME_PARTS.prefixes[idx % SETTLEMENT_NAME_PARTS.prefixes.length];
      const root = SETTLEMENT_NAME_PARTS.roots[idx % SETTLEMENT_NAME_PARTS.roots.length];
      const sName = `دار ${root}`;
      usedNames.add(sName);
      const capId = `settlement-cap-${idx + 1}`;
      r.capitalSettlementId = capId;

      settlements.push({
        id: capId,
        name: sName,
        type: 'capital',
        x: pos.x,
        y: pos.y,
        realmId: r.id,
        population: `${Math.floor(rng.range(50, 150))},000 نسمة`,
        description: `العاصمة الكبرى لـ ${r.name}، محاطة بأسوار حجرية شاهقة وأسواق عامرة وقصر الحكم.`,
        dangerLevel: 'آمن',
        loreNotes: `مركز السلطة والقرار السياسي والعسكري لإقليم ${r.name}.`,
      });
    });

    // Secondary Settlements & Adventure Sites
    const numOther = rng.choice([8, 10, 12, 14]);
    const settlementTypes: MapSettlementType[] = [
      'castle',
      'city',
      'town',
      'port',
      'oasis',
      'temple',
      'tower',
      'ruins',
      'cave',
      'pass',
    ];

    for (let i = 0; i < numOther; i++) {
      const sType = rng.choice(settlementTypes);
      const isPort = sType === 'port';
      const prefBiome = sType === 'oasis' ? 'desert' : sType === 'pass' ? 'hills' : undefined;
      const pos = findLandCoord(prefBiome, isPort);

      const pref = rng.choice(SETTLEMENT_NAME_PARTS.prefixes);
      const root = rng.choice(SETTLEMENT_NAME_PARTS.roots);
      let sName = `${pref} ${root}`;
      if (usedNames.has(sName)) {
        sName = `${sName} الكبرى`;
      }
      usedNames.add(sName);

      const assignedRealm = rng.choice(realms);
      const danger: 'آمن' | 'حذر' | 'شديد الخطورة' =
        sType === 'ruins' || sType === 'cave'
          ? 'شديد الخطورة'
          : sType === 'pass' || sType === 'tower'
          ? 'حذر'
          : 'آمن';

      settlements.push({
        id: `settlement-other-${i + 1}`,
        name: sName,
        type: sType,
        x: pos.x,
        y: pos.y,
        realmId: assignedRealm.id,
        population: sType === 'ruins' || sType === 'cave' ? 'مهجور' : `${Math.floor(rng.range(3, 40))},000 نسمة`,
        description: `موقع استراتيجي ومعلم حيوي في روايتك يربط مسارات السرد وأحداث الشخصيات.`,
        dangerLevel: danger,
        loreNotes: `منطقة ذات أهمية حكائية تحت نفوذ ${assignedRealm.name}.`,
      });
    }

    // 4. Generate Realistic Rivers
    const rivers: MapRiver[] = [];
    const riverCount = rng.choice([4, 5, 6, 7]);
    const riverNames = [
      'نهر الفرات العتيق',
      'نهر الياقوت',
      'وادي الرمال الجاري',
      'نهر الكوثر',
      'رافد الزبرجد',
      'شط الحياة',
      'نهر الغدير الفضي',
    ];

    for (let r = 0; r < riverCount; r++) {
      let startX = -1;
      let startY = -1;

      // Find mountain or hill source
      for (let attempts = 0; attempts < 60; attempts++) {
        const x = Math.floor(rng.range(4, Math.max(5, width - 4)));
        const y = Math.floor(rng.range(4, Math.max(5, height - 4)));
        const cell = grid[y]?.[x];
        if (cell === 'snow_mountains' || cell === 'mountains' || cell === 'hills') {
          startX = x;
          startY = y;
          break;
        }
      }

      if (startX !== -1) {
        const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
        let currX = startX;
        let currY = startY;

        for (let step = 0; step < 16; step++) {
          const dx = rng.choice([-1, 0, 1]);
          const dy = rng.choice([-1, 0, 1]);
          currX = Math.max(1, Math.min(width - 2, currX + dx));
          currY = Math.max(1, Math.min(height - 2, currY + dy));
          points.push({ x: currX, y: currY });

          const cell = grid[currY]?.[currX];
          if (cell === 'coastal_water' || cell === 'deep_ocean' || cell === 'lake') {
            break;
          }
        }

        if (points.length >= 3) {
          rivers.push({
            id: `river-${r + 1}`,
            name: riverNames[r % riverNames.length],
            points,
            width: rng.choice([2, 3]),
          });
        }
      }
    }

    // 5. Generate Trade Roads and Maritime Sea Routes
    const roads: MapRoad[] = [];

    // Land Roads connecting neighboring settlements
    if (settlements.length >= 2) {
      for (let i = 0; i < settlements.length - 1; i++) {
        const s1 = settlements[i];
        let nearest: MapSettlement | null = null;
        let minDist = 999;

        for (let j = i + 1; j < settlements.length; j++) {
          const s2 = settlements[j];
          const d = Math.hypot(s1.x - s2.x, s1.y - s2.y);
          if (d < minDist && d < 18) {
            minDist = d;
            nearest = s2;
          }
        }

        if (nearest) {
          const midX = (s1.x + nearest.x) / 2 + rng.range(-1.2, 1.2);
          const midY = (s1.y + nearest.y) / 2 + rng.range(-1.2, 1.2);

          roads.push({
            id: `road-land-${i + 1}`,
            name: `درب ${s1.name} - ${nearest.name}`,
            type: s1.type === 'capital' || nearest.type === 'capital' ? 'highway' : 'trail',
            points: [
              { x: s1.x, y: s1.y },
              { x: Math.round(midX), y: Math.round(midY) },
              { x: nearest.x, y: nearest.y },
            ],
          });
        }
      }
    }

    // Maritime Sea Routes connecting coastal ports
    const ports = settlements.filter((s) => s.type === 'port');
    if (ports.length >= 2) {
      for (let pIdx = 0; pIdx < ports.length - 1; pIdx++) {
        const p1 = ports[pIdx];
        const p2 = ports[pIdx + 1];
        roads.push({
          id: `road-sea-${pIdx + 1}`,
          name: `المسار البحري: ${p1.name} ⇆ ${p2.name}`,
          type: 'sea_route',
          points: [
            { x: p1.x, y: p1.y },
            { x: Math.round((p1.x + p2.x) / 2), y: Math.round((p1.y + p2.y) / 2) },
            { x: p2.x, y: p2.y },
          ],
        });
      }
    }

    // 6. Geographic Calligraphy Labels
    const labels: MapLabel[] = [
      {
        id: 'label-sea-1',
        text: rng.choice(GEOGRAPHIC_LABEL_NAMES.seas),
        x: Math.floor(width * 0.18),
        y: Math.floor(height * 0.82),
        size: 16,
        type: 'sea',
        rotation: -6,
      },
      {
        id: 'label-mountain-1',
        text: rng.choice(GEOGRAPHIC_LABEL_NAMES.mountains),
        x: Math.floor(width * 0.52),
        y: Math.floor(height * 0.28),
        size: 14,
        type: 'mountain',
        rotation: 3,
      },
      {
        id: 'label-desert-1',
        text: rng.choice(GEOGRAPHIC_LABEL_NAMES.deserts),
        x: Math.floor(width * 0.72),
        y: Math.floor(height * 0.65),
        size: 15,
        type: 'region',
        rotation: 0,
      },
    ];

    // Realms labels
    realms.forEach((r, idx) => {
      const cap = settlements.find((s) => s.id === r.capitalSettlementId);
      if (cap) {
        labels.push({
          id: `label-realm-${idx + 1}`,
          text: r.name,
          x: cap.x,
          y: Math.max(1, cap.y - 2),
          size: 13,
          type: 'realm',
          rotation: 0,
        });
      }
    });

    const seasons: ('ربيع' | 'صيف' | 'خريف' | 'شتاء')[] = ['ربيع', 'صيف', 'خريف', 'شتاء'];
    const winds = [
      'رياح شمالية شرقية رطبة تهب من بحر الظلمات',
      'رياح السموم الجنوبية الحارة تهب عبر البادية',
      'رياح موسمية غربية تجلب الأمطار على السلاسل الجبلية',
    ];

    return {
      id: `map-${Date.now()}`,
      name: 'خريطة عالم الرواية الأكبر',
      description: 'خريطة جغرافية وسياسية تفصيلية تظهر تضاريس عالم الرواية، الممالك، والمعالم الاستراتيجية.',
      seed,
      width,
      height,
      theme,
      landform,
      terrainGrid: grid,
      realms,
      settlements,
      rivers,
      roads,
      labels,
      layersConfig: { ...DEFAULT_LAYERS_CONFIG },
      scaleKmPerUnit: 25, // 25 km per cell unit
      season: rng.choice(seasons),
      prevailingWinds: rng.choice(winds),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  }
}
