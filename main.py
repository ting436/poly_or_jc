from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List, Optional
from ConnectionManagers.MySQLManager import MySQLManager
from rag_pipeline import RAG_Chat
import json
import os
from pydantic import BaseModel
from dotenv import load_dotenv
# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Serve static files (your HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Create database and tables if they don't exist
@app.on_event("startup")
async def startup_db_client():
    sqlmanager = MySQLManager()
    conn = sqlmanager.get_connection()
    cursor = conn.cursor()
    
    # Create database if it doesn't exist
    cursor.execute("USE choose")
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        considerations JSON,
        rankings JSON,
        explanations JSON,
        interests TEXT,
        l1r5_score VARCHAR(10),
        strengths TEXT,
        learning_style TEXT,
        education_focus TEXT,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()

# Define request models
class FormData(BaseModel):
    key_considerations: Optional[List[str]] = None
    rankings: Optional[dict] = None
    explanations: Optional[dict] = None
    interests: Optional[str] = None
    l1r5: Optional[str] = None
    strengths: Optional[str] = None
    learning_style: Optional[str] = None
    education_focus: Optional[str] = None

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# API endpoint to handle form data directly from JavaScript
@app.post("/api/submit")
async def api_submit_form(form_data: dict):

    # Extract data from JSON payload
    key_considerations = form_data.get("key_considerations", [])
    rankings = form_data.get("rankings", {})
    explanations = form_data.get("explanations", {})
    interests = form_data.get("interests", "")
    l1r5 = form_data.get("l1r5", "")
    strengths = form_data.get("strengths", "")
    learning_style = form_data.get("learning_style", "")
    education_focus = form_data.get("education_focus", "")
    
    # Store in database
    sqlmanager = MySQLManager()
    conn = sqlmanager.get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM student_responses")
    
    query = """
    INSERT INTO student_responses 
    (considerations, rankings, explanations, interests, l1r5_score, strengths, learning_style, education_focus)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    values = (
        json.dumps(key_considerations),
        json.dumps(rankings),
        json.dumps(explanations),
        interests,
        l1r5,
        strengths,
        learning_style,
        education_focus
    )
    
    cursor.execute(query, values)
    conn.commit()

    new_id = cursor.lastrowid
    response = {"id": new_id}
    
    cursor.close()
    conn.close()

    return response


# Initialize RAG instance
rag = RAG_Chat(user_id="student10")

@app.post("/api/recommendations/{id}")
async def get_recommendations(id):
    try:
        # Use your pipeline
        response = rag.get_recommendations(id)
        # Convert response to HTML-friendly format
        response_str = str(response)
        return response_str
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            response = rag.chat(message)
            await websocket.send_text(str(response))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)