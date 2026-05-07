#!/bin/bash
# Quick start script — runs backend + frontend in parallel

set -e

echo "🚀 Starting 3D Scanner..."

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
  echo "❌ Backend venv not found. Run setup first:"
  echo "   cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
  echo "❌ Frontend node_modules not found. Run setup first:"
  echo "   cd frontend && npm install"
  exit 1
fi

# Check .env
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env not found — copying from .env.example"
  cp backend/.env.example backend/.env
  echo "   Edit backend/.env to add your Meshy API key!"
fi

echo ""
echo "✅ Starting backend on http://127.0.0.1:8000"
echo "✅ Starting frontend on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
(cd backend && source venv/bin/activate && uvicorn app:app --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

# Start frontend in background
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
