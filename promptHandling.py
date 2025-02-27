import json
import os
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

# Load environment variables
load_dotenv()


def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", ""),
        cursorclass=pymysql.cursors.DictCursor
    )

def format_key_considerations(considerations, rankings, explanations):
    """Format key considerations with rankings and explanations"""
    # Create a dictionary to map each consideration to its ranking
    ranked_considerations = {}
    for ranking in rankings:
        ranked_considerations[f"{ranking['name']},{ranking['id']}"] = int(ranking['value'])


    # Sort considerations by their ranking
    sorted_considerations = sorted(ranked_considerations.items(), key=lambda x: x[1])

    # Format the considerations with explanations
    formatted_text = ""
    for consideration, rank in sorted_considerations:
        # Look for explanation in the explanations dictionary
        explanation_name, explanation_key = consideration.split(",")
        explanation = explanations.get(explanation_key, "")
        
        formatted_text += f"{rank}. {explanation_name}: {explanation}\n"

    return formatted_text

def generate_prompt(student_id=None):
    """Generate a prompt based on the student's responses"""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Get the most recent entry if no ID is specified
    if student_id is None:
        query = "SELECT * FROM student_responses ORDER BY submission_date DESC LIMIT 1"
        cursor.execute(query)
    else:
        query = "SELECT * FROM student_responses WHERE id = %s"
        cursor.execute(query, (student_id,))
    
    student_data = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not student_data:
        return "No student data found."
    
    # Parse JSON fields
    considerations = json.loads(student_data['considerations'])
    rankings = json.loads(student_data['rankings'])
    explanations = json.loads(student_data['explanations'])
    
    # Determine school (placeholder, you might want to collect this in your form)
    school = "Singapore Secondary School"  # Default value
    
    # Format key considerations
    key_considerations_text = format_key_considerations(considerations, rankings, explanations)
    
    # Create prompt
    prompt = f"""I am a student from {school} seeking guidance on my future educational and career paths. Here is my profile:

    Interests: {student_data['interests']}
    Strengths/skills: {student_data['strengths']}
    Academic Scores (L1R5): {student_data['l1r5_score']}
    Learning Preferences: {student_data['learning_style']}
    Education Focus: {student_data['education_focus']}

    In order of importance, these are the key considerations I have in deciding my path.
    {key_considerations_text}

    Based on information above, please provide me with 3 personalized recommendations for suitable Junior Colleges (JC) or Polytechnics (Poly). For each recommended institution, include:

        Name of the Institution
        Reasons why studying in this institution aligns with my preferences

    Present the recommendations in a structured format to facilitate easy comparison and understanding. Feel free to add a concluding sentence comparing the institutions.
    """
    
    return prompt


    


