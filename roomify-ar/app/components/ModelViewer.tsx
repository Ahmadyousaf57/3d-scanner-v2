/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — Three.js JSX intrinsics (ambientLight, primitive, etc.) are
// registered by @react-three/fiber at runtime. TypeScript can't always resolve
// the global JSX augmentation in Next.js — suppressing here is safe.
'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

// Loading spinner shown inside the canvas while the GLB loads
function Loader() {
  return null; // Canvas handles its own loading state
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <Center>
      <primitive ref={ref} object={scene} dispose={null} />
    </Center>
  );
}

interface ModelViewerProps {
  modelUrl: string;
  onClose: () => void;
  productName: string;
}

export default function ModelViewer({ modelUrl, onClose, productName }: ModelViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-4">
        <div>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">3D Model Preview</p>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{productName}</h2>
        </div>
        <button
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-white hover:text-black transition-all text-lg font-bold"
        >
          ✕
        </button>
      </div>

      {/* Canvas container */}
      <div className="relative w-full max-w-3xl h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900">
            <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-500/10 rounded-full mb-4" />
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">
              Loading 3D Model…
            </p>
          </div>
        )}

        <Canvas
          camera={{ position: [0, 1.5, 4], fov: 45 }}
          onCreated={() => setIsLoading(false)}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[5, 8, 5]} intensity={2} castShadow />
          <directionalLight position={[-5, 2, -5]} intensity={0.5} />

          <Suspense fallback={<Loader />}>
            <Model url={modelUrl} />
            <Environment preset="apartment" />
          </Suspense>

          <OrbitControls
            enablePan={false}
            minDistance={1}
            maxDistance={10}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="mt-4 flex items-center gap-6 text-slate-500 text-xs font-medium">
        <span>🖱 Drag to rotate</span>
        <span>🔍 Scroll to zoom</span>
      </div>
    </div>
  );
}
