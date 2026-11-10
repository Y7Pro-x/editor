export interface ProseIssueResult {
  weakWordCount: number;
  passiveCount: number;
  repetitionCount: number;
  fillerCount: number;
  totalIssues: number;
  details: {
    weakMatches: string[];
    passiveMatches: string[];
    repetitionMatches: string[];
    fillerMatches: string[];
  };
}

export class ArabicProseAnalyzer {
  public static readonly WEAK_WORDS: string[] = [
    'جدا',
    'كثيرا',
    'قليلا',
    'ربما',
    'يمكن',
    'أيضا',
    'كذلك',
    'بالتأكيد',
    'في الحقيقة',
    'من الواضح',
  ];

  public static readonly FILLER_WORDS: string[] = [
    'يعني',
    'بصراحة',
    'في الواقع',
    'حرفيا',
    'فعلا',
    'طبعا',
  ];

  // Passive voice patterns: تم + verb, جرى + verb, وقع + verb, حُصِلَ, عُمِلَ, كُتِبَ, قِيلَ
  private static readonly PASSIVE_REGEX = /(?:\bتم\s+[\u0600-\u06FF]+|\bجرى\s+[\u0600-\u06FF]+|\bوقع\s+[\u0600-\u06FF]+|\bحُصِلَ|\bعُمِلَ|\bكُتِبَ|\bقِيلَ)/gi;

  // Repeated consecutive Arabic words: e.g. "في في" or "قال قال"
  private static readonly REPEATED_WORDS_REGEX = /\b([\u0600-\u06FF]+)\s+\1\b/gi;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  public analyzeDebounced(
    text: string,
    callback: (result: ProseIssueResult) => void,
    delayMs = 2000
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const res = this.analyzeText(text);
      callback(res);
    }, delayMs);
  }

  public cancelDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  public analyzeText(text: string): ProseIssueResult {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        weakWordCount: 0,
        passiveCount: 0,
        repetitionCount: 0,
        fillerCount: 0,
        totalIssues: 0,
        details: {
          weakMatches: [],
          passiveMatches: [],
          repetitionMatches: [],
          fillerMatches: [],
        },
      };
    }

    // 1. Weak words
    const weakMatches: string[] = [];
    for (const word of ArabicProseAnalyzer.WEAK_WORDS) {
      const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'gu');
      const matches = trimmed.match(regex);
      if (matches) {
        weakMatches.push(...matches);
      }
    }

    // 2. Filler words
    const fillerMatches: string[] = [];
    for (const word of ArabicProseAnalyzer.FILLER_WORDS) {
      const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'gu');
      const matches = trimmed.match(regex);
      if (matches) {
        fillerMatches.push(...matches);
      }
    }

    // 3. Passive voice
    const passiveMatches = trimmed.match(ArabicProseAnalyzer.PASSIVE_REGEX) || [];

    // 4. Repetitions
    const repetitionMatches = trimmed.match(ArabicProseAnalyzer.REPEATED_WORDS_REGEX) || [];

    const totalIssues =
      weakMatches.length +
      passiveMatches.length +
      repetitionMatches.length +
      fillerMatches.length;

    return {
      weakWordCount: weakMatches.length,
      passiveCount: passiveMatches.length,
      repetitionCount: repetitionMatches.length,
      fillerCount: fillerMatches.length,
      totalIssues,
      details: {
        weakMatches,
        passiveMatches,
        repetitionMatches,
        fillerMatches,
      },
    };
  }

  public static countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    // Split by whitespace
    const words = trimmed.split(/\s+/);
    return words.filter((w) => w.length > 0).length;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
