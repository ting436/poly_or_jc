'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'  // Add this import


export default function FormPage() {
  const router = useRouter() 
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Key Considerations Checkboxes
    key_considerations: {
      fees: false,
      location: false,
      intern_opp: false,
      stress: false,
      career_opp: false,
      school_env: false,
      extracurricular: false
    },
    // Step 2: Rankings of selected considerations
    rankings: {},
    // Step 3: Short answers
    explanations: {},
    other_answers: {
      interests: '',
      l1r5: '',
      strengths: '',
      learning_style: '',
      education_focus: ''
    }
  })

  const considerations = {
    fees: "School Fees",
    location: "Location",
    intern_opp: "Internship Opportunities",
    stress: "Stress Level",
    career_opp: "Career Opportunities",
    school_env: "School Environment (e.g., large student body)",
    extracurricular: "CCA/Interest Groups"
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      // Initialize rankings for selected considerations
      const selectedConsiderations = Object.entries(formData.key_considerations)
        .filter(([_, checked]) => checked)
        .reduce((acc, [key]) => ({
          ...acc,
          [key]: ''
        }), {})
      
      setFormData(prev => ({
        ...prev,
        rankings: selectedConsiderations
      }))
    }
    setStep(step + 1)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              What are the key considerations you have in choosing poly or JC?
            </h2>
            <div className="space-y-4">
              {Object.entries(considerations).map(([key, label]) => (
                <label key={key} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.key_considerations[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      key_considerations: {
                        ...formData.key_considerations,
                        [key]: e.target.checked
                      }
                    })}
                    className="mt-1"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Rank Your Considerations</h2>
            <p className="text-sm text-gray-600">
              Rank from 1 (most important) to {Object.keys(formData.rankings).length} (least important)
            </p>
            <div className="space-y-4">
              {Object.keys(formData.rankings).map((key) => (
                <div key={key} className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max={Object.keys(formData.rankings).length}
                    value={formData.rankings[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      rankings: {
                        ...formData.rankings,
                        [key]: e.target.value
                      }
                    })}
                    className="w-20 p-2 border rounded"
                  />
                  <span>{considerations[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Explain Your Rankings</h2>
              {Object.keys(formData.rankings).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="block font-medium">
                    Why did you rank {considerations[key]} as {formData.rankings[key]}?
                  </label>
                  <textarea
                    value={formData.explanations[key] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      explanations: {
                        ...formData.explanations,
                        [key]: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded h-24"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Other Questions</h2>
              {[
                ['interests', 'What are your current interests?/ What career paths are you considering for your future?'],
                ['l1r5', 'What is your L1R5 Score?'],
                ['strengths', 'What are your strengths/skills?'],
                ['learning_style', 'Do you prefer academic, theory-based learning or hands-on, practical experience?'],
                ['education_focus', 'Are you focused on entering a specific industry or do you want a more general university education?']
              ].map(([key, question]) => (
                <div key={key} className="space-y-2">
                  <label className="block font-medium">{question}</label>
                  <textarea
                    value={formData.other_answers[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      other_answers: {
                        ...formData.other_answers,
                        [key]: e.target.value
                      }
                    })}
                    className="w-full p-2 border rounded h-24"
                  />
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submissionData = {
        interests: formData.other_answers.interests,
        l1r5: formData.other_answers.l1r5,
        strengths: formData.other_answers.strengths,
        learning_style: formData.other_answers.learning_style,
        education_focus: formData.other_answers.education_focus,
        key_considerations: formData.key_considerations,
        rankings: formData.rankings,
        explanations: formData.explanations
      }
      const submitResponse = await fetch('http://127.0.0.1:8000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      console.log('Response status:', submitResponse.status)  // Debug log
      
      const responseText = await submitResponse.text()
      console.log('Raw response:', responseText)  // Debug log
      
      const submitData = JSON.parse(responseText)
      console.log('Parsed response:', submitData)  // Debug log
  
      if (!submitData.id) {
        console.error('Response data:', submitData)  // Debug log
        throw new Error('No ID returned from form submission')
      }

      const recsResponse = await fetch(`http://127.0.0.1:8000/api/recommendations/${submitData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
  
      const recommendations = await recsResponse.json()

      localStorage.removeItem('chatMessages')
      
      // Store recommendations in localStorage
      localStorage.setItem('recommendations', JSON.stringify(recommendations))
      
      // Redirect to recommendations page
      router.push('/dashboard/recommendations')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <form className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-auto"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}