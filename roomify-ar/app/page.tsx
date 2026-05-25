'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from './components/Navbar';
import ProductCard, { Product } from './components/ProductCard';
import Image from "next/image";
import { ALL_PRODUCTS, SELLERS, Seller } from './data';

// Dynamically import ModelViewer (uses WebGL, must be client-only)
const ModelViewer = dynamic(() => import('./components/ModelViewer'), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const STORAGE_KEY = 'roomify_products_v1';

// ─── localStorage helpers ─────────────────────────────────────────────────────
// We only persist serialisable fields (no Blob, no generatingJobId)
interface PersistedProduct {
  id: number;
  name: string;
  price: string;
  sellerId: string;
  image: string;          // may be a blob: URL for newly added products
  imageBase64?: string;   // base64 of the uploaded image (so it survives reload)
  description: string;
  modelUrl?: string;
}

function loadPersistedProducts(): PersistedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePersistedProducts(products: Product[]) {
  const serialisable: PersistedProduct[] = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    sellerId: p.sellerId,
    image: (p as any).imageBase64 ? `data:image/jpeg;base64,${(p as any).imageBase64}` : p.image,
    imageBase64: (p as any).imageBase64,
    description: p.description,
    modelUrl: p.modelUrl,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
}

// Merge ALL_PRODUCTS (hardcoded) with persisted overrides/additions
function mergeProducts(persisted: PersistedProduct[]): Product[] {
  // Start with hardcoded products
  const base: Product[] = ALL_PRODUCTS.map(p => ({ ...p }));

  // Apply persisted modelUrls to hardcoded products
  for (const pp of persisted) {
    const existing = base.find(b => b.id === pp.id);
    if (existing) {
      if (pp.modelUrl) existing.modelUrl = pp.modelUrl;
      if (pp.imageBase64) (existing as any).imageBase64 = pp.imageBase64;
    } else {
      // It's a seller-added product — add it
      base.unshift({
        id: pp.id,
        name: pp.name,
        price: pp.price,
        sellerId: pp.sellerId,
        image: pp.image,
        description: pp.description,
        modelUrl: pp.modelUrl,
      } as Product);
    }
  }
  return base;
}

// ─── Backend helpers ──────────────────────────────────────────────────────────
async function startGeneration(imageBlob: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('files', imageBlob, fileName);

  const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, { method: 'POST', body: formData });
  if (!uploadRes.ok) throw new Error('Upload failed');
  const { upload_id } = await uploadRes.json();

  const genRes = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_id }),
  });
  if (!genRes.ok) throw new Error('Generation start failed');
  const { job_id } = await genRes.json();
  return job_id;
}

async function pollJob(jobId: string): Promise<string> {
  while (true) {
    const res = await fetch(`${BACKEND_URL}/api/job/${jobId}`);
    if (!res.ok) throw new Error('Job poll failed');
    const data = await res.json();
    if (data.status === 'done') return `${BACKEND_URL}${data.model_url}`;
    if (data.status === 'error') throw new Error(data.message || 'Generation failed');
    await new Promise(r => setTimeout(r, 3000));
  }
}

