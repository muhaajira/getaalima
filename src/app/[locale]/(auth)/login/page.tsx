'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const LOCALES = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'ع' },
    { code: 'fr', label: 'FR' }
] as const

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const t = useTranslations('login')
    const tc = useTranslations('common')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error

            await supabase.from('activity_logs').insert({
                user_id: data.user.id,
                action: 'login',
                details: { method: 'password' }
            }).then(() => {})

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const switchLocale = (code: string) => {
        document.cookie = `locale=${code}; path=/; max-age=31536000`
        window.location.href = `/${code}/login`
    }

    return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Subtle girih backdrop */}
            <div className="absolute inset-0 girih-pattern girih-faint pointer-events-none" aria-hidden></div>

            <div className="relative w-full max-w-md">
                {/* Language switcher */}
                <div className="flex justify-end gap-1.5 mb-6">
                    {LOCALES.map(l => (
                        <button
                            key={l.code}
                            onClick={() => switchLocale(l.code)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-white/70 text-ink-soft hover:bg-primary-800 hover:text-cream-50"
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-card p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl font-bold text-primary-900">
                            {t('heading')}
                        </h1>
                        <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                            {t('subheading')}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="text-red-700 text-sm text-center bg-red-50 border border-red-100 p-3 rounded-xl2">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                                {tc('email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                dir="ltr"
                                className="w-full px-4 py-3 rounded-xl2 border border-cream-300 bg-cream-50 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                placeholder={t('emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                                {tc('password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                dir="ltr"
                                className="w-full px-4 py-3 rounded-xl2 border border-cream-300 bg-cream-50 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                placeholder={t('passwordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl2 bg-primary-800 hover:bg-primary-700 active:bg-primary-900 text-cream-50 font-medium transition-colors disabled:opacity-60"
                        >
                            {loading ? t('submitting') : t('submit')}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-ink-faint leading-relaxed">
                        {t('footer')}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
