<div align="center">
  <h1>🚀 AI 3D Scanner & Virtual Placement</h1>
  <p><strong>Powered by TripoSR (Local Inference) + React Three Fiber</strong></p>

  <p>
    Upload a single 2D image → Generate a 3D model locally with AI → View and virtually place it in AR. <br/>
    <b>100% Free. No API Keys. Runs entirely on your machine.</b>
  </p>
</div>

<hr />

## 🌟 Overview

Welcome to the **AI 3D Scanner v2**, a comprehensive full-stack application that bridges the gap between 2D photography and 3D augmented reality. Utilizing **TripoSR** (by Stability AI), this project allows users to convert ordinary 2D images into fully realized 3D models (`.glb`) completely locally, without relying on paid third-party APIs. 

Additionally, the project features **Roomify AR** (`virtual_placement`), a dedicated web environment for visualizing and placing these generated 3D assets into virtual spaces.

## ✨ Key Features

- **Local AI 3D Generation**: Generates 3D `.glb` files from 2D images using TripoSR. No expensive cloud APIs (like Meshy or OpenAI) are required.
- **Interactive 3D Viewer**: A Next.js frontend utilizing React Three Fiber to display, rotate, and inspect the generated 3D models.
- **Virtual Placement (AR)**: A separate `roomify-ar` Next.js application designed to virtually place your generated assets into environments.
- **FastAPI Backend**: A lightweight, robust Python backend handling file uploads, thread-pooled AI inference, and `.glb` delivery.
- **Zero-Cost Operation**: Once the initial model weights (~1.7GB) are downloaded, generation is 100% free and offline-capable.

---

## 🏗️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS | Main UI for uploading images and viewing generated models. |
| **3D Rendering** | Three.js, React Three Fiber, Drei | Powerful in-browser 3D rendering for inspecting the `.glb` files. |
| **Backend** | Python, FastAPI, Uvicorn | High-performance async API server handling AI jobs and file serving. |
| **AI Inference** | TripoSR (Stability AI) | State-of-the-art fast 3D reconstruction from a single image. |
| **AR App** | Next.js 16, React 19 | `roomify-ar` module for Virtual Placement capabilities. |

---

## 📂 Project Structure

```text
3d-scanner-v2/
├── backend/                  # FastAPI server & AI Inference
│   ├── app.py                # Main API routes (Upload, Generate, Status)
│   ├── config.py             # Configuration limits & CORS
│   ├── local_triposr.py      # TripoSR inference wrapper
│   ├── TripoSR/              # Core TripoSR model repository
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js UI & 3D Viewer
│   ├── src/app/page.tsx      # Main interface
│   ├── src/components/       # ModelViewer, CameraCapture, etc.
│   └── package.json          # Node dependencies
├── roomify-ar/               # Virtual Placement (AR) Application
│   ├── app/                  # Next.js App Router for AR placement
│   └── package.json          # Node dependencies
└── start.sh                  # One-click startup script
```

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18.x or higher) and `npm`
- **Python** (v3.10 or higher)
- **Git**
- *Optional but recommended:* A dedicated GPU. However, the app is fully configured to run on CPU (taking roughly 2-5 minutes per generation).

---

## 🚀 Installation & Setup

### 1. Backend Setup (FastAPI + TripoSR)
The backend manages the heavy lifting of AI inference. 

```bash
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup (Next.js)
The frontend provides the user interface for uploading images and viewing results.

```bash
cd ../frontend
npm install
```

### 3. Roomify AR Setup (Next.js - Optional)
If you want to use the virtual placement feature.

```bash
cd ../roomify-ar
npm install
```

---

## 🏃‍♂️ Running the Application

### Method 1: Using the Startup Script (Linux/macOS)
We provide a convenient bash script that boots up both the backend and frontend simultaneously.

```bash
# From the root of the project
chmod +x start.sh
./start.sh
```

### Method 2: Manual Startup

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000
```
*API will be available at `http://localhost:8000`*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend will be available at `http://localhost:3000`*

**Terminal 3 (Roomify AR):**
```bash
cd roomify-ar
npm run dev
```
*AR App will be available at `http://localhost:3001` (or next available port)*

---

## 📸 Tips for Best 3D Results

To get the highest quality 3D models from your 2D images, follow these guidelines:
1. **Plain Background:** Use a single object positioned on a solid, highly contrasting background (pure white or black works best).
2. **Angle:** A `3/4 angle` photo (slightly from the side and top) gives the AI better depth perception than a perfectly straight-on shot.
3. **Lighting:** Ensure good, even lighting. Avoid harsh shadows or reflections on the object.
4. **Framing:** The object should fill as much of the frame as possible without being cut off.

---

## ⚠️ Notes & Troubleshooting

- **First Run Download:** The very first time you generate a 3D model, the backend will download the TripoSR model weights (~1.7GB). This will take some time depending on your internet connection. Subsequent generations will be much faster.
- **CPU vs GPU:** If you do not have a dedicated GPU configured with PyTorch, generation will default to CPU. CPU generation typically takes **2 to 5 minutes**. 
- **Environment Variables:** If using `.env` files, ensure you copy `.env.example` to `.env` in the backend. (Note: The `start.sh` script might mention a Meshy API key from an older version, but v2 runs entirely via local TripoSR and **requires no API keys**).

---

## 📜 License
This project is for educational and portfolio purposes. 
TripoSR is released by Stability AI under the MIT License.
