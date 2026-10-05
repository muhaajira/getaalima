'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewPaymentPage() {
    const [formData, setFormData] = useState({
        invoice_id: '',
        amount: 0,
        payment_method: 'Cash',
        notes: ''
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // 1. Insert the payment
            const { data: payment, error: payErr } = await supabase.from('payments').insert({
                invoice_id: formData.invoice_id,
                amount: formData.amount,
                payment_method: formData.payment_method,
                notes: formData.notes
            }).select().single()

            if (payErr) throw payErr

            // 2. Update the invoice status based on the new payment
            const { data: inv } = await supabase.from('invoices').select('*').eq('id', formData.invoice_id).single()
            
            if (inv) {
                const totalPaid = Number(inv.paid_amount || 0) + Number(formData.amount)
                const newStatus = totalPaid >= Number(inv.total_amount) ? 'Paid' : 'Partially Paid'
                
                await supabase.from('invoices').update({
                    paid_amount: totalPaid,
                    status: newStatus
                }).eq('id', formData.invoice_id)
            }

            router.push('/dashboard/finance')
        } catch (error) {
            console.error('Error recording payment:', error)
            alert('Failed to record payment. Check that the Invoice ID is valid.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Invoice ID (UUID)</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.invoice_id} onChange={(e) => setFormData({...formData, invoice_id: e.target.value})} placeholder="Paste the UUID of the invoice" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount Received ($)</label>
                    <input type="number" step="0.01" min="0" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes / Reference</label>
                    <textarea rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{loading ? 'Processing...' : 'Confirm Payment'}</button>
            </form>
        </div>
    )
}
