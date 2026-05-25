'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SELLERS } from '../data';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const seller = (SELLERS).find(
      (s) => s.email === email && s.password === password
    );

    if (seller) {
      localStorage.setItem('userRole', 'seller');
      localStorage.setItem('activeSellerId', seller.id);
      localStorage.setItem('userName', seller.name);
      router.push('/'); 
    } else {
      setError("Invalid credentials. Try alpha@test.com / password123");
    }
  };

  return (
    // Background uses the same Slate-950 as the dashboard for consistency
    <div className="min-h-screen flex items-center justify-center bg-slate-700 p-6 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/10 relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20">
             <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">Secure Access</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            VIRTUAL <span className="text-blue-500">PLACEMENT</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Welcome back, Seller.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 py-3 rounded-xl font-bold animate-shake">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-800/50 border border-white/5 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="name@company.com"
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-800/50 border border-white/5 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 transform active:scale-[0.98]"
          >
            Sign In to Portal
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center flex flex-col gap-4">
          <Link 
            href="/" 
            onClick={() => {
              // Only clear auth keys — preserve product/model data
              localStorage.removeItem('userRole');
              localStorage.removeItem('activeSellerId');
              localStorage.removeItem('userName');
            }} 
            className="text-white font-bold text-sm hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            Enter as Guest Viewer <span className="text-lg">→</span>
          </Link>
          
          <p className="text-slate-500 text-xs">
            Don&ops,t have an account? 
            <Link href="/signUp" className="text-blue-500 font-bold ml-1 hover:underline">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}