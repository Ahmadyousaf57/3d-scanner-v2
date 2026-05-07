"use client";
import { useRef, useState, useEffect, useCallback } from "react";

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [captured, setCaptured] = useState<string | null>(null); // preview data URL
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setError("");
    setCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setError("No camera found on this device.");
      } else {
        setError(`Camera error: ${msg}`);
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
  };

  const retake = () => {
    setCaptured(null);
  };

  const confirm = () => {
    if (!captured) return;
    // Convert data URL to File
    const arr = captured.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    const file = new File([u8arr], `capture_${Date.now()}.jpg`, { type: mime });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(file);
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">📸 Take a Photo</h2>
          <button
            onClick={() => {
              streamRef.current?.getTracks().forEach((t) => t.stop());
              onClose();
            }}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Camera / Preview */}
        <div className="relative bg-black aspect-video">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="text-4xl">📷</span>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
              >
                Retry
              </button>
            </div>
          ) : captured ? (
            // Show captured photo preview
            <img src={captured} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            // Live camera feed
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Flip camera button (top-right) */}
          {!captured && !error && (
            <button
              onClick={flipCamera}
              title="Flip camera"
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white
                         rounded-full w-10 h-10 flex items-center justify-center text-lg
                         transition-colors"
            >
              🔄
            </button>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex gap-3 p-4">
          {!captured ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300
                           hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capture}
                disabled={!!error}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                           disabled:opacity-40 text-white text-sm font-semibold
                           transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">📸</span> Capture
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300
                           hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                ↩ Retake
              </button>
              <button
                onClick={confirm}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500
                           text-white text-sm font-semibold transition-colors
                           flex items-center justify-center gap-2"
              >
                ✓ Use this photo
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-slate-500 text-center pb-4 px-4">
          Tip: Place the object on a plain background with good lighting for best results
        </p>
      </div>
    </div>
  );
}
