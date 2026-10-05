'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
        if (data) setNotifications(data)
        setLoading(false)
    }

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        fetchNotifications()
    }

    if (loading) return <div className="p-6">Loading notifications...</div>

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notification Center</h1>
            
            {notifications.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                    You are all caught up! No new notifications.
                </div>
            ) : (
                notifications.map((notif) => (
                    <div key={notif.id} onClick={() => !notif.is_read && markAsRead(notif.id)} className={`p-4 rounded-lg border ${notif.is_read ? 'bg-white border-gray-200 opacity-70' : 'bg-indigo-50 border-indigo-100 cursor-pointer hover:bg-indigo-100'} transition-all`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className={`font-medium ${notif.is_read ? 'text-gray-700' : 'text-indigo-900'}`}>{notif.title}</h3>
                                <p className="text-sm mt-1 text-gray-600">{notif.message}</p>
                            </div>
                            {!notif.is_read && <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-600 text-white rounded-full">New</span>}
                        </div>
                        <p className="mt-2 text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                ))
            )}
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
