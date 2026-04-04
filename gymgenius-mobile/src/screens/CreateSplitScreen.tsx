import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, X, Trophy, Calendar, Type, Plus, Pencil, Trash2, Dumbbell } from 'lucide-react-native';
import { createSplit } from '../api/workouts';
import { useQueryClient } from '@tanstack/react-query';

const GOALS = ["Ipertrofia", "Forza", "Dimagrimento", "Mantenimento", "Powerlifting"];

// Interfaccia per gestire l'allenamento in memoria prima di salvarlo
interface LocalWorkout {
    name: string;
    dayOrder: string;
}

export function CreateSplitScreen({ navigation }: any) {
    const queryClient = useQueryClient();

    // Dati base della scheda
    const [title, setTitle] = useState('');
    const [goal, setGoal] = useState('Ipertrofia');
    const [cycleLength, setCycleLength] = useState('7');
    const [loading, setLoading] = useState(false);

    // Dati degli allenamenti locali (in memoria)
    const [localWorkouts, setLocalWorkouts] = useState<LocalWorkout[]>([]);

    // Gestione del Modale per Aggiungere/Modificare
    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [workoutName, setWorkoutName] = useState('');
    const [dayOrder, setDayOrder] = useState('1');

    // === FUNZIONI PER IL MODALE ===
    const openAddModal = () => {
        setWorkoutName('');
        setDayOrder(String(localWorkouts.length + 1)); // Suggerisce in automatico il giorno successivo
        setEditingIndex(null);
        setModalVisible(true);
    };

    const openEditModal = (index: number) => {
        setWorkoutName(localWorkouts[index].name);
        setDayOrder(localWorkouts[index].dayOrder);
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleSaveModal = () => {
        if (!workoutName.trim() || !dayOrder.trim()) return;

        const newWorkout = { name: workoutName, dayOrder };

        if (editingIndex !== null) {
            // Modifica esistente
            const updated = [...localWorkouts];
            updated[editingIndex] = newWorkout;
            setLocalWorkouts(updated);
        } else {
            // Aggiungi nuovo
            setLocalWorkouts([...localWorkouts, newWorkout]);
        }
        setModalVisible(false);
    };

    const handleDeleteWorkout = (index: number) => {
        const updated = localWorkouts.filter((_, i) => i !== index);
        setLocalWorkouts(updated);
    };

    // === CHIAMATA AL BACKEND (Richiesta Unica) ===
    const handleSubmitSplit = async () => {
        if (!title.trim()) return Alert.alert("Errore", "Inserisci il nome della scheda.");
        setLoading(true);

        try {
            // Formattiamo il payload ESATTAMENTE come lo vuole C#
            const payload = {
                title,
                goal,
                cycleLengthDays: parseInt(cycleLength) || 7,
                workouts: localWorkouts.map(w => ({
                    name: w.name,
                    dayOrder: parseInt(w.dayOrder) || 1,
                    exercises: [] // FONDAMENTALE: Passare la lista vuota per non far crashare .NET
                }))
            };

            await createSplit(payload);

            queryClient.invalidateQueries({ queryKey: ['splits'] });
            Alert.alert("Successo!", "Scheda e allenamenti creati nel database.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            // Ora estraiamo l'errore esatto mandato dal backend
            console.log("Errore API:", error.response?.data);
            const errorMsg = error.response?.data?.errors
                ? JSON.stringify(error.response.data.errors)
                : error.response?.data || error.message;

            Alert.alert("Errore di Creazione", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                    <View className="flex-row justify-between items-center mb-8">
                        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                            <X color="#71717a" size={28} />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white text-3xl font-extrabold mb-2">Nuova Scheda</Text>
                    <Text className="text-zinc-500 text-lg mb-8">Crea la tua Split personalizzata.</Text>

                    {/* Nome e Obiettivo */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-2 ml-1">
                            <Type size={16} color="#22d3ee" />
                            <Text className="text-zinc-400 font-bold uppercase text-xs ml-2">Nome della scheda</Text>
                        </View>
                        <TextInput
                            className="bg-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 text-lg"
                            placeholder="es. Summer Shred" placeholderTextColor="#3f3f46"
                            value={title} onChangeText={setTitle} editable={!loading}
                        />
                    </View>

                    <View className="mb-6">
                        <View className="flex-row items-center mb-3 ml-1">
                            <Trophy size={16} color="#22d3ee" />
                            <Text className="text-zinc-400 font-bold uppercase text-xs ml-2">Obiettivo</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {GOALS.map((g) => (
                                <TouchableOpacity key={g} onPress={() => setGoal(g)} disabled={loading}
                                                  className={`mr-2 px-4 py-3 rounded-xl border ${goal === g ? 'bg-cyan-500/20 border-cyan-500' : 'bg-zinc-900 border-zinc-800'}`}
                                >
                                    <Text className={goal === g ? 'text-cyan-400 font-bold' : 'text-zinc-500'}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="mb-10">
                        <View className="flex-row items-center mb-2 ml-1">
                            <Calendar size={16} color="#22d3ee" />
                            <Text className="text-zinc-400 font-bold uppercase text-xs ml-2">Ciclo (Giorni)</Text>
                        </View>
                        <View className="bg-zinc-900 flex-row items-center p-5 rounded-2xl border border-zinc-800">
                            <TextInput
                                className="flex-1 text-white text-lg" keyboardType="number-pad"
                                value={cycleLength} onChangeText={setCycleLength} editable={!loading}
                            />
                            <Text className="text-zinc-600 font-bold">Giorni</Text>
                        </View>
                    </View>

                    {/* LISTA DEGLI ALLENAMENTI (In Memoria) */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-xl font-bold">Allenamenti ({localWorkouts.length})</Text>
                        </View>

                        {localWorkouts.map((w, index) => (
                            <View key={index} className="bg-zinc-900 p-4 rounded-xl mb-3 border border-zinc-800 flex-row justify-between items-center">
                                <View className="flex-1">
                                    <Text className="text-cyan-400 font-bold text-xs mb-1">GIORNO {w.dayOrder}</Text>
                                    <Text className="text-white font-bold text-base">{w.name}</Text>
                                </View>
                                <View className="flex-row gap-x-4 pl-4">
                                    <TouchableOpacity onPress={() => openEditModal(index)}>
                                        <Pencil size={20} color="#a1a1aa" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteWorkout(index)}>
                                        <Trash2 size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity onPress={openAddModal} disabled={loading} className="p-4 rounded-xl border border-dashed border-zinc-700 items-center mt-2 bg-zinc-900/50">
                            <Text className="text-zinc-400 font-bold">+ Aggiungi un Allenamento</Text>
                        </TouchableOpacity>
                    </View>

                    {/* BOTTONE SALVA SCHEDA FINALE */}
                    <TouchableOpacity
                        onPress={handleSubmitSplit}
                        disabled={!title.trim() || loading}
                        className={`p-5 rounded-2xl items-center flex-row justify-center shadow-lg mb-10 ${title.trim() ? 'bg-cyan-500 shadow-cyan-500/30' : 'bg-zinc-800'}`}
                    >
                        {loading ? <ActivityIndicator color="black" /> : (
                            <>
                                <Dumbbell color={title.trim() ? 'black' : '#52525b'} size={20} />
                                <Text className={`font-bold text-lg ml-2 ${title.trim() ? 'text-black' : 'text-zinc-500'}`}>Salva Scheda</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* MODALE PER GESTIRE L'ALLENAMENTO LOCALE */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
                    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setModalVisible(false)} />

                    <View className="bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800 shadow-xl pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-2xl font-bold">
                                {editingIndex !== null ? 'Modifica Allenamento' : 'Nuovo Allenamento'}
                            </Text>
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
                            onPress={handleSaveModal} disabled={!workoutName.trim()}
                            className={`p-4 rounded-xl items-center flex-row justify-center ${workoutName.trim() ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                        >
                            <Text className={`font-bold text-lg ${workoutName.trim() ? 'text-black' : 'text-zinc-500'}`}>Conferma</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}