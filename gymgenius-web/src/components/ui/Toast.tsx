'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastStore {
    toasts: ToastItem[];
    addToast: (message: string, variant?: ToastVariant) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message: string, variant: ToastVariant = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        set((state) => ({
            toasts: [...state.toasts, { id, message, variant }],
        }));
    },
    removeToast: (id: string) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

interface SingleToastProps {
    item: ToastItem;
    onDismiss: (id: string) => void;
}

function SingleToast({ item, onDismiss }: SingleToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(item.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [item.id, onDismiss]);

    const iconMap: Record<ToastVariant, React.ReactNode> = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
        error: <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />,
        info: <Info className="h-5 w-5 text-cyan-400 shrink-0" />,
    };

    const borderMap: Record<ToastVariant, string> = {
        success: 'border-emerald-500/40 bg-slate-900/95',
        error: 'border-rose-500/40 bg-slate-900/95',
        info: 'border-cyan-500/40 bg-slate-900/95',
    };

    return (
        <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 min-w-[290px] max-w-md ${borderMap[item.variant]}`}
        >
            {iconMap[item.variant]}
            <p className="text-sm font-medium text-slate-100 flex-1 leading-snug">
                {item.message}
            </p>
            <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-slate-800/60"
                aria-label="Chiudi notifica"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ToastViewport() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
            {toasts.map((t) => (
                <SingleToast key={t.id} item={t} onDismiss={removeToast} />
            ))}
        </div>
    );
}

export default ToastViewport;