from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ConnectionManagers.MySQLManager import MySQLManager
from rag_pipeline import RAG_Chat
from pymysql.err import IntegrityError
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
class UserRegistrationRequest(BaseModel):
    email: str
    password: str
    name: str = None
    school: str = None

@app.post("/register")
async def register_user(user: UserRegistrationRequest):
    """Endpoint to register a new user."""
    sqlmanager = MySQLManager()
    conn = sqlmanager.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("USE choose")


    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        school VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    try:
        # Call create_user to register the user
        sqlmanager.create_user(
            email=user.email,
            password=user.password,
            name=user.name,
            school=user.school
        )
        return {"message": "User registered successfully!"}
    except IntegrityError as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(
                status_code=400,
                detail=f"An account already exists for {user.email}"
            )
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    except Exception as e:
        # Handle errors and return an appropriate response
        raise HTTPException(status_code=400, detail=f"Failed to register user: {str(e)}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


rag = RAG_Chat()


@app.on_event("startup")
async def startup_db_client():
    sqlmanager = MySQLManager()
    conn = sqlmanager.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("USE choose")
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_responses (
        id INT,
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
    (considerations, rankings, explanations, interests, l1r5_score, strengths, learning_style, education_focus, id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    values = (
        json.dumps(key_considerations),
        json.dumps(rankings),
        json.dumps(explanations),
        interests,
        l1r5,
        strengths,
        learning_style,
        education_focus,
        1
    )
    
    cursor.execute(query, values)
    conn.commit()
    
    cursor.close()
    conn.close()



@app.post("/api/recommendations/")
async def get_recommendations():
    try:
        rag.clear_all_history()
        response = rag.get_recommendations(id=1)
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