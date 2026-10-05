'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from '@/i18n/navigation'

interface Student {
    id: string;
    student_id_code: string;
    first_name: string;
    last_name: string;
    status: string;
    current_level: string;
    phone: string;
}

export default function StudentListPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        fetchStudents()
    }, [filter])

    const fetchStudents = async () => {
        let query = supabase.from('students').select('*').order('created_at', { ascending: false })
        
        if (filter !== 'All') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query
        if (data) setStudents(data)
        setLoading(false)
    }

    if (loading) return <div className="p-6">Loading students...</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <Link href="/dashboard/students/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Student</Link>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-2">
                {['All', 'Active', 'Registered', 'Lead', 'Graduated'].map((status) => (
                    <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 rounded-full text-sm ${filter === status ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>{status}</button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                        <li key={student.id}>
                            <Link href={`/dashboard/students/${student.id}`} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <p className="ml-2 text-sm font-medium text-indigo-600 truncate">{student.student_id_code}</p>
                                            <div className="ml-4 flex flex-col">
                                                <p className="text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                                                <p className="text-sm text-gray-500">Level: {student.current_level || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-800' : student.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{student.status}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex"><p className="flex items-center text-sm text-gray-500">{student.phone}</p></div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
