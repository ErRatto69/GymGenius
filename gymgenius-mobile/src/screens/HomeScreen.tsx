import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Flame, Weight, ChevronRight, Play } from 'lucide-react-native';
import { StatCard } from '../components/StatCard';
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";

export function HomeScreen() {
    const { user } = useAuthStore();
    const { t } = useTranslation();

    const userInitial = (user?.username?.[0] || '?').toUpperCase();

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="p-4">
                <View className="flex-row items-center justify-between mb-8 mt-2">
                    <View>
                        <Text className="text-zinc-400 text-sm uppercase tracking-wider">{t('common.welcomeBack')}</Text>
                        <Text className="text-white text-3xl font-bold">{user?.username || 'Guest'}</Text>
                    </View>
                    <View className="w-12 h-12 bg-zinc-800 rounded-full items-center justify-center border border-cyan-500">
                        <Text className="text-cyan-400 font-bold">{userInitial}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between mb-8 mx-[-4px]">
                    <StatCard
                        title={t("home.workouts")}
                        value="12"
                        subtitle="Questo mese"
                        Icon={Activity}
                    />
                    <StatCard
                        title={t("home.calories")}
                        value="2.4k"
                        subtitle="Media gg"
                        Icon={Flame}
                        iconColor="#fb923c"
                    />
                    <StatCard
                        title={t("home.weight")}
                        value="75kg"
                        subtitle="-1.2kg"
                        Icon={Weight}
                        iconColor="#a3e635"
                    />
                </View>

                <Text className="text-white text-xl font-bold mb-4">{t("home.nextWorkout")}</Text>
                <TouchableOpacity activeOpacity={0.8} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-cyan-400 font-semibold mb-1">{t("home.today")}, 18:00</Text>
                            <Text className="text-white text-lg font-bold">Upper Body Power</Text>
                            <Text className="text-zinc-400 text-sm mt-1">Forza Ipertrofia • 60 min</Text>
                        </View>
                        <View className="w-10 h-10 bg-cyan-500/20 rounded-full items-center justify-center">
                            <Play size={20} color="#22d3ee" fill="#22d3ee" />
                        </View>
                    </View>

                    <View className="h-[1px] bg-zinc-800 w-full my-3" />

                    <View className="flex-row items-center justify-between">
                        <Text className="text-zinc-400 text-sm">Panca Piana, Trazioni, Lento Avanti...</Text>
                        <ChevronRight size={16} color="#71717a" />
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}