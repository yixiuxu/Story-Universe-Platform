import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/theme-provider'
import Navbar from '@/components/Navbar'
import { GlobalSearchSidebar } from '@/components/GlobalSearchSidebar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
            <GlobalSearchSidebar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}