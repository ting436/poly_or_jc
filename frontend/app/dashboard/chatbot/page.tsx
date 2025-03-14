'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  type: 'user' | 'bot'
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set isClient to true once the component mounts
  useEffect(() => {
    setIsClient(true)
    
    // Check if there are recommendations from a recent form submission
    const recommendations = localStorage.getItem('recommendations')
    if (!recommendations) {
      // No recent form submission
      router.push('/dashboard/')
    }
    
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('chatMessages')
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error('Failed to parse saved messages:', e)
        localStorage.removeItem('chatMessages')
      }
    }
  }, [router])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isClient && messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages))
    }
  }, [messages, isClient])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // WebSocket connection
  useEffect(() => {
    if (!isClient) return

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return

      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close()
      }

      try {
        wsRef.current = new WebSocket('ws://localhost:8000/ws/chat')

        wsRef.current.onopen = () => {
          setIsConnected(true)
          console.log('WebSocket connected')
          
          // Clear any reconnection timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        wsRef.current.onmessage = (event) => {
          setMessages(prev => [...prev, { type: 'bot', content: event.data }])
        }

        wsRef.current.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          setIsConnected(false)
          
          // Attempt to reconnect after a delay
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, 3000)
        }

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    // Handle page unload/refresh
    const handleBeforeUnload = () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [isClient])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: input }])
    
    // Send message to WebSocket server
    try {
      wsRef.current.send(input)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
    
    // Clear input
    setInput('')
  }

  // Render nothing or a loading state until client-side hydration is complete
  if (!isClient) {
    return <div className="flex flex-col h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto">
      <div className="flex-1 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    </div>
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
          disabled={!isConnected || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      {!isConnected && (
        <div className="text-center text-red-500 mt-2">
          Disconnected from chat. Attempting to reconnect...
        </div>
      )}
    </div>
  )
}