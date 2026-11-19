const FRED_SERIES = [
  { id: 'DGS1MO', maturity: '1M' },
  { id: 'DGS3MO', maturity: '3M' },
  { id: 'DGS6MO', maturity: '6M' },
  { id: 'DGS1',   maturity: '1Y' },
  { id: 'DGS2',   maturity: '2Y' },
  { id: 'DGS3',   maturity: '3Y' },
  { id: 'DGS5',   maturity: '5Y' },
  { id: 'DGS7',   maturity: '7Y' },
  { id: 'DGS10',  maturity: '10Y' },
  { id: 'DGS20',  maturity: '20Y' },
  { id: 'DGS30',  maturity: '30Y' }
];

async function fetchFredYieldCurve(apiKey) {
  if (!apiKey) return null;
  try {
    const results = await Promise.all(
      FRED_SERIES.map(async ({ id, maturity }) => {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${encodeURIComponent(apiKey)}&file_type=json&sort_order=desc&limit=265`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const r = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!r.ok) return null;
        const json = await r.json();
        const valid = (json.observations || []).filter(o => o.value && o.value !== '.');
        if (!valid.length) return null;
        const pick = (idx) => parseFloat((valid[Math.min(idx, valid.length - 1)] || valid[0]).value);
        return {
          maturity,
          rate: pick(0),
          previous_day_rate: pick(1),
          one_month_ago_rate: pick(21),
          one_year_ago_rate: pick(250),
          observation_date: valid[0].date
        };
      })
    );
    const points = results.filter(Boolean);
    if (points.length < 8) return null;
    const byMat = Object.fromEntries(points.map(p => [p.maturity, p.rate]));
    const spread10y2y = Math.round(((byMat['10Y'] || 0) - (byMat['2Y'] || 0)) * 100);
    const spread10y3m = Math.round(((byMat['10Y'] || 0) - (byMat['3M'] || 0)) * 100);
    const isInverted = spread10y2y < 0 || spread10y3m < 0;
    return {
      timestamp: points[0].observation_date || new Date().toISOString(),
      points,
      spread_10y_2y_bps: spread10y2y,
      spread_10y_3m_bps: spread10y3m,
      is_inverted: isInverted,
      curve_regime: isInverted ? 'Inverted Yield Curve' : 'Dis-Inverting / Bear Steepener',
      recession_signal_level: isInverted ? 'Active Inversion Alert' : 'Elevated Watch (Post-Inversion Lag Phase)'
    };
  } catch {
    return null;
  }
}

async function fetchEiaPetroleumStocks(apiKey) {
  if (!apiKey) return null;
  try {
    const url =
      `https://api.eia.gov/v2/petroleum/stoc/wstk/data/?api_key=${encodeURIComponent(apiKey)}` +
      `&frequency=weekly&data[0]=value` +
      `&facets[series][]=WCSSTUS1&facets[series][]=W_EPC0_SAX_YCUOK_MBBL` +
      `&sort[0][column]=period&sort[0][direction]=desc&length=10`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const json = await r.json();
    const rows = json?.response?.data || [];
    const sprRows = rows.filter(x => x.series === 'WCSSTUS1' && x.value != null);
    const cushingRows = rows.filter(x => x.series === 'W_EPC0_SAX_YCUOK_MBBL' && x.value != null);

    const parsePair = (arr) => {
      if (!arr.length) return null;
      const cur = parseFloat(arr[0].value) / 1000; // thousand barrels -> million barrels
      const prev = arr[1] ? parseFloat(arr[1].value) / 1000 : cur;
      const weeklyPct = prev > 0 ? Number((((cur - prev) / prev) * 100).toFixed(2)) : 0;
      return { cur: Number(cur.toFixed(1)), weeklyPct, period: arr[0].period };
    };
    return { spr: parsePair(sprRows), cushing: parsePair(cushingRows) };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date().toISOString();
  const [liveYield, liveEia] = await Promise.all([
    fetchFredYieldCurve(process.env.FRED_API_KEY),
    fetchEiaPetroleumStocks(process.env.EIA_API_KEY)
  ]);

  const fallbackYieldCurve = {
    timestamp: now,
    points: [
      { maturity: '1M', rate: 4.45, previous_day_rate: 4.46, one_month_ago_rate: 4.52, one_year_ago_rate: 5.40 },
      { maturity: '3M', rate: 4.38, previous_day_rate: 4.39, one_month_ago_rate: 4.48, one_year_ago_rate: 5.38 },
      { maturity: '6M', rate: 4.29, previous_day_rate: 4.30, one_month_ago_rate: 4.40, one_year_ago_rate: 5.25 },
      { maturity: '1Y', rate: 4.18, previous_day_rate: 4.19, one_month_ago_rate: 4.28, one_year_ago_rate: 4.95 },
      { maturity: '2Y', rate: 4.12, previous_day_rate: 4.14, one_month_ago_rate: 4.18, one_year_ago_rate: 4.70 },
      { maturity: '3Y', rate: 4.15, previous_day_rate: 4.17, one_month_ago_rate: 4.16, one_year_ago_rate: 4.50 },
      { maturity: '5Y', rate: 4.22, previous_day_rate: 4.24, one_month_ago_rate: 4.21, one_year_ago_rate: 4.35 },
      { maturity: '7Y', rate: 4.31, previous_day_rate: 4.33, one_month_ago_rate: 4.30, one_year_ago_rate: 4.38 },
      { maturity: '10Y', rate: 4.42, previous_day_rate: 4.44, one_month_ago_rate: 4.39, one_year_ago_rate: 4.42 },
      { maturity: '20Y', rate: 4.71, previous_day_rate: 4.72, one_month_ago_rate: 4.68, one_year_ago_rate: 4.70 },
      { maturity: '30Y', rate: 4.65, previous_day_rate: 4.67, one_month_ago_rate: 4.62, one_year_ago_rate: 4.58 }
    ],
    spread_10y_2y_bps: 30.0,
    spread_10y_3m_bps: 4.0,
    is_inverted: false,
    curve_regime: 'Dis-Inverting / Bear Steepener',
    recession_signal_level: 'Elevated Watch (Post-Inversion Lag Phase)'
  };

  const sprVol = liveEia?.spr?.cur ?? 395.4;
  const sprPct = Number(((sprVol / 714.0) * 100).toFixed(1));
  const cushVol = liveEia?.cushing?.cur ?? 25.1;
  const cushPct = Number(((cushVol / 76.0) * 100).toFixed(1));

  res.status(200).json({
    updated_at: now,
    sources: {
      fred: liveYield ? 'LIVE_FRED_API' : 'CURATED_FALLBACK',
      eia: liveEia?.spr || liveEia?.cushing ? 'LIVE_EIA_V2_API' : 'CURATED_FALLBACK'
    },
    yield_curve: liveYield || fallbackYieldCurve,
    reserves: [
      {
        name: 'US Strategic Petroleum Reserve (SPR)',
        category: 'Petroleum',
        current_volume: sprVol,
        max_capacity: 714.0,
        unit: 'Million Barrels',
        fill_percentage: sprPct,
        status: sprPct < 55 ? 'Constrained Replenishment' : 'Slow Replenishment',
        weekly_change_pct: liveEia?.spr?.weeklyPct ?? 0.28,
        days_of_consumption_buffer: Math.round(sprVol / 19.8),
        notes: liveEia?.spr ? `EIA WPSR period ${liveEia.spr.period}` : 'Replenishment ongoing following emergency drawdown.'
      },
      {
        name: 'Cushing, OK Hub Commercial Crude Stocks',
        category: 'Petroleum',
        current_volume: cushVol,
        max_capacity: 76.0,
        unit: 'Million Barrels',
        fill_percentage: cushPct,
        status: cushVol < 26 ? 'Operationally Constrained' : 'Nominal Buffer',
        weekly_change_pct: liveEia?.cushing?.weeklyPct ?? -1.20,
        days_of_consumption_buffer: Math.max(8, Math.round(cushVol * 0.48)),
        notes: liveEia?.cushing ? `EIA WPSR period ${liveEia.cushing.period}` : 'Approaching operational bottoms (~20M bbl floor).'
      },
      {
        name: 'European Union Gas Storage (AGSI+)',
        category: 'Natural Gas',
        current_volume: 89.2,
        max_capacity: 100.0,
        unit: '% Capacity (TWh: ~1020)',
        fill_percentage: 89.2,
        status: 'Adequately Buffered',
        weekly_change_pct: -0.85,
        days_of_consumption_buffer: 78,
        notes: 'Storage levels above 5-year average entering seasonal withdrawal cycle.'
      },
      {
        name: 'Global Grain Stock-to-Use Ratio (Wheat)',
        category: 'Agriculture',
        current_volume: 25.4,
        max_capacity: 35.0,
        unit: '% Stock-to-Use',
        fill_percentage: 72.5,
        status: 'Tight Supply',
        weekly_change_pct: -0.15,
        days_of_consumption_buffer: 92,
        notes: 'Excluding China domestic reserves, exporter buffer remains historically fragile.'
      }
    ],
    central_banks: [
      { institution: 'Federal Reserve (Fed)', jurisdiction: 'United States', policy_rate: 4.50, headline_cpi: 2.6, core_inflation: 3.3, real_policy_rate: 1.90, balance_sheet_trillion_usd: 6.94, stance: 'Cautious Easing / Data-Dependent', last_decision_date: 'Nov 2026' },
      { institution: 'European Central Bank (ECB)', jurisdiction: 'Eurozone', policy_rate: 3.25, headline_cpi: 2.0, core_inflation: 2.7, real_policy_rate: 1.25, balance_sheet_trillion_usd: 7.12, stance: 'Dovish Neutral / Growth Defense', last_decision_date: 'Oct 2026' },
      { institution: 'Bank of Japan (BOJ)', jurisdiction: 'Japan', policy_rate: 0.25, headline_cpi: 2.5, core_inflation: 2.1, real_policy_rate: -2.25, balance_sheet_trillion_usd: 4.85, stance: 'Hawkish Normalization', last_decision_date: 'Oct 2026' },
      { institution: "People's Bank of China (PBOC)", jurisdiction: 'China', policy_rate: 3.10, headline_cpi: 0.3, core_inflation: 0.2, real_policy_rate: 2.80, balance_sheet_trillion_usd: 6.20, stance: 'Aggressive Monetary Stimulus', last_decision_date: 'Oct 2026' }
    ],
    commodities: [
      { ticker: 'BRENT', name: 'Brent Crude Oil', category: 'Energy', spot_price: 74.28, unit: '$/bbl', change_24h_pct: 1.42, high_52w: 92.18, low_52w: 68.68, geopolitical_sensitivity: 'Extreme (Middle East / Red Sea Risk Premium)' },
      { ticker: 'WTI', name: 'West Texas Intermediate', category: 'Energy', spot_price: 70.15, unit: '$/bbl', change_24h_pct: 1.35, high_52w: 87.67, low_52w: 65.27, geopolitical_sensitivity: 'High (US Export / Gulf Coast Bottlenecks)' },
      { ticker: 'NG', name: 'Henry Hub Natural Gas', category: 'Energy', spot_price: 2.82, unit: '$/MMBtu', change_24h_pct: -0.65, high_52w: 3.45, low_52w: 1.58, geopolitical_sensitivity: 'High (LNG Feedgas & Winter European Drawdowns)' },
      { ticker: 'XAU', name: 'Gold Spot', category: 'Precious Metals', spot_price: 2684.50, unit: '$/oz', change_24h_pct: 0.82, high_52w: 2790.15, low_52w: 1985.30, geopolitical_sensitivity: 'Critical (Central Bank Reserve Asset)' },
      { ticker: 'HG', name: 'Copper High Grade', category: 'Industrial Metals', spot_price: 4.18, unit: '$/lb', change_24h_pct: -0.32, high_52w: 5.19, low_52w: 3.65, geopolitical_sensitivity: 'High (Electrification / Strategic Mineral Supply)' },
      { ticker: 'ZW', name: 'Wheat Chicago Futures', category: 'Agriculture', spot_price: 552.25, unit: 'cents/bushel', change_24h_pct: 0.55, high_52w: 720.50, low_52w: 525.00, geopolitical_sensitivity: 'Critical (Black Sea Grain Corridor Instability)' }
    ],
    chokepoints: [
      { chokepoint_name: 'Strait of Hormuz', region: 'Persian Gulf', daily_oil_transit_mbpd: 20.5, global_trade_share_pct: 21.0, primary_commodities: ['Crude Oil', 'LNG (Qatar)', 'Condensate'], vulnerability_score: 95, current_alert_status: 'Heightened Surveillance (IRGC Navy Maneuvers)' },
      { chokepoint_name: 'Bab-el-Mandeb & Red Sea', region: 'Southern Red Sea', daily_oil_transit_mbpd: 8.8, global_trade_share_pct: 12.0, primary_commodities: ['Refined Fuels', 'Crude Oil', 'Containerized Goods'], vulnerability_score: 88, current_alert_status: 'Active Attack Zone (Cape Route Divergence Active)' },
      { chokepoint_name: 'Strait of Malacca', region: 'Southeast Asia', daily_oil_transit_mbpd: 16.0, global_trade_share_pct: 30.0, primary_commodities: ['Middle East Crude to Asia', 'Iron Ore', 'Electronics'], vulnerability_score: 75, current_alert_status: 'Normal Maritime Operations' },
      { chokepoint_name: 'Suez Canal', region: 'Egypt', daily_oil_transit_mbpd: 4.5, global_trade_share_pct: 12.0, primary_commodities: ['LNG', 'Oil Products', 'Manufactured Goods'], vulnerability_score: 82, current_alert_status: 'Severe Transit Volume Reduction (-55% vs Baseline)' },
      { chokepoint_name: 'Panama Canal', region: 'Central America', daily_oil_transit_mbpd: 0.9, global_trade_share_pct: 3.5, primary_commodities: ['US Gulf LNG', 'Agricultural Grains', 'LPG'], vulnerability_score: 60, current_alert_status: 'Recovering from Drought Draft Restrictions' }
    ]
  });
}
