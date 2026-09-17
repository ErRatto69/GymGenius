'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Le password non coincidono.');
            return;
        }

        if (formData.password.length < 6) {
            setError('La password deve contenere almeno 6 caratteri.');
            return;
        }

        setIsLoading(true);

        try {
            await authService.register({
                username: formData.username.trim(),
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password,
            });

            // Registrazione completata: reindirizza al login
            router.push('/login?registered=true');
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data ||
                'Impossibile completare la registrazione. Riprova.';
            setError(typeof errorMsg === 'string' ? errorMsg : 'Errore durante la registrazione.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
            {/* Background Sfuocato Fluido */}
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-lg space-y-8 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800/50 shadow-2xl relative z-10">
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700/50 mb-4 shadow-inner">
                        <svg className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tighter text-slate-100">
                        Crea il tuo account
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Inizia a monitorare i tuoi allenamenti su GymGenius
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    {/* Nome e Cognome */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                                placeholder="Nome"
                            />
                            <label htmlFor="firstName" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                                Nome
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                                placeholder="Cognome"
                            />
                            <label htmlFor="lastName" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                                Cognome
                            </label>
                        </div>
                    </div>

                    {/* Username */}
                    <div className="relative group">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                            placeholder="Username"
                        />
                        <label htmlFor="username" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                            Username
                        </label>
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                            placeholder="Email"
                        />
                        <label htmlFor="email" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                            Email
                        </label>
                    </div>

                    {/* Password e Conferma Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                                placeholder="Password"
                            />
                            <label htmlFor="password" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                                Password
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full peer rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 placeholder-transparent focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all"
                                placeholder="Conferma Password"
                            />
                            <label htmlFor="confirmPassword" className="absolute left-4 -top-2.5 px-1 bg-slate-900 text-xs font-medium text-cyan-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-cyan-400 peer-focus:text-xs">
                                Conferma
                            </label>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-xl bg-cyan-500 px-4 py-3.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creazione account...
                </span>
                            ) : (
                                'Registrati'
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-slate-400">
                    Hai già un account?{' '}
                    <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
                        Accedi qui
                    </Link>
                </p>
            </div>
        </div>
    );
}