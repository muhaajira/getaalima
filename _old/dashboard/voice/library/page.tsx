'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AudioLesson {
    id: string;
    book_title: string;
    lesson_number: number;
    title: string;
    audio_url: string;
    duration_seconds: number;
}

export default function AudioLibraryPage() {
    const [lessons, setLessons] = useState<AudioLesson[]>([])
    const [loading, setLoading] = useState(true)
    const [activeBook, setActiveBook] = useState<string | null>(null)
    const [playingId, setPlayingId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        fetchLessons()
    }, [])

    const fetchLessons = async () => {
        const { data, error } = await supabase.from('audio_library').select('*').order('book_title').order('lesson_number')
        if (data) setLessons(data)
        setLoading(false)
    }

    const togglePlay = (lesson: AudioLesson) => {
        if (!audioRef.current) {
            audioRef.current = new Audio(lesson.audio_url)
            
            audioRef.current.onended = () => setPlayingId(null)
        }

        if (playingId === lesson.id) {
            audioRef.current.pause()
            setPlayingId(null)
        } else {
            if (audioRef.current.src !== lesson.audio_url) {
                audioRef.current.src = lesson.audio_url
            }
            audioRef.current.play()
            setPlayingId(lesson.id)
        }
    }

    if (loading) return <div className="p-6">Loading library...</div>

    // Group lessons by book for better UX
    const groupedLessons = lessons.reduce((acc, lesson) => {
        acc[lesson.book_title] = [...(acc[lesson.book_title] || []), lesson]
        return acc
    }, {} as Record<string, AudioLesson[]>)

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Audio Library</h1>
            
            <div className="space-y-6">
                {Object.entries(groupedLessons).map(([bookTitle, bookLessons]) => (
                    <div key={bookTitle} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setActiveBook(activeBook === bookTitle ? null : bookTitle)}
                            className="w-full px-6 py-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                        >
                            <h3 className="font-semibold text-gray-800">{bookTitle}</h3>
                            <span className={`transform transition-transform ${activeBook === bookTitle ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        
                        {activeBook === bookTitle && (
                            <ul className="divide-y divide-gray-100">
                                {bookLessons.map((lesson) => (
                                    <li key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-indigo-50/50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <button 
                                                onClick={() => togglePlay(lesson)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                                    playingId === lesson.id ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                                }`}
                                            >
                                                {playingId === lesson.id ? '❚❚' : '▶'}
                                            </button>
                                            <div>
                                                <p className="font-medium text-gray-900">Lesson {lesson.lesson_number}: {lesson.title}</p>
                                                <p className="text-xs text-gray-500">{Math.floor(lesson.duration_seconds / 60)} min {lesson.duration_seconds % 60} sec</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
                
                {Object.keys(groupedLessons).length === 0 && (
                    <div className="bg-white p-10 rounded-lg shadow-sm text-center text-gray-500">
                        The library is empty. Upload your first audio lesson to get started!
                    </div>
                )}
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
