import { redirect } from 'next/navigation'

export default function LandingPage() {
    // The app lives behind login; land visitors on the dashboard.
    redirect('/dashboard')
}
