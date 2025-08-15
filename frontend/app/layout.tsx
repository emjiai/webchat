import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chatbot Widget - Voice & Text with RAG',
  description: 'Embeddable AI chatbot supporting real-time voice and text conversations with retrieval-augmented generation',
  keywords: 'AI, chatbot, voice, text, RAG, embeddable widget, Next.js',
  authors: [{ name: 'AI Chatbot Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.className}>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  )
}