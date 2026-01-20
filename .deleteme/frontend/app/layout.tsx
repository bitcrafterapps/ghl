import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ThreeBears',
  description: 'A modern full-stack application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen dark-theme`}>
        <ThemeProvider>
          <AuthProvider>
            {children as any}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
