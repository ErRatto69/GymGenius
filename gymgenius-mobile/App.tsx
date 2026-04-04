import './global.css';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';

import { useAuthStore } from './src/store/useAuthStore';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import {CreateSplitScreen} from "./src/screens/CreateSplitScreen";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
    const { token, isLoading, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#22d3ee" />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {token ? (
                            <>
                                <Stack.Screen name="Main" component={MainTabNavigator} />
                                {}
                                <Stack.Screen name="CreateSplit" component={CreateSplitScreen} />
                            </>
                        ) : (
                            <>
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="Register" component={RegisterScreen} />
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}