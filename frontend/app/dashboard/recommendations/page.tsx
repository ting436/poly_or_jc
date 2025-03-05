'use client'
import { useState } from 'react'

export default function RecommendationsPage() {
  const [formData, setFormData] = useState({
    interests: '',
    l1r5: '',
    strengths: '',
    learning_style: '',
    education_focus: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      // Handle response
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Get Recommendations</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Your form fields */}
      </form>
    </div>
  )
}