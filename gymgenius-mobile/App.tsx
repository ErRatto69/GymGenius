import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';

// Inizializza il client per TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false, // Su mobile si usa AppState, lo configureremo più avanti
    },
  },
});

export default function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <NavigationContainer>
            <MainTabNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
  );
}