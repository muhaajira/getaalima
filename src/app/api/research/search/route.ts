import { NextResponse } from 'next/server'

// Research Hub backend, phase 1: free public APIs.
//   Qur'aan:  api.quran.com/api/v4  (no key required)
//   Hadith:   api.sunnah.com/v1     (free key -> SUNNAH_API_KEY env in Vercel)
//
// Phase 2 (when the Oracle Cloud VM exists): swap this file's two fetchers
// for the ilm engine (ILM_API_URL). The UI, translations and page do not
// change: this route always returns { available, results }.

export const dynamic = 'force-dynamic'

const QURAN_BASE = 'https://api.quran.com/api/v4'
const SUNNAH_BASE = 'https://api.sunnah.com/v1'
const stripTags = (s: string) => s.replace(/<[^>]+>/g, '')

interface NormalizedResult {
    id: string
    surah?: string | number
    ayah?: string | number
    book?: string
    number?: string | number
    arabic?: string
    translation?: string
    grading?: string
}

async function searchQuran(q: string): Promise<NormalizedResult[]> {
    const res = await fetch(
        `${QURAN_BASE}/search?q=${encodeURIComponent(q)}&size=10&language=en`,
        { cache: 'no-store', signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return []
    const data = await res.json()
    const rows: any[] = data?.search?.results || []
    return rows.map((r) => {
        const [surah, ayah] = String(r.verse_key || '').split(':')
        return {
            id: `quran:${r.verse_key}`,
            surah: Number(surah) || surah,
            ayah: Number(ayah) || ayah,
            arabic: r.text,
            translation: r.translations?.[0]?.text
                ? stripTags(r.translations[0].text)
                : undefined,
        }
    })
}

async function searchHadith(q: string, key: string): Promise<NormalizedResult[]> {
    const res = await fetch(
        `${SUNNAH_BASE}/hadiths?search=${encodeURIComponent(q)}&limit=10`,
        {
            headers: { 'X-API-KEY': key },
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
        }
    )
    if (!res.ok) return []
    const rows: any[] = await res.json()
    return rows.map((r) => ({
        id: `hadith:${r.collection?.name || 'unknown'}:${r.hadithNumber}`,
        book: r.collection?.name,
        number: r.hadithNumber,
        arabic: r.hadithArabic || undefined,
        translation: r.hadithEnglish || undefined,
        grading: r.status || undefined,
    }))
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const source = searchParams.get('source') || 'both'
    if (!q) return NextResponse.json({ available: true, results: [] })

    const wantQuran = source === 'quran' || source === 'both'
    const wantHadith = source === 'hadith' || source === 'both'
    const sunnahKey = process.env.SUNNAH_API_KEY || ''

    const jobs: Promise<NormalizedResult[]>[] = []
    if (wantQuran) jobs.push(searchQuran(q))
    if (wantHadith && sunnahKey) jobs.push(searchHadith(q, sunnahKey))

    const settled = await Promise.allSettled(jobs)
    const results = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []))
    const degraded = wantHadith && !sunnahKey

    return NextResponse.json({
        available: true,
        results,
        ...(degraded ? { notice: 'hadith_key_missing' } : {}),
    })
}
