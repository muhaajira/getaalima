'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalRevenue: 0,
        activeStudents: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch student count
                const { count: studentCount } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })

                // Fetch teacher count
                const { count: teacherCount } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role_id', (select) => select.from('roles').eq('name', 'teacher').select('id'))

                // Fetch revenue (placeholder - will be implemented in finance phase)
                const { data: payments } = await supabase
                    .from('payments')
                    .select('amount')
                
                const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

                setStats({
                    totalStudents: studentCount || 0,
                    totalTeachers: teacherCount || 0,
                    totalRevenue,
                    activeStudents: Math.floor((studentCount || 0) * 0.8) // Placeholder calculation
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">Welcome to your education management system</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0"><div className="text-2xl">👨‍🎓</div></div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                                    <dd><div className="text-lg font-medium text-gray-900">{stats.totalStudents}</div></dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0"><div className="text-2xl">👩‍🏫</div></div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Teachers</dt>
                                    <dd><div className="text-lg font-medium text-gray-900">{stats.totalTeachers}</div></dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0"><div className="text-2xl">💰</div></div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd><div className="text-lg font-medium text-gray-900">${stats.totalRevenue.toLocaleString()}</div></dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0"><div className="text-2xl">✅</div></div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Students</dt>
                                    <dd><div className="text-lg font-medium text-gray-900">{stats.activeStudents}</div></dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Activity logs will appear here once users start interacting with the system.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
