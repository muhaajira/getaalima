'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Link, usePathname } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'

const LOCALES = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'ع' },
    { code: 'fr', label: 'FR' }
] as const

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations('nav')
    const tc = useTranslations('common')

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [router])

    const switchLocale = (code: string) => {
        document.cookie = `locale=${code}; path=/; max-age=31536000`
        // Replace the locale segment in the current path
        const segments = pathname.split('/')
        segments[1] = code
        window.location.href = segments.join('/')
    }

    const navItems = [
        { href: '/dashboard', key: 'dashboard', icon: '◈' },
        { href: '/dashboard/students', key: 'students', icon: '✦' },
        { href: '/dashboard/classes', key: 'classes', icon: '❖' },
        { href: '/dashboard/attendance', key: 'attendance', icon: '✓' },
        { href: '/dashboard/finance', key: 'finance', icon: '◆' },
        { href: '/dashboard/marketing', key: 'marketing', icon: '✧' },
        { href: '/dashboard/voice', key: 'voice', icon: '♪' },
        { href: '/dashboard/support/tickets', key: 'support', icon: '?' }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-100">
                <div className="animate-pulse h-14 w-14 rounded-full border-2 border-primary-800 border-t-transparent"></div>
            </div>
        )
    }

    const isActive = (href: string) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

    return (
        <div className="min-h-screen bg-cream-100 flex">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 bg-primary-900 text-cream-100 flex flex-col relative overflow-hidden">
                {/* Faint girih watermark */}
                <div className="absolute inset-0 girih-pattern girih-faint pointer-events-none" aria-hidden></div>

                <div className="relative flex flex-col h-full p-5">
                    <Link href="/dashboard" className="font-display text-2xl font-bold tracking-wide text-cream-50 mb-1">
                        {tc('brand')}
                    </Link>
                    <p className="text-xs text-primary-200 mb-8 leading-relaxed">{tc('tagline')}</p>

                    <nav className="flex-1 space-y-1">
                        {navItems.map(item => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm transition-colors ${
                                    isActive(item.href)
                                        ? 'bg-primary-700/60 text-cream-50 font-medium'
                                        : 'text-primary-100 hover:bg-primary-800/60 hover:text-cream-50'
                                }`}
                            >
                                <span className="text-base w-5 text-center opacity-80">{item.icon}</span>
                                {t(item.key)}
                            </Link>
                        ))}
                    </nav>

                    {/* Language switcher */}
                    <div className="pt-4 border-t border-primary-800">
                        <div className="flex items-center gap-1.5 mb-3">
                            {LOCALES.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => switchLocale(l.code)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-primary-800/50 text-primary-100 hover:bg-primary-700 hover:text-cream-50"
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-primary-200 truncate me-2">{user?.email}</span>
                            <button
                                onClick={() => supabase.auth.signOut()}
                                className="text-xs text-gold-400 hover:text-gold-300 transition-colors whitespace-nowrap"
                            >
                                {tc('signOut')}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
                <div className="max-w-6xl mx-auto py-8 px-6 lg:px-10">
                    {children}
                </div>
            </main>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
