//! Live Maritime AIS Chokepoint Telemetry Ingestion (AISStream.io)
//! Connects server-side to wss://stream.aisstream.io/v0/stream so the API key
//! never leaks to the browser. Tracks unique vessels inside the 4 global chokepoints.

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChokepointAisSnapshot {
    pub id: String,
    pub name: String,
    pub active_vessels: usize,
    pub baseline_vessels: usize,
    pub diversion_pct: f64,
}

#[derive(Debug, Clone)]
pub struct AisChokepointTracker {
    vessels_by_zone: Arc<RwLock<HashMap<String, HashSet<u64>>>>,
}

impl AisChokepointTracker {
    pub fn new() -> Self {
        let mut map = HashMap::new();
        for key in ["CP-HORMUZ", "CP-MANDAB", "CP-SUEZ", "CP-MALACCA"] {
            map.insert(key.to_string(), HashSet::new());
        }
        Self {
            vessels_by_zone: Arc::new(RwLock::new(map)),
        }
    }

    /// Build the official AISStream.io JSON subscription payload for all 4 chokepoints.
    pub fn build_subscription_message(api_key: &str) -> String {
        serde_json::json!({
            "APIKey": api_key,
            "BoundingBoxes": [
                [[25.5, 55.0], [27.5, 57.5]], // Strait of Hormuz
                [[11.8, 42.5], [13.4, 44.2]], // Bab-el-Mandeb
                [[29.8, 32.0], [31.4, 32.8]], // Suez Canal
                [[1.0,  99.5], [4.5, 104.2]]  // Strait of Malacca
            ],
            "FilterMessageTypes": ["PositionReport"]
        })
        .to_string()
    }

    /// Record a vessel MMSI observed at (lat, lon) into its matching chokepoint bucket.
    pub fn record_vessel(&self, mmsi: u64, lat: f64, lon: f64) {
        let zone = if (25.5..=27.5).contains(&lat) && (55.0..=57.5).contains(&lon) {
            Some("CP-HORMUZ")
        } else if (11.8..=13.4).contains(&lat) && (42.5..=44.2).contains(&lon) {
            Some("CP-MANDAB")
        } else if (29.8..=31.4).contains(&lat) && (32.0..=32.8).contains(&lon) {
            Some("CP-SUEZ")
        } else if (1.0..=4.5).contains(&lat) && (99.5..=104.2).contains(&lon) {
            Some("CP-MALACCA")
        } else {
            None
        };

        if let (Some(z), Ok(mut guard)) = (zone, self.vessels_by_zone.write()) {
            if let Some(set) = guard.get_mut(z) {
                set.insert(mmsi);
            }
        }
    }

    pub fn snapshot(&self) -> Vec<ChokepointAisSnapshot> {
        let baselines = [
            ("CP-HORMUZ", "Strait of Hormuz", 132usize),
            ("CP-MANDAB", "Bab-el-Mandeb", 96usize),
            ("CP-SUEZ", "Suez Canal", 76usize),
            ("CP-MALACCA", "Strait of Malacca", 270usize),
        ];
        let guard = self.vessels_by_zone.read().ok();
        baselines
            .iter()
            .map(|(id, name, base)| {
                let active = guard
                    .as_ref()
                    .and_then(|m| m.get(*id))
                    .map(|s| s.len())
                    .unwrap_or(0);
                let diversion = if *base > 0 && active > 0 {
                    (((*base as f64 - active as f64) / *base as f64) * 100.0).max(0.0)
                } else {
                    0.0
                };
                ChokepointAisSnapshot {
                    id: (*id).to_string(),
                    name: (*name).to_string(),
                    active_vessels: active,
                    baseline_vessels: *base,
                    diversion_pct: (diversion * 10.0).round() / 10.0,
                }
            })
            .collect()
    }
}
