'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VoiceRoomsPage() {
    const [roomName, setRoomName] = useState('')
    const router = useRouter()

    const startInstantRoom = () => {
        if (!roomName) return
        // In a full implementation, you would create the room in Supabase first.
        // For now, we'll use a hash-based route to identify the room.
        const slug = roomName.toLowerCase().replace(/ /g, '-')
        router.push(`/dashboard/voice/rooms/${slug}`)
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md text-center space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Start an Instant Room</h2>
                <p className="text-sm text-gray-500">Create a secure voice space for your sisters right now.</p>
                
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Enter Room Name (e.g. Circle 1)" 
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    
                    <button 
                        onClick={startInstantRoom}
                        disabled={!roomName}
                        className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        Enter Secure Room
                    </button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        🔒 This room is protected by our women-only verification system.
                    </p>
                </div>
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
