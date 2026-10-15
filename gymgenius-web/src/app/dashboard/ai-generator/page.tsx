'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Cpu, Sparkles, Save, Layers, Clock } from 'lucide-react';
import { workoutService } from '@/services/workoutService';
import { getHumanErrorMessage } from '@/services/api';
import { useToastStore } from '@/components/ui/Toast';
import type {
    AiSplitType,
    AiFitnessGoal,
    AiGeneratorConfig,
} from '@/types/workouts';

interface SimulatedExercise {
    name: string;
    notes: string;
    sets: { setNumber: number; reps: number; weight: number; restTimeSeconds: number }[];
}

interface SimulatedDay {
    name: string;
    dayOrder: number;
    notes: string;
    exercises: SimulatedExercise[];
}

interface SimulatedSplitPreview {
    name: string;
    description: string;
    days: SimulatedDay[];
}

function buildSimulatedSplit(config: AiGeneratorConfig): SimulatedSplitPreview {
    const goalParameters: Record<
        AiFitnessGoal,
        { reps: number; rest: number; label: string }
    > = {
        STRENGTH: { reps: 5, rest: 180, label: 'Forza Massimale (82-88% 1RM)' },
        HYPERTROPHY: { reps: 8, rest: 120, label: 'Ipertrofia Miofibrillare' },
        RECOMPOSITION: { reps: 10, rest: 90, label: 'Ricomposizione Corporea' },
        ENDURANCE: { reps: 15, rest: 60, label: 'Densità & Capacità Lavorativa' },
    };

    const target = goalParameters[config.goal];

    const templates: Record<AiSplitType, { title: string; days: { name: string; ex: [string, number][] }[] }> = {
        PPL: {
            title: 'Push / Pull / Legs',
            days: [
                {
                    name: 'Push (Petto, Deltoidi Anteriori/Laterali, Tricipiti)',
                    ex: [
                        ['Panca Piana Bilanciere', 85],
                        ['Military Press in Piedi', 50],
                        ['Spinte Manubri Panca 30°', 32],
                        ['Alzate Laterali ai Cavi', 12],
                        ['French Press EZ', 35],
                    ],
                },
                {
                    name: 'Pull (Dorso, Trapezio, Deltoidi Posteriori, Bicipiti)',
                    ex: [
                        ['Stacco da Terra Regolare', 140],
                        ['Trazioni Presa Prona Zavorrate', 15],
                        ['Rematore Bilanciere Pendlay', 80],
                        ['Face Pull Corda', 25],
                        ['Curl Bilanciere EZ', 38],
                    ],
                },
                {
                    name: 'Legs (Quadricipiti, Femorali, Glutei, Polpacci)',
                    ex: [
                        ['Back Squat High-Bar', 115],
                        ['Stacco Rumeno con Bilanciere', 100],
                        ['Leg Press 45°', 180],
                        ['Leg Curl Seduto', 65],
                        ['Calf Raise Multipower', 90],
                    ],
                },
            ],
        },
        UPPER_LOWER: {
            title: 'Upper / Lower Split',
            days: [
                {
                    name: 'Upper A - Focus Spinta & Trazione Orizzontale',
                    ex: [
                        ['Panca Piana Bilanciere', 87.5],
                        ['Rematore con Manubrio', 40],
                        ['Dip alle Parallele Zavorrate', 20],
                        ['Lat Machine Presa Neutra', 70],
                        ['Curl Manubri Panca Inclinata', 16],
                    ],
                },
                {
                    name: 'Lower A - Focus Accosciata',
                    ex: [
                        ['Back Squat Bilanciere', 120],
                        ['Stacco Rumeno Manubri', 36],
                        ['Affondi Bulgari', 24],
                        ['Leg Extension', 75],
                    ],
                },
            ],
        },
        FULL_BODY: {
            title: 'Full Body Ad Alta Frequenza',
            days: [
                {
                    name: 'Full Body A - Fondamentali Sinergici',
                    ex: [
                        ['Back Squat', 110],
                        ['Panca Piana Bilanciere', 82.5],
                        ['Trazioni Presa Supina', 10],
                        ['Alzate Laterali Manubri', 14],
                    ],
                },
                {
                    name: 'Full Body B - Catena Cinetica Posteriore & Spinta Verticale',
                    ex: [
                        ['Stacco da Terra', 135],
                        ['Military Press Bilanciere', 52.5],
                        ['Pulley Basso Triangolo', 75],
                        ['Dip alle Parallele', 15],
                    ],
                },
            ],
        },
        BRO_SPLIT: {
            title: 'Monofrequenza Strutturata',
            days: [
                {
                    name: 'Sessione 1 - Petto & Tricipiti',
                    ex: [
                        ['Panca Piana Bilanciere', 85],
                        ['Panca Inclinata Manubri', 32],
                        ['Croci ai Cavi Alti', 20],
                        ['Pushdown Cavo Alto', 35],
                    ],
                },
                {
                    name: 'Sessione 2 - Dorso & Bicipiti',
                    ex: [
                        ['Trazioni alla Sbarra', 10],
                        ['Rematore Bilanciere', 80],
                        ['Pullover Cavo Alto', 30],
                        ['Curl Alternato Manubri', 18],
                    ],
                },
                {
                    name: 'Sessione 3 - Gambe & Deltoidi',
                    ex: [
                        ['Back Squat', 115],
                        ['Leg Press', 190],
                        ['Military Press', 50],
                        ['Alzate Laterali', 14],
                    ],
                },
            ],
        },
    };

    const baseTemplate = templates[config.splitType];
    const generatedDays: SimulatedDay[] = [];

    for (let i = 0; i < config.daysPerWeek; i++) {
        const templateDay = baseTemplate.days[i % baseTemplate.days.length];
        generatedDays.push({
            name: `${templateDay.name}`,
            dayOrder: i + 1,
            notes: `Durata target: ${config.sessionDurationMinutes} min | ${target.label}`,
            exercises: templateDay.ex.map(([exName, baseWeight]) => ({
                name: exName,
                notes: config.focusNotes
                    ? `Focus: ${config.focusNotes}`
                    : 'Controllo eccentrico 2s, fermo tecnico',
                sets: [1, 2, 3].map((setNum) => ({
                    setNumber: setNum,
                    reps: target.reps,
                    weight: baseWeight,
                    restTimeSeconds: target.rest,
                })),
            })),
        });
    }

    return {
        name: `[AI] ${baseTemplate.title} (${config.daysPerWeek}gg)`,
        description: `Obiettivo: ${target.label}. Durata media: ${
            config.sessionDurationMinutes
        } min. ${config.focusNotes ? `Note: ${config.focusNotes}` : ''}`,
        days: generatedDays,
    };
}

