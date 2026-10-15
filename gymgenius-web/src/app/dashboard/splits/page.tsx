'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Trash2,
    Edit3,
    Layers,
    ArrowUpRight,
    X,
    Calendar,
} from 'lucide-react';
import { workoutService } from '@/services/workoutService';
import { getHumanErrorMessage } from '@/services/api';
import { useToastStore } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { SplitSummary } from '@/types/workouts';

export default function SplitsListPage() {
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSplit, setEditingSplit] = useState<SplitSummary | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<SplitSummary | null>(null);

    const {
        data: splits = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['splits'],
        queryFn: workoutService.getSplits,
    });

    const createMutation = useMutation({
        mutationFn: workoutService.createSplit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splits'] });
            addToast('Scheda creata.', 'success');
            closeModal();
        },
        onError: (err: unknown) => {
            setModalError(getHumanErrorMessage(err));
        },
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; name: string; description: string }) =>
            workoutService.updateSplit(vars.id, {
                name: vars.name,
                description: vars.description,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splits'] });
            addToast('Scheda aggiornata.', 'success');
            closeModal();
        },
        onError: (err: unknown) => {
            setModalError(getHumanErrorMessage(err));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => workoutService.deleteSplit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splits'] });
            addToast('Scheda eliminata.', 'info');
            setDeleteTarget(null);
        },
        onError: (err: unknown) => {
            addToast(getHumanErrorMessage(err), 'error');
            setDeleteTarget(null);
        },
    });

    const openCreateModal = () => {
        setEditingSplit(null);
        setName('');
        setDescription('');
        setModalError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (split: SplitSummary) => {
        setEditingSplit(split);
        setName(split.name);
        setDescription(split.description || '');
        setModalError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSplit(null);
        setName('');
        setDescription('');
        setModalError(null);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setModalError(null);

        if (!name.trim()) {
            setModalError('Specifica un nome per la scheda.');
            return;
        }

        if (editingSplit) {
            updateMutation.mutate({
                id: editingSplit.id,
                name: name.trim(),
                description: description.trim(),
            });
        } else {
            createMutation.mutate({
                name: name.trim(),
                description: description.trim(),
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                        PROGRAMMAZIONE
                    </p>
                    <h1 className="text-2xl font-bold text-slate-100 mt-1">
                        Schede di Allenamento (Splits)
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuova Scheda</span>
                </button>
            </div>

            {isError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                    {getHumanErrorMessage(error)}
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
                        />
                    ))}
                </div>
            ) : splits.length === 0 ? (
                <div className="rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-12 text-center">
                    <Layers className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                    <h2 className="text-base font-semibold text-slate-200">
                        Nessuna scheda presente
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Crea una nuova scheda per strutturare giorni, esercizi, serie e
                        tempi di recupero.
                    </p>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Crea Scheda</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {splits.map((split) => (
                        <div
                            key={split.id}
                            className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-all"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <Link
                                        href={`/dashboard/splits/${split.id}`}
                                        className="text-base font-bold text-slate-100 hover:text-cyan-400 transition-colors line-clamp-1"
                                    >
                                        {split.name}
                                    </Link>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(split)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                                            aria-label="Modifica scheda"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(split)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            aria-label="Elimina scheda"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 mt-2 line-clamp-2 min-h-[2.25rem]">
                                    {split.description || 'Nessuna descrizione inserita.'}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>{split.totalWorkouts} sessioni</span>
                                </div>

                                <Link
                                    href={`/dashboard/splits/${split.id}`}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                                >
                                    <span>Apri dettaglio</span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modale Creazione / Modifica Scheda */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="text-base font-bold text-slate-100">
                                {editingSplit ? 'Modifica Scheda' : 'Nuova Scheda'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label
                                    htmlFor="splitName"
                                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                >
                                    Nome Scheda
                                </label>
                                <input
                                    id="splitName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Es. Upper / Lower 4 Giorni - Blocco Intensità"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="splitDesc"
                                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                >
                                    Descrizione / Note Mesociclo
                                </label>
                                <textarea
                                    id="splitDesc"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Indicazioni su buffer, progressione settimanale, focus muscolare..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            {modalError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                                    {modalError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        createMutation.isPending || updateMutation.isPending
                                    }
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending
                                        ? 'Salvataggio...'
                                        : editingSplit
                                            ? 'Salva Modifiche'
                                            : 'Crea Scheda'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modale Conferma Eliminazione */}
            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                title="Elimina Scheda"
                description={`Confermi l'eliminazione definitiva della scheda "${deleteTarget?.name}" e di tutte le sessioni collegate?`}
                confirmLabel="Elimina definitivamente"
                isLoading={deleteMutation.isPending}
                onConfirm={() => {
                    if (deleteTarget) {
                        deleteMutation.mutate(deleteTarget.id);
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}