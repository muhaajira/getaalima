'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewTicketPage() {
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'Medium',
        category: 'General Inquiry'
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // The SQL trigger will auto-generate the ticket_number (TKT-YYYY-NNNN)
            const { data, error } = await supabase.from('support_tickets').insert({
                ...formData,
                status: 'Open',
                created_by_id: (await supabase.auth.getUser()).data.user?.id
            }).select().single()

            if (error) throw error
            router.push('/dashboard/support/tickets')
        } catch (error) {
            console.error('Error creating ticket:', error)
            alert('Failed to create ticket. Ensure the support_tickets table is set up correctly.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Billing Issue">Billing Issue</option>
                            <option value="Technical Glitch">Technical Glitch</option>
                            <option value="Curriculum Question">Curriculum Question</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows={5} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{loading ? 'Submitting...' : 'Submit Ticket'}</button>
            </form>
        </div>
    )
}
