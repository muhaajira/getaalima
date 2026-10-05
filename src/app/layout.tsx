import "./globals.css";

// Minimal root layout — the <html>/<body> tags live in [locale]/layout.tsx
// so each language can set its own lang and dir (rtl for Arabic).
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
