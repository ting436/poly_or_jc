from fastapi import FastAPI, WebSocket, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ConnectionManagers.MySQLManager import MySQLManager
from rag_pipeline import RAG_Chat
from pymysql.err import IntegrityError
import json
from dotenv import load_dotenv
from jose import jwt
import os
from datetime import datetime, timedelta
from typing import Optional
import logging

load_dotenv()

app = FastAPI()

SECRET_KEY = os.getenv('SECRET')  # Same as in NextAuth.js
ALGORITHM = "HS256"

def verify_jwt_token(request: Optional[Request] = None, token: Optional[str] = None):
    if request:
        token = request.headers.get("Authorization")
    else:
        token = token
    if not token:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    try:
        # Decode the JWT token
        payload = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=[ALGORITHM]) 
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Pydantic model for sign-in request
class UserSignInRequest(BaseModel):
    email: str
    password: str

@app.post("/signin")
async def sign_in_user(user: UserSignInRequest):
    """Endpoint to sign in a user."""
    sqlmanager = MySQLManager()
    try:
        # Call verify_user to check credentials
        is_valid_user = sqlmanager.verify_user(email=user.email, password=user.password)
        if is_valid_user:
            # Generate JWT token
            token_payload = {
                "email": user.email,
                "exp": datetime.utcnow() + timedelta(days=1)  # Token expires in 1 day
            }
            access_token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
            
            return {
                "message": "Sign-in successful!",
                "accessToken": access_token
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    except HTTPException as e:
        raise e  # Pass HTTP exceptions directly
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

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
        id VARCHAR(255) NOT NULL UNIQUE,
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
def get_rag_instance(request: Optional[Request] = None, token: Optional[str] = None):
    # Verify the JWT token and retrieve the email
    if request:
        payload = verify_jwt_token(request=request)
    else:
        payload = verify_jwt_token(token=token)
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in session")

    # Instantiate and return RAG_Chat
    return RAG_Chat(email=email)


@app.on_event("startup")
async def startup_db_client():
    sqlmanager = MySQLManager()
    conn = sqlmanager.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("USE choose")
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_responses (
        considerations JSON,
        rankings JSON,
        explanations JSON,
        interests TEXT,
        l1r5_score VARCHAR(10),
        strengths TEXT,
        learning_style TEXT,
        education_focus TEXT,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) NOT NULL
    )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()

# API endpoint to handle form data directly from JavaScript
@app.post("/api/submit")
async def api_submit_form(form_data: dict, request: Request):
    payload = verify_jwt_token(request=request)

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
    (considerations, rankings, explanations, interests, l1r5_score, strengths, learning_style, education_focus, email)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    email = payload.get("email")
    values = (
        json.dumps(key_considerations),
        json.dumps(rankings),
        json.dumps(explanations),
        interests,
        l1r5,
        strengths,
        learning_style,
        education_focus,
        email
    )
    
    cursor.execute(query, values)
    conn.commit()
    
    cursor.close()
    conn.close()

    return {"message": f"Data submitted by {payload['email']}"}



@app.post("/api/recommendations/")
async def get_recommendations(request: Request):
    try:
        rag = get_rag_instance(request=request)
        response = rag.get_recommendations()
        response_str = str(response)
        return response_str
    except Exception as e:
        print(str(e))

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    initial_token = await websocket.receive_text()
    token = initial_token.strip() 
    try:
        rag = get_rag_instance(token=f"Bearer {token}")
    except Exception as e:
        logging.error(f"Token validation error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
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