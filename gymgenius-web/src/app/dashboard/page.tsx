'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Layers,
    Cpu,
    Settings,
    Plus,
    Calendar,
    ArrowUpRight,
    Activity,
} from 'lucide-react';
import { workoutService } from '@/services/workoutService';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);

    const { data: splits = [], isLoading } = useQuery({
        queryKey: ['splits'],
        queryFn: workoutService.getSplits,
    });

    const totalSplits = splits.length;
    const totalWorkoutDays = splits.reduce(
        (acc, item) => acc + (item.totalWorkouts || 0),
        0
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                        PANNELLO OPERATIVO
                    </p>
                    <h1 className="text-2xl font-bold text-slate-100 mt-1">
                        {user?.firstName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.username}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/splits"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Gestisci Schede</span>
                    </Link>
                </div>
            </div>

            {/* Statistiche rapide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">
              Schede Attive
            </span>
                        <Layers className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="text-3xl font-bold font-mono text-slate-100 mt-3">
                        {isLoading ? '—' : totalSplits}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Programmi configurati a sistema
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">
              Sessioni Totali
            </span>
                        <Calendar className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold font-mono text-slate-100 mt-3">
                        {isLoading ? '—' : totalWorkoutDays}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Giorni di allenamento strutturati
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">
              Motore AI
            </span>
                        <Activity className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="text-lg font-bold text-emerald-400 mt-3">PRONTO</p>
                    <p className="text-xs text-slate-500 mt-2">
                        Simulatore microcicli attivo
                    </p>
                </div>
            </div>

            {/* Moduli rapidi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/dashboard/splits"
                    className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 p-6 transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                            <Layers className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            Archivio Schede (Splits)
                        </h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Crea e modifica le tue programmazioni, organizza i giorni di
                            allenamento, gli esercizi, i carichi e i recuperi.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-6">
                        <span>Apri programmazione</span>
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </Link>

                <Link
                    href="/dashboard/ai-generator"
                    className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-6 transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                            <Cpu className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                            Generatore Schede IA
                        </h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Configura split, frequenza settimanale e target ipertrofico o di
                            forza per generare ed esportare una scheda strutturata.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-6">
                        <span>Configura parametri</span>
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </Link>

                <Link
                    href="/dashboard/settings"
                    className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 p-6 transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                            <Settings className="h-5 w-5 text-slate-300" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
                            Profilo & Attrezzatura
                        </h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Aggiorna obiettivi fisici, attrezzatura disponibile, infortuni
                            pregressi, preferenze alimentari e lingua API.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 mt-6">
                        <span>Modifica profilo</span>
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </Link>
            </div>

            {/* Ultime schede create */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                        Schede Recenti
                    </h2>
                    <Link
                        href="/dashboard/splits"
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                        Vedi tutte
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map((skeleton) => (
                            <div
                                key={skeleton}
                                className="h-16 rounded-xl bg-slate-950/60 border border-slate-800 animate-pulse"
                            />
                        ))}
                    </div>
                ) : splits.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                        <p className="text-xs text-slate-400">
                            Nessuna scheda presente in archivio.
                        </p>
                        <Link
                            href="/dashboard/splits"
                            className="inline-block mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                            + Crea la prima scheda
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {splits.slice(0, 4).map((split) => (
                            <Link
                                key={split.id}
                                href={`/dashboard/splits/${split.id}`}
                                className="flex items-center justify-between py-3.5 hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">
                                        {split.name}
                                    </p>
                                    <p className="text-xs text-slate-400 line-clamp-1">
                                        {split.description || 'Nessuna nota descrittiva'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
                    {split.totalWorkouts} gg
                  </span>
                                    <ArrowUpRight className="h-4 w-4 text-slate-500" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}