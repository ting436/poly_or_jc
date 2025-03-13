from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ConnectionManagers.MySQLManager import MySQLManager
from rag_pipeline import RAG_Chat
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


rag = RAG_Chat(user_id="lol")


@app.on_event("startup")
async def startup_db_client():
    sqlmanager = MySQLManager()
    conn = sqlmanager.get_connection()
    cursor = conn.cursor()
    
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


@app.post("/api/recommendations/{id}")
async def get_recommendations(id):
    try:
        response = rag.get_recommendations(id)
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