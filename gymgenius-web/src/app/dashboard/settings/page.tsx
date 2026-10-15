'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { profileService } from '@/services/profileService';
import { api } from '@/services/api';

const AVAILABLE_LANGUAGES = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export default function SettingsPage() {
    const router = useRouter();
    const { user, setAuth } = useAuthStore();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || '');
    const [availableEquipment, setAvailableEquipment] = useState(user?.availableEquipment || '');

    const [allergies, setAllergies] = useState(user?.allergies?.join(', ') || '');
    const [injuries, setInjuries] = useState(user?.injuries?.join(', ') || '');
    const [preferredFoods, setPreferredFoods] = useState(user?.preferredFoods?.join(', ') || '');
    const [dislikedFoods, setDislikedFoods] = useState(user?.dislikedFoods?.join(', ') || '');

    // Gestione lingua attiva
    const [currentLang, setCurrentLang] = useState('it');

    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const savedLang = localStorage.getItem('gymgenius_lang') || 'it';
        setCurrentLang(savedLang);
        api.defaults.headers.common['Accept-Language'] = savedLang;
    }, []);

    const handleLanguageChange = (code: string) => {
        setCurrentLang(code);
        localStorage.setItem('gymgenius_lang', code);
        api.defaults.headers.common['Accept-Language'] = code;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMsg(null);

        const parseList = (str: string) => str.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

        try {
            const payload = {
                firstName,
                lastName,
                fitnessGoal: fitnessGoal || null,
                availableEquipment: availableEquipment || null,
                allergies: parseList(allergies),
                injuries: parseList(injuries),
                preferredFoods: parseList(preferredFoods),
                dislikedFoods: parseList(dislikedFoods),
            };

            await profileService.updateProfile(payload);

            if (user) {
                setAuth({ ...user, ...payload }, useAuthStore.getState().accessToken!, useAuthStore.getState().refreshToken!);
            }

            setStatusMsg({ type: 'success', text: 'Impostazioni del profilo salvate con successo.' });
        } catch {
            setStatusMsg({ type: 'error', text: 'Errore durante il salvataggio dei dati nel server.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    &larr; Torna alla Dashboard
                </button>

                <div className="border-b border-slate-900 pb-4">
                    <h1 className="text-2xl font-black tracking-tight">Impostazioni Account</h1>
                    <p className="text-xs text-slate-400 mt-1">Configura lingua, dati personali e parametri di allenamento.</p>
                </div>

                {statusMsg && (
                    <div
                        className={`rounded-xl p-3 text-xs font-medium border text-center ${
                            statusMsg.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                    >
                        {statusMsg.text}
                    </div>
                )}

                {/* Selettore Lingua Interfaccia */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-3">
                    <div>
                        <h3 className="text-sm font-bold text-cyan-400">Lingua applicazione</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Imposta la lingua preferita per l'interfaccia e le risposte del backend.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                        {AVAILABLE_LANGUAGES.map((lang) => {
                            const isSelected = currentLang === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold border transition-all ${
                                        isSelected
                                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-sm shadow-cyan-500/20'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                                >
                                    <span className="text-sm">{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Sezione Informazioni Base */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-cyan-400">Anagrafica essenziale</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cognome</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione Anamnesi Sportiva */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-cyan-400">Parametri Fitness & Infortuni</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Obiettivo Fitness</label>
                                <input
                                    type="text"
                                    value={fitnessGoal}
                                    onChange={(e) => setFitnessGoal(e.target.value)}
                                    placeholder="Es. Ipertrofia, Definizione"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attrezzatura Disponibile</label>
                                <input
                                    type="text"
                                    value={availableEquipment}
                                    onChange={(e) => setAvailableEquipment(e.target.value)}
                                    placeholder="Es. Palestra Completa, Home Gym"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Infortuni Attivi (separati da virgola)</label>
                                <input
                                    type="text"
                                    value={injuries}
                                    onChange={(e) => setInjuries(e.target.value)}
                                    placeholder="Es. Strappo bicipite femorale, tendinite ginocchio"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione Profilo Alimentare */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-cyan-400">Nutrizione & Restrizioni</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Allergie o Intolleranze (separati da virgola)</label>
                                <input
                                    type="text"
                                    value={allergies}
                                    onChange={(e) => setAllergies(e.target.value)}
                                    placeholder="Es. Lattosio, Glutine"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alimenti Preferiti</label>
                                <input
                                    type="text"
                                    value={preferredFoods}
                                    onChange={(e) => setPreferredFoods(e.target.value)}
                                    placeholder="Es. Riso, Pollo, Albumi"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alimenti Sgraditi</label>
                                <input
                                    type="text"
                                    value={dislikedFoods}
                                    onChange={(e) => setDislikedFoods(e.target.value)}
                                    placeholder="Es. Broccoli, Merluzzo"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/10"
                        >
                            {isSaving ? 'Salvataggio in corso...' : 'Salva Modifiche'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}