/**
 * Arabic Spell Checker & Typographical Rules Engine
 * 100% offline, local-first rule and dictionary matching.
 * Handles common hamza errors, yaa/alif maqsura, taa marbuta/haa,
 * common grammatical typos (انشاء الله, لكن/لاكن), and punctuation attachment.
 */

export interface SpellCheckIssue {
  id: string;
  word: string;
  suggestion: string;
  category: 'hamza' | 'taa_marbuta' | 'yaa' | 'common_typo' | 'punctuation' | 'grammar';
  explanation: string;
  startIndex?: number;
  endIndex?: number;
}

export class ArabicSpellChecker {
  // Common specific typos with definitive replacements
  public static readonly COMMON_TYPO_MAP: Record<string, { suggestion: string; explanation: string; category: SpellCheckIssue['category'] }> = {
    'انشاء الله': { suggestion: 'إن شاء الله', explanation: 'تكتب "إن شاء الله" مفصولة للدلالة على المشيئة، بينما "إنشاء" تعني البناء أو التأسيس', category: 'common_typo' },
    'انشالله': { suggestion: 'إن شاء الله', explanation: 'الصواب كتابتها "إن شاء الله" مفصولة', category: 'common_typo' },
    'لاكن': { suggestion: 'لكن', explanation: 'تكتب "لكن" بدون ألف بعد اللام', category: 'common_typo' },
    'لاكنها': { suggestion: 'لكنها', explanation: 'تكتب "لكنها" بدون ألف بعد اللام', category: 'common_typo' },
    'لاكنهم': { suggestion: 'لكنهم', explanation: 'تكتب "لكنهم" بدون ألف بعد اللام', category: 'common_typo' },
    'هائلء': { suggestion: 'هؤلاء', explanation: 'كتابة غير صحيحة، الصواب: هؤلاء', category: 'common_typo' },
    'هأولاء': { suggestion: 'هؤلاء', explanation: 'الصواب: هؤلاء (بدون ألف بعد الهاء)', category: 'common_typo' },
    'ذالك': { suggestion: 'ذلك', explanation: 'تكتب "ذلك" بحذف الألف رسماً', category: 'common_typo' },
    'هاذا': { suggestion: 'هذا', explanation: 'تكتب "هذا" بحذف الألف رسماً', category: 'common_typo' },
    'هاذه': { suggestion: 'هذه', explanation: 'تكتب "هذه" بحذف الألف رسماً', category: 'common_typo' },
    'هاذان': { suggestion: 'هذان', explanation: 'تكتب "هذان" بحذف الألف رسماً', category: 'common_typo' },
    'هاؤلاء': { suggestion: 'هؤلاء', explanation: 'تكتب "هؤلاء" بحذف الألف رسماً', category: 'common_typo' },
    'اللة': { suggestion: 'الله', explanation: 'لفظ الجلالة يكتب بالهاء وليس بالتاء المربوطة', category: 'taa_marbuta' },
    'إذن': { suggestion: 'إذاً / إذن', explanation: 'يجوز كتابتها "إذاً" أو "إذن"، والأولى تنوين إذا لم تنصب مضارعاً', category: 'grammar' },
    'رجائا': { suggestion: 'رجاءً', explanation: 'الاسم المنتهي بهمزة مسبوقة بألف لا تزاد بعده ألف تنوين (رجاءً)', category: 'hamza' },
    'مسائا': { suggestion: 'مساءً', explanation: 'الهمزة المسبوقة بألف لا يوضع بعدها ألف تنوين (مساءً)', category: 'hamza' },
    'صباحا': { suggestion: 'صباحاً', explanation: 'تنوين الفتح يوضع على الحرف أو الألف (صباحاً)', category: 'grammar' },
    'شئ': { suggestion: 'شيء', explanation: 'تكتب الهمزة المتطرفة على السطر بعد الياء الساكنة: شيء', category: 'hamza' },
    'دفئ': { suggestion: 'دفء', explanation: 'تكتب الهمزة المتطرفة على السطر بعد الساكن: دفء', category: 'hamza' },
    'بدئ': { suggestion: 'بدء', explanation: 'تكتب الهمزة المتطرفة على السطر بعد الساكن: بدء', category: 'hamza' },
    'بطئ': { suggestion: 'بطيء', explanation: 'تكتب: بطيء (ياء ثم همزة على السطر)', category: 'hamza' },
    'مفاجئ': { suggestion: 'مفاجئ', explanation: 'تكتب على نبرة مكسور ما قبلها', category: 'hamza' },
    'أمرء': { suggestion: 'امرؤ', explanation: 'تكتب: امرؤ (همزة وصل في البداية وعلى الواو في حالة الرفع)', category: 'hamza' },
    'امرء': { suggestion: 'امرؤ', explanation: 'تكتب: امرؤ أو امرأ بحسب الموقع الإعرابي', category: 'hamza' },
    'مسؤل': { suggestion: 'مسؤول', explanation: 'الرسم القياسي الأرجح: مسؤول (على واو)', category: 'hamza' },
    'شؤن': { suggestion: 'شؤون', explanation: 'الرسم الشائع: شؤون', category: 'hamza' },
    'مأذنة': { suggestion: 'مئذنة', explanation: 'الصواب مئذنة (على نبرة لأن ما قبلها مكسور)', category: 'hamza' },
    'رأيس': { suggestion: 'رئيس', explanation: 'الصواب رئيس (على نبرة لأنها مكسورة)', category: 'hamza' },
    'يؤوس': { suggestion: 'يئوس / يائس', explanation: 'الراجح يئوس أو يائس', category: 'hamza' },
    'خطئا': { suggestion: 'خطأً', explanation: 'الصواب خطأً (تنوين على الألف المهموزة)', category: 'hamza' },
    'جذء': { suggestion: 'جزء', explanation: 'تكتب: جزء (الزاي منفصلة والهمزة على السطر)', category: 'hamza' },
    'شاطيء': { suggestion: 'شاطئ', explanation: 'تكتب الهمزة المتطرفة على ياء غير منقوطة: شاطئ', category: 'hamza' },
    'بادئ ذي بدئ': { suggestion: 'بادئ ذي بدء', explanation: 'تكتب: بدء', category: 'hamza' },
    'علي': { suggestion: 'على', explanation: 'حرف الجر يكتب بألف مقصورة "على" وليس ياء "علي" إلا إذا كان اسم شخص (عَليّ)', category: 'yaa' },
    'حتي': { suggestion: 'حتى', explanation: 'تكتب بالألف المقصورة: حتى', category: 'yaa' },
    'الي': { suggestion: 'إلى', explanation: 'حرف الجر "إلى" يبدأ بهمزة قطع مكسورة وينتهي بألف مقصورة', category: 'hamza' },
    'اذا': { suggestion: 'إذا', explanation: 'اسم الشرط والظرف يكتب بهمزة قطع مكسورة: إذا', category: 'hamza' },
    'او': { suggestion: 'أو', explanation: 'حرف العطف يكتب بهمزة قطع مفتوحة: أو', category: 'hamza' },
    'ام': { suggestion: 'أم', explanation: 'حرف العطف يكتب بهمزة قطع مفتوحة: أم', category: 'hamza' },
    'ان': { suggestion: 'أن / إن', explanation: 'الحروف الناسخة وحروف النصب والشرط تكتب بهمزة قطع: أن أو إن', category: 'hamza' },
    'انما': { suggestion: 'إنما / أنما', explanation: 'تكتب بهمزة قطع: إنما أو أنما', category: 'hamza' },
    'ايضا': { suggestion: 'أيضاً', explanation: 'تكتب بهمزة قطع مفتوحة وتنوين: أيضاً', category: 'hamza' },
    'انت': { suggestion: 'أنتَ / أنتِ', explanation: 'ضمائر المخاطب تبدأ بهمزة قطع: أنت', category: 'hamza' },
    'انتم': { suggestion: 'أنتم', explanation: 'تكتب بهمزة قطع: أنتم', category: 'hamza' },
    'انا': { suggestion: 'أنا', explanation: 'ضمير المتكلم يكتب بهمزة قطع: أنا', category: 'hamza' },
    'اكثر': { suggestion: 'أكثر', explanation: 'اسم التفضيل على وزن أفعل يكتب بهمزة قطع: أكثر', category: 'hamza' },
    'اكبر': { suggestion: 'أكبر', explanation: 'اسم التفضيل على وزن أفعل يكتب بهمزة قطع: أكبر', category: 'hamza' },
    'اصغر': { suggestion: 'أصغر', explanation: 'اسم التفضيل على وزن أفعل يكتب بهمزة قطع: أصغر', category: 'hamza' },
    'افضل': { suggestion: 'أفضل', explanation: 'اسم التفضيل على وزن أفعل يكتب بهمزة قطع: أفضل', category: 'hamza' },
    'اقل': { suggestion: 'أقل', explanation: 'اسم التفضيل على وزن أفعل يكتب بهمزة قطع: أقل', category: 'hamza' },
    'اجمل': { suggestion: 'أجمل', explanation: 'اسم التفضيل على وزن أفعل يكتب بهمزة قطع: أجمل', category: 'hamza' },
    'اول': { suggestion: 'أول', explanation: 'تكتب بهمزة قطع: أول', category: 'hamza' },
    'اخر': { suggestion: 'آخر / أخر', explanation: 'تكتب بهمزة مد: آخر أو همزة قطع: أخر', category: 'hamza' },
    'اثناء': { suggestion: 'أثناء', explanation: 'تكتب بهمزة قطع: أثناء', category: 'hamza' },
    'اراد': { suggestion: 'أراد', explanation: 'ماضي الفعل الرباعي يكتب بهمزة قطع: أراد', category: 'hamza' },
    'اعطى': { suggestion: 'أعطى', explanation: 'ماضي الرباعي يكتب بهمزة قطع: أعطى', category: 'hamza' },
    'اعلن': { suggestion: 'أعلن', explanation: 'ماضي الرباعي يكتب بهمزة قطع: أعلن', category: 'hamza' },
    'ارسل': { suggestion: 'أرسل', explanation: 'ماضي الرباعي يكتب بهمزة قطع: أرسل', category: 'hamza' },
    'اخذ': { suggestion: 'أخذ', explanation: 'ماضي الثلاثي المهموز يكتب بهمزة قطع: أخذ', category: 'hamza' },
    'اكل': { suggestion: 'أكل', explanation: 'ماضي الثلاثي المهموز يكتب بهمزة قطع: أكل', category: 'hamza' },
    'امر': { suggestion: 'أمر', explanation: 'ماضي الثلاثي المهموز يكتب بهمزة قطع: أمر', category: 'hamza' },
    'مائة': { suggestion: 'مئة / مائة', explanation: 'كلاهما جائز، وكتابتها "مئة" أوفق للقواعد الإملائية الحديثة', category: 'hamza' },
    'مسؤلية': { suggestion: 'مسؤولية', explanation: 'الرسم الأرجح: مسؤولية', category: 'hamza' },
    'فترة': { suggestion: 'فترة', explanation: 'تكتب بالتاء المربوطة "فترة" وليس الهاء "فتره"', category: 'taa_marbuta' },
    'لحضة': { suggestion: 'لحظة', explanation: 'تكتب بالظاء المشالة والتاء المربوطة: لحظة', category: 'common_typo' },
    'ضلام': { suggestion: 'ظلام', explanation: 'تكتب بالظاء: ظلام', category: 'common_typo' },
    'ضبي': { suggestion: 'ظبي', explanation: 'تكتب بالظاء: ظبي', category: 'common_typo' },
    'يضهر': { suggestion: 'يظهر', explanation: 'تكتب بالظاء: يظهر', category: 'common_typo' },
    'ضهر': { suggestion: 'ظهر', explanation: 'تكتب بالظاء: ظهر', category: 'common_typo' },
  };

