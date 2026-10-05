'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AttendanceAnalyticsPage() {
    const [stats, setStats] = useState({
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalExcused: 0,
        attendanceRate: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        // In a real app, you would aggregate this in the database. 
        // Here we simulate it by fetching recent records.
        const { data: presentData } = await supabase.from('attendance_records').select('*').eq('status', 'P')
        const { data: absentData } = await supabase.from('attendance_records').select('*').eq('status', 'A')
        const { data: lateData } = await supabase.from('attendance_records').select('*').eq('status', 'L')
        const { data: excusedData } = await supabase.from('attendance_records').select('*').eq('status', 'E')

        const p = presentData?.length || 0
        const a = absentData?.length || 0
        const l = lateData?.length || 0
        const e = excusedData?.length || 0
        const total = p + a + l + e
        
        setStats({
            totalPresent: p,
            totalAbsent: a,
            totalLate: l,
            totalExcused: e,
            attendanceRate: total > 0 ? Math.round((p / total) * 100) : 0
        })
        setLoading(false)
    }

    if (loading) return <div className="p-6">Calculating analytics...</div>

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Attendance Analytics</h1>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Overall Rate</dt>
                        <dd><div className="text-3xl font-medium text-indigo-600">{stats.attendanceRate}%</div></dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Present</dt>
                        <dd><div className="text-3xl font-medium text-green-600">{stats.totalPresent}</div></dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Absent</dt>
                        <dd><div className="text-3xl font-medium text-red-600">{stats.totalAbsent}</div></dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Late Arrivals</dt>
                        <dd><div className="text-3xl font-medium text-yellow-600">{stats.totalLate}</div></dd>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div>
                    <p className="text-sm text-blue-700">
                        <strong>Insight:</strong> This dashboard currently shows global totals. To see per-class or per-student trends, you can add filters here to group by class_id or student_id.
                    </p>
                </div>
            </div>
        </div>
    )
}
