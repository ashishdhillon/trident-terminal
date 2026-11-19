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
      id: "GEO-001",
      title: "Black Sea Naval Drone Threat Vector",
      incident_type: "Naval Exclusion",
      location_name: "Crimean Coastline / Sevastopol",
      latitude: 44.6166,
      longitude: 33.5254,
      severity: "high",
      timestamp: now,
      details: "Intermittent GPS spoofing and electronic warfare affecting commercial grain carriers.",
      source_verified: true
    },
    {
      id: "GEO-002",
      title: "Strait of Hormuz Airspace NOTAM Restriction",
      incident_type: "Military Airspace",
      location_name: "Strait of Hormuz / Bandar Abbas",
      latitude: 27.1832,
      longitude: 56.2666,
      severity: "critical",
      timestamp: now,
      details: "Live-fire naval drills restricting commercial transit lane western approaches.",
      source_verified: true
    }
  ]);
}
