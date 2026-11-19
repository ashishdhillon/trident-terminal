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

// ==========================================
// PHASE 4: AI STRATEGIC SYNTHESIS & SITREP
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CausalityLink {
    pub step: u32,
    pub domain: FocusPillar,
    pub trigger_event: String,
    pub immediate_impact: String,
    pub secondary_ripple: String,
    pub confidence_pct: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossDomainInference {
    pub id: String,
    pub title: String,
    pub primary_thesis: String,
    pub risk_tier: SignalSeverity,
    pub correlated_domains: Vec<FocusPillar>,
    pub causality_sequence: Vec<CausalityLink>,
    pub market_vector: String,
    pub defensive_posture: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategicSitrep {
    pub sitrep_id: String,
    pub generated_at: DateTime<Utc>,
    pub threat_convergence_index: u8, // 0 - 100
    pub executive_summary: String,
    pub active_syndicates: Vec<String>,
    pub primary_inferences: Vec<CrossDomainInference>,
    pub key_cve_exposures: Vec<String>,
    pub macro_buffers: Vec<String>,
    pub actionable_directives: Vec<String>,
    pub model_engine: String,
    pub inference_latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiSynthesisRequest {
    pub query: String,
    pub target_domains: Option<Vec<FocusPillar>>,
    pub max_inferences: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceNode {
    pub id: String,
    pub title: String,
    pub domain: FocusPillar,
    pub similarity_score: f32,
    pub citation_source: String,
    pub excerpt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareAccelerationInfo {
    pub target_arch: String,
    pub is_apple_silicon: bool,
    pub acceleration_tier: String,
    pub vector_simd_active: bool,
    pub memory_allocated_mb: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiSynthesisResponse {
    pub query: String,
    pub sitrep: StrategicSitrep,
    pub relevant_evidence_nodes: Vec<EvidenceNode>,
    pub hardware_acceleration: HardwareAccelerationInfo,
}

// ==========================================
// MODULE 1 & 2: AUDIO SITREP & WARGAME MODELS
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioSitrepScript {
    pub script_id: String,
    pub generated_at: DateTime<Utc>,
    pub threat_convergence_index: u8,
    pub headline: String,
    pub transcript_paragraphs: Vec<String>,
    pub estimated_duration_sec: u32,
    pub recommended_voice_cadence: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedCellMove {
    pub round: u32,
    pub adversary_name: String,
    pub state_sponsor: String,
    pub operation_codename: String,
    pub vector_type: String,
    pub target_asset: String,
    pub signature_ttp: String,
    pub tactical_action: String,
    pub gross_market_shock: String,
    pub escalation_score: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlueCellCounter {
    pub round: u32,
    pub defense_force: String,
    pub doctrine_response: String,
    pub operational_directive: String,
    pub strategic_buffer_deployed: String,
    pub containment_efficiency_pct: u8,
    pub net_residual_risk: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WargameTurnState {
    pub round: u32,
    pub round_title: String,
    pub red_move: RedCellMove,
    pub blue_counter: BlueCellCounter,
    pub brent_projected_usd: f64,
    pub eu_gas_storage_pct: f64,
    pub us_10y_yield_pct: f64,
    pub threat_index_after_containment: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WargameSimulationReport {
    pub simulation_id: String,
    pub scenario_id: String,
    pub scenario_name: String,
    pub initial_threat_index: u8,
    pub peak_threat_index: u8,
    pub final_equilibrium_index: u8,
    pub turns: Vec<WargameTurnState>,
    pub executive_takeaway: String,
    pub systemic_fragility_rating: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WargameRunRequest {
    pub scenario_preset: Option<String>,
    pub custom_chokepoint_days: Option<u32>,
    pub custom_cyber_severity: Option<u32>,
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
