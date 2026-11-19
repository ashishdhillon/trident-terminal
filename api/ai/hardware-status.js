export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    target_arch: "vercel-edge-v8",
    is_apple_silicon: false,
    acceleration_tier: "Vercel Edge Global Serverless Compute",
    vector_simd_active: true,
    memory_allocated_mb: 18.2
  });
}
