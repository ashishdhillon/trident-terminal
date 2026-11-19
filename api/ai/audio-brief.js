export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date();
  const zuluTime = now.toISOString().slice(11, 16).replace(':', '') + 'Z';
  const zuluDate = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const paragraphs = [
    `Director, as of ${zuluTime}, the composite Threat Convergence Index stands at 87 out of 100, remaining in the elevated multi-domain nexus.`,
    `In the kinetic and maritime theaters, anti-ship ballistic missile alerts in Bab-el-Mandeb continue to enforce commercial diversion around the Cape of Good Hope, adding approximately twelve transit days and sustaining a 1.8 percent war-risk premium on European crude benchmarks. Meanwhile, naval maneuvers in the western approaches of the Strait of Hormuz maintain heightened surveillance across 20.5 million barrels per day of daily petroleum flow.`,
    `Macroeconomic buffers show structural compression. Cushing hub inventories remain depressed near tank bottoms at 33 percent capacity, limiting immediate domestic cushion. Concurrently, the US Treasury ten-year to two-year yield spread has dis-inverted to positive 30 basis points, signaling term premium repricing and sovereign refinancing friction.`,
    `On the cyber front, CISA and Five Eyes advisories confirm persistent Living-off-the-Land staging by Volt Typhoon across maritime port logistics and Gulf Coast pipeline control networks. Adversaries are actively leveraging perimeter gateway vulnerabilities including CVE-2024-3400 and CVE-2024-21887 to establish persistent telemetry access.`,
    `Recommended strategic directives: First, enforce out-of-band multi-factor authentication and zero-trust firmware quarantine across all coastal pipeline gateways. Second, lock ninety-day distillate crack spread hedges for rerouted maritime fleets. Third, maintain continuous satellite telemetry monitoring across southern Red Sea transit corridors. End of brief.`
  ];

  const wordCount = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0);
  const estimatedDurationSec = Math.round((wordCount / 140) * 60);

  res.status(200).json({
    script_id: `AUDIO-BRIEF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${zuluTime}`,
    generated_at: now.toISOString(),
    threat_convergence_index: 87,
    headline: `Trident Strategic C2 Intelligence Briefing for ${zuluDate}, ${zuluTime}.`,
    transcript_paragraphs: paragraphs,
    full_text: paragraphs.join(' '),
    estimated_duration_sec: Math.max(45, estimatedDurationSec),
    recommended_voice_cadence: "1.05x Command Authority"
  });
}
