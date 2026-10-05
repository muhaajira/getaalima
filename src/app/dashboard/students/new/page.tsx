'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewStudentPage() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        date_of_birth: '',
        gender: 'Female',
        address: '',
        medical_notes: '',
        special_requirements: '',
        status: 'Lead',
        current_level: ''
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // The SQL trigger will auto-generate the student_id_code
            const { data, error } = await supabase.from('students').insert({
                ...formData,
                center_id: 1 // Default center
            }).select().single()

            if (error) throw error
            router.push(`/dashboard/students/${data.id}`)
        } catch (error) {
            console.error('Error creating student:', error)
            alert('Error creating student. Please check your database schema.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input type="tel" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Medical Notes</label>
                    <textarea rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.medical_notes} onChange={(e) => setFormData({...formData, medical_notes: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                            <option value="Lead">Lead</option>
                            <option value="Interested">Interested</option>
                            <option value="Assessed">Assessed</option>
                            <option value="Registered">Registered</option>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Withdrawn">Withdrawn</option>
                            <option value="Graduated">Graduated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Level</label>
                        <input type="text" placeholder="e.g. Beginner" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.current_level} onChange={(e) => setFormData({...formData, current_level: e.target.value})} />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{loading ? 'Saving...' : 'Save Student'}</button>
            </form>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
