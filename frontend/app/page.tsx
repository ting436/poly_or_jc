'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Clear all storage
    localStorage.clear()
    
    // Call cleanup API
    fetch('http://127.0.0.1:8000/api/cleanup', {
      method: 'POST',
    })
    .then(() => {
      router.push('/dashboard/')
    })
    .catch(console.error)
  }, [])

  return <div>Loading...</div>
}