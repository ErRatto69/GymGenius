'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { workoutService } from '@/services/workoutService';
import { SplitSummary } from '@/types/workouts';

export default function SplitsPage() {
    const router = useRouter();
    const [splits, setSplits] = useState<SplitSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modale Creazione
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSplitName, setNewSplitName] = useState('');
    const [newSplitDesc, setNewSplitDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Modale Eliminazione
    const [splitToDelete, setSplitToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Notifica Toast
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchSplits = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await workoutService.getSplits();
            setSplits(data || []);
        } catch {
            setSplits([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSplits();
    }, [fetchSplits]);

    const handleCreateSplit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSplitName.trim()) return;

        setIsSubmitting(true);
        setModalError(null);

        try {
            await workoutService.createSplit({
                name: newSplitName.trim(),
                description: newSplitDesc.trim() || undefined,
            });

            setNewSplitName('');
            setNewSplitDesc('');
            setIsCreateModalOpen(false);
            showToast('success', 'Scheda creata con successo!');
            fetchSplits();
        } catch (err: any) {
            // Messaggio chiaro per l'utente, senza codici d'errore tecnici
            let humanMessage = 'Non siamo riusciti a salvare la scheda. Controlla la connessione o riprova tra poco.';

            if (err.response?.data) {
                if (typeof err.response.data === 'string' && !err.response.data.includes('<html')) {
                    humanMessage = err.response.data;
                } else if (err.response.data.message) {
                    humanMessage = err.response.data.message;
                } else if (err.response.data.errors?.Name?.[0]) {
                    humanMessage = 'Il nome inserito per la scheda non è valido.';
                }
            }

            setModalError(humanMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteSplit = async () => {
        if (!splitToDelete) return;

        setIsDeleting(true);
        try {
            await workoutService.deleteSplit(splitToDelete.id);
            setSplits((prev) => prev.filter((s) => s.id !== splitToDelete.id));
            showToast('success', `Scheda "${splitToDelete.name}" eliminata.`);
            setSplitToDelete(null);
        } catch {
            showToast('error', 'Impossibile eliminare la scheda al momento. Riprova più tardi.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10 relative">
            {/* Toast Notifica Fluttuante */}
            {notification && (
                <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
                    <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold ${
                            notification.type === 'success'
                                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                                : 'bg-red-950/90 border-red-500/50 text-red-300'
                        }`}
                    >
                        <span>{notification.type === 'success' ? '✓' : '⚠️'}</span>
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-white">
                            &times;
                        </button>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
                    <div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
                        >
                            &larr; Torna alla Dashboard
                        </button>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Routine di Allenamento</h1>
                        <p className="text-xs text-slate-400 mt-1">Gestisci i tuoi programmi, i giorni e la suddivisione dei volumi.</p>
                    </div>
                    <button
                        onClick={() => {
                            setModalError(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
                    >
                        <span>+</span> Nuova Scheda
                    </button>
                </div>

                {/* Griglia Schede */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" />
                    </div>
                ) : splits.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
                        <p className="text-sm font-semibold text-slate-300">Nessuna scheda presente</p>
                        <p className="text-xs text-slate-500 mt-1">Crea il tuo primo programma per organizzare gli allenamenti.</p>
                        <button
                            onClick={() => {
                                setModalError(null);
                                setIsCreateModalOpen(true);
                            }}
                            className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-cyan-400 hover:bg-slate-700 transition-colors"
                        >
                            Crea scheda
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {splits.map((split) => (
                            <div
                                key={split.id}
                                onClick={() => router.push(`/dashboard/splits/${split.id}`)}
                                className="group relative cursor-pointer rounded-2xl border border-slate-900 bg-slate-900/40 p-6 transition-all hover:border-cyan-500/30 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-cyan-500/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                                            {split.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {split.description || 'Nessuna descrizione impostata.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSplitToDelete({ id: split.id, name: split.name });
                                        }}
                                        title="Elimina scheda"
                                        className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-[11px] text-slate-500">
                                    <span>{split.totalWorkouts ?? 0} giorni programmati</span>
                                    <span className="font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    Apri dettaglio &rarr;
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modale Creazione Scheda */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100">Nuova Scheda di Allenamento</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Definisci nome e obiettivo generale del programma.</p>
                            </div>

                            <form onSubmit={handleCreateSplit} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Scheda</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Es. Upper / Lower Hypertrophy"
                                        value={newSplitName}
                                        onChange={(e) => setNewSplitName(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrizione</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Es. 4 giorni a settimana, focus forza e ipertrofia"
                                        value={newSplitDesc}
                                        onChange={(e) => setNewSplitDesc(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Box di Errore posizionato IN BASSO sotto i campi */}
                                {modalError && (
                                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
                                        <span className="text-sm">⚠️</span>
                                        <p className="text-[12px]">{modalError}</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-md shadow-cyan-500/10"
                                    >
                                        {isSubmitting ? 'Salvataggio...' : 'Crea Scheda'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modale Eliminazione */}
                {splitToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
                            <div className="mx-auto h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-lg font-bold">
                                !
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-100">Elimina Scheda</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Sei sicuro di voler eliminare <span className="font-semibold text-slate-200">"{splitToDelete.name}"</span>? Verranno rimossi anche tutti i giorni e gli esercizi inclusi.
                                </p>
                            </div>
                            <div className="flex justify-center gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSplitToDelete(null)}
                                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDeleteSplit}
                                    disabled={isDeleting}
                                    className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-400 transition-all shadow-md shadow-red-500/10 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Eliminazione...' : 'Elimina definitivamente'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}