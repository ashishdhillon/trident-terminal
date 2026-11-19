# Ψ TRIDENT TERMINAL
*Unified Multi-Domain Strategic Intelligence Platform*

[![Rust Core](https://img.shields.io/badge/Core-Rust_1.99-black?style=flat&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![Vite](https://img.shields.io/badge/Frontend-Vite_TypeScript-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Memory](https://img.shields.io/badge/RAM_Footprint-<35MB-emerald?style=flat)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An institutional-grade, multi-domain command & control terminal that fuses **Geopolitics**, **Macroeconomics & Energy Security**, and **Cyber Warfare & State Actors** into a single, cohesive situational awareness interface.

Unlike traditional platforms that require multiple heavy Docker containers (>4 GB RAM), **Trident Terminal** is architected around an ultra-lean **native Rust core (<35 MB RAM)** and a high-density, zero-slop analytical dashboard.

---

## ⚡ The Four Strategic Pillars

1. **⚡ Convergence Matrix (Situation Room)**:
   - Real-time cross-domain signal fusion correlating kinetic escalations, infrastructure cyber pre-positioning, and commodity risk repricing.
2. **🌍 Geopolitics & Kinetic Theater**:
   - Tactical world surface tracking armed conflict zones (UCDP), NOTAM military airspace closures, and naval chokepoint blockades.
3. **📈 Macroeconomics & Resource Security**:
   - Interactive US Treasury Yield Curve (1M to 30Y) with live 10Y-2Y and 10Y-3M spread inversion detection.
   - Strategic Petroleum Reserves (Cushing, OK tank bottom floor, US SPR, EU AGSI+ gas storage %).
   - Central Bank monetary posture matrix (Fed, ECB, BOJ, PBOC) and commodity spot radar.
4. **🛡️ Cyber Warfare & State Threat Actors**:
   - Nation-state APT dossiers (Volt Typhoon, Sandworm, Lazarus Group, Mint Sandstorm) with infrastructure sector mapping.
   - MITRE ATT&CK enterprise tactical heatmap.
   - CISA KEV (Known Exploited Vulnerabilities) live zero-day radar.

---

## 🚀 Quick Start (Local)

Requires **Rust 1.80+** and **Node.js 20+**.

```bash
git clone https://github.com/ashishdhillon/trident-terminal.git
cd trident-terminal

# Launch both Rust core and web terminal:
./run.sh
```

- **Web Terminal**: [http://localhost:3200](http://localhost:3200)
- **Rust API Server**: [http://127.0.0.1:3100](http://127.0.0.1:3100)

### Keyboard Shortcuts
* `1` : Convergence Situation Room
* `2` : Geopolitics & Kinetic Map
* `3` : Macroeconomics & Yield Curves
* `4` : Cyber Warfare & APTs
* `R` : Instant Telemetry Refresh

---

## 🏗️ Architecture

```
trident-terminal/
├── crates/
│   ├── trident-core/        # Data models, SQLite in-memory cache, signal types
│   ├── trident-macro/       # High-speed macro & yield curve computation engine
│   ├── trident-cyber/       # MITRE ATT&CK & CISA KEV cyber threat engine
│   └── trident-server/      # Native Axum HTTP server (<15 MB RAM)
├── frontend/                # High-density Vite + TypeScript dashboard
├── api/                     # Vercel Serverless Edge API endpoints
└── run.sh                   # Unified launcher
```

---

## 🌐 Deploy to Vercel

The project includes serverless edge adapters for instant deployment on Vercel:

```bash
vercel --prod
```

---

## 📄 License

MIT © [Ashish Dhillon](https://github.com/ashishdhillon)
