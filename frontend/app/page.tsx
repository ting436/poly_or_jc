'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Clear all storage
    localStorage.clear()
    
    router.push('/dashboard/')
  }, [])

  return <div>Loading...</div>
}