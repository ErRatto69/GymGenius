import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Trash2, X, ChevronRight, Dumbbell } from 'lucide-react-native';
import { getSplitDetails, updateWorkoutInSplit, deleteWorkoutFromSplit, addWorkoutToSplit, WorkoutSummary } from '../api/workouts';
import { SplitDetailScreenProps } from '../navigation/types';

export function SplitDetailScreen({ route, navigation }: SplitDetailScreenProps) {
    const { splitId, splitTitle } = route.params;
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [workoutName, setWorkoutName] = useState('');
    const [dayOrder, setDayOrder] = useState('1');

    const { data: split, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['splitDetails', splitId],
        queryFn: () => getSplitDetails(splitId),
    });

    const createMutation = useMutation({
        mutationFn: (payload: { name: string; dayOrder: number }) => addWorkoutToSplit(splitId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splitDetails', splitId] });
            setModalVisible(false);
        },
        onError: () => Alert.alert("Errore", "Impossibile creare l'allenamento.")
    });

    const updateMutation = useMutation({
        mutationFn: (payload: { id: string; name: string; dayOrder: number }) =>
            updateWorkoutInSplit(splitId, payload.id, { name: payload.name, dayOrder: payload.dayOrder }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['splitDetails', splitId] });
            setModalVisible(false);
        },
        onError: () => Alert.alert("Errore", "Impossibile aggiornare l'allenamento.")
    });

    const deleteMutation = useMutation({
        mutationFn: (workoutId: string) => deleteWorkoutFromSplit(splitId, workoutId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['splitDetails', splitId] }),
        onError: () => Alert.alert("Errore", "Impossibile rimuovere l'allenamento.")
    });

    const openAddModal = () => {
        setSelectedWorkoutId(null);
        setWorkoutName('');
        setDayOrder(String((split?.workouts?.length || 0) + 1));
        setModalVisible(true);
    };

    const openEditModal = (workout: WorkoutSummary) => {
        setSelectedWorkoutId(workout.id);
        setWorkoutName(workout.name);
        setDayOrder(String(workout.dayOrder));
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!workoutName.trim()) return;
        const parsedOrder = parseInt(dayOrder, 10) || 1;

        if (selectedWorkoutId) {
            updateMutation.mutate({ id: selectedWorkoutId, name: workoutName.trim(), dayOrder: parsedOrder });
        } else {
            createMutation.mutate({ name: workoutName.trim(), dayOrder: parsedOrder });
        }
    };

    const handleDelete = (workoutId: string, name: string) => {
        Alert.alert("Elimina Allenamento", `Sei sicuro di voler eliminare definitivamente "${name}"?`, [
            { text: "Annulla", style: "cancel" },
            { text: "Elimina", style: "destructive", onPress: () => deleteMutation.mutate(workoutId) }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="px-4 py-3 flex-row items-center border-b border-zinc-900 bg-black">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-zinc-900 rounded-full mr-4">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Scheda</Text>
                    <Text className="text-white text-xl font-bold truncate" numberOfLines={1}>{splitTitle}</Text>
                </View>
                <TouchableOpacity onPress={openAddModal} className="w-10 h-10 bg-cyan-500 rounded-full items-center justify-center">
                    <Plus size={20} color="black" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#22d3ee" /></View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22d3ee" />}
                >
                    <View className="mb-6">
                        <Text className="text-zinc-400 text-sm uppercase font-bold tracking-widest mb-1">Obiettivo: {split?.goal}</Text>
                        <Text className="text-zinc-600 text-sm">Frequenza ciclo: {split?.cycleLengthDays} giorni</Text>
                    </View>

                    <Text className="text-white text-lg font-bold mb-4">Giorni di Allenamento ({split?.workouts?.length || 0})</Text>

                    {split?.workouts && split.workouts.length > 0 ? (
                        [...split.workouts].sort((a,b) => a.dayOrder - b.dayOrder).map((workout) => (
                            <TouchableOpacity
                                key={workout.id}
                                className="bg-zinc-900 p-5 rounded-2xl mb-4 border border-zinc-800 flex-row justify-between items-center"
                                onPress={() => {}}
                                activeOpacity={0.7}
                            >
                                <View className="flex-1 pr-4">
                                    <Text className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">Giorno {workout.dayOrder}</Text>
                                    <Text className="text-white font-bold text-lg">{workout.name}</Text>
                                </View>

                                <View className="flex-row items-center gap-x-4">
                                    <TouchableOpacity onPress={() => openEditModal(workout)} className="p-1">
                                        <Pencil size={18} color="#a1a1aa" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(workout.id, workout.name)} className="p-1">
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                    <ChevronRight size={18} color="#52525b" />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="items-center py-12 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800">
                            <Dumbbell size={32} color="#52525b" />
                            <Text className="text-zinc-500 font-medium mt-3 text-center px-6">Nessun allenamento presente. Premi il tasto "+" in alto per iniziare.</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {modalVisible && (
                <View className="absolute inset-0 z-50 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/60"
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 max-h-[75%] w-full z-50 shadow-2xl"
                    >
                        <View className="flex-row justify-between items-center p-6 pb-2">
                            <Text className="text-white text-2xl font-bold">
                                {selectedWorkoutId ? 'Modifica Allenamento' : 'Nuovo Allenamento'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-zinc-800 rounded-full">
                                <X color="#a1a1aa" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            <View className="mb-4">
                                <Text className="text-zinc-400 text-sm font-bold uppercase mb-2">Nome (es. Giorno A - Spinte)</Text>
                                <TextInput className="bg-black text-white p-4 rounded-xl border border-zinc-800 text-base" placeholder="Nome dell'allenamento" placeholderTextColor="#52525b" value={workoutName} onChangeText={setWorkoutName} autoFocus />
                            </View>

                            <View className="mb-6">
                                <Text className="text-zinc-400 text-sm font-bold uppercase mb-2">Ordine del Giorno</Text>
                                <TextInput className="bg-black text-white p-4 rounded-xl border border-zinc-800 text-base" keyboardType="number-pad" value={dayOrder} onChangeText={(text) => setDayOrder(text.replace(/[^0-9]/g, ''))} />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave} disabled={!workoutName.trim() || createMutation.isPending || updateMutation.isPending}
                                className={`p-4 rounded-xl items-center flex-row justify-center mb-4 ${workoutName.trim() ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <ActivityIndicator color="black" />
                                ) : (
                                    <Text className={`font-bold text-lg ${workoutName.trim() ? 'text-black' : 'text-zinc-500'}`}>Conferma</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            )}
        </SafeAreaView>
    );
}