  /**
   * Words that end with haa 'ه' mistakenly written as taa marbuta 'ة'
   */
  private static readonly HAA_MISTAKES = new Set([
    'وجهة', // when meaning face: وجه
    'مياة', // مياه
    'إتجاة', // اتجاه
    'تجاة', // تجاه
    'شبية', // شبيه
    'فواكة', // فواكه
  ]);

  /**
   * Check text for Arabic spelling and typographical rules
   */
  public static check(text: string): SpellCheckIssue[] {
    if (!text || text.trim().length === 0) return [];

    const issues: SpellCheckIssue[] = [];
    const seenMap = new Set<string>();

    // 1. Multi-word phrases check (e.g. "انشاء الله", "بادئ ذي بدئ")
    for (const [phrase, info] of Object.entries(ArabicSpellChecker.COMMON_TYPO_MAP)) {
      if (phrase.includes(' ')) {
        const regex = new RegExp(`(?<=^|\\s|[«"،؛.!?])${phrase}(?=[»"،؛.!?]|\\s|$)`, 'gu');
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
          const key = `${match.index}-${phrase}`;
          if (!seenMap.has(key)) {
            seenMap.add(key);
            issues.push({
              id: `spell-${match.index}-${phrase}`,
              word: phrase,
              suggestion: info.suggestion,
              category: info.category,
              explanation: info.explanation,
              startIndex: match.index,
              endIndex: match.index + phrase.length,
            });
          }
        }
      }
    }

