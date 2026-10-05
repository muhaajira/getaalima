import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// Lazy initialization so importing this module never throws at build time.
// The browser supplies NEXT_PUBLIC_* vars at runtime; on the server during
// static generation they may be absent, in which case we defer until first use.
export const getSupabase = (): SupabaseClient => {
    if (!supabaseInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !anonKey) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
        }
        supabaseInstance = createClient(url, anonKey)
    }
    return supabaseInstance
}

// Backwards-compatible named export used throughout the app.
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return Reflect.get(getSupabase(), prop)
    }
})
