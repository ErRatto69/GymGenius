import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/client';
import { User as UserIcon, Lock } from 'lucide-react-native';
import { LoginScreenProps } from '../navigation/types';

export function LoginScreen({ navigation }: LoginScreenProps) {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        if (!usernameOrEmail || !password) return Alert.alert('Errore', 'Compila tutti i campi');
        setLoading(true);
        try {
            const { data } = await apiClient.post('/auth/login', { usernameOrEmail, password });

            await setAuth(data.accessToken, data.refreshToken, data);
        } catch (e: any) {
            Alert.alert('Errore', e.response?.data || 'Credenziali non valide.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-cyan-500/10 rounded-3xl items-center justify-center mb-4 border border-cyan-500/20">
                        <UserIcon size={40} color="#22d3ee" />
                    </View>
                    <Text className="text-white text-3xl font-extrabold tracking-tight">GymGenius</Text>
                    <Text className="text-zinc-400 text-sm mt-2 text-center">Accedi per continuare ad allenarti</Text>
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