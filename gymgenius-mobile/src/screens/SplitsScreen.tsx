import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Plus, Sparkles, Trash2, ChevronRight, X, Calendar } from 'lucide-react-native';
import { getMySplits, deleteSplit, addWorkoutToSplit, SplitSummary } from '../api/workouts';

export function SplitsScreen({ navigation, route }: any) {
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSplitId, setSelectedSplitId] = useState<string | null>(null);

    // Stati del form del modale
    const [workoutName, setWorkoutName] = useState('');
    const [dayOrder, setDayOrder] = useState('1');
    const [isAdding, setIsAdding] = useState(false);

    const { data: splits, isLoading, isError } = useQuery({
        queryKey: ['splits'],
        queryFn: getMySplits,
    });

    // Intercetta se veniamo dal bivio della pagina di creazione
    useEffect(() => {
        if (route.params?.openModalForSplitId) {
            openAddModal(route.params.openModalForSplitId);
            // Pulisci i parametri così non si riapre da solo in futuro
            navigation.setParams({ openModalForSplitId: null });
        }
    }, [route.params?.openModalForSplitId]);

    const openAddModal = (splitId: string) => {
        setSelectedSplitId(splitId);
        setWorkoutName('');
        setDayOrder('1');
        setModalVisible(true);
    };

    const handleSaveWorkout = async () => {
        if (!workoutName.trim() || !selectedSplitId) return;
        setIsAdding(true);
        try {
            await addWorkoutToSplit(selectedSplitId, {
                name: workoutName,
                dayOrder: parseInt(dayOrder) || 1
            });
            // Aggiorniamo la lista in background
            queryClient.invalidateQueries({ queryKey: ['splits'] });
            setModalVisible(false);
            Alert.alert("Aggiunto", "Allenamento inserito nella scheda!");
        } catch (e) {
            Alert.alert("Errore", "Impossibile aggiungere l'allenamento.");
        } finally {
            setIsAdding(false);
        }
    };

    const renderSplitCard = ({ item }: { item: SplitSummary }) => (
        <View className="bg-zinc-900 rounded-2xl p-5 mb-4 border border-zinc-800">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                    <Text className="text-zinc-500 text-xs font-bold uppercase mb-1">{item.goal}</Text>
                    <Text className="text-white text-xl font-bold">{item.title}</Text>
                    <Text className="text-zinc-400 text-sm">Ciclo di {item.cycleLengthDays} giorni</Text>
                </View>
                <TouchableOpacity onPress={() => {/* Metti qui logica delete */}} className="p-2">
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* Bottoni della Card */}
            <View className="flex-row gap-x-3 mt-2">
                <TouchableOpacity
                    className="flex-1 bg-zinc-800 py-3 rounded-xl flex-row items-center justify-center border border-zinc-700"
                    onPress={() => {/* In futuro naviga a SplitDetailScreen */}}
                >
                    <Text className="text-white font-bold text-sm">Vedi Dettagli</Text>
                </TouchableOpacity>

                {/* BOTTONE PER AGGIUNGERE ALLENAMENTO */}
                <TouchableOpacity
                    className="flex-1 bg-cyan-500/10 py-3 rounded-xl flex-row items-center justify-center border border-cyan-500/30"
                    onPress={() => openAddModal(item.id)}
                >
                    <Plus size={16} color="#22d3ee" />
                    <Text className="text-cyan-400 font-bold text-sm ml-2">Allenamento</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                <View>
                    <Text className="text-white text-3xl font-extrabold">Le tue Schede</Text>
                    <Text className="text-zinc-500 text-base">Scegli il tuo piano.</Text>
                </View>
                <TouchableOpacity
                    className="w-12 h-12 bg-cyan-500 rounded-full items-center justify-center shadow-lg shadow-cyan-500/30"
                    onPress={() => navigation.navigate('CreateSplit')}
                >
                    <Plus size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Lista */}
            {isLoading ? <ActivityIndicator size="large" color="#22d3ee" className="mt-10" /> : (
                <FlatList data={splits} keyExtractor={(i) => i.id} renderItem={renderSplitCard} contentContainerStyle={{ padding: 24, paddingBottom: 100 }} />
            )}

            {/* MODALE BOTTOM SHEET PER AGGIUNGERE ALLENAMENTO */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
                    {/* Sfondo scuro cliccabile per chiudere */}
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setModalVisible(false)} />

                    {/* Contenuto del Modale */}
                    <View className="bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800 shadow-xl pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-2xl font-bold">Nuovo Allenamento</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-zinc-800 rounded-full">
                                <X color="#a1a1aa" size={20} />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            <Text className="text-zinc-400 text-sm font-bold uppercase mb-2">Nome (es. Giorno A - Push)</Text>
                            <TextInput
                                className="bg-black text-white p-4 rounded-xl border border-zinc-800"
                                placeholder="Nome dell'allenamento" placeholderTextColor="#52525b"
                                value={workoutName} onChangeText={setWorkoutName} autoFocus
                            />
                        </View>

                        <View className="mb-8">
                            <Text className="text-zinc-400 text-sm font-bold uppercase mb-2">Ordine Giorno (1, 2, 3...)</Text>
                            <TextInput
                                className="bg-black text-white p-4 rounded-xl border border-zinc-800"
                                keyboardType="number-pad" value={dayOrder} onChangeText={setDayOrder}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSaveWorkout} disabled={!workoutName.trim() || isAdding}
                            className={`p-4 rounded-xl items-center flex-row justify-center ${workoutName.trim() ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                        >
                            {isAdding ? <ActivityIndicator color="black" /> : <Text className={`font-bold text-lg ${workoutName.trim() ? 'text-black' : 'text-zinc-500'}`}>Salva Allenamento</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}