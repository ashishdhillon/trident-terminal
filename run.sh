#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Ensure Rust binary is built
if [ ! -f "$DIR/target/debug/trident-server" ]; then
    echo "⚡ Building Trident Rust core server..."
    cargo build -p trident-server
fi

case "$1" in
  backend)
    echo "⚡ Starting Trident Rust Core on http://127.0.0.1:3100..."
    exec "$DIR/target/debug/trident-server"
    ;;
  frontend)
    echo "⚡ Starting Trident Web Interface on http://localhost:3200..."
    cd "$DIR/frontend"
    exec npm run dev
    ;;
  *)
    echo "=========================================================="
    echo "Ψ TRIDENT TERMINAL // Multi-Domain Strategic Intelligence"
    echo "=========================================================="
    echo "⚡ Starting Rust Core Engine on http://127.0.0.1:3100..."
    "$DIR/target/debug/trident-server" &
    BACKEND_PID=$!

    echo "⚡ Starting Web Interface on http://localhost:3200..."
    cd "$DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!

    cleanup() {
        echo ""
        echo "🛑 Shutting down Trident Terminal..."
        kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
        exit 0
    }

    trap cleanup INT TERM
    wait
    ;;
esac
