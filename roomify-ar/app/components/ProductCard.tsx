"use client";
import React from 'react';
import Image from "next/image";

export interface Product {
  id: number;
  name: string;
  price: string;
  sellerId: string;
  image: string;
  description: string;
  modelUrl?: string;        // set after 3D generation — persisted to localStorage
  generatingJobId?: string; // transient: only lives in memory while generating
}

interface ProductCardProps {
  product: Product;
  role: 'user' | 'seller';
  onViewDetails: (product: Product) => void;
  onCreate3D: (product: Product) => void;
  onLaunch3D: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  role,
  onViewDetails,
  onCreate3D,
  onLaunch3D,
}) => {
  const isGenerating = !!product.generatingJobId;
  const hasModel = !!product.modelUrl;

  return (
    <div className="group relative bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-500 shadow-2xl">

      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={product.image.startsWith('blob:')}
        />
        {/* Status Badge */}
        {hasModel && !isGenerating && (
          <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
            3D Ready
          </div>
        )}
        {isGenerating && (
          <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-blue-500/90 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
            <span className="animate-spin inline-block w-2 h-2 border border-white border-t-transparent rounded-full" />
            Generating…
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 relative">
        <div className="mb-4">
          <h3 className="font-black text-xl text-white tracking-tight group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${hasModel ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
              {hasModel ? '3D Model Available' : isGenerating ? 'Generating 3D…' : 'No 3D yet'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4">
          {/* Price */}
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price</span>
            <span className="text-white font-black text-xl tracking-tighter">{product.price}</span>
          </div>

          {/* Action Buttons */}
          {role === 'user' ? (
            /* ── BUYER BUTTONS ── */
            <div className="flex flex-col gap-2 flex-1">
              <button
                onClick={() => onViewDetails(product)}
                className="w-full bg-white/5 hover:bg-blue-600 text-white text-xs font-bold px-4 py-3 rounded-2xl border border-white/10 hover:border-transparent transition-all duration-300"
              >
                View Details
              </button>
              {hasModel && (
                <button
                  onClick={() => onLaunch3D(product)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  🚀 Launch 3D
                </button>
              )}
            </div>
          ) : (
            /* ── SELLER BUTTONS ── */
            <div className="flex flex-col gap-2 flex-1">
              {/* Generate / Regenerate button */}
              <button
                onClick={() => onCreate3D(product)}
                disabled={isGenerating}
                className={`w-full text-white text-xs font-bold px-4 py-3 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 ${
                  isGenerating
                    ? 'bg-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                {isGenerating ? 'Generating…' : hasModel ? 'Regenerate 3D' : 'Generate 3D'}
              </button>

              {/* View 3D button — only shown when model exists */}
              {hasModel && (
                <button
                  onClick={() => onLaunch3D(product)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  👁 View 3D Model
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </div>
  );
};

export default ProductCard;
