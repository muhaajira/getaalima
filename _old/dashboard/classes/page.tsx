'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ClassRoom {
    id: string;
    class_name: string;
    academic_level_id: number;
    teacher_id: string;
    schedule_days: string[];
    start_time: string;
    end_time: string;
    capacity: number;
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassRoom[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false })
        if (data) setClasses(data)
        setLoading(false)
    }

    if (loading) return <div className="p-6">Loading classes...</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Academic Classes</h1>
                <Link href="/dashboard/classes/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create Class</Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-800">{cls.class_name}</h3>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p><strong>Schedule:</strong> {cls.schedule_days?.join(', ') || 'Not Set'}</p>
                            <p><strong>Time:</strong> {cls.start_time} - {cls.end_time}</p>
                            <p><strong>Capacity:</strong> {cls.capacity} students</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
