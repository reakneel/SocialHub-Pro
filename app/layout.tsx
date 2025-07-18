import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SocialHub Pro - Multi-Platform Social Media Management',
  description: 'Professional social media management tool supporting multiple platforms including Bilibili, Weibo, Douyu, X (Twitter), and YouTube.',
  keywords: ['social media', 'management', 'bilibili', 'weibo', 'twitter', 'youtube', 'douyu'],
  authors: [{ name: 'SocialHub Pro Team' }],
  openGraph: {
    title: 'SocialHub Pro',
    description: 'Professional multi-platform social media management tool',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}