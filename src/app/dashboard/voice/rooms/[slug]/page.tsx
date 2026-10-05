'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Room, RemoteParticipant, Track } from 'livekit-client'
import { getRoom, disconnectFromRoom } from '@/lib/livekit'

export default function VoiceRoomPage() {
    const params = useParams()
    const roomSlug = params.slug as string
    const [roomState, setRoomState] = useState<'connecting' | 'connected' | 'error'>('connecting')
    const [participants, setParticipants] = useState<RemoteParticipant[]>([])
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [micEnabled, setMicEnabled] = useState(true)
    
    const localStreamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        const connectToRoom = async () => {
            try {
                // Get LiveKit token (in production, this should be a server-side API route)
                // For now, we assume the URL and Key are in env vars
                const url = process.env.NEXT_PUBLIC_LIVEKIT_URL
                const apiKey = process.env.NEXT_PUBLIC_LIVEKIT_API_KEY
                
                if (!url || !apiKey) throw new Error('Missing LiveKit configuration')

                const room = getRoom()
                
                room.on('participantConnected', (p: RemoteParticipant) => {
                    setParticipants(prev => [...prev, p])
                })
                room.on('participantDisconnected', (p: RemoteParticipant) => {
                    setParticipants(prev => prev.filter(part => part.identity !== p.identity))
                })
                room.on('activeSpeakersChanged', (speakers) => {
                    console.log('Active speakers:', speakers.map(s => s.identity))
                })

                await room.connect(url, `demo-token-${roomSlug}`)
                setRoomState('connected')
                
                // Enable microphone
                await room.localParticipant.setMicrophoneEnabled(micEnabled)

            } catch (err) {
                console.error('Connection error:', err)
                setRoomState('error')
            }
        }

        connectToRoom()

        return () => {
            disconnectFromRoom()
        }
    }, [roomSlug, micEnabled])

    const startRecording = async () => {
        try {
            // Capture audio from all participants
            const stream = new MediaStream()
            
            // Add local track
            const localTrack = getRoom().localParticipant.getTrack(Track.Kind.Audio)
            if (localTrack) {
                stream.addTrack(localTrack.mediaStreamTrack)
            }

            // Add remote tracks
            participants.forEach(p => {
                const remoteTrack = p.getTrack(Track.Kind.Audio)
                if (remoteTrack) {
                    stream.addTrack(remoteTrack.mediaStreamTrack)
                }
            })

            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
            const chunks: Blob[] = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                downloadBlob(blob, `${roomSlug}-recording.webm`)
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
        } catch (err) {
            console.error('Recording error:', err)
            alert('Could not start recording. Please ensure you have permission to access audio.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop()
            setIsRecording(false)
        }
    }

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const toggleMic = async () => {
        const newState = !micEnabled
        setMicEnabled(newState)
        await getRoom().localParticipant.setMicrophoneEnabled(newState)
    }

    if (roomState === 'connecting') {
        return <div className="p-6 text-center">Connecting to secure voice room...</div>
    }

    if (roomState === 'error') {
        return <div className="p-6 text-center text-red-500">Failed to connect. Check your LiveKit configuration.</div>
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white capitalize">{roomSlug.replace(/-/g, ' ')}</h1>
                    <p className="text-gray-400 mt-1 text-sm">Secure Women-Only Voice Space</p>
                </div>

                {/* Participant List */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">In this room ({participants.length + 1})</h3>
                    <ul className="space-y-1">
                        <li className="flex items-center space-x-2 text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-sm">You (Host)</span>
                        </li>
                        {participants.map(p => (
                            <li key={p.identity} className="flex items-center space-x-2 text-gray-300">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                <span className="text-sm">{p.name || p.identity}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={toggleMic}
                        className={`py-3 rounded-lg font-medium transition-colors ${
                            micEnabled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {micEnabled ? '🎤 Mic On' : '🔇 Muted'}
                    </button>
                    
                    <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`py-3 rounded-lg font-medium transition-colors ${
                            isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                    >
                        {isRecording ? '⏹ Stop' : '⏺ Record'}
                    </button>

                    <button 
                        onClick={() => disconnectFromRoom()}
                        className="py-3 rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-600"
                    >
                        📞 Leave
                    </button>
                </div>

                {isRecording && (
                    <div className="text-center text-xs text-red-400 bg-red-900/30 py-2 rounded-md">
                        Recording locally on your device...
                    </div>
                )}
            </div>
        </div>
    )
}
