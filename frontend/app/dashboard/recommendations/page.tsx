'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in"); // Redirect to sign-in if not authenticated
    }
  }, [status, router]);
  
  useEffect(() => {
    const email = session?.user.email
    const recommendations = localStorage.getItem(`recommendations${email}`)
    if (!recommendations) {
      // No recent form submission
      router.push('/dashboard/')
    }
  }, [router])

  useEffect(() => {
    const email = session?.user.email
    const storedRecs = localStorage.getItem(`recommendations${email}`)
    if (storedRecs) {
      setRecommendations(JSON.parse(storedRecs))
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No recommendations available. Please complete the form first.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Educational Pathway Recommendations</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">
            {recommendations}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => window.location.href = '/dashboard/chatbot'}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Chat with AI Assistant
        </button>
      </div>
    </div>
  )
}