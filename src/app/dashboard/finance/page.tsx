'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Invoice {
    id: string;
    invoice_number: string;
    student_id: string;
    total_amount: number;
    status: string;
    due_date: string;
}

export default function FinancePage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState({ outstanding: 0, collected: 0 })

    useEffect(() => {
        fetchFinanceData()
    }, [])

    const fetchFinanceData = async () => {
        const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(20)
        if (data) {
            setInvoices(data)
            const outstanding = data.filter(i => i.status === 'Unpaid' || i.status === 'Partially Paid').reduce((sum, i) => sum + Number(i.total_amount), 0)
            const collected = data.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.total_amount), 0)
            setSummary({ outstanding, collected })
        }
        setLoading(false)
    }

    if (loading) return <div className="p-6">Loading financials...</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                <Link href="/dashboard/finance/payments/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Record Payment</Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
                        <dd><div className="text-3xl font-medium text-red-600">${summary.outstanding.toLocaleString()}</div></dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Recently Collected</dt>
                        <dd><div className="text-3xl font-medium text-green-600">${summary.collected.toLocaleString()}</div></dd>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Invoices</h3>
                    <ul className="mt-4 divide-y divide-gray-200">
                        {invoices.map((inv) => (
                            <li key={inv.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{inv.invoice_number}</p>
                                    <p className="text-xs text-gray-500">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">${Number(inv.total_amount).toFixed(2)}</p>
                                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                        inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                                        inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>{inv.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
