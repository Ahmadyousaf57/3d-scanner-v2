'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {
    role: 'user' | 'seller';
    userName: string;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, userName, onLogout }) => {
    // Agar role 'user' hai aur userName 'Guest' hai, iska matlab user logged in nahi hai
    const isLoggedIn = userName !== 'Guest' && userName !== '';

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-slate-700/95 backdrop-blur-lg shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                
                {/* Logo Section */}
                <Link href="/" className="flex items-center group cursor-pointer">
                    <div className="p-1.5 rounded-xl transition-transform duration-300 group-hover:rotate-6">
                        <Image src="/logo2.png" alt="logo" width={100} height={100} priority />
                    </div>
                    <div className="flex flex-col">
                        <span className="hidden md:block font-black text-xl leading-none tracking-tight text-white uppercase">
                            ROOMIFY <span className="text-blue-400 font-medium">AR</span>
                        </span>
                    </div>
                </Link>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-6">
                    
                    {!isLoggedIn ? (
                        /* Login Button - Sirf tab dikhega jab user login na ho */
                        <Link 
                            href="/signIn"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            Login
                        </Link>
                    ) : (
                        /* User Profile & Logout - Jab user login ho */
                        <div className="flex items-center gap-6 pl-6 border-l border-white/10">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                    {role === 'seller' ? 'Partner Account' : 'Welcome'}
                                </span>
                                <span className="text-sm font-semibold text-white">{userName}</span>
                            </div>
                            
                            {/* Avatar or Dashboard Link */}
                            <div className="relative group">
                                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl ring-2 ring-white/10 group-hover:ring-blue-400/50 transition-all">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <button 
                                onClick={onLogout} 
                                className="bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;