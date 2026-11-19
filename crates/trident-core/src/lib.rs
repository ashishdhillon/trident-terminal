use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FocusPillar {
    Convergence,
    Geopolitics,
    Macroeconomics,
    CyberWarfare,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConvergenceSignal {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub domains: Vec<FocusPillar>,
    pub timestamp: DateTime<Utc>,
    pub market_implication: Option<String>,
    pub geographical_target: Option<String>,
    pub threat_actor: Option<String>,
    pub confidence_score: u8,
    pub primary_indicator: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SignalSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoIncident {
    pub id: String,
    pub title: String,
    pub incident_type: String,
    pub location_name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub severity: SignalSeverity,
    pub timestamp: DateTime<Utc>,
    pub details: String,
    pub source_verified: bool,
}

// ==========================================
// PHASE 3: CYBER WARFARE DATA MODELS
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AptDossier {
    pub actor_id: String,
    pub primary_name: String,
    pub aliases: Vec<String>,
    pub state_sponsor: String,
    pub attribution_agency: String,
    pub motivation: String,
    pub targeted_sectors: Vec<String>,
    pub targeted_countries: Vec<String>,
    pub signature_ttp_ids: Vec<String>,
    pub recent_campaign: String,
    pub threat_level: SignalSeverity,
    pub operational_status: String,
    pub last_observed_activity: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreTacticGroup {
    pub tactic_id: String,
    pub tactic_name: String,
    pub observed_techniques_count: u32,
    pub critical_techniques: Vec<MitreTechnique>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreTechnique {
    pub technique_id: String,
    pub name: String,
    pub detection_priority: String,
    pub active_threat_actors: Vec<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CisaKevVulnerability {
    pub cve_id: String,
    pub vendor_project: String,
    pub product: String,
    pub vulnerability_name: String,
    pub date_added: String,
    pub due_date: String,
    pub known_ransomware_campaign_use: bool,
    pub cvss_score: f64,
    pub attack_vector: String,
    pub active_exploitation_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfrastructureCyberTarget {
    pub sector_name: String,
    pub active_incident_count: u32,
    pub primary_threat_actors: Vec<String>,
    pub readiness_posture: String,
    pub scada_exposure_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CyberDashboardPayload {
    pub updated_at: DateTime<Utc>,
    pub apt_dossiers: Vec<AptDossier>,
    pub mitre_tactics: Vec<MitreTacticGroup>,
    pub cisa_kev_feed: Vec<CisaKevVulnerability>,
    pub infrastructure_targets: Vec<InfrastructureCyberTarget>,
}

pub struct StateStorage {
    conn: rusqlite::Connection,
}

impl StateStorage {
    pub fn new_in_memory() -> anyhow::Result<Self> {
        let conn = rusqlite::Connection::open_in_memory()?;
        let storage = Self { conn };
        storage.init_tables()?;
        Ok(storage)
    }

    fn init_tables(&self) -> anyhow::Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS signals (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                data JSON NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS macro_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                data JSON NOT NULL,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            ",
        )?;
        Ok(())
    }
}
