'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  type: 'user' | 'bot'
  content: string
}

export default function ChatPage() {
  const router = useRouter()

  // Check if there are recommendations from a recent form submission
  useEffect(() => {
    const recommendations = localStorage.getItem('recommendations')
    if (!recommendations) {
      // No recent form submission
      router.push('/dashboard/')
    }
  }, [router])

  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatMessages')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/ws/chat')

    wsRef.current.onopen = () => {
      setIsConnected(true)
    }

    wsRef.current.onmessage = (event) => {
      setMessages(prev => [...prev, { type: 'bot', content: event.data }])
    }

    wsRef.current.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      wsRef.current?.close()
    }
  }, [])

  const handleEndChat = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    // Clear chat history
    localStorage.removeItem('chatMessages')
    setMessages([])
    router.push('/dashboard')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !wsRef.current) return

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: input }])
    
    // Send message to WebSocket server
    wsRef.current.send(input)
    
    // Clear input
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      {!isConnected && (
        <div className="text-center text-red-500 mt-2">
          Disconnected from chat. Please refresh the page.
        </div>
      )}
    </div>
  )
}