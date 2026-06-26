import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import apiClient from '../api/client';
import { TagInput } from '../components/TagInput';
import { RegisterScreenProps } from '../navigation/types';

const GOALS = ["Dimagrimento", "Ipertrofia", "Forza", "Mantenimento"];
const EQUIPMENT = ["Palestra Completa", "Pesi a Casa", "Corpo Libero"];

const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-6 mb-3">{title}</Text>
);

interface FormInputProps {
    placeholder: string;
    value: string;
    onChange: (text: string) => void;
    secure?: boolean;
}

const FormInput = ({ placeholder, value, onChange, secure = false }: FormInputProps) => (
    <TextInput
        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800 mb-3"
        placeholder={placeholder} placeholderTextColor="#71717a"
        value={value} onChangeText={onChange} secureTextEntry={secure} autoCapitalize={secure ? 'none' : 'sentences'}
    />
);

interface ChipSelectorProps {
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
}

const ChipSelector = ({ options, selected, onSelect }: ChipSelectorProps) => (
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

export function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [form, setForm] = useState<{
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        preferredFoods: string[];
        dislikedFoods: string[];
        allergies: string[];
        injuries: string[];
        fitnessGoal: string;
        availableEquipment: string;
    }>({
        email: '', username: '', password: '', firstName: '', lastName: '',
        preferredFoods: [], dislikedFoods: [], allergies: [], injuries: [],
        fitnessGoal: 'Ipertrofia', availableEquipment: 'Palestra Completa'
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.email || !form.username || !form.password || !form.firstName) return Alert.alert('Errore', 'Compila i dati obbligatori');
        setLoading(true);

        try {
            await apiClient.post('/auth/register', form);
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

                <SectionTitle title="Dati Fisici & Dieta" />
                <TagInput
                    label="Infortuni"
                    placeholder="Aggiungi infortunio (es. Ginocchio sinistro)..."
                    tags={form.injuries}
                    onChangeTags={(tags) => setForm({...form, injuries: tags})}
                />
                <TagInput
                    label="Allergie / Intolleranze"
                    placeholder="Aggiungi intolleranza (es. Lattosio)..."
                    tags={form.allergies}
                    onChangeTags={(tags) => setForm({...form, allergies: tags})}
                />
                <TagInput
                    label="Cibi Preferiti"
                    placeholder="Aggiungi cibo preferito (es. Riso)..."
                    tags={form.preferredFoods}
                    onChangeTags={(tags) => setForm({...form, preferredFoods: tags})}
                />
                <TagInput
                    label="Cibi da Evitare"
                    placeholder="Aggiungi cibo da evitare (es. Pesce)..."
                    tags={form.dislikedFoods}
                    onChangeTags={(tags) => setForm({...form, dislikedFoods: tags})}
                />

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