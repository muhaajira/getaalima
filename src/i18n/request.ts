import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const locales = ['en', 'ar', 'fr'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale
    if (!locale || !locales.includes(locale as Locale)) {
        // Fall back to browser language, then English
        const cookieStore = cookies()
        const saved = cookieStore.get('locale')?.value as Locale | undefined
        const accept = typeof process.env.NEXT_PUBLIC_ACCEPT_LANGUAGE === 'string'
            ? process.env.NEXT_PUBLIC_ACCEPT_LANGUAGE
            : ''
        locale = saved && locales.includes(saved) ? saved : 'en'
    }

    const messages = (await import(`../../messages/${locale}.json`)).default
    return { locale: locale as Locale, messages }
})
