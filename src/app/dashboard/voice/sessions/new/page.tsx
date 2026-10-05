'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewSessionPage() {
    const [formData, setFormData] = useState({
        session_title: '',
        description: '',
        start_time: '',
        end_time: '',
        max_participants: 50
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            const { error } = await supabase.from('voice_sessions').insert({
                ...formData,
                host_id: user?.id,
                is_live: false
            })

            if (error) throw error
            router.push('/dashboard/voice')
        } catch (error) {
            console.error('Error scheduling session:', error)
            alert('Failed to schedule session.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Schedule a Voice Session</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Session Title</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.session_title} onChange={(e) => setFormData({...formData, session_title: e.target.value})} placeholder="e.g. Advanced Tajweed Lesson" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input type="datetime-local" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input type="datetime-local" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Max Participants</label>
                    <input type="number" min="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.max_participants} onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})} />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{loading ? 'Scheduling...' : 'Create Session'}</button>
            </form>
        </div>
    )
}
