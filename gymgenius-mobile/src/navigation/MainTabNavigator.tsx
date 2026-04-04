import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, User, Dumbbell, Utensils } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SplitsScreen } from '../screens/SplitsScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Placeholder temporanei per le altre sezioni
const Placeholder = ({ name }: { name: string }) => (
    <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-xl">{name} in arrivo...</Text>
    </View>
);

export function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopWidth: 1,
                    borderTopColor: '#27272a',
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#22d3ee',
                tabBarInactiveTintColor: '#71717a',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Allenamenti"
                component={SplitsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Dieta"
                component={() => <Placeholder name="Pasti" />}
                options={{
                    tabBarIcon: ({ color, size }) => <Utensils color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Profilo"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}