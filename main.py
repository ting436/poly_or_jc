from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List, Optional
from ConnectionManagers.MySQLManager import MySQLManager
import json
import os
from pydantic import BaseModel
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure database connection
# Change your get_db_connection function
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", ""),
        cursorclass=pymysql.cursors.DictCursor
    )

# Serve static files (your HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Create database and tables if they don't exist
@app.on_event("startup")
async def startup_db_client():
    conn = get_db_connection()
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
    conn = get_db_connection()
    cursor = conn.cursor()
    
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
    cursor.close()
    conn.close()
    
    return {"status": "success", "message": "Form submitted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)