# Trident Terminal v3.0 — Quick Start & Upgrade Guide

## 1. Web & Vercel Deployment (Live FRED + EIA v2 + NASA FIRMS + CISA KEV + CelesTrak + UCDP)
1. Copy `.env.example` to `.env.local` (or add the keys in Vercel Project Settings).
2. Run locally:
   ```bash
   cd frontend && npm install && npm run dev
   ```
3. Optional: install MapLibre GL JS & deck.gl for full WebGL vector tiles on Tab 2:
   ```bash
   cd frontend && npm install maplibre-gl @deck.gl/core @deck.gl/layers @deck.gl/mapbox
   ```

## 2. Native macOS Menu-Bar App (Tauri v2)
Requires Rust (`rustup`) and `@tauri-apps/cli`:
```bash
cargo install tauri-cli --version "^2"
cd src-tauri && cargo tauri dev
# Build standalone Spotlight .app & DMG:
cargo tauri build
```

## 3. Register the Trident MCP Server (Claude Code / Claude Desktop / Cursor)
Add this entry to your MCP config (`claude_desktop_config.json` or `.mcp.json`):
```json
{
  "mcpServers": {
    "trident-terminal": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/trident-terminal/mcp/trident-mcp-server.mjs"],
      "env": {
        "TRIDENT_API_BASE": "https://trident-terminal-smoky.vercel.app"
      }
    }
  }
}
```

## 4. Test Alert Webhooks (Discord / Slack / Telegram)
```bash
curl -X POST http://localhost:3200/api/alerts/webhook \
  -H "Content-Type: application/json" \
  -d '{"threat_index":89,"threshold":85,"title":"Hormuz Chokepoint Escalation"}'
```
