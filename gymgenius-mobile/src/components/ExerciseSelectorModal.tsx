import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, ActivityIndicator } from 'react-native';
import { Search, X, Dumbbell } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getExerciseLibrary, ExerciseLibraryItem } from '../api/workouts';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelectExercise: (exercise: ExerciseLibraryItem) => void;
}

export function ExerciseSelectorModal({ visible, onClose, onSelectExercise }: Props) {
    const [search, setSearch] = useState('');

    const { data: exercises = [], isLoading } = useQuery({
        queryKey: ['exerciseLibrary', search],
        queryFn: () => getExerciseLibrary(search),
        enabled: visible,
    });

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <View className="flex-1 bg-black p-4 pt-14">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-2xl font-black">Libreria Esercizi</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-zinc-900 rounded-full border border-zinc-800">
                        <X color="#a1a1aa" size={22} />
                    </TouchableOpacity>
                </View>

                {/* Barra di ricerca */}
                <View className="flex-row items-center bg-zinc-900 px-4 py-3 rounded-2xl border border-zinc-800 mb-4">
                    <Search color="#71717a" size={20} />
                    <TextInput
                        className="flex-1 text-white ml-3 text-base"
                        placeholder="Cerca (es. panca, squat, bicipiti, spalle)..."
                        placeholderTextColor="#71717a"
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <X color="#71717a" size={18} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Lista Esercizi */}
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator color="#22d3ee" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center pt-20">
                                <Dumbbell color="#3f3f46" size={48} />
                                <Text className="text-zinc-500 mt-3 font-semibold">Nessun esercizio trovato</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelectExercise(item);
                                    onClose();
                                }}
                                className="flex-row items-center bg-zinc-900 p-3.5 rounded-2xl mb-3 border border-zinc-800 active:border-cyan-500"
                            >
                                <View style={{ width: 64, height: 64 }} className="rounded-xl bg-zinc-800 overflow-hidden justify-center items-center">
                                    {item.imageUrl ? (
                                        <Image
                                            source={{ uri: item.imageUrl }}
                                            style={{ width: 64, height: 64 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Dumbbell color="#71717a" size={24} />
                                    )}
                                </View>

                                <View className="flex-1 ml-4">
                                    <Text className="text-white font-bold text-base">{item.name}</Text>
                                    <View className="flex-row gap-2 mt-1.5 flex-wrap">
                                        <Text className="text-cyan-400 text-xs font-bold uppercase bg-cyan-500/10 px-2 py-0.5 rounded">
                                            {item.targetMuscle}
                                        </Text>
                                        <Text className="text-zinc-400 text-xs bg-zinc-800 px-2 py-0.5 rounded">
                                            {item.equipment}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Modal>
    );
}