// Convert File to base64 string
async function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── SellerRow ────────────────────────────────────────────────────────────────
const SellerRow = ({ seller, onClick }: { seller: Seller; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col lg:flex-row items-center gap-8 p-6 bg-slate-800/30 border border-white/5 rounded-[3rem] hover:bg-slate-800/60 transition-all duration-500 cursor-pointer hover:border-blue-500/40 mb-8 overflow-hidden shadow-2xl"
  >
    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/5 blur-[100px] group-hover:bg-blue-600/10 transition-all duration-700" />
    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-105">
      <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-blue-500 bg-blue-500/5 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 italic">
        {seller.name.charAt(0)}
      </div>
    </div>
    <div className="flex-1 text-center lg:text-left z-10">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{seller.name}</h3>
        <div className="flex items-center justify-center lg:justify-start gap-1">
          {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
          <span className="ml-2 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Verified 5.0</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mb-6 font-medium">
        Authorized distribution partner specializing in high-fidelity 3D assets and immersive spatial computing experiences.
      </p>
      <div className="flex flex-wrap justify-center lg:justify-start gap-3">
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-md uppercase tracking-[0.2em] border border-blue-500/20">Official Partner</span>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-[0.2em] border border-emerald-500/20">AR Ready</span>
        <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-medium rounded-md italic border border-white/10">{seller.email}</span>
      </div>
    </div>
    <div className="px-10 py-5 bg-white text-black group-hover:bg-blue-600 group-hover:text-white rounded-4xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl group-hover:shadow-blue-600/30 transform group-hover:-translate-x-2">
      Enter Showroom
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use null/default on first render (SSR), then hydrate from localStorage
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<'user' | 'seller'>('user');
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Guest');

  // ── Products state — starts with hardcoded data, merges localStorage after mount
  const [products, setProducts] = useState<Product[]>(() =>
    ALL_PRODUCTS.map(p => ({ ...p }))
  );

  // Hydrate from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    setRole((localStorage.getItem('userRole') as 'user' | 'seller') || 'user');
    setActiveSellerId(localStorage.getItem('activeSellerId'));
    setUserName(localStorage.getItem('userName') || 'Guest');
    setProducts(mergeProducts(loadPersistedProducts()));
    setMounted(true);
  }, []);

  // Persist products to localStorage — but ONLY after mount so we don't
  // overwrite saved data with the blank initial state on first render.
  useEffect(() => {
    if (!mounted) return;
    savePersistedProducts(products);
  }, [products, mounted]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', description: '',
    image: '',          // blob: URL for preview
    imageBlob: null as Blob | null,
    imageFileName: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3D viewer
  const [viewingModel, setViewingModel] = useState<{ url: string; name: string } | null>(null);

  // Error banner
  const [genError, setGenError] = useState<string | null>(null);

  const viewingSellerId = role === 'seller' ? activeSellerId : searchParams.get('seller');
  const filteredProducts = viewingSellerId
    ? products.filter(p => p.sellerId === viewingSellerId)
    : [];
  const currentSeller = SELLERS.find(s => s.id === viewingSellerId);

  // ── Generate 3D (seller) ─────────────────────────────────────────────────
  const handleGenerate3D = async (product: Product) => {
    setGenError(null);
    try {
      let blob: Blob;
      let fileName = 'image.jpg';

      if ((product as any).imageBlob) {
        // Newly added product — blob still in memory
        blob = (product as any).imageBlob;
        fileName = (product as any).imageFileName || 'image.jpg';
      } else if ((product as any).imageBase64) {
        // Reloaded from localStorage — reconstruct blob from base64
        const byteString = atob((product as any).imageBase64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        blob = new Blob([ab], { type: 'image/jpeg' });
        fileName = 'image.jpg';
      } else {
        // Hardcoded product with remote URL — fetch it
        const res = await fetch(product.image);
        blob = await res.blob();
        fileName = 'image.jpg';
      }

      // Mark as generating (transient — not persisted)
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, generatingJobId: 'pending' } : p
      ));

      const jobId = await startGeneration(blob, fileName);

      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, generatingJobId: jobId } : p
      ));

      // Poll in background — when done, save modelUrl (will auto-persist via useEffect)
      pollJob(jobId)
        .then(modelUrl => {
          setProducts(prev => prev.map(p =>
            p.id === product.id ? { ...p, modelUrl, generatingJobId: undefined } : p
          ));
        })
        .catch(err => {
          setGenError(`Generation failed: ${err.message}`);
          setProducts(prev => prev.map(p =>
            p.id === product.id ? { ...p, generatingJobId: undefined } : p
          ));
        });

    } catch (err: any) {
      setGenError(`Error: ${err.message}`);
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, generatingJobId: undefined } : p
      ));
    }
  };

  // ── Launch 3D viewer ─────────────────────────────────────────────────────
  const handleLaunch3D = (product: Product) => {
    if (product.modelUrl) {
      setViewingModel({ url: product.modelUrl, name: product.name });
    }
  };

  // ── Add product ──────────────────────────────────────────────────────────
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert uploaded image to base64 so it survives localStorage round-trips
    let imageBase64: string | undefined;
    let imageSrc = newProduct.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500';

    if (newProduct.imageBlob) {
      imageBase64 = await fileToBase64(newProduct.imageBlob);
      imageSrc = `data:image/jpeg;base64,${imageBase64}`;
    }

    const p: Product = {
      id: Date.now(),
      name: newProduct.name,
      price: newProduct.price.startsWith('$') ? newProduct.price : `$${newProduct.price}`,
      sellerId: activeSellerId || 'unknown',
      image: imageSrc,
      description: newProduct.description,
    };

    // Attach extra fields (not in Product interface but used at runtime)
    (p as any).imageBase64 = imageBase64;
    (p as any).imageBlob = newProduct.imageBlob;   // still useful if generating immediately
    (p as any).imageFileName = newProduct.imageFileName;

    setProducts(prev => [p, ...prev]);
    setNewProduct({ name: '', price: '', description: '', image: '', imageBlob: null, imageFileName: '' });
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-700 text-slate-100 selection:bg-blue-500/30">
      <Navbar
        role={role}
        userName={userName}
        onLogout={() => {
          // Only clear auth keys — preserve product data (modelUrls etc.)
          localStorage.removeItem('userRole');
          localStorage.removeItem('activeSellerId');
          localStorage.removeItem('userName');
          window.location.href = '/';
        }}
      />

      {/* Show skeleton until client hydration is complete */}
      {!mounted ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin w-10 h-10 border-4 border-t-blue-500 border-blue-500/10 rounded-full" />
        </div>
      ) : (<>

      <main className="max-w-7xl mx-auto p-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            {role === 'user' && viewingSellerId && (
              <button
                onClick={() => router.push('/')}
                className="mb-4 text-blue-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Showrooms
              </button>
            )}
            <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
              {viewingSellerId
                ? (role === 'seller' ? 'My Storefront' : currentSeller?.name)
                : 'Explore '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 block md:inline">
                {viewingSellerId ? ' Collection' : 'Partner Showrooms'}
              </span>
            </h1>
          </div>

          {role === 'seller' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              + Add New Listing
            </button>
          )}
        </header>

        {/* Error banner */}
        {genError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium flex items-center justify-between">
            <span>{genError}</span>
            <button onClick={() => setGenError(null)} className="text-red-400 hover:text-white ml-4 text-lg">✕</button>
          </div>
        )}

        {/* Seller info banner */}
        {role === 'seller' && viewingSellerId && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-300 text-xs font-medium flex items-center gap-3">
            <span className="text-blue-400 text-base">💡</span>
            <span>
              Click <strong>Generate 3D</strong> on any product to create a 3D model from its image.
              Once generated, use <strong>View 3D Model</strong> to preview it — and buyers will see a <strong>Launch 3D</strong> button too.
              Models are saved and will persist after logout.
            </span>
          </div>
        )}

        {!viewingSellerId ? (
          <div className="space-y-4">
            {SELLERS.map((s) => (
              <SellerRow key={s.id} seller={s} onClick={() => router.push(`?seller=${s.id}`)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {filteredProducts.length === 0 ? (
              <p className="text-slate-500 col-span-3 text-center py-20 font-medium">No products yet.</p>
            ) : (
              filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  role={role}
                  onViewDetails={setSelectedProduct}
                  onCreate3D={handleGenerate3D}
                  onLaunch3D={handleLaunch3D}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* ── ADD PRODUCT MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center z-[150] p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-lg w-full p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-white mb-8 uppercase italic tracking-tighter">Publish New Asset</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-48 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center cursor-pointer hover:border-blue-500/50 bg-slate-800/30 relative overflow-hidden"
              >
                {newProduct.image
                  ? <Image src={newProduct.image} alt="preview" fill className="object-cover" unoptimized />
                  : (
                    <div className="text-center">
                      <p className="text-slate-400 text-2xl mb-2">📷</p>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Click to Select Image</p>
                    </div>
                  )
                }
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewProduct({
                      ...newProduct,
                      image: URL.createObjectURL(file),
                      imageBlob: file,
                      imageFileName: file.name,
                    });
                  }
                }}
              />
              <input
                required
                className="w-full bg-slate-800/50 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 text-white placeholder-slate-600"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                required
                className="w-full bg-slate-800/50 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 text-white placeholder-slate-600"
                placeholder="Price (e.g. 150)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <textarea
                required
                rows={3}
                className="w-full bg-slate-800/50 border border-white/5 p-5 rounded-2xl outline-none focus:border-blue-500/50 resize-none text-white placeholder-slate-600"
                placeholder="Asset description..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-colors"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAIL MODAL (buyer) ── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-2xl w-full p-2 relative shadow-2xl overflow-hidden group">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-white hover:text-black transition-all"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row gap-8 p-8">
              <div className="w-full md:w-1/2 relative h-80 rounded-3xl overflow-hidden border border-white/5">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-between py-2 text-white">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">{selectedProduct.name}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">{selectedProduct.description}</p>
                  <span className="text-3xl font-black text-blue-400 tracking-tighter">{selectedProduct.price}</span>
                </div>
                {selectedProduct.modelUrl ? (
                  <button
                    onClick={() => { setSelectedProduct(null); handleLaunch3D(selectedProduct); }}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest mt-6 hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
                  >
                    🚀 Launch 3D Model
                  </button>
                ) : (
                  <div className="mt-6 p-4 bg-slate-800/50 rounded-2xl text-center">
                    <p className="text-slate-500 text-xs font-medium">3D model not yet available for this product.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3D MODEL VIEWER ── */}
      {viewingModel && (
        <ModelViewer
          modelUrl={viewingModel.url}
          productName={viewingModel.name}
          onClose={() => setViewingModel(null)}
        />
      )}
      </>)}
    </div>
  );
}

export default function VirtualPlacementApp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-700 flex items-center justify-center text-white">
        Loading…
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
