'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { authService } from '@/services/authService';
import { getHumanErrorMessage } from '@/services/api';
import { useToastStore } from '@/components/ui/Toast';

export default function RegisterPage() {
    const router = useRouter();
    const addToast = useToastStore((state) => state.addToast);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !username.trim() ||
            !email.trim() ||
            password.length < 6
        ) {
            setFormError(
                'Compila tutti i campi richiesti. La password deve contenere almeno 6 caratteri.'
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim(),
                email: email.trim(),
                password,
            });

            addToast('Account registrato. Effettua il login.', 'success');
            router.push('/login');
        } catch (error: unknown) {
            setFormError(getHumanErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-100">
                            NUOVO PROFILO <span className="text-cyan-400">ATLETA</span>
                        </h1>
                        <p className="text-xs text-slate-400">
                            Configura le tue credenziali di accesso
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                            >
                                Nome
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Marco"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                            >
                                Cognome
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Rossi"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="marco_power"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="marco@gymgenius.it"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimo 6 caratteri"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
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
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50 mt-2"
                    >
            <span>
              {isSubmitting ? 'Registrazione in corso...' : 'Completa Registrazione'}
            </span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        Hai già un account?{' '}
                        <Link
                            href="/login"
                            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                        >
                            Torna al login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}