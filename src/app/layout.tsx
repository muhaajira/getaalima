import './globals.css'

export const metadata = {
  title: 'Education SaaS',
  description: 'Management system for educational centers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
