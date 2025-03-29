'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleServicesClick = () => {
    if (pathname === '/dashboard') {
      return
    }

    if (session?.user) {
      router.push('/dashboard')
    } else {
      router.push('/sign-in')
    }
  }

  const handleSignInOut = () => {
    if (session?.user) {
      signOut({ callbackUrl: '/' }) // Log out the user
    } else {
      router.push('/sign-in') // Redirect to sign-in page
    }
  }

  return (
    <nav className="w-full flex justify-between items-center py-4 px-8 bg-rose-50">
      <h1 className="text-xl font-bold">Educational Pathway Advisor</h1>
      <div className="space-x-6 flex items-center">
        <a href="/" className="text-gray-700 hover:text-black">Home</a>
        <button onClick={handleServicesClick} className="text-gray-700 hover:text-black">Services</button>
        <a href="#" className="text-gray-700 hover:text-black">Contact Us</a>
        <button
          onClick={handleSignInOut}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
        >
          {session ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar