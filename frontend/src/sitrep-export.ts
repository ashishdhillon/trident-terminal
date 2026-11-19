/**
 * One-Click Institutional PDF SITREP Export
 * Generates a clean, classified-style printable executive brief and opens the
 * browser's native Save-as-PDF print pipeline with zero external dependencies.
 */
export interface SitrepExportPayload {
  threatIndex: number;
  brentProjected: number;
  euGasProjected: number;
  us10yProjected: number;
  closureDays: number;
  cyberSeverity: number;
  sprRelease: number;
  activeSources: string[];
  topKevs: { cve: string; vendor: string; product: string; added: string }[];
}

export function exportExecutiveSitrepPdf(data: SitrepExportPayload): void {
  const now = new Date();
  const stamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const id = `SITREP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.toISOString().slice(11, 16).replace(/:/g, '')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${id} // TRIDENT EXECUTIVE SITREP</title>
  <style>
    @page { size: A4; margin: 18mm; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #0F172A; line-height: 1.5; margin: 0; }
    .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    .header { border-bottom: 2px solid #0F172A; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
    .kicker { font-size: 10px; letter-spacing: 0.12em; color: #0369A1; font-weight: 700; text-transform: uppercase; }
    h1 { font-size: 22px; margin: 4px 0 0; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
    .metric { border-top: 2px solid #CBD5E1; padding-top: 8px; }
    .metric-val { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .metric-lbl { font-size: 10px; color: #475569; text-transform: uppercase; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-top: 22px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th, td { text-align: left; padding: 6px 8px 6px 0; border-bottom: 1px solid #E2E8F0; }
    .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #CBD5E1; font-size: 10px; color: #64748B; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="kicker mono">TRIDENT STRATEGIC C2 // AUTOMATED EXECUTIVE SITREP</div>
      <h1>Multi-Domain Threat Convergence Brief</h1>
    </div>
    <div class="mono" style="text-align:right; font-size:11px;">
      <div><strong>${id}</strong></div>
      <div>${stamp}</div>
      <div>SOURCES: ${data.activeSources.join(', ')}</div>
    </div>
  </div>

  <div class="grid">
    <div class="metric"><div class="metric-lbl mono">Threat Index</div><div class="metric-val mono">${data.threatIndex}/100</div></div>
    <div class="metric"><div class="metric-lbl mono">Projected Brent</div><div class="metric-val mono">$${data.brentProjected.toFixed(2)}</div></div>
    <div class="metric"><div class="metric-lbl mono">EU Gas Storage</div><div class="metric-val mono">${data.euGasProjected.toFixed(1)}%</div></div>
    <div class="metric"><div class="metric-lbl mono">US 10Y Yield</div><div class="metric-val mono">${data.us10yProjected.toFixed(2)}%</div></div>
  </div>

  <h2>Scenario War-Game Parameters</h2>
  <p style="font-size:13px;">
    Deterministic cross-domain sensitivity run modeling a <strong>${data.closureDays}-day</strong> maritime chokepoint closure,
    <strong>${data.cyberSeverity}%</strong> OT/SCADA pipeline disruption severity, and a <strong>${data.sprRelease}M bbl</strong> US SPR emergency release.
  </p>

  <h2>Priority CISA Known Exploited Vulnerabilities (KEV)</h2>
  <table>
    <thead><tr class="mono"><th>CVE ID</th><th>Vendor</th><th>Product</th><th>Date Added</th></tr></thead>
    <tbody>
      ${data.topKevs.slice(0, 6).map(k => `<tr><td class="mono"><strong>${k.cve}</strong></td><td>${k.vendor}</td><td>${k.product}</td><td class="mono">${k.added}</td></tr>`).join('')}
    </tbody>
  </table>

  <div class="footer mono">
    <span>TRIDENT INTELLIGENCE FRAMEWORK v3.0</span>
    <span>OPERATIONAL BRIEF // GENERATED LOCALLY</span>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=720');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}
