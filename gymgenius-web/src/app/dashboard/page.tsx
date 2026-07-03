'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-cyan-500/30">
            {/* Navbar */}
            <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            <span className="text-lg font-black tracking-tighter">GYM<span className="text-cyan-400">GENIUS</span></span>
                        </div>

                        {/* Menu Utente Dropdown Interattivo */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 focus:outline-none bg-slate-900 rounded-full p-1 pr-3 border border-slate-800 hover:border-slate-700 transition-all"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <span className="text-xs font-semibold text-slate-300 hidden sm:inline">{user.firstName}</span>
                                <svg className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu Fluido */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-150 z-50">
                                    <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                                        <p className="text-xs font-semibold text-slate-200">{user.firstName} {user.lastName}</p>
                                        <p className="text-[10px] text-slate-500 truncate">@{user.username}</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); router.push('/dashboard/settings'); }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        Impostazioni
                                    </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); logout(); }}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenuto principale pulito */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
                <div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Pannello di Controllo</h1>
                    <p className="text-xs text-slate-400 mt-1">Monitoraggio e configurazione macroclicli attivi.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Card Schede */}
                    <div onClick={() => router.push('/dashboard/splits')} className="group bg-slate-900/40 border border-slate-900 p-6 rounded-2xl hover:border-slate-800 hover:bg-slate-900/80 transition-all cursor-pointer">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/10">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-200">Routine & Programmi</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Gestione completa dei microcicli di allenamento personalizzati.</p>
                    </div>

                    {/* Card AI */}
                    <div className="group bg-slate-900/20 border border-slate-950 p-6 rounded-2xl opacity-60">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/10">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-300">Generatore AI</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Algoritmo Gemini per l'ottimizzazione del volume (Disattivato).</p>
                    </div>
                </div>
            </main>
        </div>
    );
}