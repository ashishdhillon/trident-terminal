export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date().toISOString();

  res.status(200).json([
    {
      id: "SIG-CONV-901",
      title: "Red Sea Maritime Escort Chokepoint & Energy Premium Convergence",
      description: "Bab-el-Mandeb anti-ship missile alerts triggering 14-day voyage reroutes around Cape of Good Hope, adding +$1.85/bbl war risk insurance premium to European crude imports.",
      severity: "critical",
      domains: ["geopolitics", "macroeconomics"],
      timestamp: now,
      market_implication: "+1.8% Brent Crude premium; +24% container freight spot rates (SCFI).",
      geographical_target: "Bab-el-Mandeb / Southern Red Sea",
      threat_actor: "Houthi Movement (Ansar Allah)",
      confidence_score: 94,
      primary_indicator: "AIS Vessel Divergence & UKMTO Incident 118"
    },
    {
      id: "SIG-CONV-902",
      title: "Volt Typhoon Pre-Positioning on Critical Pipeline SCADA Infrastructure",
      description: "CISA alert indicating persistent living-off-the-land malware staging across maritime port logistics and Gulf Coast pipeline control networks.",
      severity: "high",
      domains: ["cyber_warfare", "geopolitics"],
      timestamp: now,
      market_implication: "Elevated supply disruption hedging in US Natural Gas and refined products.",
      geographical_target: "US Gulf Coast Energy Corridor",
      threat_actor: "Volt Typhoon (PRC State-Sponsored)",
      confidence_score: 89,
      primary_indicator: "CISA KEV / Router Firmware Telemetry"
    },
    {
      id: "SIG-CONV-903",
      title: "Yield Curve Dis-Inversion vs. Strategic Petroleum Stock Depletion",
      description: "US 10Y-2Y spread steepening (+30 bps) coupled with Cushing storage near tank bottoms (33% capacity), reducing US macro buffer against unexpected supply shocks.",
      severity: "medium",
      domains: ["macroeconomics"],
      timestamp: now,
      market_implication: "Steepening sovereign curve; heightened sensitivity to headline inflation data.",
      geographical_target: "North America Financial & Energy Hubs",
      threat_actor: null,
      confidence_score: 98,
      primary_indicator: "US Treasury / EIA Weekly Petroleum Status"
    }
  ]);
}
