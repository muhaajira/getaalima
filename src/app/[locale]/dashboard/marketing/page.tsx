'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from '@/i18n/navigation'

interface Campaign {
    id: string;
    campaign_name: string;
    channel: string;
    status: string;
    budget: number;
}

export default function MarketingPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async () => {
        const { data, error } = await supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false })
        if (data) setCampaigns(data)
        setLoading(false)
    }

    if (loading) return <div className="p-6">Loading marketing campaigns...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Marketing & Growth</h1>
                <Link href="/dashboard/marketing/tasks" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Task Board</Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((camp) => (
                    <div key={camp.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-800">{camp.campaign_name}</h3>
                            <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${camp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{camp.status}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            <p><strong>Channel:</strong> {camp.channel}</p>
                            <p><strong>Budget:</strong> ${camp.budget.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {campaigns.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No active campaigns yet. Start by creating your first growth initiative.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Render on-demand (uses browser APIs + Supabase auth)
export const dynamic = 'force-dynamic'
