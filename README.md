# AI 3D Scanner — Powered by TripoSR

Upload a photo → local AI generates a 3D model → view & download GLB.
**100% free. No API key. Runs on your machine.**

## Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind + React Three Fiber
- **Backend**: FastAPI (Python)
- **3D AI**: TripoSR by Stability AI (runs locally)

## Project Structure
```
3d-scanner-v2/
├── backend/
│   ├── app.py              # FastAPI server
│   ├── config.py           # Configuration
│   ├── local_triposr.py    # TripoSR inference
│   ├── TripoSR/            # TripoSR model code
│   ├── requirements.txt
│   └── .env
└── frontend/
    └── src/
        ├── app/page.tsx         # Main UI
        ├── components/
        │   ├── ModelViewer.tsx  # 3D viewer
        │   └── CameraCapture.tsx# Camera modal
        └── lib/api.ts           # API client
```

## Setup & Run

### Backend
```bash
cd 3d-scanner-v2/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd 3d-scanner-v2/frontend
npm install
npm run dev
```

Open **http://localhost:3000**

> First generation downloads the model weights (~1.7GB) and takes 2-5 min on CPU.
> Subsequent generations are faster as the model stays loaded in RAM.

## Tips for Best Results
- Use a single object on a plain/white background
- 3/4 angle photo gives better depth than straight front-on
- Good even lighting, no harsh shadows
- Object should fill most of the frame
