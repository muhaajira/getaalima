'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface AttendanceRecord {
    id: string;
    student_id: string;
    class_id: string;
    date: string;
    status: 'P' | 'A' | 'L' | 'E'; // Present, Absent, Late, Excused
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        fetchAttendance(selectedDate)
    }, [selectedDate])

    const fetchAttendance = async (date: string) => {
        const { data, error } = await supabase.from('attendance_records').select('*').eq('date', date).order('created_at', { ascending: false })
        if (data) setRecords(data)
        setLoading(false)
    }

    if (loading) return <div className="p-6">Loading attendance...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Daily Attendance</h1>
                <Link href="/dashboard/attendance/analytics" className="text-indigo-600 hover:underline">View Analytics →</Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                <label className="font-medium text-gray-700">Select Date:</label>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {records.map((rec) => (
                            <tr key={rec.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.student_id.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.class_id.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                        rec.status === 'P' ? 'bg-green-100 text-green-800' :
                                        rec.status === 'A' ? 'bg-red-100 text-red-800' :
                                        rec.status === 'L' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>{rec.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => updateStatus(rec.id, rec.status === 'P' ? 'A' : 'P')} className="text-indigo-600 hover:text-indigo-900">Toggle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <p className="text-sm text-gray-500 italic">Note: To add new attendance records, use the API or extend this page with a "Mark Attendance" form.</p>
        </div>
    )

    const updateStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'P' ? 'A' : 'P'
        await supabase.from('attendance_records').update({ status: newStatus }).eq('id', id)
        fetchAttendance(selectedDate)
    }
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
