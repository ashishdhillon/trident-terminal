use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YieldPoint {
    pub maturity: String,
    pub rate: f64,
    pub previous_day_rate: f64,
    pub one_month_ago_rate: f64,
    pub one_year_ago_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YieldCurveData {
    pub timestamp: DateTime<Utc>,
    pub points: Vec<YieldPoint>,
    pub spread_10y_2y_bps: f64,
    pub spread_10y_3m_bps: f64,
    pub is_inverted: bool,
    pub curve_regime: String,
    pub recession_signal_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategicReserveItem {
    pub name: String,
    pub category: String,
    pub current_volume: f64,
    pub max_capacity: f64,
    pub unit: String,
    pub fill_percentage: f64,
    pub status: String,
    pub weekly_change_pct: f64,
    pub days_of_consumption_buffer: u32,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CentralBankProfile {
    pub institution: String,
    pub jurisdiction: String,
    pub policy_rate: f64,
    pub headline_cpi: f64,
    pub core_inflation: f64,
    pub real_policy_rate: f64,
    pub balance_sheet_trillion_usd: f64,
    pub stance: String,
    pub last_decision_date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommodityItem {
    pub ticker: String,
    pub name: String,
    pub category: String,
    pub spot_price: f64,
    pub unit: String,
    pub change_24h_pct: f64,
    pub high_52w: f64,
    pub low_52w: f64,
    pub geopolitical_sensitivity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChokepointCommodityExposure {
    pub chokepoint_name: String,
    pub region: String,
    pub daily_oil_transit_mbpd: f64,
    pub global_trade_share_pct: f64,
    pub primary_commodities: Vec<String>,
    pub vulnerability_score: u8,
    pub current_alert_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacroDashboardPayload {
    pub updated_at: DateTime<Utc>,
    pub yield_curve: YieldCurveData,
    pub reserves: Vec<StrategicReserveItem>,
    pub central_banks: Vec<CentralBankProfile>,
    pub commodities: Vec<CommodityItem>,
    pub chokepoints: Vec<ChokepointCommodityExposure>,
}

pub struct MacroEngine;

impl MacroEngine {
    pub fn get_telemetry_snapshot() -> MacroDashboardPayload {
        let now = Utc::now();

        let yield_points = vec![
            YieldPoint { maturity: "1M".into(), rate: 4.45, previous_day_rate: 4.46, one_month_ago_rate: 4.52, one_year_ago_rate: 5.40 },
            YieldPoint { maturity: "3M".into(), rate: 4.38, previous_day_rate: 4.39, one_month_ago_rate: 4.48, one_year_ago_rate: 5.38 },
            YieldPoint { maturity: "6M".into(), rate: 4.29, previous_day_rate: 4.30, one_month_ago_rate: 4.40, one_year_ago_rate: 5.25 },
            YieldPoint { maturity: "1Y".into(), rate: 4.18, previous_day_rate: 4.19, one_month_ago_rate: 4.28, one_year_ago_rate: 4.95 },
            YieldPoint { maturity: "2Y".into(), rate: 4.12, previous_day_rate: 4.14, one_month_ago_rate: 4.18, one_year_ago_rate: 4.70 },
            YieldPoint { maturity: "3Y".into(), rate: 4.15, previous_day_rate: 4.17, one_month_ago_rate: 4.16, one_year_ago_rate: 4.50 },
            YieldPoint { maturity: "5Y".into(), rate: 4.22, previous_day_rate: 4.24, one_month_ago_rate: 4.21, one_year_ago_rate: 4.35 },
            YieldPoint { maturity: "7Y".into(), rate: 4.31, previous_day_rate: 4.33, one_month_ago_rate: 4.30, one_year_ago_rate: 4.38 },
            YieldPoint { maturity: "10Y".into(), rate: 4.42, previous_day_rate: 4.44, one_month_ago_rate: 4.39, one_year_ago_rate: 4.42 },
            YieldPoint { maturity: "20Y".into(), rate: 4.71, previous_day_rate: 4.72, one_month_ago_rate: 4.68, one_year_ago_rate: 4.70 },
            YieldPoint { maturity: "30Y".into(), rate: 4.65, previous_day_rate: 4.67, one_month_ago_rate: 4.62, one_year_ago_rate: 4.58 },
        ];

        let spread_10_2: f64 = (4.42 - 4.12) * 100.0; // +30.0 bps (steepening)
        let spread_10_3m: f64 = (4.42 - 4.38) * 100.0; // +4.0 bps

        let yield_curve = YieldCurveData {
            timestamp: now,
            points: yield_points,
            spread_10y_2y_bps: (spread_10_2 * 10.0_f64).round() / 10.0_f64,
            spread_10y_3m_bps: (spread_10_3m * 10.0_f64).round() / 10.0_f64,
            is_inverted: false,
            curve_regime: "Dis-Inverting / Bear Steepener".into(),
            recession_signal_level: "Elevated Watch (Post-Inversion Lag Phase)".into(),
        };

        let reserves = vec![
            StrategicReserveItem {
                name: "US Strategic Petroleum Reserve (SPR)".into(),
                category: "Petroleum".into(),
                current_volume: 395.4,
                max_capacity: 714.0,
                unit: "Million Barrels".into(),
                fill_percentage: 55.4,
                status: "Slow Replenishment".into(),
                weekly_change_pct: 0.28,
                days_of_consumption_buffer: 20,
                notes: "Replenishment ongoing following 2022 emergency drawdown.".into(),
            },
            StrategicReserveItem {
                name: "Cushing, OK Hub Commercial Crude Stocks".into(),
                category: "Petroleum".into(),
                current_volume: 25.1,
                max_capacity: 76.0,
                unit: "Million Barrels".into(),
                fill_percentage: 33.0,
                status: "Operationally Constrained".into(),
                weekly_change_pct: -1.20,
                days_of_consumption_buffer: 12,
                notes: "Approaching operational bottoms; highly sensitive to Midwest refinery outages.".into(),
            },
            StrategicReserveItem {
                name: "European Union Gas Storage (AGSI+)".into(),
                category: "Natural Gas".into(),
                current_volume: 89.2,
                max_capacity: 100.0,
                unit: "% Capacity (TWh: ~1020)".into(),
                fill_percentage: 89.2,
                status: "Adequately Buffered".into(),
                weekly_change_pct: -0.85,
                days_of_consumption_buffer: 78,
                notes: "Storage levels above 5-year average entering seasonal withdrawal cycle.".into(),
            },
            StrategicReserveItem {
                name: "Global Grain Stock-to-Use Ratio (Wheat)".into(),
                category: "Agriculture".into(),
                current_volume: 25.4,
                max_capacity: 35.0,
                unit: "% Stock-to-Use".into(),
                fill_percentage: 72.5,
                status: "Tight Supply".into(),
                weekly_change_pct: -0.15,
                days_of_consumption_buffer: 92,
                notes: "Excluding China domestic reserves, exporter buffer remains historically fragile.".into(),
            },
        ];

        let central_banks = vec![
            CentralBankProfile {
                institution: "Federal Reserve (Fed)".into(),
                jurisdiction: "United States".into(),
                policy_rate: 4.50,
                headline_cpi: 2.6,
                core_inflation: 3.3,
                real_policy_rate: 1.90,
                balance_sheet_trillion_usd: 6.94,
                stance: "Cautious Easing / Data-Dependent".into(),
                last_decision_date: "Nov 2026".into(),
            },
            CentralBankProfile {
                institution: "European Central Bank (ECB)".into(),
                jurisdiction: "Eurozone".into(),
                policy_rate: 3.25,
                headline_cpi: 2.0,
                core_inflation: 2.7,
                real_policy_rate: 1.25,
                balance_sheet_trillion_usd: 7.12,
                stance: "Dovish Neutral / Growth Defense".into(),
                last_decision_date: "Oct 2026".into(),
            },
            CentralBankProfile {
                institution: "Bank of Japan (BOJ)".into(),
                jurisdiction: "Japan".into(),
                policy_rate: 0.25,
                headline_cpi: 2.5,
                core_inflation: 2.1,
                real_policy_rate: -2.25,
                balance_sheet_trillion_usd: 4.85,
                stance: "Hawkish Normalization".into(),
                last_decision_date: "Oct 2026".into(),
            },
            CentralBankProfile {
                institution: "People's Bank of China (PBOC)".into(),
                jurisdiction: "China".into(),
                policy_rate: 3.10,
                headline_cpi: 0.3,
                core_inflation: 0.2,
                real_policy_rate: 2.80,
                balance_sheet_trillion_usd: 6.20,
                stance: "Aggressive Monetary Stimulus".into(),
                last_decision_date: "Oct 2026".into(),
            },
        ];

        let commodities = vec![
            CommodityItem {
                ticker: "BRENT".into(),
                name: "Brent Crude Oil".into(),
                category: "Energy".into(),
                spot_price: 74.28,
                unit: "$/bbl".into(),
                change_24h_pct: 1.42,
                high_52w: 92.18,
                low_52w: 68.68,
                geopolitical_sensitivity: "Extreme (Middle East / Red Sea Risk Premium)".into(),
            },
            CommodityItem {
                ticker: "WTI".into(),
                name: "West Texas Intermediate".into(),
                category: "Energy".into(),
                spot_price: 70.15,
                unit: "$/bbl".into(),
                change_24h_pct: 1.35,
                high_52w: 87.67,
                low_52w: 65.27,
                geopolitical_sensitivity: "High (US Export / Gulf Coast Bottlenecks)".into(),
            },
            CommodityItem {
                ticker: "NG".into(),
                name: "Henry Hub Natural Gas".into(),
                category: "Energy".into(),
                spot_price: 2.82,
                unit: "$/MMBtu".into(),
                change_24h_pct: -0.65,
                high_52w: 3.45,
                low_52w: 1.58,
                geopolitical_sensitivity: "High (LNG Feedgas & Winter European Drawdowns)".into(),
            },
            CommodityItem {
                ticker: "XAU".into(),
                name: "Gold Spot".into(),
                category: "Precious Metals".into(),
                spot_price: 2684.50,
                unit: "$/oz".into(),
                change_24h_pct: 0.82,
                high_52w: 2790.15,
                low_52w: 1985.30,
                geopolitical_sensitivity: "Critical (Central Bank De-Dollarization Reserve Asset)".into(),
            },
            CommodityItem {
                ticker: "HG".into(),
                name: "Copper High Grade".into(),
                category: "Industrial Metals".into(),
                spot_price: 4.18,
                unit: "$/lb".into(),
                change_24h_pct: -0.32,
                high_52w: 5.19,
                low_52w: 3.65,
                geopolitical_sensitivity: "High (Electrification / Strategic Mineral Supply)".into(),
            },
            CommodityItem {
                ticker: "ZW".into(),
                name: "Wheat Chicago Futures".into(),
                category: "Agriculture".into(),
                spot_price: 552.25,
                unit: "cents/bushel".into(),
                change_24h_pct: 0.55,
                high_52w: 720.50,
                low_52w: 525.00,
                geopolitical_sensitivity: "Critical (Black Sea Grain Corridor Instability)".into(),
            },
        ];

        let chokepoints = vec![
            ChokepointCommodityExposure {
                chokepoint_name: "Strait of Hormuz".into(),
                region: "Persian Gulf".into(),
                daily_oil_transit_mbpd: 20.5,
                global_trade_share_pct: 21.0,
                primary_commodities: vec!["Crude Oil".into(), "LNG (Qatar)".into(), "Condensate".into()],
                vulnerability_score: 95,
                current_alert_status: "Heightened Surveillance (IRGC Navy Maneuvers)".into(),
            },
            ChokepointCommodityExposure {
                chokepoint_name: "Bab-el-Mandeb & Red Sea".into(),
                region: "Southern Red Sea".into(),
                daily_oil_transit_mbpd: 8.8,
                global_trade_share_pct: 12.0,
                primary_commodities: vec!["Refined Fuels".into(), "Crude Oil".into(), "Containerized Goods".into()],
                vulnerability_score: 88,
                current_alert_status: "Active Attack Zone (Cape Route Divergence Active)".into(),
            },
            ChokepointCommodityExposure {
                chokepoint_name: "Strait of Malacca".into(),
                region: "Southeast Asia".into(),
                daily_oil_transit_mbpd: 16.0,
                global_trade_share_pct: 30.0,
                primary_commodities: vec!["Middle East Crude to Asia".into(), "Iron Ore".into(), "Electronics".into()],
                vulnerability_score: 75,
                current_alert_status: "Normal Maritime Operations".into(),
            },
            ChokepointCommodityExposure {
                chokepoint_name: "Suez Canal".into(),
                region: "Egypt".into(),
                daily_oil_transit_mbpd: 4.5,
                global_trade_share_pct: 12.0,
                primary_commodities: vec!["LNG".into(), "Oil Products".into(), "Manufactured Goods".into()],
                vulnerability_score: 82,
                current_alert_status: "Severe Transit Volume Reduction (-55% vs Baseline)".into(),
            },
            ChokepointCommodityExposure {
                chokepoint_name: "Panama Canal".into(),
                region: "Central America".into(),
                daily_oil_transit_mbpd: 0.9,
                global_trade_share_pct: 3.5,
                primary_commodities: vec!["US Gulf LNG".into(), "Agricultural Grains".into(), "LPG".into()],
                vulnerability_score: 60,
                current_alert_status: "Recovering from Drought Draft Restrictions".into(),
            },
        ];

        MacroDashboardPayload {
            updated_at: now,
            yield_curve,
            reserves,
            central_banks,
            commodities,
            chokepoints,
        }
    }
}
