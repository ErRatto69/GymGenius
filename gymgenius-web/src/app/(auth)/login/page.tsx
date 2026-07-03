'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function LoginPage() {
    const router = useRouter();
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameOrEmail || !password) return;

        setIsLoading(true);
        setError(null);

        try {
            await authService.login({ usernameOrEmail, password });
            router.push('/dashboard');
        } catch (err: any) {
            const errorMsg = err.response?.data || 'Credenziali non valide o errore del server.';
            setError(typeof errorMsg === 'string' ? errorMsg : 'Errore di autenticazione.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
            {/* Background Sfuocato Fluido */}
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]"></div>
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]"></div>

            <div className="w-full max-w-md space-y-8 bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/50 shadow-2xl relative z-10">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700/50 mb-4 shadow-inner">
                        {/* Logo Placeholder Moderno */}
                        <svg className="h-9 w-9 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tighter text-slate-100">
                        Gym<span className="text-cyan-400">Genius</span> Web
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Intelligent Performance.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="relative group">
                            <input
                                id="usernameOrEmail"
                                name="usernameOrEmail"
                                type="text"
                                required
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                                placeholder="Username o Email"
                            />
                            <label htmlFor="usernameOrEmail" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                                Username o Email
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3.5 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                                placeholder="Password"
                            />
                            <label htmlFor="password" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                                Password
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-xl bg-cyan-500 px-4 py-3.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifica...
                </span>
                            ) : (
                                'Accedi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}