'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalRevenue: 0,
        activeStudents: 0
    })
    const [loading, setLoading] = useState(true)
    const t = useTranslations('dashboard')

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: studentCount } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })

                const { data: teacherRole } = await supabase.from('roles').select('id').eq('name', 'Teacher').single()
                const { count: teacherCount } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role_id', teacherRole?.id || 0)

                const { data: payments } = await supabase.from('payments').select('amount')
                const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

                setStats({
                    totalStudents: studentCount || 0,
                    totalTeachers: teacherCount || 0,
                    totalRevenue,
                    activeStudents: Math.floor((studentCount || 0) * 0.8)
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse h-12 w-12 rounded-full border-2 border-primary-500 border-t-transparent"></div>
            </div>
        )
    }

    const cards = [
        { label: t('totalStudents'), value: String(stats.totalStudents), icon: '✦' },
        { label: t('totalTeachers'), value: String(stats.totalTeachers), icon: '❖' },
        { label: t('totalRevenue'), value: `$${stats.totalRevenue.toLocaleString()}`, icon: '◆' },
        { label: t('activeStudents'), value: String(stats.activeStudents), icon: '✓' }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-primary-950">{t('title')}</h1>
                <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{t('welcome')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(card => (
                    <div key={card.label} className="bg-white rounded-2xl shadow-card p-6 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <dt className="text-sm text-ink-faint mb-1">{card.label}</dt>
                                <dd className="font-display text-3xl font-bold text-primary-900">
                                    {card.value}
                                </dd>
                            </div>
                            <span className="text-primary-300 text-xl" aria-hidden>{card.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-display text-lg font-semibold text-primary-950 mb-4">{t('recentActivity')}</h3>
                <p className="text-sm text-ink-faint">{t('noActivity')}</p>
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