    // 2. Tokenize words with position
    const wordRegex = /[\u0600-\u06FF]+/gu;
    let wordMatch: RegExpExecArray | null;

    while ((wordMatch = wordRegex.exec(text)) !== null) {
      const rawWord = wordMatch[0];
      const startIndex = wordMatch.index;
      const endIndex = startIndex + rawWord.length;

      // Clean diacritics for dictionary lookup
      const cleanWord = rawWord.replace(/[\u064B-\u065F\u0670]/g, '');

      // Check common typos map
      if (ArabicSpellChecker.COMMON_TYPO_MAP[cleanWord]) {
        const info = ArabicSpellChecker.COMMON_TYPO_MAP[cleanWord];
        const key = `${startIndex}-${cleanWord}`;
        if (!seenMap.has(key)) {
          seenMap.add(key);
          issues.push({
            id: `spell-${startIndex}-${cleanWord}`,
            word: rawWord,
            suggestion: info.suggestion,
            category: info.category,
            explanation: info.explanation,
            startIndex,
            endIndex,
          });
        }
        continue;
      }

      // Check wrong haa instead of taa marbuta at end of common feminine nouns
      // E.g. "مدينه", "قريه", "روايه", "حياه", "شجره" (if word > 3 letters and ends with ه)
      if (
        cleanWord.length >= 4 &&
        cleanWord.endsWith('ه') &&
        !cleanWord.endsWith('الله') &&
        !['هذه', 'عنه', 'منه', 'فيه', 'إليه', 'عليه', 'معه', 'شبه', 'وجه', 'مياه', 'فواكه', 'تجاه', 'جنيه', 'منبه'].includes(cleanWord)
      ) {
        // High confidence check: words like "روايه", "مدينه", "قصيده", "فتره", "حبيبه", "غرفه"
        if (/[\u0600-\u06FF]{2}(?:ي|ا|و|د|ر|ز|س|ش|ص|ض|ط|ع|غ|ف|ق|ك|ل|م|ن)ه$/u.test(cleanWord)) {
          // If followed by feminine pattern
          const suggestion = cleanWord.slice(0, -1) + 'ة';
          const key = `${startIndex}-${cleanWord}`;
          if (!seenMap.has(key)) {
            seenMap.add(key);
            issues.push({
              id: `spell-${startIndex}-${cleanWord}`,
              word: rawWord,
              suggestion,
              category: 'taa_marbuta',
              explanation: `قد تكون الكلمة منتهية بتاء مربوطة "ة" وليست هاء "ه": ${suggestion}`,
              startIndex,
              endIndex,
            });
          }
        }
      }

      // Check wrong taa marbuta where haa is required
      if (ArabicSpellChecker.HAA_MISTAKES.has(cleanWord)) {
        const suggestion = cleanWord.slice(0, -1) + 'ه';
        const key = `${startIndex}-${cleanWord}`;
        if (!seenMap.has(key)) {
          seenMap.add(key);
          issues.push({
            id: `spell-${startIndex}-${cleanWord}`,
            word: rawWord,
            suggestion,
            category: 'taa_marbuta',
            explanation: `هذه الكلمة تنتهي بهاء أصلية "ه" وليس بتاء مربوطة: ${suggestion}`,
            startIndex,
            endIndex,
          });
        }
      }
    }

    // 3. Typographical punctuation rules:
    // Punctuation should be attached to preceding word without space, e.g. "قال ،" -> "قال،"
    const punctuationSpaceRegex = /([\u0600-\u06FF]+)\s+([،؛؟.!])/gu;
    let punctMatch: RegExpExecArray | null;
    while ((punctMatch = punctuationSpaceRegex.exec(text)) !== null) {
      const fullMatch = punctMatch[0];
      const wordPart = punctMatch[1];
      const mark = punctMatch[2];
      const start = punctMatch.index;
      const key = `${start}-${fullMatch}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        issues.push({
          id: `spell-punct-${start}`,
          word: fullMatch,
          suggestion: `${wordPart}${mark}`,
          category: 'punctuation',
          explanation: 'في قواعد الطباعة العربية تلتصق علامة الترقيم بالكلمة التي تسبقها مباشرة بدون فراغ',
          startIndex: start,
          endIndex: start + fullMatch.length,
        });
      }
    }

    return issues;
  }
}
