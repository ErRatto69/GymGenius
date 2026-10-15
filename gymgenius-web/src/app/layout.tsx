import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastViewport } from '@/components/ui/Toast';

export const metadata: Metadata = {
    title: 'GymGenius | Performance & Strength Tracking',
    description:
        'Piattaforma essenziale per la programmazione di schede di allenamento, progressione dei carichi e generazione AI.',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="it" className="dark">
        <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <QueryProvider>
            {children}
            <ToastViewport />
        </QueryProvider>
        </body>
        </html>
    );
}