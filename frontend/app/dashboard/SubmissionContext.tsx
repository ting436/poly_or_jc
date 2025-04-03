'use client'
import { createContext, useContext, useState } from 'react'

interface SubmissionContextType {
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined)

export const SubmissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <SubmissionContext.Provider value={{ isSubmitting, setIsSubmitting }}>
      {children}
    </SubmissionContext.Provider>
  )
}

export const useSubmission = () => {
  const context = useContext(SubmissionContext)
  if (!context) {
    throw new Error('useSubmission must be used within a SubmissionProvider')
  }
  return context
}