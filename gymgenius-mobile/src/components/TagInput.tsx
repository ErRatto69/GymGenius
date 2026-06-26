import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Plus, X } from 'lucide-react-native';

interface TagInputProps {
    label?: string;
    placeholder?: string;
    tags: string[];
    onChangeTags: (tags: string[]) => void;
    editable?: boolean;
}

export function TagInput({ label, placeholder, tags = [], onChangeTags, editable = true }: TagInputProps) {
    const [text, setText] = useState('');

    const handleAddTag = () => {
        const trimmed = text.trim();
        if (trimmed && !tags.includes(trimmed)) {
            const updated = [...tags, trimmed];
            onChangeTags(updated);
            setText('');
        }
    };

    const handleRemoveTag = (indexToRemove: number) => {
        const updated = tags.filter((_, index) => index !== indexToRemove);
        onChangeTags(updated);
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                    {label}
                </Text>
            )}

            {tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                        <View
                            key={index}
                            className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5"
                        >
                            <Text className="text-zinc-300 text-sm font-medium mr-2">{tag}</Text>
                            {editable && (
                                <TouchableOpacity
                                    onPress={() => handleRemoveTag(index)}
                                    className="bg-zinc-800 rounded-full p-0.5"
                                    activeOpacity={0.7}
                                >
                                    <X size={12} color="#a1a1aa" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {editable && (
                <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                    <TextInput
                        className="flex-1 text-white px-2 py-1 text-base"
                        placeholder={placeholder || "Aggiungi nuovo..."}
                        placeholderTextColor="#52525b"
                        value={text}
                        onChangeText={setText}
                        onSubmitEditing={handleAddTag}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        onPress={handleAddTag}
                        disabled={!text.trim()}
                        className={`p-2 rounded-lg ${text.trim() ? 'bg-cyan-500' : 'bg-zinc-800'}`}
                        activeOpacity={0.8}
                    >
                        <Plus size={18} color={text.trim() ? 'black' : '#52525b'} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}