async function fetchCelesTrakStations() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json', {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data.slice(0, 12).map(sat => ({
      name: sat.OBJECT_NAME,
      norad_id: sat.NORAD_CAT_ID,
      inclination_deg: sat.INCLINATION,
      mean_motion: sat.MEAN_MOTION,
      epoch: sat.EPOCH
    }));
  } catch {
    return null;
  }
}

async function fetchUcdpEvents(token) {
  if (!token) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch('https://ucdpapi.pcr.uu.se/api/gedevents/26.1?pagesize=20', {
      headers: { 'x-ucdp-access-token': token },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    const rows = json?.Result || [];
    return rows.map(r => ({
      id: `UCDP-${r.id}`,
      conflict_name: r.conflict_name,
      country: r.country,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      date_start: r.date_start,
      fatalities_best: r.best
    }));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const [satellites, ucdpEvents] = await Promise.all([
    fetchCelesTrakStations(),
    fetchUcdpEvents(process.env.UCDP_ACCESS_TOKEN)
  ]);

  // Major strategic submarine cable corridors (TeleGeography reference corridors)
  const submarine_cables = [
    {
      name: 'SEA-ME-WE 6 (Europe–Middle East–Asia)',
      landing_stations: ['Marseille', 'Suez', 'Djibouti', 'Mumbai', 'Singapore'],
      path: [[5.37, 43.3], [32.34, 30.57], [43.15, 11.58], [72.87, 19.07], [103.82, 1.35]],
      risk_level: 'critical'
    },
    {
      name: 'AAE-1 (Asia-Africa-Europe 1)',
      landing_stations: ['Marseille', 'Alexandria', 'Aden', 'Fujairah', 'Hong Kong'],
      path: [[5.37, 43.3], [29.92, 31.2], [45.03, 12.78], [56.33, 25.12], [114.17, 22.32]],
      risk_level: 'high'
    },
    {
      name: 'MAREA / Trans-Atlantic Fiber Spine',
      landing_stations: ['Virginia Beach', 'Bilbao'],
      path: [[-75.98, 36.85], [-42.0, 41.5], [-2.93, 43.26]],
      risk_level: 'nominal'
    },
    {
      name: 'FASTER / Trans-Pacific Corridor',
      landing_stations: ['Oregon', 'Chikura (Japan)', 'Taiwan'],
      path: [[-124.05, 44.63], [-168.0, 42.0], [139.95, 34.97], [121.56, 25.03]],
      risk_level: 'elevated'
    }
  ];

  const fallbackUcdp = [
    { id: 'UCDP-BASE-1', conflict_name: 'Red Sea Maritime Theater', country: 'Yemen / Red Sea', latitude: 13.5, longitude: 43.2, date_start: '2026-10-15', fatalities_best: 14 },
    { id: 'UCDP-BASE-2', conflict_name: 'Black Sea Littoral Zone', country: 'Ukraine', latitude: 46.48, longitude: 30.72, date_start: '2026-10-20', fatalities_best: 29 }
  ];

  res.status(200).json({
    updated_at: new Date().toISOString(),
    sources: {
      celestrak: satellites ? 'LIVE_CELESTRAK_GP' : 'CURATED_FALLBACK',
      ucdp: ucdpEvents ? 'LIVE_UCDP_GED_26_1' : 'CURATED_FALLBACK',
      cables: 'TELEGEOGRAPHY_CORRIDORS'
    },
    submarine_cables,
    satellites: satellites || [
      { name: 'ISS (ZARYA)', norad_id: 25544, inclination_deg: 51.64, mean_motion: 15.49, epoch: new Date().toISOString() },
      { name: 'CSS (TIANHE)', norad_id: 48274, inclination_deg: 41.47, mean_motion: 15.61, epoch: new Date().toISOString() }
    ],
    ucdp_conflicts: ucdpEvents || fallbackUcdp
  });
}
