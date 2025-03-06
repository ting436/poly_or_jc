# Educational Pathway Advisor

An AI-powered application that helps students make informed decisions about their educational pathway between Junior College (JC) and Polytechnic options in Singapore.

## Features

- **Smart Form**: Collects student preferences, academic performance, and key considerations
- **Personalized Recommendations**: Uses RAG (Retrieval Augmented Generation) to provide tailored institution suggestions
- **Interactive Chat**: AI assistant to answer follow-up questions about recommendations
- **Persistent Sessions**: Maintains chat history during navigation

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- WebSocket for real-time chat

### Backend
- FastAPI
- MySQL
- LangChain for RAG implementation
- WebSocket for bidirectional communication

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=its 

# Backend (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

5. Start the development servers:
```bash
# Frontend
npm run dev

# Backend
uvicorn main:app --reload
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── form/
│   │   │   ├── recommendations/
│   │   │   └── chat/
│   │   └── layout.tsx
│   └── package.json
│
└── backend/
    ├── main.py
    ├── rag_pipeline.py
    └── requirements.txt
```
