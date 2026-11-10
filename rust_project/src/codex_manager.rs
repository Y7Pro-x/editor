use crate::models::{CodexCategory, CodexItem};
use std::collections::HashMap;

pub struct CodexManager {
    items: Vec<CodexItem>,
}

impl CodexManager {
    pub fn new() -> Self {
        Self { items: Vec::new() }
    }

    pub fn add_item(&mut self, item: CodexItem) {
        self.items.push(item);
    }

    pub fn get_characters(&self) -> Vec<&CodexItem> {
        self.items
            .iter()
            .filter(|i| matches!(i.category, CodexCategory::Character))
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<&CodexItem> {
        let q = query.to_lowercase();
        self.items
            .iter()
            .filter(|i| {
                i.name.to_lowercase().contains(&q)
                    || i.description.to_lowercase().contains(&q)
                    || i.tags.iter().any(|t| t.to_lowercase().contains(&q))
            })
            .collect()
    }

    pub fn build_relationship_graph(&self) -> HashMap<String, Vec<(String, String)>> {
        let mut graph = HashMap::new();
        for item in &self.items {
            let mut edges = Vec::new();
            for rel in &item.relationships {
                edges.push((rel.target_name.clone(), rel.relation_type.clone()));
            }
            graph.insert(item.name.clone(), edges);
        }
        graph
    }
}
