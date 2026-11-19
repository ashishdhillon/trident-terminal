#!/usr/bin/env node
/**
 * TRIDENT TERMINAL — Lightweight MCP Server (JSON-RPC 2.0 over stdio)
 * Zero external npm dependencies. Plug into Claude Desktop, Claude Code, or Cursor:
 *   "command": "node", "args": ["/path/to/trident-terminal/mcp/trident-mcp-server.mjs"]
 * Optional env: TRIDENT_API_BASE=https://trident-terminal-smoky.vercel.app
 */

import readline from 'node:readline';

const API_BASE = (process.env.TRIDENT_API_BASE || 'http://127.0.0.1:3200').replace(/\/$/, '');

const TOOLS = [
  {
    name: 'get_threat_convergence',
    description: 'Fetch active cross-domain geopolitical, macro, and cyber convergence signals from Trident Terminal.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_yield_curve_and_buffers',
    description: 'Fetch live FRED US Treasury yield curve spreads and EIA petroleum reserve buffers (SPR & Cushing).',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_cisa_kev_alerts',
    description: 'Fetch live CISA Known Exploited Vulnerabilities (KEV) and state-sponsored APT dossiers.',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'run_wargame_simulation',
    description: 'Run Trident deterministic shock model for chokepoint closure duration, OT cyber severity, and SPR release.',
    inputSchema: {
      type: 'object',
      properties: {
        closure_days: { type: 'number', description: 'Chokepoint closure duration in days (0-90)', default: 45 },
        cyber_severity: { type: 'number', description: 'OT/SCADA cyber disruption severity (0-100)', default: 65 },
        spr_release_mbbl: { type: 'number', description: 'US SPR emergency drawdown in million barrels (0-100)', default: 30 }
      }
    }
  }
];

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${API_BASE}${path}`);
  return await res.json();
}

async function callTool(name, args = {}) {
  if (name === 'get_threat_convergence') return await fetchJson('/api/convergence/signals');
  if (name === 'get_yield_curve_and_buffers') return await fetchJson('/api/macro/all');
  if (name === 'get_cisa_kev_alerts') return await fetchJson('/api/cyber/all');
  if (name === 'run_wargame_simulation') {
    const closure = Math.max(0, Math.min(90, Number(args.closure_days ?? 45)));
    const cyber = Math.max(0, Math.min(100, Number(args.cyber_severity ?? 65)));
    const spr = Math.max(0, Math.min(100, Number(args.spr_release_mbbl ?? 30)));
    const brent = Number((74.28 + closure * 0.42 + cyber * 0.14 - spr * 0.11).toFixed(2));
    const euGasPct = Number(Math.max(12, Math.min(98, 89.2 - closure * 0.34 - cyber * 0.08)).toFixed(1));
    const us10y = Number((4.42 + closure * 0.0055 + cyber * 0.002 - spr * 0.0012).toFixed(2));
    const threatIndex = Math.max(20, Math.min(99, Math.round(58 + closure * 0.38 + cyber * 0.22 - spr * 0.08)));
    return {
      model: 'Trident Deterministic Cross-Domain Sensitivity Engine v2',
      inputs: { closure_days: closure, cyber_severity: cyber, spr_release_mbbl: spr },
      projections: { brent_usd_bbl: brent, eu_gas_storage_pct: euGasPct, us_10y_yield_pct: us10y, threat_convergence_index: threatIndex }
    };
  }
  throw new Error(`Unknown tool: ${name}`);
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', async (line) => {
  if (!line.trim()) return;
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;

  try {
    if (method === 'initialize') {
      send({
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'trident-terminal-mcp', version: '3.0.0' }
        }
      });
    } else if (method === 'tools/list') {
      send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    } else if (method === 'tools/call') {
      const data = await callTool(params?.name, params?.arguments);
      send({
        jsonrpc: '2.0', id,
        result: { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      });
    } else if (id !== undefined) {
      send({ jsonrpc: '2.0', id, result: {} });
    }
  } catch (err) {
    if (id !== undefined) {
      send({ jsonrpc: '2.0', id, error: { code: -32000, message: String(err?.message || err) } });
    }
  }
});
