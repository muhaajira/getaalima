import { NextResponse } from 'next/server'

// Bridge between GetAalima and the ilm research engine (github.com/arriqaaq/ilm)
// hosted on the Oracle Cloud Always Free VM.
//
// Set ILM_API_URL in Vercel (e.g. http://<vm-ip>:3000) once the ilm server
// is running. Until then this route reports { available: false } and the
// UI shows a gentle "not connected yet" state instead of an error.
//
// NOTE: the upstream path below follows ilm's versioned /v1/* REST surface.
// When the server is live we verify the exact response shape against its
// OpenAPI spec (/openapi.json) and adjust the normalizer here in one place.

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const base = process.env.ILM_API_URL
    if (!base) {
        return NextResponse.json({ available: false, results: [] })
    }

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const source = searchParams.get('source') || 'both'
    if (!q) {
        return NextResponse.json({ available: true, results: [] })
    }

    try {
        const upstream = await fetch(
            `${base.replace(/\/+$/, '')}/v1/search?q=${encodeURIComponent(q)}&type=${source}`,
            {
                headers: { accept: 'application/json' },
                cache: 'no-store',
                signal: AbortSignal.timeout(8000),
            }
        )

        if (!upstream.ok) {
            return NextResponse.json({
                available: true,
                error: `upstream ${upstream.status}`,
                results: [],
            })
        }

        const data = await upstream.json()
        const results: unknown[] = Array.isArray(data)
            ? data
            : data.results || data.hits || data.items || []

        return NextResponse.json({ available: true, results })
    } catch {
        return NextResponse.json({
            available: true,
            error: 'unreachable',
            results: [],
        })
    }
}
