import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Plus, Sparkles, Trash2, ChevronRight, X, Calendar } from 'lucide-react-native';
import { getMySplits, deleteSplit, addWorkoutToSplit, SplitSummary } from '../api/workouts';
import { SplitsScreenProps } from '../navigation/types';

interface SplitCardProps {
    item: SplitSummary;
    onDelete: (id: string, title: string) => void;
    onAddWorkout: (id: string) => void;
}

const SplitCardSkeleton = () => (
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

const SplitCard = React.memo(({ item, onDelete, onAddWorkout }: SplitCardProps) => (
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
                onPress={() => {}}
            >
                <Text className="text-white font-bold text-sm">Vedi Dettagli</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-1 bg-cyan-500/10 py-3 rounded-xl flex-row items-center justify-center border border-cyan-500/30"
                onPress={() => onAddWorkout(item.id)}
            >
                <Plus size={16} color="#22d3ee" />
                <Text className="text-cyan-400 font-bold text-sm ml-2">Allenamento</Text>
            </TouchableOpacity>
        </View>
    </View>
));

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
        // Ora route.params è pienamente tipizzato e sicuro
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
            Alert.alert("Aggiunto", "Allenamento inserito nella scheda!");
        } catch (e) {
            Alert.alert("Errore", "Impossibile aggiungere l'allenamento.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = useCallback((id: string, title: string) => {
        Alert.alert(
            "Elimina Scheda",
            `Sei sicuro di voler eliminare definitivamente "${title}" e tutti i suoi allenamenti?`,
            [
                { text: "Annulla", style: "cancel" },
                {
                    text: "Elimina",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteSplit(id);
                            queryClient.invalidateQueries({ queryKey: ['splits'] });
                        } catch (e) {
                            Alert.alert("Errore", "Impossibile eliminare la scheda.");
                        }
                    }
                }
            ]
        );
    }, [queryClient]);

    const renderItem = useCallback(({ item }: { item: SplitSummary }) => (
        <SplitCard
            item={item}
            onDelete={handleDelete}
            onAddWorkout={openAddModal}
        />
    ), [handleDelete, openAddModal]);

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

            {isLoading ? (
                <ScrollView
                    contentContainerStyle={{ padding: 24 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor="#22d3ee"
                            colors={["#22d3ee"]}
                            progressBackgroundColor="#18181b"
                        />
                    }
                >
                    <SplitCardSkeleton />
                    <SplitCardSkeleton />
                    <SplitCardSkeleton />
                </ScrollView>
            ) : (
                <FlatList
                    data={splits}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    removeClippedSubviews={Platform.OS === 'android'}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor="#22d3ee"
                            colors={["#22d3ee"]}
                            progressBackgroundColor="#18181b"
                        />
                    }
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">

                    <TouchableOpacity
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    />

                    <View className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 shadow-xl max-h-[80%]">

                        <View className="flex-row justify-between items-center p-6 pb-2">
                            <Text className="text-white text-2xl font-bold">Nuovo Allenamento</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-zinc-800 rounded-full">
                                <X color="#a1a1aa" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
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
                                    keyboardType="number-pad"
                                    value={dayOrder}
                                    onChangeText={(text) => setDayOrder(text.replace(/[^0-9]/g, ''))}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveWorkout} disabled={!workoutName.trim() || isAdding}
                                className={`p-4 rounded-xl items-center flex-row justify-center mb-4 ${workoutName.trim() ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                            >
                                {isAdding ? <ActivityIndicator color="black" /> : <Text className={`font-bold text-lg ${workoutName.trim() ? 'text-black' : 'text-zinc-500'}`}>Salva Allenamento</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}