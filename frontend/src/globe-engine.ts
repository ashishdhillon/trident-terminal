/**
 * MapLibre GL JS v5 (3D Globe View) + deck.gl v9.1 MapLibreOverlay helper.
 * Loads Submarine Cables, CelesTrak Orbits, and UCDP Conflict Events from /api/geo/layers.
 * Designed as a drop-in upgrade when `maplibre-gl` and `@deck.gl/mapbox` / `@deck.gl/layers`
 * are installed locally (`npm i maplibre-gl @deck.gl/core @deck.gl/layers @deck.gl/mapbox`).
 */

export interface GeoLayersPayload {
  submarine_cables: { name: string; path: [number, number][]; risk_level: string }[];
  satellites: { name: string; norad_id: number; inclination_deg: number; mean_motion: number }[];
  ucdp_conflicts: { id: string; conflict_name: string; country: string; latitude: number; longitude: number; fatalities_best: number }[];
}

export async function fetchTacticalGeoLayers(): Promise<GeoLayersPayload | null> {
  try {
    const res = await fetch('/api/geo/layers');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function buildDeckGlLayerSpecs(layers: GeoLayersPayload) {
  return {
    cablePaths: layers.submarine_cables.map(c => ({
      name: c.name,
      path: c.path,
      color: c.risk_level === 'critical' ? [244, 63, 94] : c.risk_level === 'high' ? [245, 158, 11] : [56, 189, 248]
    })),
    conflictPoints: layers.ucdp_conflicts.map(u => ({
      id: u.id,
      name: `${u.conflict_name} (${u.country})`,
      position: [u.longitude, u.latitude],
      radius: Math.max(40000, Math.min(180000, (u.fatalities_best || 5) * 4500))
    }))
  };
}
