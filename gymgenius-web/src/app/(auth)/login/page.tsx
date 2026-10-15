'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Lock, User } from 'lucide-react';
import { authService } from '@/services/authService';
import { getHumanErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/components/ui/Toast';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const addToast = useToastStore((state) => state.addToast);

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!usernameOrEmail.trim() || !password) {
            setFormError('Inserisci username/email e password per accedere.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authService.login({
                usernameOrEmail: usernameOrEmail.trim(),
                password,
            });
            setAuth(response);
            addToast(`Accesso effettuato: ${response.username}`, 'success');
            router.replace('/dashboard');
        } catch (error: unknown) {
            setFormError(getHumanErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-100">
                            GYM<span className="text-cyan-400">GENIUS</span>
                        </h1>
                        <p className="text-xs text-slate-400">
                            Autenticazione piattaforma atleti
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label
                            htmlFor="usernameOrEmail"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                        >
                            Username o Email
                        </label>
                        <div className="relative">
                            <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                id="usernameOrEmail"
                                type="text"
                                autoComplete="username"
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                placeholder="atleta@dominio.it"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    </div>

                    {formError && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 leading-relaxed">
                            {formError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50"
                    >
                        <span>{isSubmitting ? 'Verifica credenziali...' : 'Accedi'}</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        Non hai ancora un profilo?{' '}
                        <Link
                            href="/register"
                            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                        >
                            Crea un account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}