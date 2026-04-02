import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import apiClient from '../api/client';

const GOALS = ["Dimagrimento", "Ipertrofia", "Forza", "Mantenimento"];
const EQUIPMENT = ["Palestra Completa", "Pesi a Casa", "Corpo Libero"];

// SPOSTATI FUORI: Ora React non li distruggerà ad ogni tasto premuto!
const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-6 mb-3">{title}</Text>
);

const FormInput = ({ placeholder, value, onChange, secure = false }: any) => (
    <TextInput
        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800 mb-3"
        placeholder={placeholder} placeholderTextColor="#71717a"
        value={value} onChangeText={onChange} secureTextEntry={secure} autoCapitalize={secure ? 'none' : 'sentences'}
    />
);

const ChipSelector = ({ options, selected, onSelect }: any) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
        {options.map((opt: string) => (
            <TouchableOpacity key={opt} onPress={() => onSelect(opt)}
                              className={`mr-2 px-4 py-2 rounded-full border ${selected === opt ? 'bg-cyan-500/20 border-cyan-500' : 'bg-zinc-900 border-zinc-800'}`}
            >
                <Text className={selected === opt ? 'text-cyan-400 font-bold' : 'text-zinc-500'}>{opt}</Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
);

export function RegisterScreen({ navigation }: any) {
    const [form, setForm] = useState({
        email: '', username: '', password: '', firstName: '', lastName: '',
        preferredFoods: '', dislikedFoods: '', allergies: '', injuries: '',
        fitnessGoal: 'Ipertrofia', availableEquipment: 'Palestra Completa'
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.email || !form.username || !form.password || !form.firstName) return Alert.alert('Errore', 'Compila i dati obbligatori');
        setLoading(true);

        const payload = {
            ...form,
            preferredFoods: form.preferredFoods.split(',').map(s => s.trim()).filter(Boolean),
            dislikedFoods: form.dislikedFoods.split(',').map(s => s.trim()).filter(Boolean),
            allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
            injuries: form.injuries.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            await apiClient.post('/auth/register', payload);
            Alert.alert('Successo', 'Account creato!', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
        } catch (e: any) {
            Alert.alert('Errore', e.response?.data?.errors ? "Errore di validazione" : e.response?.data || 'Errore');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 60, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
                <Text className="text-white text-4xl font-extrabold mb-2">Il tuo Profilo</Text>

                <SectionTitle title="Dati Personali" />
                <View className="flex-row gap-x-3">
                    <View className="flex-1"><FormInput placeholder="Nome" value={form.firstName} onChange={(t:string) => setForm({...form, firstName: t})} /></View>
                    <View className="flex-1"><FormInput placeholder="Cognome" value={form.lastName} onChange={(t:string) => setForm({...form, lastName: t})} /></View>
                </View>
                <FormInput placeholder="Username" value={form.username} onChange={(t:string) => setForm({...form, username: t})} />
                <FormInput placeholder="Email" value={form.email} onChange={(t:string) => setForm({...form, email: t})} />
                <FormInput placeholder="Password" value={form.password} onChange={(t:string) => setForm({...form, password: t})} secure />

                <SectionTitle title="Obiettivi & Setup" />
                <Text className="text-zinc-400 mb-2 text-sm">Obiettivo Principale</Text>
                <ChipSelector options={GOALS} selected={form.fitnessGoal} onSelect={(val:string) => setForm({...form, fitnessGoal: val})} />

                <Text className="text-zinc-400 mb-2 mt-3 text-sm">Attrezzatura</Text>
                <ChipSelector options={EQUIPMENT} selected={form.availableEquipment} onSelect={(val:string) => setForm({...form, availableEquipment: val})} />

                <SectionTitle title="Dati Fisici & Dieta (Separati da virgola)" />
                <FormInput placeholder="Infortuni (es. Ginocchio destro, Spalla)" value={form.injuries} onChange={(t:string) => setForm({...form, injuries: t})} />
                <FormInput placeholder="Allergie (es. Lattosio, Glutine)" value={form.allergies} onChange={(t:string) => setForm({...form, allergies: t})} />
                <FormInput placeholder="Cibi preferiti (es. Pollo, Riso, Uova)" value={form.preferredFoods} onChange={(t:string) => setForm({...form, preferredFoods: t})} />
                <FormInput placeholder="Cibi da evitare (es. Broccoli, Pesce)" value={form.dislikedFoods} onChange={(t:string) => setForm({...form, dislikedFoods: t})} />

                <TouchableOpacity onPress={handleRegister} disabled={loading} className="bg-cyan-500 p-5 rounded-2xl mt-8 items-center">
                    {loading ? <ActivityIndicator color="black" /> : <Text className="font-bold text-xl text-black">Crea Profilo</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-8 mb-8">
                    <Text className="text-center text-zinc-400">Hai già un account? <Text className="text-cyan-400 font-bold">Accedi</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}