'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { workoutService } from '@/services/workoutService';
import { SplitDetail, WorkoutItem } from "@/types/workouts";

export default function SplitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: splitId } = use(params);

    const [split, setSplit] = useState<SplitDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Stato Modali
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [workoutName, setWorkoutName] = useState('');
    const [workoutOrder, setWorkoutOrder] = useState(1);

    const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
    const [exerciseName, setExerciseName] = useState('');
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

    const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
    const [isSetModalOpen, setIsSetModalOpen] = useState(false);
    const [setReps, setSetReps] = useState<number>(10);
    const [setWeight, setSetWeight] = useState<number>(50);
    const [setRest, setSetRest] = useState<number>(90);

    const loadDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await workoutService.getSplitById(splitId);
            setSplit(data);
        } catch {
            router.push('/dashboard/splits');
        } finally {
            setIsLoading(false);
        }
    }, [splitId, router]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    // Handler Workout
    const handleAddWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workoutName.trim()) return;
        await workoutService.addWorkout(splitId, { name: workoutName, dayOrder: workoutOrder });
        setWorkoutName('');
        setIsWorkoutModalOpen(false);
        loadDetails();
    };

    const handleDeleteWorkout = async (workoutId: string) => {
        if (!confirm('Eliminare questa sessione di allenamento?')) return;
        await workoutService.deleteWorkout(splitId, workoutId);
        loadDetails();
    };

    // Handler Exercise
    const handleAddExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exerciseName.trim() || !activeWorkoutId) return;
        await workoutService.addExercise(splitId, activeWorkoutId, { name: exerciseName, order: 1 });
        setExerciseName('');
        setIsExerciseModalOpen(false);
        loadDetails();
    };

    const handleDeleteExercise = async (workoutId: string, exerciseId: string) => {
        if (!confirm('Eliminare questo esercizio?')) return;
        await workoutService.deleteExercise(splitId, workoutId, exerciseId);
        loadDetails();
    };

    // Handler Sets
    const handleAddSet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkoutId || !activeExerciseId) return;
        await workoutService.addSet(splitId, activeWorkoutId, activeExerciseId, {
            reps: Number(setReps),
            weight: Number(setWeight),
            restTimeSeconds: Number(setRest),
            setNumber: 1,
        });
        setIsSetModalOpen(false);
        loadDetails();
    };

    const handleDeleteSet = async (workoutId: string, exerciseId: string, setId: string) => {
        await workoutService.deleteSet(splitId, workoutId, exerciseId, setId);
        loadDetails();
    };

    if (isLoading || !split) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Intestazione */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
                    <div>
                        <button
                            onClick={() => router.push('/dashboard/splits')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
                        >
                            &larr; Tutte le Schede
                        </button>
                        <h1 className="text-2xl font-black tracking-tight">{split.name}</h1>
                        <p className="text-xs text-slate-400 mt-1">{split.description || 'Nessuna descrizione impostata'}</p>
                    </div>
                    <button
                        onClick={() => setIsWorkoutModalOpen(true)}
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/10"
                    >
                        + Aggiungi Giorno
                    </button>
                </div>

                {/* Lista Giorni / Workouts */}
                <div className="space-y-8">
                    {(!split.workouts || split.workouts.length === 0) ? (
                        <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center text-xs text-slate-500">
                            Nessun giorno inserito in questo programma. Clicca su "+ Aggiungi Giorno" per iniziare.
                        </div>
                    ) : (
                        split.workouts.map((workout: WorkoutItem) => (
                            <div key={workout.id} className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 space-y-6">

                                {/* Header Giorno */}
                                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                                    <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[11px] font-bold text-cyan-400">
                      Giorno {workout.dayOrder}
                    </span>
                                        <h2 className="text-base font-bold text-slate-100">{workout.name}</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setActiveWorkoutId(workout.id);
                                                setIsExerciseModalOpen(true);
                                            }}
                                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-cyan-400 hover:bg-slate-700 transition-colors"
                                        >
                                            + Esercizio
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWorkout(workout.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Lista Esercizi nel Giorno */}
                                <div className="space-y-4">
                                    {(!workout.exercises || workout.exercises.length === 0) ? (
                                        <p className="text-xs text-slate-500 italic">Nessun esercizio presente in questa sessione.</p>
                                    ) : (
                                        workout.exercises.map((exercise) => (
                                            <div key={exercise.id} className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-200">{exercise.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setActiveWorkoutId(workout.id);
                                                                setActiveExerciseId(exercise.id);
                                                                setIsSetModalOpen(true);
                                                            }}
                                                            className="text-[11px] font-semibold text-emerald-400 hover:underline"
                                                        >
                                                            + Serie
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExercise(workout.id, exercise.id)}
                                                            className="text-slate-500 hover:text-red-400"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Tabella Set / Serie */}
                                                {exercise.sets && exercise.sets.length > 0 && (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-[11px] text-slate-400">
                                                            <thead>
                                                            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                                                <th className="pb-1">Serie</th>
                                                                <th className="pb-1">Carico</th>
                                                                <th className="pb-1">Reps</th>
                                                                <th className="pb-1">Recupero</th>
                                                                <th className="pb-1 text-right">Rimuovi</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-800/40">
                                                            {exercise.sets.map((set, index) => (
                                                                <tr key={set.id}>
                                                                    <td className="py-1.5 font-bold text-slate-300">#{index + 1}</td>
                                                                    <td className="py-1.5">{set.weight ? `${set.weight} kg` : '-'}</td>
                                                                    <td className="py-1.5">{set.reps ?? '-'}</td>
                                                                    <td className="py-1.5">{set.restTimeSeconds ? `${set.restTimeSeconds}s` : '-'}</td>
                                                                    <td className="py-1.5 text-right">
                                                                        <button
                                                                            onClick={() => handleDeleteSet(workout.id, exercise.id, set.id)}
                                                                            className="text-slate-600 hover:text-red-400"
                                                                        >
                                                                            &times;
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                            </div>
                        ))
                    )}
                </div>

                {/* Modal: Aggiungi Giorno */}
                {isWorkoutModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
                            <h3 className="text-base font-bold">Aggiungi Giorno di Allenamento</h3>
                            <form onSubmit={handleAddWorkout} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Sessione</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Es. Petto e Tricipiti"
                                        value={workoutName}
                                        onChange={(e) => setWorkoutName(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Ordine Giorno (1-7)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={7}
                                        value={workoutOrder}
                                        onChange={(e) => setWorkoutOrder(Number(e.target.value))}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsWorkoutModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">Annulla</button>
                                    <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950">Aggiungi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Aggiungi Esercizio */}
                {isExerciseModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
                            <h3 className="text-base font-bold">Aggiungi Esercizio</h3>
                            <form onSubmit={handleAddExercise} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nome Esercizio</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Es. Panca Piana Bilanciere"
                                        value={exerciseName}
                                        onChange={(e) => setExerciseName(e.target.value)}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsExerciseModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">Annulla</button>
                                    <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950">Aggiungi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Aggiungi Serie (Set) */}
                {isSetModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
                            <h3 className="text-base font-bold">Aggiungi Serie</h3>
                            <form onSubmit={handleAddSet} className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Carico Target (kg)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={setWeight}
                                        onChange={(e) => setSetWeight(Number(e.target.value))}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ripetizioni</label>
                                    <input
                                        type="number"
                                        value={setReps}
                                        onChange={(e) => setSetReps(Number(e.target.value))}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Recupero (secondi)</label>
                                    <input
                                        type="number"
                                        value={setRest}
                                        onChange={(e) => setSetRest(Number(e.target.value))}
                                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm focus:border-cyan-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setIsSetModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">Annulla</button>
                                    <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950">Salva Serie</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}