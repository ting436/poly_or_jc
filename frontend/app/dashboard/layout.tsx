'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '../components/Navbar'
import { SubmissionProvider, useSubmission } from './SubmissionContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SubmissionProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar pathname={pathname ?? ''} />

        {/* Main Content */}
        <div className="flex flex-col flex-1">
        <Navbar />
          <div className="flex-1 bg-rose-50 overflow-auto p-2">{children}</div>
        </div>
      </div>
    </SubmissionProvider>
  )

}

const Sidebar = ({ pathname }: { pathname: string }) => {
  const { isSubmitting } = useSubmission()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`w-64 bg-rose-100 text-gray-800 p-4 flex flex-col ${
          isSubmitting ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <h1 className="text-2xl font-bold mb-8 text-gray-700">Hi there</h1>
        <nav className="space-y-2 flex-1">
          <Link
            href="/dashboard"
            className={`block p-2 rounded ${
              pathname === '/dashboard'
                ? 'bg-rose-200 text-rose-800'
                : 'hover:bg-rose-100'
            }`}
          >
            Form
          </Link>
          <Link
            href="/dashboard/recommendations"
            className={`block p-2 rounded ${
              pathname === '/dashboard/recommendations'
                ? 'bg-rose-200 text-rose-800'
                : 'hover:bg-rose-100'
            }`}
          >
            Recommendations
          </Link>
          <Link
            href="/dashboard/chatbot"
            className={`block p-2 rounded ${
              pathname === '/dashboard/chatbot'
                ? 'bg-rose-200 text-rose-800'
                : 'hover:bg-rose-100'
            }`}
          >
            Chatbot
          </Link>
        </nav>
      </div>
    </div>
  )
}