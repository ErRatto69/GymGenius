import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar, Dumbbell, Play } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { SplitDetailScreenProps } from '../navigation/types';
import { getSplitDetails } from '../api/workouts';

export function SplitDetailScreen({ route, navigation }: SplitDetailScreenProps) {
    const { splitId } = route.params;

    const { data: split, isLoading, isError } = useQuery({
        queryKey: ['splitDetail', splitId],
        queryFn: () => getSplitDetails(splitId),
    });

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator color="#22d3ee" size="large" />
            </SafeAreaView>
        );
    }

    if (isError || !split) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center p-6">
                <Text className="text-white text-lg font-bold mb-4">Impossibile caricare la scheda</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="bg-zinc-800 px-6 py-3 rounded-xl">
                    <Text className="text-cyan-400 font-bold">Torna Indietro</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center px-5 py-3 border-b border-zinc-900">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
                <View className="ml-2 flex-1">
                    <Text className="text-white text-2xl font-black" numberOfLines={1}>{split.title}</Text>
                    <Text className="text-zinc-500 text-xs font-semibold uppercase">{split.goal} • {split.cycleLengthDays} Giorni</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 ml-1">
                    Giorni di Allenamento ({split.workouts.length})
                </Text>

                {split.workouts.map((workout) => (
                    <TouchableOpacity
                        key={workout.id}
                        onPress={() => navigation.navigate('WorkoutDetail', {
                            splitId: split.id,
                            workoutId: workout.id,
                            workoutName: workout.name,
                            dayOrder: workout.dayOrder
                        })}
                        className="bg-zinc-900 p-5 rounded-3xl mb-4 border border-zinc-800 active:border-cyan-500 flex-row items-center justify-between"
                    >
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <Calendar size={14} color="#22d3ee" />
                                <Text className="text-cyan-400 font-extrabold text-xs ml-1.5 uppercase">
                                    GIORNO {workout.dayOrder}
                                </Text>
                            </View>
                            <Text className="text-white font-black text-xl mb-1">{workout.name}</Text>
                            <Text className="text-zinc-500 text-xs font-semibold">
                                {workout.exercises?.length || 0} Esercizi previsti
                            </Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <ChevronRight color="#71717a" size={24} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}