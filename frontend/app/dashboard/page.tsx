'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useSubmission } from './SubmissionContext'

export default function FormPage() {
  const { data: session, status } = useSession();
  const router = useRouter()
  const { isSubmitting, setIsSubmitting } = useSubmission()
  const [step, setStep] = useState(1)
  const [validationError, setValidationError] = useState('')
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

  // State to handle drag and drop
  const [rankingItems, setRankingItems] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in"); // Redirect to sign-in if not authenticated
    }
  }, [status, router]);

  // Effect to update rankingItems when we move to step 2
  useEffect(() => {
    if (step === 2) {
      // Convert selected considerations to draggable items
      const selectedItems = Object.entries(formData.key_considerations)
        .filter(([_, checked]) => checked)
        .map(([key], index) => ({
          id: key,
          content: considerations[key],
          rank: index + 1
        }));
      
      setRankingItems(selectedItems);
    }
  }, [step, formData.key_considerations]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading state while checking the session
  }

  const LOCATION_OPTIONS = [
    "North",
    "South",
    "East",
    "West"
  ]
  
  const FEES_OPTIONS = [
    "Below $100/month",
    "Below $300/month",
    "Below $500/month"
  ]

  const considerations = {
    fees: "School Fees",
    location: "Location",
    intern_opp: "Internship Opportunities",
    stress: "Stress Level",
    career_opp: "Career Opportunities",
    school_env: "School Environment (e.g., large student body)",
    extracurricular: "CCA/Interest Groups"
  }

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('bg-rose-100');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-100');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-gray-100');
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-100');
    
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === targetIndex) return;
    
    const items = Array.from(rankingItems);
    const [movedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, movedItem);
    
    // Update ranks based on new order
    const rankedItems = items.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
    
    setRankingItems(rankedItems);
    
    // Update rankings in formData
    const newRankings = {};
    rankedItems.forEach(item => {
      newRankings[item.id] = item.rank.toString();
    });
    
    setFormData(prev => ({
      ...prev,
      rankings: newRankings
    }));
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('bg-rose-100');
  };

  const validateRankings = () => {
    // With drag and drop, rankings should always be valid as the UI enforces ordering
    if (rankingItems.length === 0) {
      setValidationError('Please rank your considerations');
      return false;
    }
    
    setValidationError('');
    return true;
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1) {
      // Check if at least one consideration is selected
      const hasSelections = Object.values(formData.key_considerations).some(checked => checked)
      
      if (!hasSelections) {
        setValidationError('Please select at least one consideration')
        return;
      }
      
      // Initialize rankings for selected considerations
      const selectedConsiderations = Object.entries(formData.key_considerations)
        .filter(([_, checked]) => checked)
        .reduce((acc, [key], index) => ({
          ...acc,
          [key]: (index + 1).toString()
        }), {});
      
      setFormData(prev => ({
        ...prev,
        rankings: selectedConsiderations
      }));
      
      setValidationError('');
    } else if (step === 2) {
      // Validate rankings before proceeding
      if (!validateRankings()) {
        return;
      }
    }
    
    setStep(step + 1);
  }
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 bg-rose-50 p-6 rounded-lg">
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
            {validationError && (
              <p className="text-red-500 mt-2">{validationError}</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Rank Your Considerations</h2>
            <p className="text-sm text-gray-600">
              Drag and drop to rank from most important (top) to least important (bottom)
            </p>
            
            <div className="space-y-4">
              {rankingItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className="p-4 rounded-lg shadow-md flex items-center bg-white cursor-move transition-colors duration-200 hover:bg-rose-100"
                >
                  <div className="flex-1 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold mr-4">
                      {item.rank}
                    </div>
                    <span className="font-medium">{item.content}</span>
                  </div>
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            
            {validationError && (
              <p className="text-red-500 mt-2">{validationError}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Explain Your Rankings</h2>
              {Object.keys(formData.rankings).map((key) => (
                <div key={key} className="space-y-2 p-4 rounded-lg">
                  <label className="block font-medium">
                    Why did you rank {considerations[key]} as {formData.rankings[key]}?
                  </label>
                  {key === 'fees' ? (
                    <select
                      value={formData.explanations[key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        explanations: {
                          ...formData.explanations,
                          [key]: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select fee range</option>
                      {FEES_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : key === 'location' ? (
                    <select
                      value={formData.explanations[key] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        explanations: {
                          ...formData.explanations,
                          [key]: e.target.value
                        }
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select location preference</option>
                      {LOCATION_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
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
                  )}
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
                <div key={key} className="space-y-2 p-4 rounded-lg">
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent double submission
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

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

      const token = session?.user.accessToken;
      const email = session?.user.email;

      localStorage.removeItem(`recommendations${email}`)

      localStorage.removeItem(`chatMessages${email}`)

      const submitResponse = await fetch("http://127.0.0.1:8000/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
        body: JSON.stringify(submissionData),
      });

      console.log('Response status:', submitResponse.status)  // Debug log
      
      const responseText = await submitResponse.text()
      console.log('Raw response:', responseText)  // Debug log
      
      const submitData = JSON.parse(responseText)
      console.log('Parsed response:', submitData)  // Debug log

  
      // Fetch recommendations
      const recsResponse = await fetch("http://127.0.0.1:8000/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
      });

      if (!recsResponse.ok) {
        throw new Error("Failed to fetch recommendations");
      }
  
      const recommendations = await recsResponse.json()
      
      // Store recommendations in localStorage
      localStorage.setItem(`recommendations${email}`, JSON.stringify(recommendations))
      
      // Redirect to recommendations page
      router.push('/dashboard/recommendations')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
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
              className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded ml-auto ${
                isSubmitting 
                  ? 'bg-green-300 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}