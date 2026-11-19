use axum::{
    http::{HeaderValue, Method},
    response::Json,
    routing::get,
    Router,
};
use chrono::Utc;
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use trident_core::{ConvergenceSignal, FocusPillar, GeoIncident, SignalSeverity};
use trident_cyber::CyberEngine;
use trident_macro::MacroEngine;

#[derive(Serialize)]
struct SystemStatus {
    service: &'static str,
    version: &'static str,
    status: &'static str,
    active_engine: &'static str,
    timestamp: chrono::DateTime<Utc>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .compact()
        .init();

    let cors = CorsLayer::new()
        .allow_origin("*".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([axum::http::header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/status", get(system_status))
        .route("/api/macro/all", get(get_macro_telemetry))
        .route("/api/macro/yield-curve", get(get_yield_curve))
        .route("/api/macro/reserves", get(get_reserves))
        .route("/api/macro/commodities", get(get_commodities))
        .route("/api/macro/central-banks", get(get_central_banks))
        .route("/api/macro/chokepoints", get(get_chokepoints))
        .route("/api/cyber/all", get(get_cyber_telemetry))
        .route("/api/cyber/apt-actors", get(get_apt_actors))
        .route("/api/cyber/cisa-kev", get(get_cisa_kev))
        .route("/api/convergence/signals", get(get_convergence_signals))
        .route("/api/geo/summary", get(get_geo_summary))
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3100));
    tracing::info!("Trident Terminal High-Speed Core listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "timestamp": Utc::now()
    }))
}

async fn system_status() -> Json<SystemStatus> {
    Json(SystemStatus {
        service: "trident-core-engine",
        version: "0.1.0-alpha",
        status: "operational",
        active_engine: "rust-native-async",
        timestamp: Utc::now(),
    })
}

async fn get_macro_telemetry() -> Json<trident_macro::MacroDashboardPayload> {
    Json(MacroEngine::get_telemetry_snapshot())
}

async fn get_yield_curve() -> Json<trident_macro::YieldCurveData> {
    Json(MacroEngine::get_telemetry_snapshot().yield_curve)
}

async fn get_reserves() -> Json<Vec<trident_macro::StrategicReserveItem>> {
    Json(MacroEngine::get_telemetry_snapshot().reserves)
}

async fn get_commodities() -> Json<Vec<trident_macro::CommodityItem>> {
    Json(MacroEngine::get_telemetry_snapshot().commodities)
}

async fn get_central_banks() -> Json<Vec<trident_macro::CentralBankProfile>> {
    Json(MacroEngine::get_telemetry_snapshot().central_banks)
}

async fn get_chokepoints() -> Json<Vec<trident_macro::ChokepointCommodityExposure>> {
    Json(MacroEngine::get_telemetry_snapshot().chokepoints)
}

async fn get_cyber_telemetry() -> Json<trident_core::CyberDashboardPayload> {
    Json(CyberEngine::get_telemetry_snapshot())
}

async fn get_apt_actors() -> Json<Vec<trident_core::AptDossier>> {
    Json(CyberEngine::get_telemetry_snapshot().apt_dossiers)
}

async fn get_cisa_kev() -> Json<Vec<trident_core::CisaKevVulnerability>> {
    Json(CyberEngine::get_telemetry_snapshot().cisa_kev_feed)
}

async fn get_convergence_signals() -> Json<Vec<ConvergenceSignal>> {
    let now = Utc::now();
    let signals = vec![
        ConvergenceSignal {
            id: "SIG-CONV-901".into(),
            title: "Red Sea Maritime Escort Chokepoint & Energy Premium Convergence".into(),
            description: "Bab-el-Mandeb anti-ship missile alerts triggering 14-day voyage reroutes around Cape of Good Hope, adding +$1.85/bbl war risk insurance premium to European crude imports.".into(),
            severity: SignalSeverity::Critical,
            domains: vec![FocusPillar::Geopolitics, FocusPillar::Macroeconomics],
            timestamp: now,
            market_implication: Some("+1.8% Brent Crude premium; +24% container freight spot rates (SCFI).".into()),
            geographical_target: Some("Bab-el-Mandeb / Southern Red Sea".into()),
            threat_actor: Some("Houthi Movement (Ansar Allah)".into()),
            confidence_score: 94,
            primary_indicator: "AIS Vessel Divergence & UKMTO Incident 118".into(),
        },
        ConvergenceSignal {
            id: "SIG-CONV-902".into(),
            title: "Volt Typhoon Pre-Positioning on Critical Pipeline SCADA Infrastructure".into(),
            description: "CISA alert indicating persistent living-off-the-land malware staging across maritime port logistics and Gulf Coast pipeline control networks.".into(),
            severity: SignalSeverity::High,
            domains: vec![FocusPillar::CyberWarfare, FocusPillar::Geopolitics],
            timestamp: now,
            market_implication: Some("Elevated supply disruption hedging in US Natural Gas and refined products.".into()),
            geographical_target: Some("US Gulf Coast Energy Corridor".into()),
            threat_actor: Some("Volt Typhoon (PRC State-Sponsored)".into()),
            confidence_score: 89,
            primary_indicator: "CISA KEV / Router Firmware Telemetry".into(),
        },
        ConvergenceSignal {
            id: "SIG-CONV-903".into(),
            title: "Yield Curve Dis-Inversion vs. Strategic Petroleum Stock Depletion".into(),
            description: "US 10Y-2Y spread steepening (+30 bps) coupled with Cushing storage near tank bottoms (33% capacity), reducing US macro buffer against unexpected supply shocks.".into(),
            severity: SignalSeverity::Medium,
            domains: vec![FocusPillar::Macroeconomics],
            timestamp: now,
            market_implication: Some("Steepening sovereign curve; heightened sensitivity to headline inflation data.".into()),
            geographical_target: Some("North America Financial & Energy Hubs".into()),
            threat_actor: None,
            confidence_score: 98,
            primary_indicator: "US Treasury / EIA Weekly Petroleum Status".into(),
        },
    ];
    Json(signals)
}

async fn get_geo_summary() -> Json<Vec<GeoIncident>> {
    let now = Utc::now();
    let incidents = vec![
        GeoIncident {
            id: "GEO-001".into(),
            title: "Black Sea Naval Drone Threat Vector".into(),
            incident_type: "Naval Exclusion".into(),
            location_name: "Crimean Coastline / Sevastopol".into(),
            latitude: 44.6166,
            longitude: 33.5254,
            severity: SignalSeverity::High,
            timestamp: now,
            details: "Intermittent GPS spoofing and electronic warfare affecting commercial grain carriers.".into(),
            source_verified: true,
        },
        GeoIncident {
            id: "GEO-002".into(),
            title: "Strait of Hormuz Airspace NOTAM Restriction".into(),
            incident_type: "Military Airspace".into(),
            location_name: "Strait of Hormuz / Bandar Abbas".into(),
            latitude: 27.1832,
            longitude: 56.2666,
            severity: SignalSeverity::Critical,
            timestamp: now,
            details: "Live-fire naval drills restricting commercial transit lane western approaches.".into(),
            source_verified: true,
        },
    ];
    Json(incidents)
}
