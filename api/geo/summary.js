const FIRMS_SECTORS = [
  { name: 'Persian Gulf / Hormuz Sector', bbox: '48,23,59,31' },
  { name: 'Southern Red Sea / Bab-el-Mandeb', bbox: '40,11,47,17' }
];

function parseFirmsCsv(csvText, sectorName) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const idx = (col) => header.indexOf(col);
  const latI = idx('latitude');
  const lonI = idx('longitude');
  const frpI = idx('frp');
  const dateI = idx('acq_date');
  const timeI = idx('acq_time');
  const confI = idx('confidence');

  if (latI < 0 || lonI < 0 || frpI < 0) return [];

  const hotspots = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const frp = parseFloat(cols[frpI]);
    const lat = parseFloat(cols[latI]);
    const lon = parseFloat(cols[lonI]);
    // Filter for high Fire Radiative Power (>= 25 MW) to suppress minor agricultural burns
    if (!Number.isFinite(frp) || frp < 25 || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    // Pad acq_time to 4 digits (NASA FIRMS drops leading zeros, e.g. "52" -> "0052")
    const hhmm = String(cols[timeI] || '0000').trim().padStart(4, '0');
    const ts = `${cols[dateI] || new Date().toISOString().slice(0, 10)}T${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00Z`;
    hotspots.push({
      id: `FIRMS-${i}-${Math.round(lat * 100)}`,
      title: `VIIRS Thermal Anomaly (${frp.toFixed(1)} MW FRP)`,
      incident_type: 'NASA FIRMS Thermal',
      location_name: sectorName,
      latitude: lat,
      longitude: lon,
      severity: frp >= 60 ? 'critical' : 'high',
      timestamp: ts,
      details: `Satellite VIIRS SNPP NRT hotspot detected (FRP: ${frp.toFixed(1)} MW, confidence: ${cols[confI] || 'nominal'}).`,
      source_verified: true,
      frp
    });
  }
  return hotspots.sort((a, b) => b.frp - a.frp).slice(0, 4);
}

async function fetchFirmsHotspots(mapKey) {
  if (!mapKey) return null;
  try {
    const batches = await Promise.all(
      FIRMS_SECTORS.map(async (sector) => {
        const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(mapKey)}/VIIRS_SNPP_NRT/${sector.bbox}/1`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const r = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!r.ok) return [];
        const text = await r.text();
        if (text.startsWith('Invalid')) return [];
        return parseFirmsCsv(text, sector.name);
      })
    );
    return batches.flat();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date().toISOString();
  const baseIncidents = [
    {
      id: 'GEO-001',
      title: 'Black Sea Naval Drone Threat Vector',
      incident_type: 'Naval Exclusion',
      location_name: 'Crimean Coastline / Sevastopol',
      latitude: 44.6166,
      longitude: 33.5254,
      severity: 'high',
      timestamp: now,
      details: 'Intermittent GPS spoofing and electronic warfare affecting commercial grain carriers.',
      source_verified: true
    },
    {
      id: 'GEO-002',
      title: 'Strait of Hormuz Airspace NOTAM Restriction',
      incident_type: 'Military Airspace',
      location_name: 'Strait of Hormuz / Bandar Abbas',
      latitude: 27.1832,
      longitude: 56.2666,
      severity: 'critical',
      timestamp: now,
      details: 'Live-fire naval drills restricting commercial transit lane western approaches.',
      source_verified: true
    }
  ];

  const firmsHotspots = await fetchFirmsHotspots(process.env.NASA_FIRMS_MAP_KEY);
  const allIncidents = firmsHotspots ? [...firmsHotspots, ...baseIncidents] : baseIncidents;

  res.setHeader('X-Trident-FIRMS-Source', firmsHotspots ? 'LIVE_NASA_FIRMS' : 'CURATED_FALLBACK');
  res.status(200).json(allIncidents);
}
