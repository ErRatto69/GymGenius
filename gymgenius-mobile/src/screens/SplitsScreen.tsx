import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react-native';
import { getMySplits, deleteSplit, addWorkoutToSplit, SplitSummary } from '../api/workouts';
import { SplitCard, SplitCardSkeleton } from '../components/SplitCard';
import { SplitsScreenProps } from '../navigation/types';

export function SplitsScreen({ navigation, route }: SplitsScreenProps) {
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);
    const [workoutName, setWorkoutName] = useState('');
    const [dayOrder, setDayOrder] = useState('1');
    const [isAdding, setIsAdding] = useState(false);

    const { data: splits, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['splits'],
        queryFn: getMySplits,
    });

    const openAddModal = useCallback((splitId: string) => {
        setSelectedSplitId(splitId);
        setWorkoutName('');
        setDayOrder('1');
        setModalVisible(true);
    }, []);

    useEffect(() => {
        if (route.params?.openModalForSplitId) {
            openAddModal(route.params.openModalForSplitId);
            navigation.setParams({ openModalForSplitId: null });
        }
    }, [route.params?.openModalForSplitId, openAddModal, navigation]);

    const handleSaveWorkout = async () => {
        if (!workoutName.trim() || !selectedSplitId) return;
        setIsAdding(true);
        try {
            const parsedDayOrder = parseInt(dayOrder, 10);
            await addWorkoutToSplit(selectedSplitId, {
                name: workoutName.trim(),
                dayOrder: isNaN(parsedDayOrder) ? 1 : parsedDayOrder
            });
            queryClient.invalidateQueries({ queryKey: ['splits'] });
            setModalVisible(false);
            Alert.alert("Aggiunto", "Allenamento inserito con successo!");
        } catch {
            Alert.alert("Errore", "Impossibile aggiungere l'allenamento.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = useCallback((id: string, title: string) => {
        Alert.alert("Elimina Scheda", `Eliminare definitivamente "${title}"?`, [
            { text: "Annulla", style: "cancel" },
            {
                text: "Elimina", style: "destructive",
                onPress: async () => {
                    try {
                        await deleteSplit(id);
                        queryClient.invalidateQueries({ queryKey: ['splits'] });
                    } catch {
                        Alert.alert("Errore", "Impossibile eliminare la scheda.");
                    }
                }
            }
        ]);
    }, [queryClient]);

    const handlePressDetails = useCallback((id: string, title: string) => {
        navigation.navigate('SplitDetail', { splitId: id, splitTitle: title });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: SplitSummary }) => (
        <SplitCard
            item={item}
            onDelete={handleDelete}
            onAddWorkout={openAddModal}
            onPressDetails={handlePressDetails}
        />
    ), [handleDelete, openAddModal, handlePressDetails]);

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                <View>
                    <Text className="text-white text-3xl font-extrabold">Le tue Schede</Text>
                    <Text className="text-zinc-500 text-base">Scegli il tuo piano.</Text>
                </View>
                <TouchableOpacity className="w-12 h-12 bg-cyan-500 rounded-full items-center justify-center shadow-lg" onPress={() => navigation.navigate('CreateSplit')}>
                    <Plus size={24} color="black" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ScrollView contentContainerStyle={{ padding: 24 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22d3ee" />}>
                    <SplitCardSkeleton /><SplitCardSkeleton /><SplitCardSkeleton />
                </ScrollView>
            ) : (
                <FlatList
                    data={splits} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22d3ee" />}
                />
            )}

            {/* INTERFACCIA DI AGGIUNTA WORKOUT: OVERLAY ASSOLUTO CON GESTIONE REATTIVA DEL LAYOUT */}
            {modalVisible && (
                <View className="absolute inset-0 z-50 justify-end">
                    {/* Sfondo oscurato semitrasparente che intercetta i tocchi esterni per la chiusura */}
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/60"
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />

                    {/* Contenitore inferiore protetto. Su Android lasciamo il behavior indefinito per sfruttare il ridimensionamento nativo della finestra */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 max-h-[75%] w-full z-50"
                    >
                        <View className="flex-row justify-between items-center p-6 pb-2">
                            <Text className="text-white text-2xl font-bold">Nuovo Allenamento</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-zinc-800 rounded-full">
                                <X color="#a1a1aa" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 30 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            <View className="mb-4">
                                <Text className="text-zinc-400 text-sm font-bold uppercase mb-2">Nome (es. Giorno A - Push)</Text>
                                <TextInput className="bg-black text-white p-4 rounded-xl border border-zinc-800 text-base" placeholder="Nome" placeholderTextColor="#52525b" value={workoutName} onChangeText={setWorkoutName} autoFocus />
                            </View>
                            <View className="mb-6">
                                <Text className="text-zinc-400 text-sm font-bold uppercase mb-2">Ordine Giorno</Text>
                                <TextInput className="bg-black text-white p-4 rounded-xl border border-zinc-800 text-base" keyboardType="number-pad" value={dayOrder} onChangeText={(text) => setDayOrder(text.replace(/[^0-9]/g, ''))} />
                            </View>
                            <TouchableOpacity onPress={handleSaveWorkout} disabled={!workoutName.trim() || isAdding} className={`p-4 rounded-xl items-center flex-row justify-center ${workoutName.trim() ? 'bg-cyan-500' : 'bg-zinc-800'}`}>
                                {isAdding ? <ActivityIndicator color="black" /> : <Text className={`font-bold text-lg ${workoutName.trim() ? 'text-black' : 'text-zinc-500'}`}>Salva Allenamento</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            )}
        </SafeAreaView>
    );
}