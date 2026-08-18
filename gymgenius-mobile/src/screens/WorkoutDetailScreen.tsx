import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Trash2, Dumbbell, Play, Layers, Info } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkoutDetailScreenProps } from '../navigation/types';
import {
    getSplitDetails,
    addExerciseToWorkout,
    deleteExerciseFromWorkout,
    ExerciseCatalogItem,
    ExerciseDetail
} from '../api/workouts';
import { ExerciseSelectorModal } from '../components/ExerciseSelectorModal';
import { ExerciseInfoModal } from '../components/ExerciseInfoModal';

export function WorkoutDetailScreen({ route, navigation }: WorkoutDetailScreenProps) {
    const { splitId, workoutId, workoutName, dayOrder } = route.params;
    const queryClient = useQueryClient();

    const [selectorVisible, setSelectorVisible] = useState(false);
    const [selectedExerciseForInfo, setSelectedExerciseForInfo] = useState<ExerciseDetail | null>(null);

    const { data: split, isLoading } = useQuery({
        queryKey: ['splitDetail', splitId],
        queryFn: () => getSplitDetails(splitId),
    });

    const workout = split?.workouts.find(w => w.id === workoutId);

    const addExerciseMutation = useMutation({
        mutationFn: (exercise: ExerciseCatalogItem) => {
            const nextOrder = (workout?.exercises?.length || 0) + 1;
            return addExerciseToWorkout(splitId, workoutId, {
                name: exercise.name,
                order: nextOrder,
                gifUrl: exercise.gifUrl,
                targetMuscle: exercise.target,
                equipment: exercise.equipment,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splitDetail', splitId] });
        }
    });

    const deleteExerciseMutation = useMutation({
        mutationFn: (exerciseId: string) => deleteExerciseFromWorkout(splitId, workoutId, exerciseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splitDetail', splitId] });
        }
    });

    if (isLoading || !workout) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator color="#22d3ee" size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-3 border-b border-zinc-900">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
                <View className="flex-1 ml-2">
                    <Text className="text-cyan-400 text-xs font-black uppercase">GIORNO {dayOrder}</Text>
                    <Text className="text-white text-xl font-black" numberOfLines={1}>{workoutName}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => Alert.alert("Live Workout", `Pronto ad avviare la sessione ${workoutName}!`)}
                    className="bg-cyan-500 flex-row items-center px-4 py-2 rounded-full"
                >
                    <Play color="#000" size={14} fill="#000" />
                    <Text className="text-black font-black text-xs ml-1 uppercase">Inizia</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {workout.exercises && workout.exercises.length > 0 ? (
                    <View className="gap-y-3 mb-6">
                        {workout.exercises.map((exercise, index) => (
                            <TouchableOpacity
                                key={exercise.id}
                                activeOpacity={0.8}
                                onPress={() => setSelectedExerciseForInfo(exercise)}
                                className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800"
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        {/* Immagine anteprima con dimensioni esplicite */}
                                        <View style={{ width: 56, height: 56 }} className="rounded-2xl bg-zinc-800 overflow-hidden justify-center items-center">
                                            {exercise.gifUrl ? (
                                                <Image
                                                    source={{ uri: exercise.gifUrl }}
                                                    style={{ width: 56, height: 56 }}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Dumbbell color="#71717a" size={22} />
                                            )}
                                        </View>

                                        <View className="ml-3.5 flex-1">
                                            <Text className="text-white font-bold text-base" numberOfLines={1}>
                                                {index + 1}. {exercise.name}
                                            </Text>
                                            <Text className="text-zinc-400 text-xs font-medium mt-0.5">
                                                {exercise.targetMuscle || 'Muscolo'} • {exercise.equipment || 'Attrezzo'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        <TouchableOpacity
                                            onPress={() => setSelectedExerciseForInfo(exercise)}
                                            className="p-2 bg-zinc-800/60 rounded-full"
                                        >
                                            <Info color="#22d3ee" size={16} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => deleteExerciseMutation.mutate(exercise.id)}
                                            className="p-2"
                                        >
                                            <Trash2 color="#ef4444" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Serie e Ripetizioni */}
                                <View className="mt-3.5 pt-3 border-t border-zinc-800/80 flex-row flex-wrap gap-2">
                                    {exercise.sets && exercise.sets.length > 0 ? (
                                        exercise.sets.map((s) => (
                                            <View key={s.id} className="bg-black/60 px-3 py-1.5 rounded-xl flex-row items-center border border-zinc-800">
                                                <Layers color="#22d3ee" size={12} />
                                                <Text className="text-zinc-300 text-xs font-bold ml-1.5">
                                                    Set {s.number}: <Text className="text-cyan-400">{s.targetReps} reps</Text>
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text className="text-zinc-500 text-xs italic">3 serie x 10 reps</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="py-12 items-center justify-center bg-zinc-900/40 rounded-3xl mb-6 border border-dashed border-zinc-800">
                        <Dumbbell color="#52525b" size={40} />
                        <Text className="text-zinc-400 font-bold mt-3 text-base">Nessun esercizio presente</Text>
                        <Text className="text-zinc-600 text-xs mt-1">Aggiungi gli esercizi per questo giorno di allenamento</Text>
                    </View>
                )}

                {/* Pulsante Aggiungi Esercizio */}
                <TouchableOpacity
                    onPress={() => setSelectorVisible(true)}
                    className="bg-zinc-900 p-4 rounded-2xl flex-row items-center justify-center border border-dashed border-zinc-700 active:bg-zinc-800"
                >
                    <Plus color="#22d3ee" size={20} />
                    <Text className="text-cyan-400 font-bold text-base ml-2">+ Aggiungi Esercizio</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal Ricerca Esercizi */}
            <ExerciseSelectorModal
                visible={selectorVisible}
                onClose={() => setSelectorVisible(false)}
                onSelectExercise={(ex) => addExerciseMutation.mutate(ex)}
            />

            {/* Modal Dettaglio Esercizio & Note Personali */}
            <ExerciseInfoModal
                exercise={selectedExerciseForInfo}
                visible={!!selectedExerciseForInfo}
                onClose={() => setSelectedExerciseForInfo(null)}
            />
        </SafeAreaView>
    );
}