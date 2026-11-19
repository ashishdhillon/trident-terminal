// Server-side maritime AIS summary endpoint.
// Live persistent WebSocket streaming from wss://stream.aisstream.io/v0/stream
// runs in crates/trident-server/src/ais.rs (Tauri/local Rust daemon) because
// serverless functions cannot hold long-lived WebSocket connections.

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  res.status(200).json({
    updated_at: new Date().toISOString(),
    mode: process.env.AISSTREAM_API_KEY ? 'KEY_CONFIGURED_USE_RUST_DAEMON' : 'CURATED_BASELINE',
    chokepoints: [
      { id: 'CP-HORMUZ', name: 'Strait of Hormuz', active_vessels: 118, baseline_vessels: 132, diversion_pct: 10.6, bbox: [[25.5, 55.0], [27.5, 57.5]] },
      { id: 'CP-MANDAB', name: 'Bab-el-Mandeb', active_vessels: 41, baseline_vessels: 96, diversion_pct: 57.3, bbox: [[11.8, 42.5], [13.4, 44.2]] },
      { id: 'CP-SUEZ', name: 'Suez Canal', active_vessels: 34, baseline_vessels: 76, diversion_pct: 55.2, bbox: [[29.8, 32.0], [31.4, 32.8]] },
      { id: 'CP-MALACCA', name: 'Strait of Malacca', active_vessels: 264, baseline_vessels: 270, diversion_pct: 2.2, bbox: [[1.0, 99.5], [4.5, 104.2]] }
    ]
  });
}
