'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 1. Clear every field
    setFormData({ name: '', email: '', password: '', company: '' });

    // 2. Push to Sign In page
    router.push('/signIn');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-700 p-6 relative overflow-hidden">
      
      {/* Background radial glow to match the theme */}
      <div className="absolute top-0 right-0 w-150 h-150 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] shadow-2xl p-10 border border-white/5 relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-white">
            JOIN <span className="text-blue-500 bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">Virtual PLACEMENT</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Start showcasing your 3D assets today.</p>
        </div>

        <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
            <input 
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-800/40 border border-white/5 px-5 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="John Doe"
              required 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Work Email</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-800/40 border border-white/5 px-5 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="john@company.com"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Company</label>
            <input 
              name="company"
              type="text" 
              value={formData.company}
              onChange={handleChange}
              className="w-full bg-slate-800/40 border border-white/5 px-5 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="Design Studio"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Password</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-800/40 border border-white/5 px-5 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="md:col-span-2 mt-4 w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Seller Account'}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs">
            Already have a portal account? 
            <Link href="/signIn" className="text-blue-500 font-bold ml-1 hover:text-blue-400 transition-colors">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}