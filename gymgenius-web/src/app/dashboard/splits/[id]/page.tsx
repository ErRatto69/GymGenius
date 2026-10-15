'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit3,
    Dumbbell,
    Clock,
    X,
} from 'lucide-react';
import { workoutService } from '@/services/workoutService';
import { getHumanErrorMessage } from '@/services/api';
import { useToastStore } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { WorkoutDay, WorkoutExercise } from '@/types/workouts';

interface SetDraft {
    reps: string;
    weight: string;
    restTimeSeconds: string;
}

export default function SplitDetailPage() {
    const params = useParams<{ id: string }>();
    const splitId = params.id;
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);

    // Stato modale Giorno (Workout)
    const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState<WorkoutDay | null>(null);
    const [workoutName, setWorkoutName] = useState('');
    const [workoutOrder, setWorkoutOrder] = useState('1');
    const [workoutNotes, setWorkoutNotes] = useState('');
    const [workoutFormError, setWorkoutFormError] = useState<string | null>(null);

    // Stato modale Esercizio
    const [exerciseModalWorkoutId, setExerciseModalWorkoutId] = useState<
        string | null
    >(null);
    const [exerciseName, setExerciseName] = useState('');
    const [exerciseOrder, setExerciseOrder] = useState('1');
    const [exerciseNotes, setExerciseNotes] = useState('');
    const [exerciseFormError, setExerciseFormError] = useState<string | null>(
        null
    );

    // Stato inline form per nuova Serie (mappato per exerciseId)
    const [setDrafts, setSetDrafts] = useState<Record<string, SetDraft>>({});

    // Stato eliminazioni con ConfirmModal
    const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutDay | null>(
        null
    );
    const [exerciseToDelete, setExerciseToDelete] = useState<{
        workoutId: string;
        exercise: WorkoutExercise;
    } | null>(null);

    const {
        data: split,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['split', splitId],
        queryFn: () => workoutService.getSplitById(splitId),
        enabled: Boolean(splitId),
    });

    const invalidateSplit = () => {
        queryClient.invalidateQueries({ queryKey: ['split', splitId] });
        queryClient.invalidateQueries({ queryKey: ['splits'] });
    };

    // Mutations Giorni (Workouts)
    const addWorkoutMutation = useMutation({
        mutationFn: (payload: { name: string; dayOrder: number; notes: string }) =>
            workoutService.addWorkout(splitId, payload),
        onSuccess: () => {
            invalidateSplit();
            addToast('Giorno di allenamento aggiunto.', 'success');
            closeWorkoutModal();
        },
        onError: (err: unknown) => setWorkoutFormError(getHumanErrorMessage(err)),
    });

    const updateWorkoutMutation = useMutation({
        mutationFn: (vars: {
            workoutId: string;
            name: string;
            dayOrder: number;
            notes: string;
        }) =>
            workoutService.updateWorkout(splitId, vars.workoutId, {
                name: vars.name,
                dayOrder: vars.dayOrder,
                notes: vars.notes,
            }),
        onSuccess: () => {
            invalidateSplit();
            addToast('Giorno di allenamento aggiornato.', 'success');
            closeWorkoutModal();
        },
        onError: (err: unknown) => setWorkoutFormError(getHumanErrorMessage(err)),
    });

    const deleteWorkoutMutation = useMutation({
        mutationFn: (workoutId: string) =>
            workoutService.deleteWorkout(splitId, workoutId),
        onSuccess: () => {
            invalidateSplit();
            addToast('Giorno rimosso dalla scheda.', 'info');
            setWorkoutToDelete(null);
        },
        onError: (err: unknown) => {
            addToast(getHumanErrorMessage(err), 'error');
            setWorkoutToDelete(null);
        },
    });

    // Mutations Esercizi
    const addExerciseMutation = useMutation({
        mutationFn: (vars: {
            workoutId: string;
            name: string;
            order: number;
            notes: string;
        }) =>
            workoutService.addExercise(splitId, vars.workoutId, {
                name: vars.name,
                order: vars.order,
                notes: vars.notes,
            }),
        onSuccess: () => {
            invalidateSplit();
            addToast('Esercizio aggiunto.', 'success');
            closeExerciseModal();
        },
        onError: (err: unknown) => setExerciseFormError(getHumanErrorMessage(err)),
    });

    const deleteExerciseMutation = useMutation({
        mutationFn: (vars: { workoutId: string; exerciseId: string }) =>
            workoutService.deleteExercise(splitId, vars.workoutId, vars.exerciseId),
        onSuccess: () => {
            invalidateSplit();
            addToast('Esercizio rimosso.', 'info');
            setExerciseToDelete(null);
        },
        onError: (err: unknown) => {
            addToast(getHumanErrorMessage(err), 'error');
            setExerciseToDelete(null);
        },
    });

    // Mutations Serie (Sets)
    const addSetMutation = useMutation({
        mutationFn: (vars: {
            workoutId: string;
            exerciseId: string;
            setNumber: number;
            reps: number;
            weight: number;
            restTimeSeconds: number;
        }) =>
            workoutService.addSet(splitId, vars.workoutId, vars.exerciseId, {
                setNumber: vars.setNumber,
                reps: vars.reps,
                weight: vars.weight,
                restTimeSeconds: vars.restTimeSeconds,
            }),
        onSuccess: () => {
            invalidateSplit();
            addToast('Serie registrata.', 'success');
        },
        onError: (err: unknown) => {
            addToast(getHumanErrorMessage(err), 'error');
        },
    });

    const deleteSetMutation = useMutation({
        mutationFn: (vars: {
            workoutId: string;
            exerciseId: string;
            setId: string;
        }) =>
            workoutService.deleteSet(
                splitId,
                vars.workoutId,
                vars.exerciseId,
                vars.setId
            ),
        onSuccess: () => {
            invalidateSplit();
            addToast('Serie rimossa.', 'info');
        },
        onError: (err: unknown) => {
            addToast(getHumanErrorMessage(err), 'error');
        },
    });

    // Handlers Modale Giorno
    const openCreateWorkoutModal = () => {
        const nextOrder = (split?.workouts?.length || 0) + 1;
        setEditingWorkout(null);
        setWorkoutName('');
        setWorkoutOrder(String(nextOrder));
        setWorkoutNotes('');
        setWorkoutFormError(null);
        setWorkoutModalOpen(true);
    };

    const openEditWorkoutModal = (day: WorkoutDay) => {
        setEditingWorkout(day);
        setWorkoutName(day.name);
        setWorkoutOrder(String(day.dayOrder));
        setWorkoutNotes(day.notes || '');
        setWorkoutFormError(null);
        setWorkoutModalOpen(true);
    };

    const closeWorkoutModal = () => {
        setWorkoutModalOpen(false);
        setEditingWorkout(null);
        setWorkoutFormError(null);
    };

    const handleWorkoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWorkoutFormError(null);

        if (!workoutName.trim()) {
            setWorkoutFormError('Inserisci il nome del giorno di allenamento.');
            return;
        }

        const parsedOrder = Math.max(1, parseInt(workoutOrder, 10) || 1);

        if (editingWorkout) {
            updateWorkoutMutation.mutate({
                workoutId: editingWorkout.id,
                name: workoutName.trim(),
                dayOrder: parsedOrder,
                notes: workoutNotes.trim(),
            });
        } else {
            addWorkoutMutation.mutate({
                name: workoutName.trim(),
                dayOrder: parsedOrder,
                notes: workoutNotes.trim(),
            });
        }
    };

    // Handlers Modale Esercizio
    const openExerciseModal = (workout: WorkoutDay) => {
        const nextOrder = (workout.exercises?.length || 0) + 1;
        setExerciseModalWorkoutId(workout.id);
        setExerciseName('');
        setExerciseOrder(String(nextOrder));
        setExerciseNotes('');
        setExerciseFormError(null);
    };

    const closeExerciseModal = () => {
        setExerciseModalWorkoutId(null);
        setExerciseFormError(null);
    };

    const handleExerciseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setExerciseFormError(null);

        if (!exerciseModalWorkoutId || !exerciseName.trim()) {
            setExerciseFormError('Specifica il nome dell’esercizio.');
            return;
        }

        const parsedOrder = Math.max(1, parseInt(exerciseOrder, 10) || 1);
        addExerciseMutation.mutate({
            workoutId: exerciseModalWorkoutId,
            name: exerciseName.trim(),
            order: parsedOrder,
            notes: exerciseNotes.trim(),
        });
    };

    // Gestione Draft Serie
    const getDraftForExercise = (exerciseId: string): SetDraft => {
        return (
            setDrafts[exerciseId] || {
                reps: '8',
                weight: '60',
                restTimeSeconds: '120',
            }
        );
    };

    const updateDraftForExercise = (
        exerciseId: string,
        field: keyof SetDraft,
        value: string
    ) => {
        const current = getDraftForExercise(exerciseId);
        setSetDrafts((prev) => ({
            ...prev,
            [exerciseId]: {
                ...current,
                [field]: value,
            },
        }));
    };

    const handleAddSet = (workoutId: string, exercise: WorkoutExercise) => {
        const draft = getDraftForExercise(exercise.id);
        const reps = Math.max(1, parseInt(draft.reps, 10) || 1);
        const weight = Math.max(0, parseFloat(draft.weight) || 0);
        const restTimeSeconds = Math.max(
            0,
            parseInt(draft.restTimeSeconds, 10) || 60
        );
        const nextSetNumber = (exercise.sets?.length || 0) + 1;

        addSetMutation.mutate({
            workoutId,
            exerciseId: exercise.id,
            setNumber: nextSetNumber,
            reps,
            weight,
            restTimeSeconds,
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
                <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            </div>
        );
    }

    if (isError || !split) {
        return (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center space-y-4">
                <p className="text-sm text-rose-300">{getHumanErrorMessage(error)}</p>
                <Link
                    href="/dashboard/splits"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Torna alle schede</span>
                </Link>
            </div>
        );
    }

    const orderedWorkouts = [...(split.workouts || [])].sort(
        (a, b) => a.dayOrder - b.dayOrder
    );

    return (
        <div className="space-y-8">
            {/* Header Scheda */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <Link
                        href="/dashboard/splits"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Torna all’archivio schede</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-100">{split.name}</h1>
                    {split.description && (
                        <p className="text-xs text-slate-400 mt-1">{split.description}</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={openCreateWorkoutModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    <span>Aggiungi Giorno</span>
                </button>
            </div>

            {/* Lista Giorni (Workouts) */}
            {orderedWorkouts.length === 0 ? (
                <div className="rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-12 text-center">
                    <Dumbbell className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                    <h2 className="text-base font-semibold text-slate-200">
                        Nessun giorno configurato
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Aggiungi il primo giorno di allenamento (es. Giorno 1 - Push /
                        Spinta) per inserire esercizi e serie.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orderedWorkouts.map((day) => {
                        const orderedExercises = [...(day.exercises || [])].sort(
                            (a, b) => a.order - b.order
                        );

                        return (
                            <section
                                key={day.id}
                                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden"
                            >
                                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
                        GIORNO {day.dayOrder}
                      </span>
                                            <h2 className="text-base font-bold text-slate-100">
                                                {day.name}
                                            </h2>
                                        </div>
                                        {day.notes && (
                                            <p className="text-xs text-slate-400 mt-1">{day.notes}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openExerciseModal(day)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Esercizio</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openEditWorkoutModal(day)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                                            aria-label="Modifica giorno"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWorkoutToDelete(day)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                            aria-label="Elimina giorno"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {orderedExercises.length === 0 ? (
                                        <p className="text-xs text-slate-500 text-center py-4">
                                            Nessun esercizio in questa sessione. Clicca su &ldquo;+
                                            Esercizio&rdquo; per iniziare.
                                        </p>
                                    ) : (
                                        orderedExercises.map((exercise) => {
                                            const orderedSets = [...(exercise.sets || [])].sort(
                                                (a, b) => a.setNumber - b.setNumber
                                            );
                                            const draft = getDraftForExercise(exercise.id);

                                            return (
                                                <div
                                                    key={exercise.id}
                                                    className="rounded-xl bg-slate-950/70 border border-slate-800/90 p-4 space-y-4"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-cyan-400 font-bold">
                                  #{exercise.order}
                                </span>
                                                                <h3 className="text-sm font-bold text-slate-100">
                                                                    {exercise.name}
                                                                </h3>
                                                            </div>
                                                            {exercise.notes && (
                                                                <p className="text-xs text-slate-400 mt-0.5">
                                                                    {exercise.notes}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExerciseToDelete({
                                                                    workoutId: day.id,
                                                                    exercise,
                                                                })
                                                            }
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                            aria-label="Rimuovi esercizio"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {/* Tabella Serie */}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                                                                <th className="py-2 px-3">Set</th>
                                                                <th className="py-2 px-3">Reps</th>
                                                                <th className="py-2 px-3">Carico (kg)</th>
                                                                <th className="py-2 px-3">Recupero (s)</th>
                                                                <th className="py-2 px-3 text-right">
                                                                    Azioni
                                                                </th>
                                                            </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                                                            {orderedSets.map((s) => (
                                                                <tr
                                                                    key={s.id}
                                                                    className="hover:bg-slate-900/40"
                                                                >
                                                                    <td className="py-2.5 px-3 font-bold text-cyan-400">
                                                                        {s.setNumber}
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-slate-200">
                                                                        {s.reps}
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                                                                        {s.weight} kg
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-slate-300">
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-slate-500" />
                                          {s.restTimeSeconds}s
                                      </span>
                                                                    </td>
                                                                    <td className="py-2.5 px-3 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                deleteSetMutation.mutate({
                                                                                    workoutId: day.id,
                                                                                    exerciseId: exercise.id,
                                                                                    setId: s.id,
                                                                                })
                                                                            }
                                                                            className="text-slate-500 hover:text-rose-400 p-1 rounded"
                                                                            aria-label="Elimina serie"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Riga interattiva aggiunta rapida Set */}
                                                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-end gap-2.5">
                                                        <div className="w-20">
                                                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                                                Reps
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={draft.reps}
                                                                onChange={(e) =>
                                                                    updateDraftForExercise(
                                                                        exercise.id,
                                                                        'reps',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                                                            />
                                                        </div>

                                                        <div className="w-24">
                                                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                                                Kg
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                min={0}
                                                                value={draft.weight}
                                                                onChange={(e) =>
                                                                    updateDraftForExercise(
                                                                        exercise.id,
                                                                        'weight',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                                                            />
                                                        </div>

                                                        <div className="w-24">
                                                            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                                                                Rest (sec)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="15"
                                                                min={0}
                                                                value={draft.restTimeSeconds}
                                                                onChange={(e) =>
                                                                    updateDraftForExercise(
                                                                        exercise.id,
                                                                        'restTimeSeconds',
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={addSetMutation.isPending}
                                                            onClick={() => handleAddSet(day.id, exercise)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            <span>Aggiungi Serie</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            {/* Modale Creazione / Modifica Giorno */}
            {workoutModalOpen && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="text-base font-bold text-slate-100">
                                {editingWorkout
                                    ? 'Modifica Giorno di Allenamento'
                                    : 'Nuovo Giorno di Allenamento'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeWorkoutModal}
                                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleWorkoutSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Nome Sessione
                                    </label>
                                    <input
                                        type="text"
                                        value={workoutName}
                                        onChange={(e) => setWorkoutName(e.target.value)}
                                        placeholder="Es. Push Pesante"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Ordine
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={workoutOrder}
                                        onChange={(e) => setWorkoutOrder(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Note Sessione
                                </label>
                                <textarea
                                    rows={2}
                                    value={workoutNotes}
                                    onChange={(e) => setWorkoutNotes(e.target.value)}
                                    placeholder="Riscaldamento cuffia dei rotatori, focus panca piana..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            {workoutFormError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                                    {workoutFormError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeWorkoutModal}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        addWorkoutMutation.isPending ||
                                        updateWorkoutMutation.isPending
                                    }
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50"
                                >
                                    Salva Giorno
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modale Nuovo Esercizio */}
            {exerciseModalWorkoutId && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="text-base font-bold text-slate-100">
                                Aggiungi Esercizio
                            </h2>
                            <button
                                type="button"
                                onClick={closeExerciseModal}
                                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleExerciseSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Nome Esercizio
                                    </label>
                                    <input
                                        type="text"
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                        placeholder="Es. Panca Piana Bilanciere"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Ordine
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={exerciseOrder}
                                        onChange={(e) => setExerciseOrder(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Note Tecniche (RPE, Fermo, Eccentrica)
                                </label>
                                <textarea
                                    rows={2}
                                    value={exerciseNotes}
                                    onChange={(e) => setExerciseNotes(e.target.value)}
                                    placeholder="Es. Fermo al petto 1s, RPE 8.5"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            {exerciseFormError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                                    {exerciseFormError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeExerciseModal}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={addExerciseMutation.isPending}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50"
                                >
                                    Inserisci Esercizio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modali di conferma eliminazione */}
            <ConfirmModal
                isOpen={Boolean(workoutToDelete)}
                title="Elimina Giorno di Allenamento"
                description={`Vuoi eliminare "${workoutToDelete?.name}" e tutti gli esercizi al suo interno?`}
                confirmLabel="Elimina Giorno"
                isLoading={deleteWorkoutMutation.isPending}
                onConfirm={() => {
                    if (workoutToDelete) {
                        deleteWorkoutMutation.mutate(workoutToDelete.id);
                    }
                }}
                onCancel={() => setWorkoutToDelete(null)}
            />

            <ConfirmModal
                isOpen={Boolean(exerciseToDelete)}
                title="Rimuovi Esercizio"
                description={`Confermi la rimozione dell'esercizio "${exerciseToDelete?.exercise.name}" e delle relative serie?`}
                confirmLabel="Rimuovi Esercizio"
                isLoading={deleteExerciseMutation.isPending}
                onConfirm={() => {
                    if (exerciseToDelete) {
                        deleteExerciseMutation.mutate({
                            workoutId: exerciseToDelete.workoutId,
                            exerciseId: exerciseToDelete.exercise.id,
                        });
                    }
                }}
                onCancel={() => setExerciseToDelete(null)}
            />
        </div>
    );
}