export default function AiGeneratorPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);

    const [config, setConfig] = useState<AiGeneratorConfig>({
        splitType: 'PPL',
        daysPerWeek: 3,
        goal: 'HYPERTROPHY',
        sessionDurationMinutes: 75,
        focusNotes: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSavingToAccount, setIsSavingToAccount] = useState(false);
    const [preview, setPreview] = useState<SimulatedSplitPreview | null>(null);

    const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsGenerating(true);

        setTimeout(() => {
            const result = buildSimulatedSplit(config);
            setPreview(result);
            setIsGenerating(false);
            addToast('Anteprima scheda IA generata con successo.', 'info');
        }, 650);
    };

    const handleSavePreviewToBackend = async () => {
        if (!preview) return;
        setIsSavingToAccount(true);

        try {
            const createdSplit = await workoutService.createSplit({
                name: preview.name,
                description: preview.description,
            });

            for (const day of preview.days) {
                const createdDay = await workoutService.addWorkout(createdSplit.id, {
                    name: day.name,
                    dayOrder: day.dayOrder,
                    notes: day.notes,
                });

                for (let i = 0; i < day.exercises.length; i++) {
                    const ex = day.exercises[i];
                    const createdEx = await workoutService.addExercise(
                        createdSplit.id,
                        createdDay.id,
                        {
                            name: ex.name,
                            order: i + 1,
                            notes: ex.notes,
                        }
                    );

                    for (const s of ex.sets) {
                        await workoutService.addSet(
                            createdSplit.id,
                            createdDay.id,
                            createdEx.id,
                            {
                                setNumber: s.setNumber,
                                reps: s.reps,
                                weight: s.weight,
                                restTimeSeconds: s.restTimeSeconds,
                            }
                        );
                    }
                }
            }

            await queryClient.invalidateQueries({ queryKey: ['splits'] });
            addToast('Scheda salvata nel tuo archivio.', 'success');
            router.push(`/dashboard/splits/${createdSplit.id}`);
        } catch (error: unknown) {
            addToast(getHumanErrorMessage(error), 'error');
        } finally {
            setIsSavingToAccount(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-slate-800 pb-5">
                <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold">
            SIMULATION ENGINE
          </span>
                    <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                        AI WORKOUT ARCHITECT
                    </p>
                </div>
                <h1 className="text-2xl font-bold text-slate-100 mt-1.5">
                    Generatore Programmazione Allenamento
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Colonna Configurazione */}
                <form
                    onSubmit={handleGenerate}
                    className="lg:col-span-5 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-5"
                >
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Cpu className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-base font-bold text-slate-100">
                            Parametri Mesociclo
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Struttura Split
                        </label>
                        <select
                            value={config.splitType}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    splitType: e.target.value as AiSplitType,
                                })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="PPL">Push / Pull / Legs (PPL)</option>
                            <option value="UPPER_LOWER">Upper / Lower</option>
                            <option value="FULL_BODY">Full Body Ad Alta Frequenza</option>
                            <option value="BRO_SPLIT">Monofrequenza Specifica</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Giorni / Settimana
                            </label>
                            <select
                                value={config.daysPerWeek}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        daysPerWeek: Number(e.target.value),
                                    })
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                            >
                                {[2, 3, 4, 5, 6].map((d) => (
                                    <option key={d} value={d}>
                                        {d} sessioni
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Durata (Minuti)
                            </label>
                            <input
                                type="number"
                                step={15}
                                min={30}
                                max={150}
                                value={config.sessionDurationMinutes}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        sessionDurationMinutes: Number(e.target.value) || 60,
                                    })
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Obiettivo Fisiologico
                        </label>
                        <select
                            value={config.goal}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    goal: e.target.value as AiFitnessGoal,
                                })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="HYPERTROPHY">Ipertrofia Muscolare</option>
                            <option value="STRENGTH">Forza Massimale (Powerlifting)</option>
                            <option value="RECOMPOSITION">Ricomposizione Corporea</option>
                            <option value="ENDURANCE">Densità & Condizionamento</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Focus Muscolare o Note Tecniche
                        </label>
                        <textarea
                            rows={3}
                            value={config.focusNotes}
                            onChange={(e) =>
                                setConfig({ ...config, focusNotes: e.target.value })
                            }
                            placeholder="Es. Priorità deltoidi laterali e femorali, evitare stacchi da terra classici..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all disabled:opacity-50"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span>
              {isGenerating
                  ? 'Elaborazione microciclo...'
                  : 'Genera Preview Scheda'}
            </span>
                    </button>
                </form>

                {/* Colonna Preview */}
                <div className="lg:col-span-7 space-y-4">
                    {!preview ? (
                        <div className="rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 p-12 text-center">
                            <Layers className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-slate-200">
                                Nessuna anteprima attiva
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                Imposta i parametri a sinistra e avvia la generazione per
                                ispezionare esercizi, serie, carichi consigliati e tempi di
                                recupero.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-100">
                                        {preview.name}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {preview.description}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    disabled={isSavingToAccount}
                                    onClick={handleSavePreviewToBackend}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shrink-0 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                    {isSavingToAccount
                        ? 'Esportazione su DB...'
                        : 'Importa nelle mie Schede'}
                  </span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {preview.days.map((day) => (
                                    <div
                                        key={day.dayOrder}
                                        className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        GIORNO {day.dayOrder} — {day.name}
                      </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">{day.notes}</p>

                                        <div className="divide-y divide-slate-800/80 pt-1">
                                            {day.exercises.map((ex, idx) => (
                                                <div
                                                    key={idx}
                                                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                                >
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-100">
                                                            {idx + 1}. {ex.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {ex.notes}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                              {ex.sets.length} × {ex.sets[0]?.reps} @{' '}
                                {ex.sets[0]?.weight}kg
                            </span>
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              <Clock className="h-3 w-3 text-slate-500" />
                                                            {ex.sets[0]?.restTimeSeconds}s
                            </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}