'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewClassPage() {
    const [formData, setFormData] = useState({
        class_name: '',
        academic_level_id: 1,
        teacher_id: '',
        schedule_days: [] as string[],
        start_time: '09:00',
        end_time: '10:30',
        capacity: 20
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            schedule_days: prev.schedule_days.includes(day) 
                ? prev.schedule_days.filter(d => d !== day)
                : [...prev.schedule_days, day]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { error } = await supabase.from('classes').insert(formData)
            if (error) throw error
            router.push('/dashboard/classes')
        } catch (error) {
            console.error('Error creating class:', error)
            alert('Error creating class. Ensure the academic_levels and users tables are populated.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create New Class</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.class_name} onChange={(e) => setFormData({...formData, class_name: e.target.value})} placeholder="e.g. Beginner Group A" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Academic Level ID</label>
                        <input type="number" min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.academic_level_id} onChange={(e) => setFormData({...formData, academic_level_id: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teacher ID (UUID)</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.teacher_id} onChange={(e) => setFormData({...formData, teacher_id: e.target.value})} placeholder="Paste Teacher User UUID" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Schedule Days</label>
                    <div className="mt-2 flex space-x-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-3 py-1 rounded ${formData.schedule_days.includes(day) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{day}</button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input type="time" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input type="time" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input type="number" min="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{loading ? 'Creating...' : 'Create Class'}</button>
            </form>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
