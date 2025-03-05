'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">  {/* This ensures full height */}
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">  {/* Added flex flex-col */}
        <h1 className="text-2xl font-bold mb-8">Hi there</h1>
        <nav className="space-y-2 flex-1">  {/* Added flex-1 */}
          <Link 
            href="/dashboard"
            className={`block p-2 rounded ${
              pathname === '/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Form
          </Link>
          <Link 
            href="/dashboard/recommendations"
            className={`block p-2 rounded ${
              pathname === '/dashboard/recommendations' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Recommendations
          </Link>
          <Link 
            href="/dashboard/chatbot"
            className={`block p-2 rounded ${
              pathname === '/dashboard/chatbot' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Chatbot
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 overflow-auto">  {/* Added overflow-auto */}
        {children}
      </div>
    </div>
  )
}