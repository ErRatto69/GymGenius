import React from 'react';
import { HomeScreen } from '../screens/HomeScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Dumbbell, Utensils, Sparkles, TrendingUp, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

const PlaceholderScreen = ({ name }: { name: string }) => (
    <View>
        <Text>{name}</Text>
    </View>
);

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000000',
                    borderTopWidth: 1,
                    borderTopColor: '#27272a',
                    height: 85,
                    paddingBottom: 25,
                    paddingTop: 10,
                    position: 'absolute', // Per dare l'effetto floating/trasparente in futuro
                },
                tabBarActiveTintColor: '#22d3ee', // Cyan-400
                tabBarInactiveTintColor: '#71717a', // Zinc-500
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontFamily: 'Inter', // Assicurati di caricare i font in futuro
                    textTransform: 'uppercase',
                    marginTop: 4,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
            />
            <Tab.Screen
                name="Scheda"
                children={() => <PlaceholderScreen name="Scheda" />}
                options={{ tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} /> }}
            />
            <Tab.Screen
                name="Dieta"
                children={() => <PlaceholderScreen name="Dieta" />}
                options={{ tabBarIcon: ({ color, size }) => <Utensils color={color} size={size} /> }}
            />
            <Tab.Screen
                name="AI Lab"
                children={() => <PlaceholderScreen name="AI Lab" />}
                options={{ tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }}
            />
            <Tab.Screen
                name="Progressi"
                children={() => <PlaceholderScreen name="Progressi" />}
                options={{ tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }}
            />
            <Tab.Screen
                name="Profilo"
                children={() => <PlaceholderScreen name="Profilo" />}
                options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
            />
        </Tab.Navigator>
    );
}