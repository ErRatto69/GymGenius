'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
                                 isOpen,
                                 title,
                                 description,
                                 confirmLabel = 'Conferma',
                                 cancelLabel = 'Annulla',
                                 isLoading = false,
                                 variant = 'danger',
                                 onConfirm,
                                 onCancel,
                             }: ConfirmModalProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !isLoading) {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <AlertTriangle
                            className={`h-5 w-5 ${
                                variant === 'danger' ? 'text-rose-400' : 'text-cyan-400'
                            }`}
                        />
                        <h3
                            id="confirm-modal-title"
                            className="text-base font-semibold text-slate-100"
                        >
                            {title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        aria-label="Chiudi modale"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950/50 border-t border-slate-800">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                            variant === 'danger'
                                ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        }`}
                    >
                        {isLoading ? 'Operazione in corso...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;