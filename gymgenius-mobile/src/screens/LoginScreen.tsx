import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { User as UserIcon, Lock, LogIn } from 'lucide-react-native';

export function LoginScreen({ navigation }: any) {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        if (!usernameOrEmail || !password) return Alert.alert('Errore', 'Compila tutti i campi');
        setLoading(true);
        try {
            const { data } = await apiClient.post('/auth/login', { usernameOrEmail, password });
            await setAuth(data.accessToken, data);
        } catch (e: any) {
            Alert.alert('Errore', e.response?.data || 'Credenziali non valide.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-10 mt-10">
                    <View className="w-20 h-20 bg-cyan-500 rounded-3xl items-center justify-center rotate-12 mb-4">
                        <LogIn color="black" size={40} />
                    </View>
                    <Text className="text-white text-4xl font-extrabold tracking-tight">GymGenius</Text>
                </View>

                <View className="gap-y-4">
                    <View className="bg-zinc-900 flex-row items-center p-4 rounded-2xl border border-zinc-800">
                        <UserIcon size={20} color="#71717a" />
                        <TextInput className="flex-1 ml-3 text-white" placeholder="Email o Username" placeholderTextColor="#71717a" value={usernameOrEmail} onChangeText={setUsernameOrEmail} autoCapitalize="none" />
                    </View>
                    <View className="bg-zinc-900 flex-row items-center p-4 rounded-2xl border border-zinc-800">
                        <Lock size={20} color="#71717a" />
                        <TextInput className="flex-1 ml-3 text-white" placeholder="Password" placeholderTextColor="#71717a" secureTextEntry value={password} onChangeText={setPassword} />
                    </View>
                </View>

                <TouchableOpacity onPress={handleLogin} disabled={loading} className="bg-cyan-500 p-5 rounded-2xl mt-8 shadow-lg shadow-cyan-500/50 flex-row justify-center items-center">
                    {loading ? <ActivityIndicator color="black" /> : <Text className="font-bold text-xl text-black">Accedi</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-8">
                    <Text className="text-center text-zinc-400 text-base">Non hai un account? <Text className="text-cyan-400 font-bold underline">Registrati ora</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}