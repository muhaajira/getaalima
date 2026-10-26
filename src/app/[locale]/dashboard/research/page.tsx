'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface ResearchResult {
    id?: string
    title?: string
    text?: string
    arabic?: string
    translation?: string
    grading?: string
    gradings?: unknown
    book?: string
    number?: string | number
    surah?: string | number
    ayah?: string | number
    [key: string]: unknown
}

export default function ResearchPage() {
    const t = useTranslations('research')
    const [query, setQuery] = useState('')
    const [source, setSource] = useState<'quran' | 'hadith' | 'both'>('both')
    const [results, setResults] = useState<ResearchResult[]>([])
    const [state, setState] = useState<'idle' | 'loading' | 'done' | 'offline' | 'error'>('idle')

    const search = async (e?: React.FormEvent) => {
        e?.preventDefault()
        const q = query.trim()
        if (!q) return
        setState('loading')
        try {
            const res = await fetch(`/api/research/search?q=${encodeURIComponent(q)}&source=${source}`)
            const data = await res.json()
            if (!data.available) {
                setState('offline')
                setResults([])
                return
            }
            if (data.error && data.results.length === 0) {
                setState('error')
                setResults([])
                return
            }
            setResults(data.results)
            setState('done')
        } catch {
            setState('error')
        }
    }

    const sources: Array<{ value: 'quran' | 'hadith' | 'both'; label: string }> = [
        { value: 'both', label: t('both') },
        { value: 'quran', label: t('quran') },
        { value: 'hadith', label: t('hadith') },
    ]

    const refOf = (r: ResearchResult) => {
        if (r.book || r.number) return [r.book, r.number].filter(Boolean).join(' ')
        if (r.surah || r.ayah) return `${r.surah ?? ''}:${r.ayah ?? ''}`
        return r.title || ''
    }

    const textOf = (r: ResearchResult) =>
        r.translation || r.text || r.arabic || ''

    const arabicOf = (r: ResearchResult) =>
        r.arabic && r.translation ? r.arabic : ''

    return (
        <div className="relative">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-primary-900">{t('title')}</h1>
                <p className="text-stone-600 mt-1">{t('subtitle')}</p>
            </div>

            {state === 'offline' && (
                <div className="mb-6 rounded-xl2 border border-gold-400/40 bg-cream-50 px-5 py-4">
                    <p className="font-medium text-primary-900">{t('offline')}</p>
                    <p className="text-sm text-stone-600 mt-1">{t('offlineHint')}</p>
                </div>
            )}

            {/* Search bar */}
            <form onSubmit={search} className="flex flex-wrap items-stretch gap-2 mb-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('queryPlaceholder')}
                    className="flex-1 min-w-64 rounded-xl2 border border-primary-800/20 bg-white px-4 py-3 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-700/30"
                />
                <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="rounded-xl2 bg-primary-900 text-cream-50 px-6 py-3 font-medium hover:bg-primary-800 disabled:opacity-50 transition-colors"
                >
                    {state === 'loading' ? t('searching') : t('searchBtn')}
                </button>
            </form>

            {/* Source toggle */}
            <div className="flex gap-1.5 mb-8">
                {sources.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => setSource(s.value)}
                        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                            source === s.value
                                ? 'bg-primary-900 text-cream-50 font-medium'
                                : 'bg-white text-stone-600 border border-primary-800/15 hover:bg-cream-100'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            {state === 'error' && (
                <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl2 px-5 py-4">{t('error')}</p>
            )}

            {state === 'done' && results.length === 0 && (
                <p className="text-stone-500">{t('noResults')}</p>
            )}

            <div className="space-y-4">
                {results.map((r, i) => (
                    <article
                        key={r.id || i}
                        className="rounded-xl2 bg-white border border-primary-800/10 p-5 hover:border-primary-800/25 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary-800">{refOf(r)}</span>
                            {r.grading && (
                                <span className="text-xs rounded-full bg-gold-400/20 text-gold-500 px-2.5 py-0.5">
                                    {String(r.grading)}
                                </span>
                            )}
                        </div>
                        {arabicOf(r) && (
                            <p dir="rtl" className="font-arabic text-xl leading-loose text-primary-900 mb-2">
                                {arabicOf(r)}
                            </p>
                        )}
                        <p className="text-stone-700 leading-relaxed">{textOf(r)}</p>
                    </article>
                ))}
            </div>

            {/* Scholarly caution */}
            <p className="mt-10 text-xs text-stone-500 border-t border-primary-800/10 pt-4">{t('note')}</p>
        </div>
    )
}

// Render on-demand (client-side search against the research API)
export const dynamic = 'force-dynamic'
