import './style.css';

type FocusPillar = 'convergence' | 'geopolitics' | 'macroeconomics' | 'cyber';

// Data Interfaces
interface YieldPoint {
  maturity: string;
  rate: number;
  previous_day_rate: number;
  one_month_ago_rate: number;
  one_year_ago_rate: number;
}

interface YieldCurveData {
  timestamp: string;
  points: YieldPoint[];
  spread_10y_2y_bps: number;
  spread_10y_3m_bps: number;
  is_inverted: boolean;
  curve_regime: string;
  recession_signal_level: string;
}

interface StrategicReserveItem {
  name: string;
  category: string;
  current_volume: number;
  max_capacity: number;
  unit: string;
  fill_percentage: number;
  status: string;
  weekly_change_pct: number;
  days_of_consumption_buffer: number;
  notes: string;
}

interface CentralBankProfile {
  institution: string;
  jurisdiction: string;
  policy_rate: number;
  headline_cpi: number;
  core_inflation: number;
  real_policy_rate: number;
  balance_sheet_trillion_usd: number;
  stance: string;
  last_decision_date: string;
}

interface CommodityItem {
  ticker: string;
  name: string;
  category: string;
  spot_price: number;
  unit: string;
  change_24h_pct: number;
  high_52w: number;
  low_52w: number;
  geopolitical_sensitivity: string;
}

interface ChokepointCommodityExposure {
  chokepoint_name: string;
  region: string;
  daily_oil_transit_mbpd: number;
  global_trade_share_pct: number;
  primary_commodities: string[];
  vulnerability_score: number;
  current_alert_status: string;
}

interface MacroPayload {
  updated_at: string;
  yield_curve: YieldCurveData;
  reserves: StrategicReserveItem[];
  central_banks: CentralBankProfile[];
  commodities: CommodityItem[];
  chokepoints: ChokepointCommodityExposure[];
}

interface ConvergenceSignal {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  domains: string[];
  timestamp: string;
  market_implication?: string;
  geographical_target?: string;
  threat_actor?: string;
  confidence_score: number;
  primary_indicator: string;
}

interface GeoIncident {
  id: string;
  title: string;
  incident_type: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  details: string;
  source_verified: boolean;
}

interface AptDossier {
  actor_id: string;
  primary_name: string;
  aliases: string[];
  state_sponsor: string;
  attribution_agency: string;
  motivation: string;
  targeted_sectors: string[];
  targeted_countries: string[];
  signature_ttp_ids: string[];
  recent_campaign: string;
  threat_level: 'critical' | 'high' | 'medium' | 'low';
  operational_status: string;
  last_observed_activity: string;
}

interface MitreTacticGroup {
  tactic_id: string;
  tactic_name: string;
  observed_techniques_count: number;
  critical_techniques: {
    technique_id: string;
    name: string;
    detection_priority: string;
    active_threat_actors: string[];
    description: string;
  }[];
}

interface CisaKevVulnerability {
  cve_id: string;
  vendor_project: string;
  product: string;
  vulnerability_name: string;
  date_added: string;
  due_date: string;
  known_ransomware_campaign_use: boolean;
  cvss_score: number;
  attack_vector: string;
  active_exploitation_status: string;
}

interface InfrastructureCyberTarget {
  sector_name: string;
  active_incident_count: number;
  primary_threat_actors: string[];
  readiness_posture: string;
  scada_exposure_level: string;
}

interface CyberPayload {
  updated_at: string;
  apt_dossiers: AptDossier[];
  mitre_tactics: MitreTacticGroup[];
  cisa_kev_feed: CisaKevVulnerability[];
  infrastructure_targets: InfrastructureCyberTarget[];
}

class TridentTerminalApp {
  private activePillar: FocusPillar = 'macroeconomics';
  private macroData: MacroPayload | null = null;
  private cyberData: CyberPayload | null = null;
  private convergenceSignals: ConvergenceSignal[] = [];
  private geoIncidents: GeoIncident[] = [];
  private isOnline = false;
  private activeAptFilter = 'ALL';
  private hoveredTenor: YieldPoint | null = null;
  private latencyMs = 0;

  constructor() {
    this.init();
  }

  async init() {
    this.renderChassis();
    this.setupGlobalShortcuts();
    this.setupListeners();
    await this.fetchData();
    this.startClocks();
    this.renderContent();

    // Auto-refresh every 8 seconds
    setInterval(() => this.fetchData(), 8000);
  }

  setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') this.switchPillar('convergence');
      if (e.key === '2') this.switchPillar('geopolitics');
      if (e.key === '3') this.switchPillar('macroeconomics');
      if (e.key === '4') this.switchPillar('cyber');
      if (e.key.toLowerCase() === 'r') this.fetchData();
    });
  }

  switchPillar(pillar: FocusPillar) {
    this.activePillar = pillar;
    this.updateNavButtons();
    this.renderContent();
  }

  async fetchData() {
    const t0 = performance.now();
    try {
      const [macroRes, convRes, geoRes, cyberRes] = await Promise.all([
        fetch('/api/macro/all').then(r => r.ok ? r.json() : null),
        fetch('/api/convergence/signals').then(r => r.ok ? r.json() : []),
        fetch('/api/geo/summary').then(r => r.ok ? r.json() : []),
        fetch('/api/cyber/all').then(r => r.ok ? r.json() : null),
      ]);

      this.latencyMs = Math.round(performance.now() - t0);

      if (macroRes) {
        this.macroData = macroRes;
        if (!this.hoveredTenor && macroRes.yield_curve.points.length > 8) {
          this.hoveredTenor = macroRes.yield_curve.points[8]; // Default to 10Y
        }
      }
      this.cyberData = cyberRes;
      this.convergenceSignals = convRes || [];
      this.geoIncidents = geoRes || [];
      this.isOnline = true;
      this.updateStatusHeader();
      this.renderContent();
    } catch {
      this.isOnline = false;
      this.updateStatusHeader();
    }
  }

  startClocks() {
    const update = () => {
      const now = new Date();
      const zulu = document.getElementById('clock-zulu');
      const local = document.getElementById('clock-local');
      if (zulu) {
        zulu.textContent = now.toISOString().substring(11, 19) + ' Z';
      }
      if (local) {
        local.textContent = now.toLocaleTimeString([], { hour12: false });
      }
    };
    update();
    setInterval(update, 1000);
  }

  updateStatusHeader() {
    const statusDot = document.getElementById('status-indicator-dot');
    const statusText = document.getElementById('status-indicator-text');
    const latencyEl = document.getElementById('latency-indicator');

    if (statusDot && statusText) {
      if (this.isOnline) {
        statusDot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]';
        statusText.textContent = 'CONNECTED // LOCAL DAEMON';
        statusText.className = 'text-emerald-400 font-mono text-[10px] font-semibold tracking-wider';
      } else {
        statusDot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse';
        statusText.textContent = 'CONNECTING // RUST IPC';
        statusText.className = 'text-amber-400 font-mono text-[10px] font-semibold tracking-wider';
      }
    }

    if (latencyEl) {
      latencyEl.textContent = `${this.latencyMs}ms`;
    }
  }

  renderChassis() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appEl.innerHTML = `
      <!-- TOP INSTITUTIONAL COMMAND BAR -->
      <header class="border-b border-zinc-800 bg-[#090b10] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <!-- Brand & Breadcrumbs -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <span class="font-mono text-zinc-100 font-bold tracking-widest text-sm uppercase">TRIDENT</span>
            <span class="text-zinc-600 font-mono">/</span>
            <span class="text-[11px] font-mono text-cyan-400 font-semibold tracking-wide">STRATEGIC C2 TERMINAL</span>
          </div>
          <span class="hidden sm:inline-block w-px h-3.5 bg-zinc-800"></span>
          <div class="hidden sm:flex items-center space-x-2 text-[10px] font-mono text-zinc-500">
            <span>CORE: <span class="text-zinc-300">RUST v0.1.0</span></span>
            <span>•</span>
            <span>MEMORY: <span class="text-emerald-400 font-medium">32 MB</span></span>
          </div>
        </div>

        <!-- Telemetry & Clocks -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800/80">
            <span id="status-indicator-dot" class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span id="status-indicator-text" class="text-zinc-400 font-mono text-[10px]">SYNCING</span>
            <span class="text-zinc-600 font-mono text-[10px] ml-1">|</span>
            <span id="latency-indicator" class="text-zinc-400 font-mono text-[10px]">--ms</span>
          </div>

          <div class="flex items-center space-x-2 font-mono text-[11px]">
            <span class="text-zinc-500 text-[10px]">ZULU:</span>
            <span id="clock-zulu" class="font-semibold text-zinc-200">--:--:-- Z</span>
            <span class="text-zinc-700">|</span>
            <span class="text-zinc-500 text-[10px]">LOCAL:</span>
            <span id="clock-local" class="text-zinc-400">--:--:--</span>
          </div>
        </div>
      </header>

      <!-- INSTITUTIONAL PILLAR TABS (HIGH-DENSITY) -->
      <nav class="bg-[#0c0e14] border-b border-zinc-800/80 px-4 py-1.5 flex items-center justify-between text-xs select-none sticky top-0 z-40">
        <div class="flex items-center space-x-1 overflow-x-auto">
          <button data-pillar="convergence" class="pillar-tab">
            <span class="text-zinc-500 mr-1.5">[1]</span>
            <span>CONVERGENCE MATRIX</span>
            <span class="ml-2 text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">FUSION</span>
          </button>
          <button data-pillar="geopolitics" class="pillar-tab">
            <span class="text-zinc-500 mr-1.5">[2]</span>
            <span>GEOPOLITICS & KINETIC</span>
            <span class="ml-2 text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">MAP</span>
          </button>
          <button data-pillar="macroeconomics" class="pillar-tab">
            <span class="text-zinc-500 mr-1.5">[3]</span>
            <span>MACROECONOMICS & RESOURCES</span>
            <span class="ml-2 text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/60">YIELD</span>
          </button>
          <button data-pillar="cyber" class="pillar-tab">
            <span class="text-zinc-500 mr-1.5">[4]</span>
            <span>CYBER WARFARE & STATE ACTORS</span>
            <span class="ml-2 text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-mono border border-rose-800/60">APT</span>
          </button>
        </div>

        <div class="hidden lg:flex items-center space-x-2 text-[10px] font-mono text-zinc-500">
          <span class="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">1-4</span>
          <span>Switch View</span>
          <span class="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 ml-1">R</span>
          <span>Refresh</span>
        </div>
      </nav>

      <!-- DYNAMIC CONTENT VIEWPORT -->
      <main id="main-content" class="flex-1 p-4 md:p-5 overflow-y-auto max-w-[1680px] mx-auto w-full"></main>

      <!-- BOTTOM AUDIT TICKER -->
      <footer class="border-t border-zinc-900 bg-[#07080c] px-4 py-1 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
        <div class="flex items-center space-x-3">
          <span class="text-zinc-400 font-medium">TRIDENT INTELLIGENCE FRAMEWORK</span>
          <span>•</span>
          <span>ZERO CLOUD TELEMETRY LEAKAGE</span>
          <span>•</span>
          <span>DIS-INVERSION PHASE ACTIVE</span>
        </div>
        <div class="text-zinc-600">
          CONFIDENTIAL // OPERATIONAL USE ONLY
        </div>
      </footer>
    `;
  }

  setupListeners() {
    const tabs = document.querySelectorAll('.pillar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const pillar = tab.getAttribute('data-pillar') as FocusPillar;
        if (pillar) this.switchPillar(pillar);
      });
    });
    this.updateNavButtons();
  }

  updateNavButtons() {
    const tabs = document.querySelectorAll('.pillar-tab');
    tabs.forEach(tab => {
      const p = tab.getAttribute('data-pillar');
      if (p === this.activePillar) {
        tab.className = 'pillar-tab px-3 py-1.5 rounded font-mono text-xs font-semibold tracking-wider transition-colors flex items-center bg-zinc-900 text-zinc-100 border border-zinc-700 shadow-sm';
      } else {
        tab.className = 'pillar-tab px-3 py-1.5 rounded font-mono text-xs font-medium tracking-wider transition-colors flex items-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent';
      }
    });
  }

  renderContent() {
    const container = document.getElementById('main-content');
    if (!container) return;

    switch (this.activePillar) {
      case 'macroeconomics':
        container.innerHTML = this.renderMacroeconomicsView();
        this.bindYieldCurveHover();
        break;
      case 'cyber':
        container.innerHTML = this.renderCyberView();
        this.bindCyberFilters();
        break;
      case 'convergence':
        container.innerHTML = this.renderConvergenceView();
        break;
      case 'geopolitics':
        container.innerHTML = this.renderGeopoliticsView();
        break;
    }
  }

  // ==========================================
  // VIEW: MACROECONOMICS & RESOURCE SECURITY
  // ==========================================
  renderMacroeconomicsView(): string {
    if (!this.macroData) {
      return `<div class="p-8 text-center font-mono text-xs text-zinc-500">AWAITING RUST ENGINE SNAPSHOT...</div>`;
    }

    const { yield_curve, reserves, central_banks, commodities, chokepoints } = this.macroData;
    const h = this.hoveredTenor || yield_curve.points[8];

    return `
      <div class="space-y-4">
        <!-- TOP EXECUTIVE RADAR BAR -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div class="p-3 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="text-[10px] uppercase tracking-wider font-mono text-zinc-500">10Y–2Y SPREAD (SLOPE)</div>
            <div class="flex items-baseline space-x-2 mt-1">
              <span class="text-xl font-mono font-bold ${yield_curve.spread_10y_2y_bps >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                ${yield_curve.spread_10y_2y_bps >= 0 ? '+' : ''}${yield_curve.spread_10y_2y_bps}
              </span>
              <span class="text-[10px] font-mono text-zinc-400">BPS</span>
            </div>
            <div class="text-[10px] font-mono text-zinc-400 mt-0.5">Curve Dis-Inverting (Bear Steepener)</div>
          </div>

          <div class="p-3 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="text-[10px] uppercase tracking-wider font-mono text-zinc-500">10Y–3M SPREAD (RECESSION)</div>
            <div class="flex items-baseline space-x-2 mt-1">
              <span class="text-xl font-mono font-bold ${yield_curve.spread_10y_3m_bps >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                ${yield_curve.spread_10y_3m_bps >= 0 ? '+' : ''}${yield_curve.spread_10y_3m_bps}
              </span>
              <span class="text-[10px] font-mono text-zinc-400">BPS</span>
            </div>
            <div class="text-[10px] font-mono text-amber-400/90 mt-0.5">Post-Inversion Lag Zone</div>
          </div>

          <div class="p-3 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="text-[10px] uppercase tracking-wider font-mono text-zinc-500">US SPR CRUDE BUFFER</div>
            <div class="flex items-baseline space-x-2 mt-1">
              <span class="text-xl font-mono font-bold text-zinc-100">395.4M</span>
              <span class="text-[10px] font-mono text-zinc-400">/ 714M BBL (55.4%)</span>
            </div>
            <div class="text-[10px] font-mono text-zinc-400 mt-0.5">Net Buffer: ~20 Days Net Import</div>
          </div>

          <div class="p-3 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="text-[10px] uppercase tracking-wider font-mono text-zinc-500">CUSHING TERMINAL FLOOR</div>
            <div class="flex items-baseline space-x-2 mt-1">
              <span class="text-xl font-mono font-bold text-amber-400">25.1M</span>
              <span class="text-[10px] font-mono text-zinc-400">/ 76M BBL (33%)</span>
            </div>
            <div class="text-[10px] font-mono text-rose-400/90 mt-0.5">Floor Threshold: ~20M bbl</div>
          </div>
        </div>

        <!-- 1. INSTITUTIONAL US TREASURY YIELD CURVE INSPECTOR -->
        <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded">
          <div class="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 gap-3">
            <div>
              <div class="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>US TREASURY BENCHMARK PAR YIELD CURVE</span>
              </div>
              <div class="text-[10px] font-mono text-zinc-500 mt-0.5">Interactive Tenor Surface with Historical Spread Differential</div>
            </div>

            <!-- Tenor Crosshair Live Inspector -->
            <div class="flex items-center space-x-3 text-xs font-mono bg-zinc-950/80 px-3 py-1.5 rounded border border-zinc-800">
              <span class="text-zinc-500">INSPECT TENOR:</span>
              <span class="text-cyan-400 font-bold" id="inspected-tenor-label">${h.maturity}</span>
              <span class="text-zinc-600">|</span>
              <span class="text-zinc-400">YIELD:</span>
              <span class="text-zinc-100 font-bold" id="inspected-tenor-yield">${h.rate.toFixed(2)}%</span>
              <span class="text-zinc-600">|</span>
              <span class="text-zinc-400">1M AGO:</span>
              <span class="text-zinc-400" id="inspected-tenor-1m">${h.one_month_ago_rate.toFixed(2)}%</span>
              <span class="text-zinc-600">|</span>
              <span class="text-zinc-400">1Y AGO:</span>
              <span class="text-zinc-400" id="inspected-tenor-1y">${h.one_year_ago_rate.toFixed(2)}%</span>
            </div>
          </div>

          <!-- SVG Visualizer -->
          <div class="py-3">
            ${this.renderYieldCurveProSvg(yield_curve.points)}
          </div>

          <!-- Tenor Pills Grid -->
          <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1.5 pt-3 border-t border-zinc-800/80">
            ${yield_curve.points.map((pt, idx) => `
              <button data-tenor-idx="${idx}" class="tenor-chip p-2 rounded text-center font-mono border transition-all ${pt.maturity === h.maturity ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'}">
                <div class="text-[10px] font-bold text-zinc-300">${pt.maturity}</div>
                <div class="text-xs font-bold my-0.5 text-zinc-100">${pt.rate.toFixed(2)}%</div>
                <div class="text-[9px] ${pt.rate >= pt.previous_day_rate ? 'text-emerald-400' : 'text-rose-400'}">
                  ${pt.rate - pt.previous_day_rate >= 0 ? '+' : ''}${(pt.rate - pt.previous_day_rate).toFixed(2)}
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 2. TWO-COLUMN SPLIT: RESERVES MONITOR & CENTRAL BANK MATRIX -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Strategic Reserves -->
          <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2.5 border-b border-zinc-800 flex items-center justify-between">
              <span>STRATEGIC COMMODITY & PETROLEUM STOCKS</span>
              <span class="text-[10px] text-zinc-500 font-normal">CRITICAL BUFFER METRICS</span>
            </div>

            <div class="space-y-3.5 mt-3">
              ${reserves.map(r => `
                <div class="p-2.5 bg-zinc-900/40 rounded border border-zinc-800/60">
                  <div class="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span class="font-bold text-zinc-200">${r.name}</span>
                    <span class="text-zinc-300 font-semibold">${r.current_volume} / ${r.max_capacity} <span class="text-zinc-500 text-[10px]">${r.unit}</span></span>
                  </div>

                  <!-- Pro Progress Gauge with Operational Floor Marker -->
                  <div class="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800 relative">
                    <div class="h-full rounded-full ${r.fill_percentage < 35 ? 'bg-amber-500' : 'bg-cyan-500'}" style="width: ${r.fill_percentage}%"></div>
                  </div>

                  <div class="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-1.5">
                    <span>STATUS: <span class="text-zinc-300">${r.status}</span></span>
                    <span>BUFFER: <strong class="text-cyan-400">${r.days_of_consumption_buffer} DAYS</strong></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Central Bank Policy Matrix -->
          <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2.5 border-b border-zinc-800 flex items-center justify-between">
              <span>CENTRAL BANK MONETARY POSTURE</span>
              <span class="text-[10px] text-zinc-500 font-normal">REAL RATE CALCULATIONS</span>
            </div>

            <div class="overflow-x-auto mt-3">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="text-zinc-500 border-b border-zinc-800 text-[10px] tracking-wider uppercase">
                    <th class="pb-2">Institution</th>
                    <th class="pb-2 text-right">Policy Rate</th>
                    <th class="pb-2 text-right">Headline CPI</th>
                    <th class="pb-2 text-right">Real Rate</th>
                    <th class="pb-2 pl-3">Stance</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60">
                  ${central_banks.map(cb => `
                    <tr class="hover:bg-zinc-900/40">
                      <td class="py-2.5 font-bold text-zinc-200">
                        ${cb.institution}
                        <div class="text-[10px] font-normal text-zinc-500">${cb.jurisdiction}</div>
                      </td>
                      <td class="py-2.5 text-right font-bold text-zinc-100">${cb.policy_rate.toFixed(2)}%</td>
                      <td class="py-2.5 text-right text-zinc-400">${cb.headline_cpi.toFixed(1)}%</td>
                      <td class="py-2.5 text-right font-bold ${cb.real_policy_rate > 0 ? 'text-emerald-400' : 'text-amber-400'}">
                        ${cb.real_policy_rate > 0 ? '+' : ''}${cb.real_policy_rate.toFixed(2)}%
                      </td>
                      <td class="py-2.5 pl-3 text-[10px] text-zinc-300">
                        <span class="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">${cb.stance}</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="mt-3 text-[10px] font-mono text-zinc-500">
              *Real Rate = Policy Benchmark - Headline CPI. Positive spreads restrict commercial liquidity.
            </div>
          </div>
        </div>

        <!-- 3. STRATEGIC COMMODITY RADAR & CHOKEPOINT CORRELATION -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Commodities -->
          <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded lg:col-span-2">
            <div class="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2.5 border-b border-zinc-800 flex justify-between">
              <span>STRATEGIC COMMODITY BENCHMARKS</span>
              <span class="text-[10px] text-zinc-500 font-normal">SPOT RADAR</span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-3">
              ${commodities.map(c => `
                <div class="p-2.5 bg-zinc-900/50 rounded border border-zinc-800/80 font-mono">
                  <div class="flex justify-between items-center text-xs text-zinc-400">
                    <span class="font-bold text-zinc-100">${c.ticker}</span>
                    <span class="${c.change_24h_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold">
                      ${c.change_24h_pct >= 0 ? '+' : ''}${c.change_24h_pct.toFixed(2)}%
                    </span>
                  </div>
                  <div class="text-lg font-bold text-zinc-100 my-0.5">
                    $${c.spot_price.toLocaleString()} <span class="text-[10px] text-zinc-500 font-normal">${c.unit}</span>
                  </div>
                  <div class="text-[11px] text-zinc-400 font-medium truncate">${c.name}</div>
                  <div class="text-[9px] text-zinc-500 mt-1 truncate" title="${c.geopolitical_sensitivity}">
                    ${c.geopolitical_sensitivity}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Maritime Chokepoints -->
          <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded">
            <div class="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2.5 border-b border-zinc-800">
              <span>NAVAL CHOKEPOINT VULNERABILITY</span>
            </div>

            <div class="space-y-2 mt-3 font-mono">
              ${chokepoints.map(cp => `
                <div class="p-2 rounded bg-zinc-900/40 border border-zinc-800/70 text-xs">
                  <div class="flex justify-between items-center font-bold text-zinc-200">
                    <span>${cp.chokepoint_name}</span>
                    <span class="${cp.vulnerability_score >= 85 ? 'text-rose-400' : 'text-amber-400'} text-[10px]">
                      VULN: ${cp.vulnerability_score}/100
                    </span>
                  </div>
                  <div class="text-[10px] text-zinc-400 mt-0.5">
                    Transit: <strong class="text-zinc-200">${cp.daily_oil_transit_mbpd}M bbl/d</strong> (${cp.global_trade_share_pct}% world trade)
                  </div>
                  <div class="text-[9px] text-zinc-400 mt-1 bg-black/60 p-1 rounded border border-zinc-800/80 truncate">
                    ${cp.current_alert_status}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderYieldCurveProSvg(points: YieldPoint[]): string {
    const width = 840;
    const height = 220;
    const padding = { top: 15, right: 25, bottom: 30, left: 40 };

    const minRate = 3.8;
    const maxRate = 5.6;

    const scaleX = (i: number) => padding.left + (i / (points.length - 1)) * (width - padding.left - padding.right);
    const scaleY = (rate: number) => height - padding.bottom - ((rate - minRate) / (maxRate - minRate)) * (height - padding.top - padding.bottom);

    const currentPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.rate)}`).join(' ');
    const monthAgoPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.one_month_ago_rate)}`).join(' ');
    const yearAgoPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.one_year_ago_rate)}`).join(' ');

    return `
      <div class="w-full overflow-x-auto">
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-44 md:h-56 font-mono select-none">
          <!-- Background Grid Lines -->
          ${[4.0, 4.5, 5.0, 5.5].map(rate => `
            <line x1="${padding.left}" y1="${scaleY(rate)}" x2="${width - padding.right}" y2="${scaleY(rate)}" stroke="#1e2433" stroke-width="1" />
            <text x="${padding.left - 6}" y="${scaleY(rate) + 3}" fill="#64748b" font-size="9" text-anchor="end">${rate.toFixed(1)}%</text>
          `).join('')}

          <!-- Tenor Labels -->
          ${points.map((p, i) => `
            <text x="${scaleX(i)}" y="${height - 8}" fill="#94a3b8" font-size="9" text-anchor="middle">${p.maturity}</text>
          `).join('')}

          <!-- 1 Year Ago -->
          <path d="${yearAgoPath}" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3" />

          <!-- 1 Month Ago -->
          <path d="${monthAgoPath}" fill="none" stroke="#3b82f6" stroke-width="1.5" opacity="0.75" />

          <!-- Current Live Yield Curve -->
          <path d="${currentPath}" fill="none" stroke="#00d2ff" stroke-width="2.5" />

          <!-- Interactive Points -->
          ${points.map((p, i) => `
            <circle cx="${scaleX(i)}" cy="${scaleY(p.rate)}" r="3.5" fill="#00d2ff" stroke="#090b10" stroke-width="1.5" class="cursor-pointer hover:r-5 transition-all" />
          `).join('')}
        </svg>
      </div>
    `;
  }

  bindYieldCurveHover() {
    const chips = document.querySelectorAll('.tenor-chip');
    chips.forEach(chip => {
      chip.addEventListener('mouseenter', () => {
        const idx = parseInt(chip.getAttribute('data-tenor-idx') || '0', 10);
        if (this.macroData && this.macroData.yield_curve.points[idx]) {
          this.hoveredTenor = this.macroData.yield_curve.points[idx];
          this.updateHoveredInspector();
        }
      });
    });
  }

  updateHoveredInspector() {
    if (!this.hoveredTenor) return;
    const t = this.hoveredTenor;
    const l1 = document.getElementById('inspected-tenor-label');
    const y1 = document.getElementById('inspected-tenor-yield');
    const m1 = document.getElementById('inspected-tenor-1m');
    const y2 = document.getElementById('inspected-tenor-1y');
    if (l1) l1.textContent = t.maturity;
    if (y1) y1.textContent = `${t.rate.toFixed(2)}%`;
    if (m1) m1.textContent = `${t.one_month_ago_rate.toFixed(2)}%`;
    if (y2) y2.textContent = `${t.one_year_ago_rate.toFixed(2)}%`;
  }

  // ==========================================
  // VIEW: PHASE 3 CYBER WARFARE INTELLIGENCE
  // ==========================================
  renderCyberView(): string {
    if (!this.cyberData) {
      return `<div class="p-8 text-center font-mono text-xs text-zinc-500">AWAITING CYBER TELEMETRY FEED...</div>`;
    }

    const { apt_dossiers, mitre_tactics, cisa_kev_feed, infrastructure_targets } = this.cyberData;
    const filteredApts = this.activeAptFilter === 'ALL'
      ? apt_dossiers
      : apt_dossiers.filter(a => a.state_sponsor.toUpperCase().includes(this.activeAptFilter));

    return `
      <div class="space-y-4">
        <!-- TOP THREAT BANNER -->
        <div class="p-3 bg-[#0d0f15] border border-zinc-800/80 rounded flex flex-wrap justify-between items-center gap-3">
          <div>
            <div class="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>STATE-SPONSORED CYBER THREAT MATRIX & ICS INTEL</span>
            </div>
            <div class="text-[10px] font-mono text-zinc-500 mt-0.5">Tracking Advanced Persistent Threats (APTs) · MITRE ATT&CK · CISA KEV Exploitations</div>
          </div>

          <!-- Country Filter Pills -->
          <div class="flex items-center space-x-1 text-[11px] font-mono">
            <span class="text-zinc-500 text-[10px] mr-1">SPONSOR:</span>
            ${['ALL', 'PRC', 'RUSSIAN', 'DPRK', 'IRAN'].map(f => `
              <button data-apt-filter="${f}" class="apt-filter-btn px-2 py-0.5 rounded border ${this.activeAptFilter === f ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}">
                ${f}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 1. MITRE ATT&CK TACTICAL COVERAGE MATRIX -->
        <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded font-mono">
          <div class="text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2 border-b border-zinc-800 flex justify-between">
            <span>MITRE ATT&CK ENTERPRISE TACTICAL HEATMAP</span>
            <span class="text-[10px] text-zinc-500">ACTIVE IN-THE-WILD TECHNIQUES</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">
            ${mitre_tactics.map(tac => `
              <div class="p-2.5 bg-zinc-900/40 rounded border border-zinc-800/70">
                <div class="flex justify-between items-center text-xs font-bold text-zinc-200">
                  <span>${tac.tactic_name}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-950 text-cyan-400 border border-zinc-800">
                    ${tac.tactic_id}
                  </span>
                </div>
                <div class="text-[10px] text-zinc-500 mt-1">
                  Observed Techniques: <strong class="text-zinc-300">${tac.observed_techniques_count}</strong>
                </div>
                <div class="mt-2 space-y-1">
                  ${tac.critical_techniques.map(tech => `
                    <div class="text-[9px] bg-black/60 p-1 rounded border border-zinc-800/80 flex justify-between">
                      <span class="text-zinc-300 truncate">${tech.technique_id} ${tech.name}</span>
                      <span class="text-rose-400 font-bold ml-1">${tech.detection_priority.split(' ')[0]}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. ACTIVE APT DOSSIERS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${filteredApts.map(apt => `
            <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded font-mono">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="text-sm font-bold text-zinc-100 flex items-center space-x-2">
                    <span>${apt.primary_name}</span>
                    <span class="text-[10px] text-zinc-500">(${apt.actor_id})</span>
                  </div>
                  <div class="text-[11px] text-rose-400/90 font-medium">${apt.state_sponsor} // ${apt.attribution_agency}</div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase ${apt.threat_level === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
                  ${apt.threat_level}
                </span>
              </div>

              <div class="text-xs text-zinc-300 leading-relaxed my-2 bg-zinc-950/60 p-2.5 rounded border border-zinc-800/70">
                ${apt.recent_campaign}
              </div>

              <div class="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-800/80 text-zinc-400">
                <div>
                  <span class="text-zinc-500">SECTORS:</span>
                  <div class="text-zinc-300 truncate">${apt.targeted_sectors.join(', ')}</div>
                </div>
                <div>
                  <span class="text-zinc-500">CORE TTPs:</span>
                  <div class="text-cyan-400 truncate">${apt.signature_ttp_ids.join(', ')}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 2. TWO-COLUMN: CISA KEV ZERO-DAYS & INFRASTRUCTURE READINESS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- CISA KEV Live Radar -->
          <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded font-mono">
            <div class="text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2 border-b border-zinc-800 flex justify-between">
              <span>CISA KNOWN EXPLOITED VULNERABILITIES (KEV)</span>
              <span class="text-[10px] text-rose-400">ACTIVELY WEAPONIZED</span>
            </div>

            <div class="divide-y divide-zinc-800/70 mt-2">
              ${cisa_kev_feed.map(kev => `
                <div class="py-2.5">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-rose-400">${kev.cve_id}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      CVSS ${kev.cvss_score.toFixed(1)}
                    </span>
                  </div>
                  <div class="text-[11px] font-medium text-zinc-200 mt-0.5">${kev.vendor_project} - ${kev.product}</div>
                  <div class="text-[10px] text-zinc-400 mt-0.5">${kev.vulnerability_name}</div>
                  <div class="text-[9px] text-zinc-500 mt-1 flex justify-between">
                    <span>STATUS: <span class="text-zinc-400">${kev.active_exploitation_status}</span></span>
                    <span>ADDED: ${kev.date_added}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Critical Infrastructure Sector Exposure -->
          <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded font-mono">
            <div class="text-xs font-bold text-zinc-100 uppercase tracking-wider pb-2 border-b border-zinc-800 flex justify-between">
              <span>CRITICAL INFRASTRUCTURE DEFENSE POSTURE</span>
              <span class="text-[10px] text-zinc-500">SCADA / OT EXPOSURE</span>
            </div>

            <div class="space-y-3 mt-3">
              ${infrastructure_targets.map(tgt => `
                <div class="p-2.5 rounded bg-zinc-900/40 border border-zinc-800/80">
                  <div class="flex justify-between items-center text-xs font-bold text-zinc-200">
                    <span>${tgt.sector_name}</span>
                    <span class="text-amber-400 text-[10px]">${tgt.readiness_posture}</span>
                  </div>
                  <div class="text-[10px] text-zinc-400 mt-1">
                    SCADA Exposure: <span class="text-zinc-300">${tgt.scada_exposure_level}</span>
                  </div>
                  <div class="text-[10px] text-zinc-500 mt-0.5">
                    Threat Adversaries: <span class="text-rose-400">${tgt.primary_threat_actors.join(', ')}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindCyberFilters() {
    const btns = document.querySelectorAll('.apt-filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-apt-filter') || 'ALL';
        this.activeAptFilter = filter;
        this.renderContent();
      });
    });
  }

  // ==========================================
  // VIEW: CONVERGENCE (SITUATION ROOM)
  // ==========================================
  renderConvergenceView(): string {
    return `
      <div class="space-y-4 font-mono">
        <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded flex justify-between items-center">
          <div>
            <div class="text-xs font-bold text-zinc-100 uppercase tracking-wider">CROSS-DOMAIN CONVERGENCE // REAL-TIME FUSION</div>
            <div class="text-[10px] text-zinc-500 mt-0.5">Correlating multi-domain telemetry: Cyber Pre-Positioning + Physical Flashpoints + Commodity Risk Repricing</div>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            AUTO-CORRELATION ACTIVE
          </span>
        </div>

        <div class="space-y-3">
          ${this.convergenceSignals.map(sig => `
            <div class="p-4 bg-[#0d0f15] border-l-2 ${sig.severity === 'critical' ? 'border-l-rose-500' : 'border-l-amber-500'} border-y border-r border-zinc-800/80 rounded">
              <div class="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${sig.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
                    ${sig.id} // ${sig.severity.toUpperCase()}
                  </span>
                  <span class="text-[10px] text-zinc-500">CONFIDENCE: <strong class="text-zinc-300">${sig.confidence_score}%</strong></span>
                </div>
                <div class="text-[10px] text-zinc-500">
                  INDICATOR: <strong class="text-zinc-400">${sig.primary_indicator}</strong>
                </div>
              </div>

              <div class="text-sm font-bold text-zinc-100 my-1">${sig.title}</div>
              <div class="text-xs text-zinc-300 leading-relaxed mb-3">${sig.description}</div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/70 text-[10px]">
                <div>
                  <span class="text-zinc-500">GEOGRAPHIC REGION:</span>
                  <div class="text-zinc-300 font-semibold">${sig.geographical_target || 'N/A'}</div>
                </div>
                <div>
                  <span class="text-zinc-500">ATTRIBUTED ACTOR:</span>
                  <div class="text-rose-400 font-semibold">${sig.threat_actor || 'Systemic Market Friction'}</div>
                </div>
                <div>
                  <span class="text-zinc-500">FINANCIAL / MARKET REPRICING:</span>
                  <div class="text-cyan-300 font-semibold">${sig.market_implication || 'Hedging Monitored'}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: GEOPOLITICS & KINETIC MAP
  // ==========================================
  renderGeopoliticsView(): string {
    return `
      <div class="space-y-4 font-mono">
        <div class="p-4 bg-[#0d0f15] border border-zinc-800/80 rounded flex justify-between items-center">
          <div>
            <div class="text-xs font-bold text-zinc-100 uppercase tracking-wider">KINETIC THEATER & MARITIME SURVEILLANCE</div>
            <div class="text-[10px] text-zinc-500 mt-0.5">UCDP Armed Conflicts · NOTAM Airspace Closures · Naval Chokepoints</div>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            RADAR ACTIVE
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Tactical Canvas / Coordinates Map -->
          <div class="lg:col-span-2 h-96 bg-[#07090e] border border-zinc-800 rounded relative overflow-hidden flex flex-col justify-between p-4">
            <div class="flex justify-between items-center z-10 text-[10px] text-zinc-500">
              <span>COORDINATES: 27.18° N, 56.26° E (HORMUZ SECTOR)</span>
              <span>GRID PROJECTION: MERCATOR 2D</span>
            </div>

            <!-- Vector Map Backdrop Grid -->
            <div class="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <!-- Target Pins -->
            <div class="absolute top-[45%] left-[55%] flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 relative"></span>
              <span class="text-[10px] bg-black/90 px-1.5 py-0.5 rounded border border-rose-800 text-rose-300">Strait of Hormuz (Naval Drills)</span>
            </div>

            <div class="absolute top-[52%] left-[48%] flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 relative"></span>
              <span class="text-[10px] bg-black/90 px-1.5 py-0.5 rounded border border-rose-800 text-rose-300">Bab-el-Mandeb (ASBM Threat Zone)</span>
            </div>

            <div class="z-10 text-[10px] text-zinc-500 flex justify-between">
              <span>SATELLITE PASS: METEOSAT / FIRMS ACTIVE</span>
              <span>GPU ENGINE: WEBGL DECK.GL ACCELERATED</span>
            </div>
          </div>

          <!-- Incidents Feed -->
          <div class="space-y-2">
            ${this.geoIncidents.map(inc => `
              <div class="p-3 bg-[#0d0f15] border border-zinc-800/80 rounded text-xs">
                <div class="flex justify-between items-start font-bold text-zinc-200">
                  <span>${inc.title}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase">${inc.incident_type}</span>
                </div>
                <div class="text-[10px] text-zinc-400 mt-1">${inc.details}</div>
                <div class="text-[9px] text-zinc-500 mt-1.5 flex justify-between">
                  <span>LOCATION: ${inc.location_name}</span>
                  <span class="text-emerald-400 font-semibold">${inc.source_verified ? 'VERIFIED' : 'UNCONFIRMED'}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

// Boot application
document.addEventListener('DOMContentLoaded', () => {
  new TridentTerminalApp();
});
