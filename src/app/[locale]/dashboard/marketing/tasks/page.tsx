'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Task {
    id: string;
    task_title: string;
    assigned_to_id: string;
    status: string;
    due_date: string;
}

export default function MarketingTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        const { data, error } = await supabase.from('marketing_tasks').select('*').order('due_date', { ascending: true })
        if (data) setTasks(data)
        setLoading(false)
    }

    const updateStatus = async (taskId: string, newStatus: string) => {
        await supabase.from('marketing_tasks').update({ status: newStatus }).eq('id', taskId)
        fetchTasks()
    }

    if (loading) return <div className="p-6">Loading tasks...</div>

    const columns = ['Pending', 'In Progress', 'Completed']

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Marketing Task Board</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((colName) => (
                    <div key={colName} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">{colName}</h3>
                        <div className="space-y-3">
                            {tasks.filter(t => t.status === colName).map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                    <h4 className="font-medium text-gray-900">{task.task_title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                                    <div className="mt-3 flex justify-end space-x-2">
                                        {colName !== 'Pending' && <button onClick={() => updateStatus(task.id, 'Pending')} className="text-xs text-gray-500 hover:text-indigo-600">Back to Pending</button>}
                                        {colName === 'Pending' && <button onClick={() => updateStatus(task.id, 'In Progress')} className="text-xs text-indigo-600 hover:underline">Start</button>}
                                        {colName === 'In Progress' && <button onClick={() => updateStatus(task.id, 'Completed')} className="text-xs text-green-600 hover:underline">Complete</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
