'use client';

import React, { useState } from 'react';
import { Save, Globe, Plus, X } from 'lucide-react';
import { profileService } from '@/services/profileService';
import { getHumanErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useToastStore } from '@/components/ui/Toast';
import type { SupportedLanguage } from '@/types/profile';

interface TagInputProps {
    label: string;
    placeholder: string;
    items: string[];
    onChange: (items: string[]) => void;
}

function TagInput({ label, placeholder, items, onChange }: TagInputProps) {
    const [draft, setDraft] = useState('');

    const handleAdd = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        if (!items.includes(trimmed)) {
            onChange([...items, trimmed]);
        }
        setDraft('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (target: string) => {
        onChange(items.filter((i) => i !== target));
    };

    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>Aggiungi</span>
                </button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                    {items.map((item) => (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        >
              <span>{item}</span>
              <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="text-slate-500 hover:text-rose-400"
                  aria-label={`Rimuovi ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
                    ))}
                </div>
            )}
        </div>
    );
}

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
    { code: 'it', label: 'Italiano (IT)' },
    { code: 'en', label: 'English (EN)' },
    { code: 'de', label: 'Deutsch (DE)' },
    { code: 'fr', label: 'Français (FR)' },
    { code: 'es', label: 'Español (ES)' },
];

export default function SettingsPage() {
    const { user, updateUserNames } = useAuthStore();
    const { language, setLanguage } = useLanguageStore();
    const addToast = useToastStore((state) => state.addToast);

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [fitnessGoal, setFitnessGoal] = useState('Ipertrofia e Forza Massimale');
    const [availableEquipment, setAvailableEquipment] = useState(
        'Palestra completa (Bilancieri olimpici, Rack, Manubri, Cavi)'
    );
    const [injuries, setInjuries] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
    const [dislikedFoods, setDislikedFoods] = useState<string[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleLanguageChange = (newLang: SupportedLanguage) => {
        setLanguage(newLang);
        addToast(
            `Header Accept-Language aggiornato su '${newLang.toUpperCase()}'`,
            'info'
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        if (!firstName.trim() || !lastName.trim()) {
            setFormError('Nome e cognome sono obbligatori.');
            return;
        }

        setIsSaving(true);
        try {
            await profileService.updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                fitnessGoal: fitnessGoal.trim(),
                availableEquipment: availableEquipment.trim(),
                allergies,
                injuries,
                preferredFoods,
                dislikedFoods,
            });

            updateUserNames(firstName.trim(), lastName.trim());
            addToast('Profilo atleta aggiornato con successo.', 'success');
        } catch (error: unknown) {
            setFormError(getHumanErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b border-slate-800 pb-5">
                <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                    CONFIGURAZIONE
                </p>
                <h1 className="text-2xl font-bold text-slate-100 mt-1">
                    Parametri Atleta & Preferenze API
                </h1>
            </div>

            {/* Selettore Lingua API */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
                <div className="flex items-center gap-2.5 mb-4">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-slate-100">
                        Lingua Comunicazione Backend (`Accept-Language`)
                    </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    La lingua selezionata viene iniettata automaticamente in ogni
                    richiesta HTTP verso il backend .NET 10.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {LANGUAGES.map((item) => {
                        const active = language === item.code;
                        return (
                            <button
                                key={item.code}
                                type="button"
                                onClick={() => handleLanguageChange(item.code)}
                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                    active
                                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Form Profilo */}
            <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6"
                noValidate
            >
                <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
                    Anagrafica e Condizione Atletica
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="settingsFirstName"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                        >
                            Nome
                        </label>
                        <input
                            id="settingsFirstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="settingsLastName"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                        >
                            Cognome
                        </label>
                        <input
                            id="settingsLastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="fitnessGoal"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                        >
                            Obiettivo Primario
                        </label>
                        <input
                            id="fitnessGoal"
                            type="text"
                            value={fitnessGoal}
                            onChange={(e) => setFitnessGoal(e.target.value)}
                            placeholder="Es. Ipertrofia, Powerlifting, Ricomposizione"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="availableEquipment"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
                        >
                            Attrezzatura Disponibile
                        </label>
                        <input
                            id="availableEquipment"
                            type="text"
                            value={availableEquipment}
                            onChange={(e) => setAvailableEquipment(e.target.value)}
                            placeholder="Es. Bilanciere, Rack, Manubri fino a 40kg"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <TagInput
                        label="Infortuni / Limitazioni Articolari"
                        placeholder="Es. Conflitto subacromiale spalla dx"
                        items={injuries}
                        onChange={setInjuries}
                    />

                    <TagInput
                        label="Allergie o Intolleranze"
                        placeholder="Es. Lattosio, Frutta a guscio"
                        items={allergies}
                        onChange={setAllergies}
                    />

                    <TagInput
                        label="Alimenti Preferiti"
                        placeholder="Es. Riso basmati, Salmone, Uova"
                        items={preferredFoods}
                        onChange={setPreferredFoods}
                    />

                    <TagInput
                        label="Alimenti Esclusi"
                        placeholder="Es. Merluzzo, Broccoli"
                        items={dislikedFoods}
                        onChange={setDislikedFoods}
                    />
                </div>

                {formError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                        {formError}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        <span>
              {isSaving ? 'Salvataggio in corso...' : 'Salva Configurazione'}
            </span>
                    </button>
                </div>
            </form>
        </div>
    );
}