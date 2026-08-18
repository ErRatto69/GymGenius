import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { X, Dumbbell, Flame, FileText } from 'lucide-react-native';
import { ExerciseDetail } from '../api/workouts';

interface Props {
    exercise: ExerciseDetail | null;
    visible: boolean;
    onClose: () => void;
}

export function ExerciseInfoModal({ exercise, visible, onClose }: Props) {
    if (!exercise) return null;

    const [notes, setNotes] = useState(exercise.notes || '');

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-zinc-950 p-6 pt-8">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-zinc-500 text-xs font-bold uppercase">Scheda Esercizio</Text>
                        <Text className="text-white text-2xl font-black">{exercise.name}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-zinc-900 rounded-full border border-zinc-800">
                        <X color="#a1a1aa" size={20} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Immagine Dimostrativa Grande con altezza fissa */}
                    <View style={{ width: '100%', height: 260 }} className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 mb-6 justify-center items-center">
                        {exercise.gifUrl ? (
                            <Image
                                source={{ uri: exercise.gifUrl }}
                                style={{ width: '100%', height: 260 }}
                                resizeMode="contain"
                            />
                        ) : (
                            <View className="items-center">
                                <Dumbbell color="#52525b" size={48} />
                                <Text className="text-zinc-500 font-semibold mt-2">Nessuna anteprima disponibile</Text>
                            </View>
                        )}
                    </View>

                    {/* Tag Muscolo & Attrezzo */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                            <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">Muscolo Target</Text>
                            <Text className="text-cyan-400 font-extrabold text-base">{exercise.targetMuscle || 'Muscolo'}</Text>
                        </View>
                        <View className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                            <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">Attrezzatura</Text>
                            <Text className="text-white font-extrabold text-base">{exercise.equipment || 'Attrezzo'}</Text>
                        </View>
                    </View>

                    {/* Statistiche & Massimale */}
                    <View className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800 mb-6">
                        <View className="flex-row items-center mb-3">
                            <Flame color="#f97316" size={20} />
                            <Text className="text-white font-bold text-base ml-2">Personal Record (PR)</Text>
                        </View>
                        <Text className="text-zinc-400 text-sm">
                            Miglior carico registrato: <Text className="text-orange-400 font-bold">80 kg x 8 reps</Text>
                        </Text>
                    </View>

                    {/* Note Personali */}
                    <View className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-8">
                        <View className="flex-row items-center mb-3">
                            <FileText color="#22d3ee" size={20} />
                            <Text className="text-white font-bold text-base ml-2">Note Personali</Text>
                        </View>
                        <TextInput
                            className="bg-black text-white p-4 rounded-2xl border border-zinc-800 text-sm"
                            placeholder="Aggiungi note (es. altezza sellino tacca 4, presa larga)..."
                            placeholderTextColor="#52525b"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}