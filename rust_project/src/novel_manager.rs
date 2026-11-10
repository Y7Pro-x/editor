use crate::models::{Chapter, ChapterStatus, TimelineEvent};

pub struct NovelManager;

impl NovelManager {
    pub fn count_words(text: &str) -> usize {
        text.split_whitespace().filter(|w| !w.is_empty()).count()
    }

    pub fn estimate_reading_time_minutes(word_count: usize) -> f32 {
        let wpm = 200.0;
        let mins = word_count as f32 / wpm;
        (mins * 10.0).round() / 10.0
    }

    pub fn calculate_total_words(chapters: &[Chapter]) -> usize {
        chapters.iter().map(|c| c.word_count).sum()
    }

    pub fn calculate_completion_percentage(chapters: &[Chapter]) -> f32 {
        if chapters.is_empty() {
            return 0.0;
        }

        let score: f32 = chapters
            .iter()
            .map(|c| match c.status {
                ChapterStatus::Completed => 1.0,
                ChapterStatus::Review => 0.75,
                ChapterStatus::Draft => 0.4,
                ChapterStatus::Idea => 0.1,
            })
            .sum();

        ((score / chapters.len() as f32) * 100.0).round()
    }

    pub fn compare_chapters<'a>(c1: &'a Chapter, c2: &'a Chapter) -> ChapterComparison<'a> {
        let diff = (c1.word_count as i64) - (c2.word_count as i64);
        let ratio = if c2.word_count > 0 {
            c1.word_count as f32 / c2.word_count as f32
        } else {
            1.0
        };

        ChapterComparison {
            chapter1: c1,
            chapter2: c2,
            word_difference: diff,
            word_ratio: ratio,
        }
    }

    pub fn sort_timeline(events: &mut [TimelineEvent]) {
        events.sort_by_key(|e| e.sort_order);
    }
}

pub struct ChapterComparison<'a> {
    pub chapter1: &'a Chapter,
    pub chapter2: &'a Chapter,
    pub word_difference: i64,
    pub word_ratio: f32,
}
