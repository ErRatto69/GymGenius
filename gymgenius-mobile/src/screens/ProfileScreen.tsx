import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { LogOut, Check, X, Edit3 } from 'lucide-react-native';

const GOALS = ["Dimagrimento", "Ipertrofia", "Forza", "Mantenimento"];
const EQUIPMENT = ["Palestra Completa", "Pesi a Casa", "Corpo Libero"];

const EditableInput = ({ label, value, onChange, isEditing }: any) => (
    <View className="mb-4">
        <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</Text>
        <TextInput
            className={`bg-zinc-900/80 text-white p-4 rounded-xl border ${isEditing ? 'border-cyan-500/50' : 'border-zinc-800'}`}
            value={value} onChangeText={onChange} editable={isEditing}
        />
    </View>
);

const ChipSelector = ({ label, options, selected, onSelect, isEditing }: any) => (
    <View className="mb-4">
        <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {options.map((opt: string) => (
                <TouchableOpacity key={opt} disabled={!isEditing} onPress={() => onSelect(opt)}
                                  className={`mr-2 px-4 py-2 rounded-full border ${selected === opt ? 'bg-cyan-500/20 border-cyan-500' : 'bg-zinc-900 border-zinc-800'} ${!isEditing && selected !== opt ? 'opacity-30' : ''}`}
                >
                    <Text className={selected === opt ? 'text-cyan-400 font-bold' : 'text-zinc-500'}>{opt}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

export function ProfileScreen() {
    const { user, logout, updateUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        firstName: user?.firstName || '', lastName: user?.lastName || '',
        fitnessGoal: user?.fitnessGoal || '', availableEquipment: user?.availableEquipment || '',
        preferredFoods: user?.preferredFoods?.join(', ') || '',
        dislikedFoods: user?.dislikedFoods?.join(', ') || '',
        allergies: user?.allergies?.join(', ') || '',
        injuries: user?.injuries?.join(', ') || ''
    });

    const handleSave = async () => {
        setLoading(true);
        const payload = {
            firstName: form.firstName, lastName: form.lastName,
            fitnessGoal: form.fitnessGoal, availableEquipment: form.availableEquipment,
            preferredFoods: form.preferredFoods.split(',').map(s => s.trim()).filter(Boolean),
            dislikedFoods: form.dislikedFoods.split(',').map(s => s.trim()).filter(Boolean),
            allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
            injuries: form.injuries.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            const { data } = await apiClient.put('/profile/update', payload);
            await updateUser({ ...user!, ...data.user });
            setIsEditing(false);
            Alert.alert("Successo", "Profilo aggiornato!");
        } catch (e: any) {
            Alert.alert("Errore", "Impossibile aggiornare il profilo.");
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setForm({
            firstName: user?.firstName || '', lastName: user?.lastName || '',
            fitnessGoal: user?.fitnessGoal || '', availableEquipment: user?.availableEquipment || '',
            preferredFoods: user?.preferredFoods?.join(', ') || '', dislikedFoods: user?.dislikedFoods?.join(', ') || '',
            allergies: user?.allergies?.join(', ') || '', injuries: user?.injuries?.join(', ') || ''
        });
        setIsEditing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

                <View className="flex-row justify-between items-start mb-8">
                    <View>
                        <Text className="text-cyan-500 font-bold mb-1">@{user?.username}</Text>
                        <Text className="text-white text-3xl font-extrabold">{user?.firstName} {user?.lastName}</Text>
                    </View>
                    {!isEditing ? (
                        <TouchableOpacity onPress={() => setIsEditing(true)} className="p-3 bg-zinc-900 rounded-full"><Edit3 size={20} color="#22d3ee" /></TouchableOpacity>
                    ) : (
                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={cancelEdit} className="p-3 bg-zinc-900 rounded-full"><X size={20} color="#ef4444" /></TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} disabled={loading} className="p-3 bg-cyan-500 rounded-full">
                                {loading ? <ActivityIndicator size="small" color="black" /> : <Check size={20} color="black" />}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {isEditing && (
                    <View className="flex-row gap-4">
                        <View className="flex-1"><EditableInput label="Nome" value={form.firstName} onChange={(t:string) => setForm({...form, firstName: t})} isEditing={isEditing} /></View>
                        <View className="flex-1"><EditableInput label="Cognome" value={form.lastName} onChange={(t:string) => setForm({...form, lastName: t})} isEditing={isEditing} /></View>
                    </View>
                )}

                <ChipSelector label="Obiettivo Principale" options={GOALS} selected={form.fitnessGoal} onSelect={(val:string) => setForm({...form, fitnessGoal: val})} isEditing={isEditing} />
                <ChipSelector label="Attrezzatura Base" options={EQUIPMENT} selected={form.availableEquipment} onSelect={(val:string) => setForm({...form, availableEquipment: val})} isEditing={isEditing} />

                <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-4 mb-3">Dettagli Fisiologici (Virgola)</Text>
                <EditableInput label="Infortuni / Problemi" value={form.injuries} onChange={(t:string) => setForm({...form, injuries: t})} isEditing={isEditing} />
                <EditableInput label="Allergie / Intolleranze" value={form.allergies} onChange={(t:string) => setForm({...form, allergies: t})} isEditing={isEditing} />
                <EditableInput label="Cibi Preferiti" value={form.preferredFoods} onChange={(t:string) => setForm({...form, preferredFoods: t})} isEditing={isEditing} />
                <EditableInput label="Cibi da Evitare" value={form.dislikedFoods} onChange={(t:string) => setForm({...form, dislikedFoods: t})} isEditing={isEditing} />

                {!isEditing && (
                    <TouchableOpacity onPress={logout} className="flex-row items-center justify-center bg-zinc-900 p-4 rounded-xl mt-6 border border-red-900/30">
                        <LogOut size={20} color="#ef4444" />
                        <Text className="text-red-500 font-bold text-lg ml-3">Esci dall'account</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}