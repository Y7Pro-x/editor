import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareChapters,
  getStatusProgress,
  estimateReadingTimeMinutes,
  countParagraphs,
} from './chapterComparison.ts';
import { Chapter } from '../types/index.ts';

test('getStatusProgress returns correct progression percentage', () => {
  assert.equal(getStatusProgress('فكرة'), 25);
  assert.equal(getStatusProgress('مسودة'), 50);
  assert.equal(getStatusProgress('مراجعة'), 75);
  assert.equal(getStatusProgress('مكتمل'), 100);
});

test('estimateReadingTimeMinutes estimates correctly', () => {
  assert.equal(estimateReadingTimeMinutes(0), 0);
  assert.equal(estimateReadingTimeMinutes(100), 1);
  assert.equal(estimateReadingTimeMinutes(200), 1);
  assert.equal(estimateReadingTimeMinutes(450), 3);
});

test('countParagraphs handles paragraphs with text and spacing', () => {
  assert.equal(countParagraphs(''), 0);
  assert.equal(countParagraphs('الفقرة الأولى\n\nالفقرة الثانية\n\nالفقرة الثالثة'), 3);
  assert.equal(countParagraphs('<p>فقرة أولى</p><p>فقرة ثانية</p>'), 2);
});

test('compareChapters computes accurate side-by-side differences and ratios', () => {
  const chapterA: Chapter = {
    id: 'ch-1',
    title: 'الفصل الأول: البداية',
    documentJson: 'كان ياما كان في قديم الزمان...\n\nثم انطلق الفارس إلى القلعة.',
    wordCount: 1000,
    status: 'مسودة',
    lastModified: new Date().toISOString(),
  };

  const chapterB: Chapter = {
    id: 'ch-2',
    title: 'الفصل الثاني: المغامرة',
    documentJson: 'وصل الفارس إلى باب القلعة الحصينة.\n\nواجه الحارس عند المدخل.\n\nدارت معركة سريعة.',
    wordCount: 1500,
    status: 'مراجعة',
    lastModified: new Date().toISOString(),
  };

  const comparison = compareChapters(chapterA, chapterB, 5000);

  assert.equal(comparison.wordCountA, 1000);
  assert.equal(comparison.wordCountB, 1500);
  assert.equal(comparison.wordDiff, 500);
  assert.equal(comparison.absoluteWordDiff, 500);
  assert.equal(comparison.wordRatioA, 40);
  assert.equal(comparison.wordRatioB, 60);
  assert.equal(comparison.percentageGrowth, 50);
  assert.equal(comparison.shareOfNovelA, 20);
  assert.equal(comparison.shareOfNovelB, 30);
  assert.equal(comparison.progressPercentA, 50);
  assert.equal(comparison.progressPercentB, 75);
  assert.equal(comparison.progressDiff, 25);
  assert.equal(comparison.readingTimeMinutesA, 5);
  assert.equal(comparison.readingTimeMinutesB, 8);
  assert.equal(comparison.paragraphsA, 2);
  assert.equal(comparison.paragraphsB, 3);
});
