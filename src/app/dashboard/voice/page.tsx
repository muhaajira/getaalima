'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface VoiceSession {
    id: string;
    session_title: string;
    host_id: string;
    start_time: string;
    end_time: string;
    is_live: boolean;
}

export default function VoicePlatformPage() {
    const [sessions, setSessions] = useState<VoiceSession[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        // Fetch upcoming and live sessions
        const { data, error } = await supabase.from('voice_sessions').select('*').order('start_time', { ascending: true }).limit(10)
        if (data) setSessions(data)
        setLoading(false)
    }

    if (loading) return <div className="p-6">Loading voice platform...</div>

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Voice Platform</h1>
                <Link href="/dashboard/voice/sessions/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Schedule Session</Link>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/voice/rooms" className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors">
                    <h3 className="font-semibold text-gray-800">Live Rooms</h3>
                    <p className="text-sm text-gray-500 mt-1">Join or start an immediate voice room.</p>
                </Link>
                <Link href="/dashboard/voice/library" className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors">
                    <h3 className="font-semibold text-gray-800">Audio Library</h3>
                    <p className="text-sm text-gray-500 mt-1">Browse past lessons organized by book.</p>
                </Link>
                <Link href="/dashboard/voice/sessions" className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors">
                    <h3 className="font-semibold text-gray-800">Scheduled Sessions</h3>
                    <p className="text-sm text-gray-500 mt-1">View all upcoming and past scheduled events.</p>
                </Link>
            </div>

            {/* Upcoming Sessions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Live Lessons</h2>
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-indigo-500">
                            <div>
                                <h3 className="font-medium text-gray-900">{session.session_title}</h3>
                                <p className="text-sm text-gray-500">
                                    Starts: {new Date(session.start_time).toLocaleString()} 
                                </p>
                            </div>
                            {session.is_live ? (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-pulse">
                                    LIVE NOW
                                </span>
                            ) : (
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
                                    Join Room
                                </button>
                            )}
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                            No upcoming sessions. Be the first to schedule a lesson!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
