"use client";
import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { uploadImages, generate3D, getJobStatus, modelDownloadUrl } from "@/lib/api";
import CameraCapture from "@/components/CameraCapture";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
      Loading viewer…
    </div>
  ),
});

const POLL_MS = 4000;
type Stage = "idle" | "uploading" | "generating" | "done" | "error";

export default function Home() {
  const [stage, setStage] = useState<Stage>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter((f) => f.type.startsWith("image/")).slice(0, 10);
    if (!arr.length) return;
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
    setStage("idle");
    setGlbUrl(null);
    setErrorMsg("");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!files.length) return;
    setStage("uploading");
    setStatusMsg("Uploading image…");
    setErrorMsg("");

    try {
      const { upload_id } = await uploadImages(files);
      setStage("generating");
      setStatusMsg("Starting TripoSR…");

      const { job_id } = await generate3D(upload_id);

      pollRef.current = setInterval(async () => {
        try {
          const job = await getJobStatus(job_id);
          setStatusMsg(job.message);

          if (job.status === "done" && job.model_url) {
            clearInterval(pollRef.current!);
            setGlbUrl(modelDownloadUrl(job.model_url));
            setStage("done");
          } else if (job.status === "error") {
            clearInterval(pollRef.current!);
            throw new Error(job.message);
          }
        } catch (err: unknown) {
          clearInterval(pollRef.current!);
          setErrorMsg(err instanceof Error ? err.message : String(err));
          setStage("error");
        }
      }, POLL_MS);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStage("error");
    }
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStage("idle"); setFiles([]); setPreviews([]);
    setStatusMsg(""); setGlbUrl(null); setErrorMsg("");
  };

  const isWorking = stage === "uploading" || stage === "generating";

  return (
    <>
      {showCamera && (
        <CameraCapture
          onCapture={(f) => { setShowCamera(false); handleFiles([f]); }}
          onClose={() => setShowCamera(false)}
        />
      )}
      <main className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            AI 3D Scanner
          </h1>
          <p className="text-slate-400 text-lg">Upload a photo → get a 3D model</p>
          <p className="text-slate-500 text-sm mt-1">Powered by TripoSR — runs locally, 100% free</p>
        </div>

        {stage !== "done" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => setShowCamera(true)}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl
                           bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40
                           hover:border-indigo-400 text-slate-300 hover:text-white transition-all">
                <span className="text-3xl">📷</span>
                <span className="font-medium text-sm">Take a Photo</span>
                <span className="text-xs text-slate-400">Use your camera</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl
                           bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600
                           hover:border-slate-500 text-slate-300 hover:text-white transition-all">
                <span className="text-3xl">🖼️</span>
                <span className="font-medium text-sm">Upload Photo</span>
                <span className="text-xs text-slate-400">JPG / PNG from device</span>
              </button>
            </div>

            <div className={`drop-zone mb-6 ${dragOver ? "drag-over" : ""}`}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              {previews.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">or drag & drop your photo here</p>
              ) : (
                <div className="flex flex-wrap gap-3 justify-center">
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt={`preview ${i + 1}`}
                      className="h-28 w-28 object-cover rounded-xl border border-indigo-500/30 shadow" />
                  ))}
                  <p className="w-full text-sm text-slate-400 mt-1 text-center">
                    {files.length} image{files.length > 1 ? "s" : ""} ·{" "}
                    <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="underline hover:text-slate-200">change</button>
                    {" or "}
                    <button onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}
                      className="underline hover:text-slate-200">retake</button>
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {files.length > 0 && (stage === "idle" || stage === "error") && (
          <button onClick={handleGenerate}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600
                       hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg
                       shadow-lg shadow-indigo-500/20 transition-all mb-6">
            ✦ Generate 3D Model
          </button>
        )}

        {stage === "error" && errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">
            <strong>Error:</strong> {errorMsg}
            <button onClick={reset} className="ml-4 underline text-red-400 hover:text-red-300">Try again</button>
          </div>
        )}

        {isWorking && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-800 border border-slate-700">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-300 text-sm">{statusMsg}</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              TripoSR runs locally — first run takes 2-5 min on CPU. Do not close this tab.
            </p>
          </div>
        )}

        {stage === "done" && glbUrl && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Your 3D Model</h2>
              <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-200 underline">← New scan</button>
            </div>
            <ModelViewer modelUrl={glbUrl} />
            <a href={glbUrl} download="model.glb"
              className="flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">
              ↓ Download GLB
            </a>
            <p className="text-xs text-slate-500 text-center">Mouse: rotate · Scroll: zoom · Right-click: pan</p>
          </div>
        )}

        {stage === "idle" && files.length === 0 && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "📸", title: "1. Capture or Upload", desc: "Use your camera or upload a photo of any object" },
              { icon: "⚡", title: "2. Local AI Inference", desc: "TripoSR runs on your machine — no API key, no cost" },
              { icon: "📦", title: "3. Download GLB", desc: "Ready for Blender, Unity, or any 3D software" },
            ].map((s) => (
              <div key={s.title} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-slate-200 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
