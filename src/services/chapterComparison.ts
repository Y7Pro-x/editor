import { Chapter, ChapterStatus } from '../types';

export interface ChapterComparisonResult {
  chapterA: Chapter;
  chapterB: Chapter;
  wordCountA: number;
  wordCountB: number;
  wordDiff: number; // chapterB - chapterA
  absoluteWordDiff: number;
  wordRatioA: number; // 0 to 100
  wordRatioB: number; // 0 to 100
  percentageGrowth: number; // Percentage growth from A to B
  shareOfNovelA: number;
  shareOfNovelB: number;
  statusA: ChapterStatus;
  statusB: ChapterStatus;
  progressPercentA: number; // 25, 50, 75, 100
  progressPercentB: number;
  progressDiff: number;
  readingTimeMinutesA: number;
  readingTimeMinutesB: number;
  readingTimeDiffMinutes: number;
  paragraphsA: number;
  paragraphsB: number;
  avgWordsPerParagraphA: number;
  avgWordsPerParagraphB: number;
  notesCountA: number;
  notesCountB: number;
  characterCountA: number;
  characterCountB: number;
  pacingSummary: string;
  statusSummary: string;
}

export const STATUS_PROGRESS_MAP: Record<ChapterStatus, number> = {
  فكرة: 25,
  مسودة: 50,
  مراجعة: 75,
  مكتمل: 100,
};

export const STATUS_ORDER: ChapterStatus[] = ['فكرة', 'مسودة', 'مراجعة', 'مكتمل'];

export const getStatusProgress = (status: ChapterStatus): number => {
  return STATUS_PROGRESS_MAP[status] || 25;
};

export const estimateReadingTimeMinutes = (words: number, wordsPerMinute: number = 200): number => {
  if (words <= 0) return 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const countParagraphs = (content: string | undefined): number => {
  if (!content) return 0;
  // Strip HTML tags if any, split by double newlines or single newlines with content
  const clean = content.replace(/<[^>]+>/g, '\n');
  const paragraphs = clean
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return paragraphs.length;
};

export const countCharactersExcludingSpaces = (content: string | undefined): number => {
  if (!content) return 0;
  const clean = content.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  return clean.length;
};

export const compareChapters = (
  chapterA: Chapter,
  chapterB: Chapter,
  totalNovelWords: number = 0
): ChapterComparisonResult => {
  const wordsA = Math.max(0, chapterA.wordCount || 0);
  const wordsB = Math.max(0, chapterB.wordCount || 0);
  const wordDiff = wordsB - wordsA;
  const absoluteWordDiff = Math.abs(wordDiff);

  const combinedWords = wordsA + wordsB;
  const wordRatioA = combinedWords > 0 ? Math.round((wordsA / combinedWords) * 100) : 50;
  const wordRatioB = combinedWords > 0 ? 100 - wordRatioA : 50;

  const percentageGrowth =
    wordsA > 0 ? Math.round(((wordsB - wordsA) / wordsA) * 100) : wordsB > 0 ? 100 : 0;

  const novelTotal = totalNovelWords > 0 ? totalNovelWords : combinedWords;
  const shareOfNovelA = novelTotal > 0 ? Math.round((wordsA / novelTotal) * 100) : 0;
  const shareOfNovelB = novelTotal > 0 ? Math.round((wordsB / novelTotal) * 100) : 0;

  const progressPercentA = getStatusProgress(chapterA.status);
  const progressPercentB = getStatusProgress(chapterB.status);
  const progressDiff = progressPercentB - progressPercentA;

  const readingTimeMinutesA = estimateReadingTimeMinutes(wordsA);
  const readingTimeMinutesB = estimateReadingTimeMinutes(wordsB);
  const readingTimeDiffMinutes = readingTimeMinutesB - readingTimeMinutesA;

  const paragraphsA = countParagraphs(chapterA.documentJson);
  const paragraphsB = countParagraphs(chapterB.documentJson);

  const avgWordsPerParagraphA =
    paragraphsA > 0 ? Math.round(wordsA / paragraphsA) : wordsA;
  const avgWordsPerParagraphB =
    paragraphsB > 0 ? Math.round(wordsB / paragraphsB) : wordsB;

  const notesCountA = chapterA.notes?.length || 0;
  const notesCountB = chapterB.notes?.length || 0;

  const characterCountA = countCharactersExcludingSpaces(chapterA.documentJson);
  const characterCountB = countCharactersExcludingSpaces(chapterB.documentJson);

  // Pacing Summary in Arabic
  let pacingSummary = '';
  if (absoluteWordDiff === 0) {
    pacingSummary = 'الفصلان متطابقان تماماً في عدد الكلمات ومتقاربان في وتيرة السرد.';
  } else if (absoluteWordDiff < 100) {
    pacingSummary = 'طول الفصلين متقارب جداً مع توازن ممتاز في التدفق الروائي.';
  } else if (wordDiff > 0) {
    pacingSummary = `الفصل الثاني أطول بمقدار ${absoluteWordDiff} كلمة (${percentageGrowth}% زيادة)، مما يعكس كثافة سردية أو حوارية أكبر.`;
  } else {
    pacingSummary = `الفصل الأول أطول بمقدار ${absoluteWordDiff} كلمة (${Math.abs(percentageGrowth)}% زيادة)، بينما الفصل الثاني أكثر إيجازاً وتركيزاً.`;
  }

  // Status Summary in Arabic
  let statusSummary = '';
  if (progressDiff === 0) {
    statusSummary = `كلا الفصلين في نفس مرحلة الإنجاز (${chapterA.status}).`;
  } else if (progressDiff > 0) {
    statusSummary = `الفصل الثاني أكثر تقدماً بمرحلة (${chapterB.status} بنسبة ${progressPercentB}%) مقارنة بالفصل الأول (${chapterA.status} بنسبة ${progressPercentA}%).`;
  } else {
    statusSummary = `الفصل الأول أكثر تقدماً بمرحلة (${chapterA.status} بنسبة ${progressPercentA}%) مقارنة بالفصل الثاني (${chapterB.status} بنسبة ${progressPercentB}%).`;
  }

  return {
    chapterA,
    chapterB,
    wordCountA: wordsA,
    wordCountB: wordsB,
    wordDiff,
    absoluteWordDiff,
    wordRatioA,
    wordRatioB,
    percentageGrowth,
    shareOfNovelA,
    shareOfNovelB,
    statusA: chapterA.status,
    statusB: chapterB.status,
    progressPercentA,
    progressPercentB,
    progressDiff,
    readingTimeMinutesA,
    readingTimeMinutesB,
    readingTimeDiffMinutes,
    paragraphsA,
    paragraphsB,
    avgWordsPerParagraphA,
    avgWordsPerParagraphB,
    notesCountA,
    notesCountB,
    characterCountA,
    characterCountB,
    pacingSummary,
    statusSummary,
  };
};
