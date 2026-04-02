import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    Icon: LucideIcon;
    iconColor?: string;
}

export function StatCard({ title, value, subtitle, Icon, iconColor = "#22d3ee" }: StatCardProps) {
    return (
        <View className="bg-zinc-900 p-4 rounded-2xl flex-1 mx-1 border border-zinc-800">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-zinc-400 text-sm font-medium">{title}</Text>
                <Icon size={18} color={iconColor} />
            </View>
            <Text className="text-white text-2xl font-bold">{value}</Text>
            <Text className="text-zinc-500 text-xs mt-1">{subtitle}</Text>
        </View>
    );
}