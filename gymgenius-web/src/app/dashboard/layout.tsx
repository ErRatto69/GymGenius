'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Dumbbell,
    LayoutDashboard,
    Layers,
    Cpu,
    Settings,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useToastStore } from '@/components/ui/Toast';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
    const language = useLanguageStore((state) => state.language);
    const addToast = useToastStore((state) => state.addToast);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [hasHydrated, isAuthenticated, router]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!hasHydrated || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-8 w-8 rounded-lg border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
        );
    }

    const navItems = [
        { href: '/dashboard', label: 'Hub', icon: LayoutDashboard },
        { href: '/dashboard/splits', label: 'Schede', icon: Layers },
        { href: '/dashboard/ai-generator', label: 'AI Lab', icon: Cpu },
        { href: '/dashboard/settings', label: 'Impostazioni', icon: Settings },
    ];

    const initials =
        user?.firstName && user?.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            : user?.username?.substring(0, 2).toUpperCase() || 'GG';

    const handleLogout = () => {
        logout();
        addToast('Sessione chiusa correttamente.', 'info');
        router.replace('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                <Dumbbell className="h-5 w-5 text-cyan-400" />
                            </div>
                            <span className="font-bold tracking-tight text-slate-100 text-base">
                GYM<span className="text-cyan-400">GENIUS</span>
              </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    item.href === '/dashboard'
                                        ? pathname === '/dashboard'
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-[11px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400">
              {language}
            </span>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-colors"
                            >
                                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                                    {initials}
                                </div>
                                <span className="text-xs font-medium text-slate-200 hidden sm:block">
                  {user?.username}
                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                                    <div className="px-4 py-2.5 border-b border-slate-800">
                                        <p className="text-xs font-semibold text-slate-100 truncate">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-[11px] text-slate-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href="/dashboard/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/70 hover:text-cyan-400 transition-colors"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Parametri & Lingua</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Termina sessione</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile bottom navigation */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-slate-950/95 border-t border-slate-800 flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium ${
                                isActive ? 'text-cyan-400' : 'text-slate-400'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
                {children}
            </main>
        </div>
    );
}