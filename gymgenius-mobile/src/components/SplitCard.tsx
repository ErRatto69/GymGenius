import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { SplitSummary } from '../api/workouts';

interface SplitCardProps {
    item: SplitSummary;
    onDelete: (id: string, title: string) => void;
    onAddWorkout: (id: string) => void;
    onPressDetails: (id: string, title: string) => void;
}

export const SplitCardSkeleton = () => (
    <View className="bg-zinc-900 rounded-2xl p-5 mb-4 border border-zinc-800 animate-pulse">
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 gap-y-2">
                <View className="bg-zinc-800 h-3 w-20 rounded-md" />
                <View className="bg-zinc-700 h-6 w-48 rounded-md" />
                <View className="bg-zinc-800 h-4 w-32 rounded-md" />
            </View>
            <View className="bg-zinc-800 h-8 w-8 rounded-full" />
        </View>
        <View className="flex-row gap-x-3 mt-2">
            <View className="flex-1 bg-zinc-800 h-11 rounded-xl" />
            <View className="flex-1 bg-zinc-800/40 h-11 rounded-xl" />
        </View>
    </View>
);

export const SplitCard = React.memo(({ item, onDelete, onAddWorkout, onPressDetails }: SplitCardProps) => (
    <View className="bg-zinc-900 rounded-2xl p-5 mb-4 border border-zinc-800">
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
                <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">{item.goal}</Text>
                <Text className="text-white text-xl font-bold">{item.title}</Text>
                <Text className="text-zinc-400 text-sm">Ciclo di {item.cycleLengthDays} giorni</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(item.id, item.title)} className="p-2">
                <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>

        <View className="flex-row gap-x-3 mt-2">
            <TouchableOpacity
                className="flex-1 bg-zinc-800 py-3 rounded-xl flex-row items-center justify-center border border-zinc-700"
                onPress={() => onPressDetails(item.id, item.title)}
            >
                <Text className="text-white font-bold text-sm">Vedi Dettagli</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-1 bg-cyan-500/10 py-3 rounded-xl flex-row items-center justify-center border border-cyan-500/30"
                onPress={() => onAddWorkout(item.id)}
            >
                <Plus size={16} color="#22d3ee" />
                <Text className="text-cyan-400 font-bold text-sm ml-2">Workout</Text>
            </TouchableOpacity>
        </View>
    </View>
));