export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date().toISOString();
  const scenario = req.body?.scenario_preset || req.query?.scenario || "Hormuz 45D + Volt Typhoon OT";

  const turns = [
    {
      round: 1,
      round_title: "Round 01: Initial Chokepoint Interdiction & Stealth SCADA Staging",
      red_move: {
        round: 1,
        adversary_name: "Volt Typhoon (PRC MSS) + IRGC Maritime",
        state_sponsor: "China / Iran Regional Axis",
        operation_codename: "Operation Iron Grip",
        vector_type: "Kinetic NOTAM + Firmware Living-off-the-Land",
        target_asset: "Strait of Hormuz western approaches + Gulf Coast pipeline routers",
        signature_ttp: "T1078 Valid Accounts + T1190 Public Edge Exploitation",
        tactical_action: "IRGC naval exclusion drill combined with stealth persistence across 14 pipeline compressor routers.",
        gross_market_shock: "+$6.40/bbl prompt crude jump; +18 bps US 10Y yield spike.",
        escalation_score: 72
      },
      blue_counter: {
        round: 1,
        defense_force: "US NAVCENT Fifth Fleet + CISA JCDC",
        doctrine_response: "Deterrence Patrol & Emergency Zero-Trust Network Quarantine",
        operational_directive: "Deploy carrier strike group escort to international tanker corridor; mandate immediate out-of-band firmware isolation on edge VPNs.",
        strategic_buffer_deployed: "Alert notice issued to US Strategic Petroleum Reserve for potential 1.0M bbl/d surge.",
        containment_efficiency_pct: 68,
        net_residual_risk: "Crude volatility partially absorbed; cyber reconnaissance active in secondary networks."
      },
      brent_projected_usd: 80.68,
      eu_gas_storage_pct: 86.4,
      us_10y_yield_pct: 4.54,
      threat_index_after_containment: 76
    },
    {
      round: 2,
      round_title: "Round 02: Asymmetric Escalation & Coordinated Grid Wiper Surge",
      red_move: {
        round: 2,
        adversary_name: "Sandworm (Unit 74455 / GRU)",
        state_sponsor: "Russian Federation",
        operation_codename: "Operation Black Ice",
        vector_type: "OT/ICS Industroyer2 Substation Disruption",
        target_asset: "Black Sea grain terminal electrical feeds & Romanian interconnectors",
        signature_ttp: "T0855 Unauthorized Command Messages + T0814 Denial of Control",
        tactical_action: "Injecting false IEC-104 telemetry to trip high-voltage circuit breakers at maritime export hubs.",
        gross_market_shock: "European power spot rates +24%; wheat shipping logistics freeze.",
        escalation_score: 89
      },
      blue_counter: {
        round: 2,
        defense_force: "NATO Cyber Defense Management Authority + ENTSO-E",
        doctrine_response: "Manual Pneumatic Substation Failover & Cross-Border Power Routing",
        operational_directive: "Disconnect digital telemetry feeds to manual air-gap control; activate synchronous grid islanding protocol.",
        strategic_buffer_deployed: "European Strategic Natural Gas reserve withdrawal triggered (+85 mcm/day).",
        containment_efficiency_pct: 82,
        net_residual_risk: "Substation trip isolated within 38 minutes; agricultural export backlog continues."
      },
      brent_projected_usd: 87.40,
      eu_gas_storage_pct: 81.2,
      us_10y_yield_pct: 4.62,
      threat_index_after_containment: 84
    },
    {
      round: 3,
      round_title: "Round 03: Strategic Counter-Surge & Allied Market Stabilization",
      red_move: {
        round: 3,
        adversary_name: "Ansar Allah + Iranian Drone Swarm",
        state_sponsor: "Yemen / IRGC",
        operation_codename: "Operation Strait Gate",
        vector_type: "ASBM Anti-Ship Missile & Uncrewed Surface Vessels",
        target_asset: "Bab-el-Mandeb commercial container fleets",
        signature_ttp: "Asymmetric saturation swarm against radar defense corridors",
        tactical_action: "Simultaneous 8-drone salvo aimed at mid-channel bulk carrier convoy.",
        gross_market_shock: "+35% container spot rates (SCFI); war risk hull insurance tripled.",
        escalation_score: 93
      },
      blue_counter: {
        round: 3,
        defense_force: "Coalition Combined Maritime Forces (CMF) + IEA",
        doctrine_response: "Kinetic Aegis Interception + Full-Scale 30M bbl SPR Drawdown",
        operational_directive: "SM-2 / Sea Ceptor intercepts 7 of 8 incoming projectiles; 1 vessel sustains minor hull damage. IEA members coordinate 1.5M bbl/day collective release.",
        strategic_buffer_deployed: "US SPR 30M bbl drawdown tender activated; Cushing stocks receive emergency pipeline injection.",
        containment_efficiency_pct: 91,
        net_residual_risk: "Cape of Good Hope rerouting remains standard; prompt crude backwardation caps at +$3.50/bbl."
      },
      brent_projected_usd: 84.15,
      eu_gas_storage_pct: 78.5,
      us_10y_yield_pct: 4.56,
      threat_index_after_containment: 78
    },
    {
      round: 4,
      round_title: "Round 04: Tactical Equilibrium & Net Systemic Resilience",
      red_move: {
        round: 4,
        adversary_name: "Consortium of State Syndicates",
        state_sponsor: "Multi-Theater Axis",
        operation_codename: "Consolidated Pressure Horizon",
        vector_type: "DDoS Extortion + Financial Payment Disruption",
        target_asset: "SWIFT maritime insurance clearing and energy billing APIs",
        signature_ttp: "T1498 Network Denial of Service + Ransomware Extortion",
        tactical_action: "Large-scale 4.2 Tbps volumetric flood targeting London and Geneva maritime settlement houses.",
        gross_market_shock: "Short-term letter-of-credit delays for crude cargoes.",
        escalation_score: 65
      },
      blue_counter: {
        round: 4,
        defense_force: "Federal Reserve / Bank of England + Cloudflare/Akamai Defense",
        doctrine_response: "Bilateral Central Bank Currency Swaps + Anycast Scrubbing",
        operational_directive: "Anycast cloud scrubbing absorbs 99.4% of flood; emergency liquidity swap lines guarantee trade settlement within 2 hours.",
        strategic_buffer_deployed: "$40B bilateral trade liquidity window activated.",
        containment_efficiency_pct: 96,
        net_residual_risk: "Systemic payment cascade averted; risk premium stabilizes at manageable plateau."
      },
      brent_projected_usd: 81.90,
      eu_gas_storage_pct: 76.8,
      us_10y_yield_pct: 4.51,
      threat_index_after_containment: 72
    }
  ];

  res.status(200).json({
    simulation_id: `SIM-WARGAME-${now.slice(0, 10).replace(/-/g, '')}`,
    scenario_id: "SCENARIO-HORMUZ-CYBER-ALPHA",
    scenario_name: scenario,
    initial_threat_index: 87,
    peak_threat_index: 93,
    final_equilibrium_index: 72,
    turns,
    executive_takeaway: "Allied buffer deployment (30M bbl SPR release + zero-trust OT quarantine) successfully absorbed 76% of gross adversarial escalation, containing peak Brent prices below $88/bbl and establishing a stable equilibrium.",
    systemic_fragility_rating: "MODERATE // Strategic Buffers Effective but Require 180-Day Replenishment"
  });
}
