'use client'
import { useState, useEffect } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/chat')
    setWs(websocket)

    websocket.onmessage = (event) => {
      setMessages(prev => [...prev, { type: 'bot', content: event.data }])
    }

    return () => websocket.close()
  }, [])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && ws) {
      ws.send(input)
      setMessages(prev => [...prev, { type: 'user', content: input }])
      setInput('')
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.type === 'user' ? 'text-right' : ''}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  )
}